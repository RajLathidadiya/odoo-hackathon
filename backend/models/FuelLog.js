const db = require('../config/database');

const FuelLog = function(fuelLog) {
  this.id = fuelLog.id;
  this.vehicle_id = fuelLog.vehicle_id;
  this.trip_id = fuelLog.trip_id || null;
  this.liters = fuelLog.liters;
  this.cost = fuelLog.cost;
  this.odometer_reading = fuelLog.odometer_reading;
  this.fuel_date = fuelLog.fuel_date;
  this.created_at = new Date();
};

// Get all fuel logs
FuelLog.getAll = (result) => {
  const query = `
    SELECT 
      fl.id,
      fl.vehicle_id,
      fl.trip_id,
      fl.liters,
      fl.cost,
      fl.odometer_reading,
      fl.fuel_date,
      fl.created_at,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.odometer_km as current_odometer
    FROM fuel_logs fl
    LEFT JOIN vehicles v ON fl.vehicle_id = v.id
    ORDER BY fl.fuel_date DESC
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

// Get fuel log by ID
FuelLog.getById = (id, result) => {
  const query = `
    SELECT 
      fl.id,
      fl.vehicle_id,
      fl.trip_id,
      fl.liters,
      fl.cost,
      fl.odometer_reading,
      fl.fuel_date,
      fl.created_at,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.odometer_km as current_odometer
    FROM fuel_logs fl
    LEFT JOIN vehicles v ON fl.vehicle_id = v.id
    WHERE fl.id = ?
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

// Get fuel logs by vehicle ID
FuelLog.getByVehicleId = (vehicleId, result) => {
  const query = `
    SELECT 
      fl.id,
      fl.vehicle_id,
      fl.trip_id,
      fl.liters,
      fl.cost,
      fl.odometer_reading,
      fl.fuel_date,
      fl.created_at,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.odometer_km as current_odometer
    FROM fuel_logs fl
    LEFT JOIN vehicles v ON fl.vehicle_id = v.id
    WHERE fl.vehicle_id = ?
    ORDER BY fl.fuel_date DESC
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

// Create new fuel log
FuelLog.create = (newFuelLog, result) => {
  db.query('INSERT INTO fuel_logs SET ?', newFuelLog, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: res.insertId, ...newFuelLog });
    }
  });
};

// Get total fuel cost for a vehicle
FuelLog.getTotalCostByVehicle = (vehicleId, result) => {
  db.query(
    'SELECT SUM(cost) as total_fuel_cost FROM fuel_logs WHERE vehicle_id = ?',
    [vehicleId],
    (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res[0].total_fuel_cost || 0);
      }
    }
  );
};

// Get total liters for a vehicle
FuelLog.getTotalLitersByVehicle = (vehicleId, result) => {
  db.query(
    'SELECT SUM(liters) as total_liters FROM fuel_logs WHERE vehicle_id = ?',
    [vehicleId],
    (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res[0].total_liters || 0);
      }
    }
  );
};

// Get fuel efficiency for a vehicle (distance / liters)
FuelLog.getFuelEfficiencyByVehicle = (vehicleId, result) => {
  const query = `
    SELECT 
      COUNT(*) as total_refuelings,
      SUM(liters) as total_liters,
      MAX(odometer_reading) as max_odometer,
      MIN(odometer_reading) as min_odometer,
      (MAX(odometer_reading) - MIN(odometer_reading)) as total_distance_km,
      CASE 
        WHEN SUM(liters) > 0 THEN 
          ROUND((MAX(odometer_reading) - MIN(odometer_reading)) / SUM(liters), 2)
        ELSE 0
      END as fuel_efficiency_kmpl
    FROM fuel_logs
    WHERE vehicle_id = ?
  `;
  
  db.query(query, [vehicleId], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res[0]);
    }
  });
};

// Get fuel log count for a vehicle
FuelLog.getCountByVehicle = (vehicleId, result) => {
  db.query(
    'SELECT COUNT(*) as refueling_count FROM fuel_logs WHERE vehicle_id = ?',
    [vehicleId],
    (err, res) => {
      if (err) {
        console.log('error: ', err);
        result(err, null);
      } else {
        result(null, res[0].refueling_count || 0);
      }
    }
  );
};

module.exports = FuelLog;
