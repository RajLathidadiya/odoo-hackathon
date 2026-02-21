const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken } = require('../middleware/auth');

// All maintenance routes require authentication
router.get('/', authenticateToken, maintenanceController.getAll);
router.post('/', authenticateToken, maintenanceController.create);
router.get('/:vehicleId', authenticateToken, maintenanceController.getByVehicleId);

module.exports = router;
