const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken } = require('../middleware/auth');

// All vehicle routes require authentication
router.get('/', authenticateToken, vehicleController.getAll);
router.get('/:id', authenticateToken, vehicleController.getById);
router.post('/', authenticateToken, vehicleController.create);
router.put('/:id', authenticateToken, vehicleController.update);
router.delete('/:id', authenticateToken, vehicleController.delete);
router.patch('/:id/status', authenticateToken, vehicleController.updateStatus);

module.exports = router;
