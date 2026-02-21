const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken } = require('../middleware/auth');

// All trip routes require authentication
router.get('/', authenticateToken, tripController.getAll);
router.get('/:id', authenticateToken, tripController.getById);
router.post('/', authenticateToken, tripController.create);
router.put('/:id', authenticateToken, tripController.update);
router.delete('/:id', authenticateToken, tripController.delete);
router.patch('/:id/status', authenticateToken, tripController.updateStatus);

module.exports = router;
