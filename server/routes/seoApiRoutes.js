const express = require('express');
const { requestUrlIndexing } = require('../controllers/seoController');

const router = express.Router();

// Using basic authentication or assume it's protected by other means
// Ideally, add an admin middleware here. e.g. router.post('/index-url', verifyAdmin, requestUrlIndexing);
router.post('/index-url', requestUrlIndexing);

module.exports = router;
