const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured. Please set the JWT_SECRET environment variable.');
}

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      if (req.user.lockUntil && req.user.lockUntil > Date.now()) {
        return res.status(423).json({
          success: false,
          message: `Account is locked. Try again after ${new Date(req.user.lockUntil).toLocaleTimeString()}.`,
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'none'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

const requireTeam = (req, res, next) => {
  if (!req.user.teamId) {
    return res.status(403).json({
      success: false,
      message: 'You must be part of a team to access this feature.',
    });
  }
  next();
};

const logAudit = (action) => {
  return async (req, res, next) => {
    const start = Date.now();
    const originalJson = res.json;

    res.json = function (body) {
      const duration = Date.now() - start;
      AuditLog.create({
        userId: req.user?._id || null,
        action,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: res.statusCode >= 400 ? 'failed' : 'success',
        errorMessage: res.statusCode >= 400 ? (body.message || body.error) : null,
        duration,
        metadata: {
          method: req.method,
          path: req.originalUrl,
        },
      }).catch(() => {});

      return originalJson.call(this, body);
    };

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id);
      } catch (error) {
        // Token invalid, continue without user
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, authorize, requireTeam, optionalAuth, logAudit };
