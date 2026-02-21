const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/auth');

// All expense routes require authentication
router.get('/', authenticateToken, expenseController.getAll);
router.post('/', authenticateToken, expenseController.create);
router.get('/:vehicleId', authenticateToken, expenseController.getByVehicleId);

module.exports = router;
