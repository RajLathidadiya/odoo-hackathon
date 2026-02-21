const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All driver routes require authentication
router.get('/', authenticateToken, driverController.getAll);
router.get('/:id', authenticateToken, driverController.getById);

// Create driver - Fleet Manager and Super Admin only
router.post('/', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  driverController.create
);

// Update driver - Fleet Manager and Super Admin only
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  driverController.update
);

// Delete driver - Fleet Manager and Super Admin only
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  driverController.delete
);

// Update driver status - Safety Officer, Fleet Manager, and Super Admin
router.patch('/:id/status', 
  authenticateToken, 
  authorizeRoles('Safety Officer', 'Fleet Manager', 'Super Admin'),
  driverController.updateStatus
);

module.exports = router;
