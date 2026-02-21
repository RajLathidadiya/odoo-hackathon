const User = require('../models/User');
const Role = require('../models/Role');
const Joi = require('joi');

// Validation schema for user creation
const userCreateSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.number().required()
});

// Validation schema for user role update
const userRoleUpdateSchema = Joi.object({
  role_id: Joi.number().required()
});

// Validation schema for user status update
const userStatusUpdateSchema = Joi.object({
  is_active: Joi.boolean().required()
});

// GET /users - Get all users (Super Admin only)
exports.getAll = (req, res) => {
  User.getAll((err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      data: users
    });
  });
};

// GET /users/:id - Get user by ID
exports.getById = (req, res) => {
  const userId = req.params.id;

  User.getById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      data: user
    });
  });
};

// POST /users - Create new user (Super Admin only)
exports.create = (req, res) => {
  // Validate input
  const { error, value } = userCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if email already exists
  User.emailExists(value.email, (err, exists) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Check if role exists
    Role.getById(value.role_id, (err, role) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!role) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      // Create user
      User.create(value, (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating user', error: err.message });
        }

        res.status(201).json({
          message: 'User created successfully',
          data: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role_id: user.role_id,
            is_active: user.is_active
          }
        });
      });
    });
  });
};

// PATCH /users/:id/role - Update user role (Super Admin only)
exports.updateRole = (req, res) => {
  const userId = req.params.id;

  // Validate input
  const { error, value } = userRoleUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if user exists
  User.getById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if role exists
    Role.getById(value.role_id, (err, role) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!role) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      // Update user role
      User.updateRole(userId, value.role_id, (err, updatedUser) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating user role' });
        }

        res.status(200).json({
          message: 'User role updated successfully',
          data: updatedUser
        });
      });
    });
  });
};

// PATCH /users/:id/status - Update user status (Super Admin only)
exports.updateStatus = (req, res) => {
  const userId = req.params.id;

  // Validate input
  const { error, value } = userStatusUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if user exists
  User.getById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status
    User.updateStatus(userId, value.is_active, (err, updatedUser) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating user status' });
      }

      res.status(200).json({
        message: 'User status updated successfully',
        data: updatedUser
      });
    });
  });
};

// DELETE /users/:id - Delete user (Super Admin only)
exports.delete = (req, res) => {
  const userId = req.params.id;

  // Prevent deleting the current user
  if (parseInt(userId) === req.user.userId) {
    return res.status(400).json({
      message: 'Cannot delete your own user account'
    });
  }

  // Check if user exists
  User.getById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user (using status update to flag as inactive instead of hard delete)
    User.updateStatus(userId, false, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting user' });
      }

      res.status(200).json({
        message: 'User deleted successfully'
      });
    });
  });
};
