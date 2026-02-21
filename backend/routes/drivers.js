const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateToken } = require('../middleware/auth');

// All driver routes require authentication
router.get('/', authenticateToken, driverController.getAll);
router.get('/:id', authenticateToken, driverController.getById);
router.post('/', authenticateToken, driverController.create);
router.put('/:id', authenticateToken, driverController.update);
router.delete('/:id', authenticateToken, driverController.delete);
router.patch('/:id/status', authenticateToken, driverController.updateStatus);

module.exports = router;
