const db = require('../config/database');

const Trip = function(trip) {
  this.id = trip.id;
  this.trip_code = trip.trip_code;
  this.origin = trip.origin;
  this.destination = trip.destination;
  this.cargo_weight_kg = trip.cargo_weight_kg;
  this.revenue = trip.revenue;
  this.status = trip.status || 'Draft';
  this.start_time = trip.start_time || null;
  this.end_time = trip.end_time || null;
  this.created_at = new Date();
};

// Get all trips
Trip.getAll = (result) => {
  db.query('SELECT * FROM trips', (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get trip by ID
Trip.getById = (id, result) => {
  db.query('SELECT * FROM trips WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Get trip by code
Trip.getByCode = (code, result) => {
  db.query('SELECT * FROM trips WHERE trip_code = ?', [code], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Create new trip
Trip.create = (newTrip, result) => {
  db.query('INSERT INTO trips SET ?', newTrip, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: res.insertId, ...newTrip });
    }
  });
};

// Update trip
Trip.updateById = (id, trip, result) => {
  db.query('UPDATE trips SET ? WHERE id = ?', [trip, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: id, ...trip });
    }
  });
};

// Update trip status
Trip.updateStatus = (id, status, result) => {
  db.query('UPDATE trips SET status = ? WHERE id = ?', [status, id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: id, status: status });
    }
  });
};

// Delete trip
Trip.delete = (id, result) => {
  db.query('DELETE FROM trips WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get trips by status
Trip.getByStatus = (status, result) => {
  db.query('SELECT * FROM trips WHERE status = ?', [status], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get trip with assignment details
Trip.getTripWithAssignments = (id, result) => {
  const query = `
    SELECT 
      t.id,
      t.trip_code,
      t.origin,
      t.destination,
      t.cargo_weight_kg,
      t.revenue,
      t.status,
      t.start_time,
      t.end_time,
      ta.vehicle_id,
      ta.driver_id,
      v.vehicle_code,
      v.license_plate,
      v.max_capacity_kg,
      v.status as vehicle_status,
      d.full_name,
      d.license_number,
      d.status as driver_status
    FROM trips t
    LEFT JOIN trip_assignments ta ON t.id = ta.trip_id
    LEFT JOIN vehicles v ON ta.vehicle_id = v.id
    LEFT JOIN drivers d ON ta.driver_id = d.id
    WHERE t.id = ?
  `;
  
  db.query(query, [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res : null);
    }
  });
};

module.exports = Trip;
