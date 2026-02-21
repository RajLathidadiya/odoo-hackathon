const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All dispatch routes require authentication

// Assign trip - Dispatcher and Super Admin only
router.post('/assign', 
  authenticateToken, 
  authorizeRoles('Dispatcher', 'Super Admin'),
  dispatchController.assign
);

// Complete trip - Dispatcher and Super Admin only
router.post('/complete', 
  authenticateToken, 
  authorizeRoles('Dispatcher', 'Super Admin'),
  dispatchController.complete
);

// Cancel trip - Dispatcher and Super Admin only
router.post('/cancel', 
  authenticateToken, 
  authorizeRoles('Dispatcher', 'Super Admin'),
  dispatchController.cancel
);

module.exports = router;
