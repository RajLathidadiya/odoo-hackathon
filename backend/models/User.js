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

// Get user by email
User.getByEmail = (email, result) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, res) => {
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

// Get user by ID
User.getById = (id, result) => {
  db.query('SELECT id, role_id, full_name, email, is_active, created_at FROM users WHERE id = ?', [id], (err, res) => {
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
