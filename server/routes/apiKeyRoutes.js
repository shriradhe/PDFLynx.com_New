const express = require('express');
const router = express.Router();
const {
  createApiKey,
  getApiKeys,
  revokeApiKey,
  updateApiKey,
} = require('../controllers/apiKeyController');
const { protect, logAudit } = require('../middleware/authMiddleware');

router.post('/', protect, logAudit('api.key.create'), createApiKey);
router.get('/', protect, getApiKeys);
router.put('/:id', protect, logAudit('api.key.update'), updateApiKey);
router.delete('/:id', protect, logAudit('api.key.revoke'), revokeApiKey);

module.exports = router;
