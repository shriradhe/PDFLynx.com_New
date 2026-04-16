const AuditLog = require('../models/AuditLog');
const FileRecord = require('../models/FileRecord');
const User = require('../models/User');

const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { action, status, startDate, endDate } = req.query;

    const filter = { userId: req.user._id };
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching audit logs.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const user = await User.findById(req.user._id).lean();

    const [totalFiles, successCount, failedCount, avgProcessingTime, toolBreakdown, dailyUsage, recentActivity] = await Promise.all([
      FileRecord.countDocuments({ userId: req.user._id }),
      FileRecord.countDocuments({ userId: req.user._id, status: 'completed' }),
      FileRecord.countDocuments({ userId: req.user._id, status: 'failed' }),
      FileRecord.aggregate([
        { $match: { userId: req.user._id, status: 'completed', processingTimeMs: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$processingTimeMs' } } },
      ]),
      FileRecord.aggregate([
        { $match: { userId: req.user._id, createdAt: { $gte: startDate } } },
        { $group: { _id: '$tool', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      FileRecord.aggregate([
        { $match: { userId: req.user._id, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      FileRecord.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const successRate = totalFiles > 0 ? Math.round((successCount / totalFiles) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalFiles,
        successCount,
        failedCount,
        successRate,
        avgProcessingTime: avgProcessingTime[0]?.avg ? Math.round(avgProcessingTime[0].avg) : 0,
        filesProcessed: user.filesProcessed,
        plan: user.plan,
        toolBreakdown,
        dailyUsage,
        recentActivity,
        period,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats.' });
  }
};

module.exports = { getAuditLogs, getDashboardStats };
