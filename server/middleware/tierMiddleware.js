/**
 * Tier Enforcement Middleware
 * Enforces plan-based limits and feature access.
 */
const User = require('../models/User');
const logger = require('../utils/logger');

const TIER_LIMITS = {
  free: {
    dailyFileLimit: 10,
    maxFileSizeMB: 10,
    features: ['merge', 'split', 'compress', 'rotate', 'watermark', 'protect', 'unlock',
                'page-numbers', 'pdf-to-text', 'pdf-to-png', 'pdf-to-jpg', 'jpg-to-pdf',
                'organize', 'image-to-pdf', 'html-to-pdf'],
    aiAccess: false,
  },
  starter: {
    dailyFileLimit: 100,
    maxFileSizeMB: 25,
    features: ['*'],  // all standard tools
    aiAccess: true,
    aiDailyLimit: 20,
  },
  business: {
    dailyFileLimit: 500,
    maxFileSizeMB: 100,
    features: ['*'],
    aiAccess: true,
    aiDailyLimit: 100,
  },
  enterprise: {
    dailyFileLimit: Infinity,
    maxFileSizeMB: 500,
    features: ['*'],
    aiAccess: true,
    aiDailyLimit: Infinity,
  },
};

/**
 * Check daily file processing limit for user's plan.
 */
const checkFileLimit = async (req, res, next) => {
  try {
    // Anonymous users get free tier limits
    const plan = req.user?.plan || 'free';
    const limits = TIER_LIMITS[plan] || TIER_LIMITS.free;

    if (limits.dailyFileLimit === Infinity) return next();

    if (req.user) {
      const FileRecord = require('../models/FileRecord');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const countToday = await FileRecord.countDocuments({
        userId: req.user._id,
        createdAt: { $gte: today },
      });

      if (countToday >= limits.dailyFileLimit) {
        return res.status(429).json({
          success: false,
          code: 'DAILY_LIMIT_REACHED',
          message: `Daily file limit reached (${limits.dailyFileLimit} files/day on ${plan} plan). Upgrade for more.`,
          currentPlan: plan,
          limit: limits.dailyFileLimit,
          used: countToday,
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Tier check error:', error.message);
    return res.status(503).json({
      success: false,
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service temporarily unavailable. Please try again.',
    });
  }
};

/**
 * Check if user's plan allows AI features.
 */
const requireAIAccess = async (req, res, next) => {
  const plan = req.user?.plan || 'free';
  const limits = TIER_LIMITS[plan] || TIER_LIMITS.free;

  if (!limits.aiAccess) {
    return res.status(403).json({
      success: false,
      code: 'AI_ACCESS_DENIED',
      message: 'AI features require a Starter plan or higher. Upgrade to access AI-powered tools.',
      currentPlan: plan,
      requiredPlan: 'starter',
    });
  }

  // Check AI daily limit
  if (limits.aiDailyLimit !== Infinity && req.user) {
    const FileRecord = require('../models/FileRecord');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aiTools = ['ai-summarize', 'ai-chat', 'ai-search'];
    const aiCount = await FileRecord.countDocuments({
      userId: req.user._id,
      tool: { $in: aiTools },
      createdAt: { $gte: today },
    });

    if (aiCount >= limits.aiDailyLimit) {
      return res.status(429).json({
        success: false,
        code: 'AI_DAILY_LIMIT',
        message: `AI daily limit reached (${limits.aiDailyLimit}/day on ${plan} plan).`,
        currentPlan: plan,
        limit: limits.aiDailyLimit,
      });
    }
  }

  next();
};

/**
 * Check file size against plan limits.
 */
const checkFileSize = (req, res, next) => {
  const plan = req.user?.plan || 'free';
  const limits = TIER_LIMITS[plan] || TIER_LIMITS.free;
  const maxBytes = limits.maxFileSizeMB * 1024 * 1024;

  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    if (file.size > maxBytes) {
      return res.status(413).json({
        success: false,
        code: 'FILE_TOO_LARGE',
        message: `File "${file.originalname}" exceeds the ${limits.maxFileSizeMB}MB limit for the ${plan} plan.`,
        currentPlan: plan,
        maxSizeMB: limits.maxFileSizeMB,
      });
    }
  }

  next();
};

module.exports = { checkFileLimit, requireAIAccess, checkFileSize, TIER_LIMITS };
