const db = require('../config/database');

const Role = function(role) {
  this.id = role.id;
  this.name = role.name;
  this.description = role.description;
  this.created_at = new Date();
};

// Get all roles
Role.getAll = (result) => {
  db.query('SELECT * FROM roles', (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get role by ID
Role.getById = (id, result) => {
  db.query('SELECT * FROM roles WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Create new role
Role.create = (newRole, result) => {
  db.query('INSERT INTO roles SET ?', newRole, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: res.insertId, ...newRole });
    }
  });
};

// Update role
Role.updateById = (id, role, result) => {
  db.query('UPDATE roles SET ? WHERE id = ?', [role, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: id, ...role });
    }
  });
};

// Delete role
Role.delete = (id, result) => {
  db.query('DELETE FROM roles WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Role;
