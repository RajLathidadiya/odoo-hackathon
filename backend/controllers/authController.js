const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Validation schema for registration
const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.number().optional()
});

// Validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.role_name || 'User'
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '30d' }
  );
};

exports.register = (req, res) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body);
  
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

    // Create user
    User.create(value, (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating user', error: err.message });
      }

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id
        },
        token,
        refreshToken
      });
    });
  });
};

exports.login = (req, res) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details[0].message 
    });
  }

  // Find user by email
  User.getByEmail(value.email, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    // Verify password
    if (!User.verifyPassword(value.password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role_id: user.role_id,
        role_name: user.role_name || 'User'
      },
      token,
      refreshToken
    });
  });
};

exports.getMe = (req, res) => {
  const userId = req.user.id;

  User.getById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user
    });
  });
};

exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || 'default_secret'
    );

    User.getById(decoded.id, (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.status(200).json({
        message: 'Token refreshed successfully',
        token: newToken,
        refreshToken: newRefreshToken
      });
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
