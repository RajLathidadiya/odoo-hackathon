const db = require('../config/database');

const TripAssignment = function(assignment) {
  this.id = assignment.id;
  this.trip_id = assignment.trip_id;
  this.vehicle_id = assignment.vehicle_id;
  this.driver_id = assignment.driver_id;
  this.assigned_at = new Date();
};

// Create trip assignment
TripAssignment.create = (assignment, result) => {
  db.query('INSERT INTO trip_assignments SET ?', assignment, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, { id: res.insertId, ...assignment });
    }
  });
};

// Get assignment by trip ID
TripAssignment.getByTripId = (tripId, result) => {
  db.query('SELECT * FROM trip_assignments WHERE trip_id = ?', [tripId], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Get assignment by ID
TripAssignment.getById = (id, result) => {
  db.query('SELECT * FROM trip_assignments WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res.length > 0 ? res[0] : null);
    }
  });
};

// Delete assignment
TripAssignment.delete = (id, result) => {
  db.query('DELETE FROM trip_assignments WHERE id = ?', [id], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = TripAssignment;
