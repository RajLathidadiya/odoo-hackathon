const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = function(user) {
  this.id = user.id;
  this.role_id = user.role_id;
  this.full_name = user.full_name;
  this.email = user.email;
  this.password_hash = user.password_hash;
  this.is_active = user.is_active || true;
  this.created_at = new Date();
};

// Create new user
User.create = (newUser, result) => {
  // Hash password
  const saltRounds = 10;
  bcrypt.hash(newUser.password, saltRounds, (err, hashedPassword) => {
    if (err) {
      result(err, null);
      return;
    }

    const user = {
      role_id: newUser.role_id || 1,
      full_name: newUser.full_name,
      email: newUser.email,
      password_hash: hashedPassword,
      is_active: true
    };

    db.query('INSERT INTO users SET ?', user, (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, { id: res.insertId, ...user });
      }
    });
  });
};

// Get user by email with role
User.getByEmail = (email, result) => {
  const query = `
    SELECT u.*, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ?
  `;
  db.query(query, [email], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      if (res.length > 0) {
        result(null, res[0]);
      } else {
        result(null, null);
      }
    }
  });
};

// Get user by ID with role
User.getById = (id, result) => {
  const query = `
    SELECT u.id, u.role_id, u.full_name, u.email, u.is_active, u.created_at, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `;
  db.query(query, [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      if (res.length > 0) {
        result(null, res[0]);
      } else {
        result(null, null);
      }
    }
  });
};

// Get all users with role details
User.getAll = (result) => {
  const query = `
    SELECT u.id, u.role_id, u.full_name, u.email, u.is_active, u.created_at, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `;
  db.query(query, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Update user role
User.updateRole = (id, roleId, result) => {
  db.query('UPDATE users SET role_id = ? WHERE id = ?', [roleId, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      User.getById(id, result);
    }
  });
};

// Update user status
User.updateStatus = (id, isActive, result) => {
  db.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      User.getById(id, result);
    }
  });
};

// Verify password
User.verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

// Check if email exists
User.emailExists = (email, result) => {
  db.query('SELECT id FROM users WHERE email = ?', [email], (err, res) => {
    if (err) {
      result(err, null);
    } else {
      result(null, res.length > 0);
    }
  });
};

module.exports = User;
