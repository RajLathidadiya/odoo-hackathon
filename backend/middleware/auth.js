const jwt = require('jsonwebtoken');

// Authentication middleware - Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Access token required',
      error: 'No authorization token provided'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    );
    // Attach decoded user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role_id: decoded.role_id,
      role: decoded.role
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        error: 'Please login again'
      });
    }
    return res.status(403).json({ 
      message: 'Invalid token',
      error: err.message
    });
  }
};

// Authorization middleware - Check if user has required roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Authentication middleware should have already been called
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated'
      });
    }

    // Super Admin has access to everything
    if (req.user.role === 'Super Admin') {
      return next();
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        error: `This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Legacy middleware for role ID based authorization (backward compatibility)
const authorizeRole = (...allowedRoleIds) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoleIds.includes(req.user.role_id)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRole, authorizeRoles };
