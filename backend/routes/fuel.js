const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All fuel routes require authentication
router.get('/', authenticateToken, fuelController.getAll);
router.get('/:vehicleId', authenticateToken, fuelController.getByVehicleId);

// Create fuel log - Fleet Manager and Super Admin only
router.post('/', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  fuelController.create
);

module.exports = router;
