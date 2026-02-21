const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const { authenticateToken } = require('../middleware/auth');

// All fuel routes require authentication
router.get('/', authenticateToken, fuelController.getAll);
router.post('/', authenticateToken, fuelController.create);
router.get('/:vehicleId', authenticateToken, fuelController.getByVehicleId);

module.exports = router;
