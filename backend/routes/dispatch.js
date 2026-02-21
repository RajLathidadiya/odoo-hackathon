const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');
const { authenticateToken } = require('../middleware/auth');

// All dispatch routes require authentication
router.post('/assign', authenticateToken, dispatchController.assign);
router.post('/complete', authenticateToken, dispatchController.complete);
router.post('/cancel', authenticateToken, dispatchController.cancel);

module.exports = router;
