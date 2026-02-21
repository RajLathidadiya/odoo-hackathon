const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All role routes require authentication
// Typically, only admin (role_id = 1) can manage roles
router.get('/', authenticateToken, roleController.getAll);
router.get('/:id', authenticateToken, roleController.getById);
router.post('/', authenticateToken, authorizeRole(1), roleController.create);
router.put('/:id', authenticateToken, authorizeRole(1), roleController.update);
router.delete('/:id', authenticateToken, authorizeRole(1), roleController.delete);

module.exports = router;
