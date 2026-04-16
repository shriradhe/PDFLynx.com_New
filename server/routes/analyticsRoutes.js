const express = require('express');
const router = express.Router();
const { getAuditLogs, getDashboardStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/logs', protect, getAuditLogs);

module.exports = router;
