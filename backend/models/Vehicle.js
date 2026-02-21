const db = require('../config/database');

const Vehicle = function(vehicle) {
  this.id = vehicle.id;
  this.vehicle_code = vehicle.vehicle_code;
  this.license_plate = vehicle.license_plate;
  this.model = vehicle.model;
  this.max_capacity_kg = vehicle.max_capacity_kg;
  this.acquisition_cost = vehicle.acquisition_cost;
  this.odometer_km = vehicle.odometer_km;
  this.vehicle_type = vehicle.vehicle_type;
  this.region = vehicle.region;
  this.status = vehicle.status || 'Available';
  this.created_at = new Date();
};

// Get all vehicles
Vehicle.getAll = (result) => {
  db.query('SELECT * FROM vehicles', (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get vehicle by ID
Vehicle.getById = (id, result) => {
  db.query('SELECT * FROM vehicles WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Get vehicle by code
Vehicle.getByCode = (code, result) => {
  db.query('SELECT * FROM vehicles WHERE vehicle_code = ?', [code], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Create new vehicle
Vehicle.create = (newVehicle, result) => {
  db.query('INSERT INTO vehicles SET ?', newVehicle, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: res.insertId, ...newVehicle });
    }
  });
};

// Update vehicle
Vehicle.updateById = (id, vehicle, result) => {
  db.query('UPDATE vehicles SET ? WHERE id = ?', [vehicle, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: id, ...vehicle });
    }
  });
};

// Update vehicle status
Vehicle.updateStatus = (id, status, result) => {
  db.query('UPDATE vehicles SET status = ? WHERE id = ?', [status, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      // Create status history record
      db.query(
        'INSERT INTO vehicle_status_history (vehicle_id, old_status, new_status, changed_at) SELECT id, status, ?, NOW() FROM vehicles WHERE id = ?',
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

// Delete vehicle
Vehicle.delete = (id, result) => {
  db.query('DELETE FROM vehicles WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get vehicles by status
Vehicle.getByStatus = (status, result) => {
  db.query('SELECT * FROM vehicles WHERE status = ?', [status], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Vehicle;
