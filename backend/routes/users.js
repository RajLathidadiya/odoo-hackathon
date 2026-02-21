const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All user routes require authentication
// User management endpoints (Super Admin only)

// GET /users - Get all users
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Super Admin'),
  userController.getAll
);

// GET /users/:id - Get user by ID
router.get(
  '/:id',
  authenticateToken,
  userController.getById
);

// POST /users - Create new user
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Super Admin'),
  userController.create
);

// PATCH /users/:id/role - Update user role
router.patch(
  '/:id/role',
  authenticateToken,
  authorizeRoles('Super Admin'),
  userController.updateRole
);

// PATCH /users/:id/status - Update user status
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('Super Admin'),
  userController.updateStatus
);

// DELETE /users/:id - Delete user (soft delete via status update)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Super Admin'),
  userController.delete
);

module.exports = router;
