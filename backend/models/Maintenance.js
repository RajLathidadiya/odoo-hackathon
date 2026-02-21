const db = require('../config/database');

const Maintenance = function(maintenance) {
  this.id = maintenance.id;
  this.vehicle_id = maintenance.vehicle_id;
  this.service_type = maintenance.service_type;
  this.cost = maintenance.cost;
  this.service_date = maintenance.service_date;
  this.created_at = new Date();
};

// Get all maintenance logs
Maintenance.getAll = (result) => {
  const query = `
    SELECT 
      ml.id,
      ml.vehicle_id,
      ml.service_type,
      ml.cost,
      ml.service_date,
      ml.created_at,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.status
    FROM maintenance_logs ml
    LEFT JOIN vehicles v ON ml.vehicle_id = v.id
    ORDER BY ml.service_date DESC
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

// Get maintenance by ID
Maintenance.getById = (id, result) => {
  const query = `
    SELECT 
      ml.id,
      ml.vehicle_id,
      ml.service_type,
      ml.cost,
      ml.service_date,
      ml.created_at,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.status
    FROM maintenance_logs ml
    LEFT JOIN vehicles v ON ml.vehicle_id = v.id
    WHERE ml.id = ?
  `;
  
  db.query(query, [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Get maintenance logs by vehicle ID
Maintenance.getByVehicleId = (vehicleId, result) => {
  const query = `
    SELECT 
      ml.id,
      ml.vehicle_id,
      ml.service_type,
      ml.cost,
      ml.service_date,
      ml.created_at,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.status
    FROM maintenance_logs ml
    LEFT JOIN vehicles v ON ml.vehicle_id = v.id
    WHERE ml.vehicle_id = ?
    ORDER BY ml.service_date DESC
  `;
  
  db.query(query, [vehicleId], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Create new maintenance log
Maintenance.create = (newMaintenance, result) => {
  db.query('INSERT INTO maintenance_logs SET ?', newMaintenance, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: res.insertId, ...newMaintenance });
    }
  });
};

// Get total maintenance cost for a vehicle
Maintenance.getTotalCostByVehicle = (vehicleId, result) => {
  db.query(
    'SELECT SUM(cost) as total_maintenance_cost FROM maintenance_logs WHERE vehicle_id = ?',
    [vehicleId],
    (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res[0].total_maintenance_cost || 0);
      }
    }
  );
};

// Get maintenance count by vehicle
Maintenance.getCountByVehicle = (vehicleId, result) => {
  db.query(
    'SELECT COUNT(*) as maintenance_count FROM maintenance_logs WHERE vehicle_id = ?',
    [vehicleId],
    (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res[0].maintenance_count || 0);
      }
    }
  );
};

module.exports = Maintenance;
