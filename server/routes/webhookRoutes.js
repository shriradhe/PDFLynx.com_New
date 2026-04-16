const express = require('express');
const router = express.Router();
const {
  createWebhook,
  getWebhooks,
  updateWebhook,
  deleteWebhook,
} = require('../controllers/webhookController');
const { protect, logAudit } = require('../middleware/authMiddleware');

router.post('/', protect, logAudit('webhook.create'), createWebhook);
router.get('/', protect, getWebhooks);
router.put('/:id', protect, logAudit('webhook.update'), updateWebhook);
router.delete('/:id', protect, logAudit('webhook.delete'), deleteWebhook);

module.exports = router;
