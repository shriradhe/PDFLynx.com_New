const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const AuditLog = require('../models/AuditLog');

const apiKeyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'API key is required.' });
    }

    const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const hashedKey = ApiKey.hashKey(key);

    const apiKey = await ApiKey.findOne({ hashedKey, isActive: true }).populate('userId');

    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'Invalid API key.' });
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'API key has expired.' });
    }

    await apiKey.incrementUsage();

    if (apiKey.rateLimit && apiKey.usageCount > apiKey.rateLimit) {
      return res.status(429).json({ success: false, message: 'API key rate limit exceeded.' });
    }

    req.apiKey = apiKey;
    req.user = apiKey.userId;

    AuditLog.create({
      userId: apiKey.userId._id,
      apiKeyId: apiKey._id,
      action: `pdf.${req.method.toLowerCase()}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      metadata: { method: req.method, path: req.originalUrl, keyName: apiKey.name },
    }).catch(() => {});

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { apiKeyAuth };
