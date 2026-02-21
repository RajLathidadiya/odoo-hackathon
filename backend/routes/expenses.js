const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All expense routes require authentication
router.get('/', authenticateToken, expenseController.getAll);
router.get('/:vehicleId', authenticateToken, expenseController.getByVehicleId);

// Create expense - Fleet Manager and Super Admin only
router.post('/', 
  authenticateToken, 
  authorizeRoles('Fleet Manager', 'Super Admin'),
  expenseController.create
);

module.exports = router;
