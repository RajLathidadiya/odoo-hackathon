const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All maintenance routes require authentication
router.get('/', authenticateToken, maintenanceController.getAll);
router.get('/:vehicleId', authenticateToken, maintenanceController.getByVehicleId);

// Create maintenance - Fleet Manager and Super Admin only
router.post('/', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  maintenanceController.create
);

module.exports = router;
