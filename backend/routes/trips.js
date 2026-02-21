const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All trip routes require authentication
router.get('/', authenticateToken, tripController.getAll);
router.get('/:id', authenticateToken, tripController.getById);

// Create trip - Fleet Manager and Super Admin only
router.post('/', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  tripController.create
);

// Update trip - Fleet Manager and Super Admin only
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  tripController.update
);

// Delete trip - Fleet Manager and Super Admin only
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  tripController.delete
);

// Update trip status - Fleet Manager and Super Admin only
router.patch('/:id/status', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  tripController.updateStatus
);

module.exports = router;
