const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect, logAudit } = require('../middleware/authMiddleware');
const { authLimiter } = require('../utils/rateLimiter');

// Public routes (rate-limited)
router.post('/register', authLimiter, logAudit('user.register'), register);
router.post('/login', authLimiter, logAudit('user.login'), login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/profile', protect, logAudit('user.profile.view'), getProfile);
router.put('/profile', protect, logAudit('user.profile.update'), updateProfile);
router.post('/change-password', protect, logAudit('user.password.change'), changePassword);
router.post('/resend-verification', protect, resendVerification);
router.post('/2fa/enable', protect, logAudit('user.2fa.enable'), enableTwoFactor);
router.post('/2fa/disable', protect, logAudit('user.2fa.disable'), disableTwoFactor);
router.get('/analytics', protect, getAnalytics);

module.exports = router;
