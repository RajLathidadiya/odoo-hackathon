const Role = require('../models/Role');
const Joi = require('joi');

// Validation schema for creating/updating role
const roleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(255).optional()
});

exports.getAll = (req, res) => {
  Role.getAll((err, roles) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Roles retrieved successfully',
      count: roles.length,
      data: roles
    });
  });
};

exports.getById = (req, res) => {
  const roleId = req.params.id;

  Role.getById(roleId, (err, role) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.status(200).json({
      message: 'Role retrieved successfully',
      data: role
    });
  });
};

exports.create = (req, res) => {
  // Validate input
  const { error, value } = roleSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  Role.create(value, (err, role) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating role', error: err.message });
    }

    res.status(201).json({
      message: 'Role created successfully',
      data: role
    });
  });
};

exports.update = (req, res) => {
  const roleId = req.params.id;

  // Validate input
  const { error, value } = roleSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  Role.updateById(roleId, value, (err, role) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating role' });
    }

    res.status(200).json({
      message: 'Role updated successfully',
      data: role
    });
  });
};

exports.delete = (req, res) => {
  const roleId = req.params.id;

  Role.delete(roleId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting role' });
    }

    res.status(200).json({
      message: 'Role deleted successfully'
    });
  });
};
