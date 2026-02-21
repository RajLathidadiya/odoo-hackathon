const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All vehicle routes require authentication
router.get('/', authenticateToken, vehicleController.getAll);
router.get('/:id', authenticateToken, vehicleController.getById);

// Create vehicle - Fleet Manager and Super Admin only
router.post('/', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  vehicleController.create
);

// Update vehicle - Fleet Manager and Super Admin only
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  vehicleController.update
);

// Delete vehicle - Fleet Manager and Super Admin only
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  vehicleController.delete
);

// Update vehicle status - Fleet Manager and Super Admin only
router.patch('/:id/status', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  vehicleController.updateStatus
);

module.exports = router;
