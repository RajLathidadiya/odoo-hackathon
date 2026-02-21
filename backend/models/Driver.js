const db = require('../config/database');

const Driver = function(driver) {
  this.id = driver.id;
  this.full_name = driver.full_name;
  this.license_number = driver.license_number;
  this.license_category = driver.license_category;
  this.license_expiry = driver.license_expiry;
  this.safety_score = driver.safety_score || 0;
  this.status = driver.status || 'Available';
  this.created_at = new Date();
};

// Get all drivers
Driver.getAll = (result) => {
  db.query('SELECT * FROM drivers', (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get driver by ID
Driver.getById = (id, result) => {
  db.query('SELECT * FROM drivers WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Get driver by license number
Driver.getByLicense = (licenseNumber, result) => {
  db.query('SELECT * FROM drivers WHERE license_number = ?', [licenseNumber], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Create new driver
Driver.create = (newDriver, result) => {
  db.query('INSERT INTO drivers SET ?', newDriver, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: res.insertId, ...newDriver });
    }
  });
};

// Update driver
Driver.updateById = (id, driver, result) => {
  db.query('UPDATE drivers SET ? WHERE id = ?', [driver, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: id, ...driver });
    }
  });
};

// Update driver status
Driver.updateStatus = (id, status, result) => {
  db.query('UPDATE drivers SET status = ? WHERE id = ?', [status, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      // Create status history record
      db.query(
        'INSERT INTO driver_status_history (driver_id, old_status, new_status, changed_at) SELECT id, status, ?, NOW() FROM drivers WHERE id = ?',
        [status, id],
        (histErr, histRes) => {
          if (histErr) {
            console.log('error creating history: ', histErr);
          }
          result(null, { id: id, status: status });
        }
      );
    }
  });
};

// Delete driver
Driver.delete = (id, result) => {
  db.query('DELETE FROM drivers WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get drivers by status
Driver.getByStatus = (status, result) => {
  db.query('SELECT * FROM drivers WHERE status = ?', [status], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Check if license is expired
Driver.isLicenseExpired = (expiryDate) => {
  const today = new Date();
  return new Date(expiryDate) < today;
};

module.exports = Driver;
