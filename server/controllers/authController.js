const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter.' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one number.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      verificationToken,
      verificationTokenExpires,
    });

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    AuditLog.create({
      userId: user._id,
      action: 'user.register',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      metadata: { email: user.email },
    }).catch(() => {});

    sendVerificationEmail(user.email, user.name, verificationToken).catch(err =>
      logger.error('Failed to send verification email:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully. A verification email has been sent.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +twoFactorEnabled +twoFactorSecret +twoFactorBackupCodes +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: `Account is locked due to too many failed attempts. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.json({
          success: true,
          requiresTwoFactor: true,
          message: 'Two-factor authentication is enabled. Please provide the code.',
          userId: user._id,
        });
      }

      const isValidCode = await verifyTwoFactorCode(user, twoFactorCode);
      if (!isValidCode) {
        return res.status(401).json({ success: false, message: 'Invalid two-factor code.' });
      }
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    AuditLog.create({
      userId: user._id,
      action: 'user.login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    AuditLog.create({
      userId: user._id,
      action: 'user.email.verify',
      status: 'success',
    }).catch(() => {});

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification.' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    sendVerificationEmail(user.email, user.name, verificationToken).catch(err =>
      logger.error('Failed to send verification email:', err.message)
    );

    res.json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    AuditLog.create({
      userId: user._id,
      action: 'user.password.reset.request',
      ipAddress: req.ip,
      status: 'success',
    }).catch(() => {});

    sendPasswordResetEmail(user.email, resetToken).catch(err =>
      logger.error('Failed to send password reset email:', err.message)
    );

    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    AuditLog.create({
      userId: user._id,
      action: 'user.password.reset.confirm',
      status: 'success',
    }).catch(() => {});

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must be stronger (use uppercase, lowercase, and numbers).' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    AuditLog.create({
      userId: user._id,
      action: 'user.password.change',
      status: 'success',
    }).catch(() => {});

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is already enabled.' });
    }

    const secret = authenticator.generateSecret();
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    user.twoFactorSecret = secret;
    user.twoFactorBackupCodes = backupCodes.map((code) => ({ code, used: false }));
    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    AuditLog.create({
      userId: user._id,
      action: 'user.2fa.enable',
      status: 'success',
    }).catch(() => {});

    const otpauth = authenticator.keyuri(user.email, 'PDFLynx', secret);

    res.json({
      success: true,
      message: '2FA enabled successfully.',
      secret,
      backupCodes,
      qrCodeUrl: otpauth,
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const disableTwoFactor = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorEnabled +twoFactorSecret');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled.' });
    }

    if (!(await verifyTwoFactorCode(user, code))) {
      return res.status(401).json({ success: false, message: 'Invalid verification code.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save({ validateBeforeSave: false });

    AuditLog.create({
      userId: user._id,
      action: 'user.2fa.disable',
      status: 'success',
    }).catch(() => {});

    res.json({ success: true, message: '2FA disabled successfully.' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const verifyTwoFactorCode = async (user, code) => {
  const backupCode = user.twoFactorBackupCodes?.find(
    (bc) => bc.code === code.toUpperCase() && !bc.used
  );
  if (backupCode) {
    backupCode.used = true;
    try {
      await user.save({ validateBeforeSave: false });
      return true;
    } catch (saveErr) {
      logger.error('Failed to mark backup code as used:', saveErr.message);
      return false;
    }
  }

  if (user.twoFactorSecret) {
    try {
      authenticator.options = { window: 1 };
      return authenticator.check(code, user.twoFactorSecret);
    } catch (err) {
      logger.error('TOTP verification failed:', err.message);
      return false;
    }
  }
  return false;
};

const generateTOTP = (secret) => {
  try {
    authenticator.options = { window: 1 };
    return authenticator.generate(secret);
  } catch (err) {
    logger.error('TOTP generation failed:', err.message);
    return null;
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (avatar) updates.avatar = avatar;
    if (preferences) updates.preferences = { ...(req.user?.preferences || {}), ...preferences };

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    AuditLog.create({
      userId: user._id,
      action: 'user.profile.update',
      status: 'success',
      metadata: { updates: Object.keys(updates) },
    }).catch(() => {});

    res.json({ success: true, message: 'Profile updated.', user: user.toSafeObject() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const FileRecord = require('../models/FileRecord');
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalFiles, recentRecords, toolBreakdown, dailyUsage] = await Promise.all([
      FileRecord.countDocuments({ userId: req.user._id }),
      FileRecord.find({ userId: req.user._id, createdAt: { $gte: startDate } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      FileRecord.aggregate([
        { $match: { userId: req.user._id, createdAt: { $gte: startDate } } },
        { $group: { _id: '$tool', count: { $sum: 1 }, success: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),
      FileRecord.aggregate([
        { $match: { userId: req.user._id, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      analytics: {
        totalFiles,
        period,
        toolBreakdown,
        dailyUsage,
        recentActivity: recentRecords,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics.' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  enableTwoFactor,
  disableTwoFactor,
  getProfile,
  updateProfile,
  getAnalytics,
};
