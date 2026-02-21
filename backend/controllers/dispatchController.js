const db = require('../config/database');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const TripAssignment = require('../models/TripAssignment');
const Joi = require('joi');

// Validation schema for assign
const assignSchema = Joi.object({
  trip_id: Joi.number().required(),
  vehicle_id: Joi.number().required(),
  driver_id: Joi.number().required()
});

// Validation schema for complete
const completeSchema = Joi.object({
  trip_id: Joi.number().required()
});

// Validation schema for cancel
const cancelSchema = Joi.object({
  trip_id: Joi.number().required()
});

// POST /api/dispatch/assign - Assign vehicle and driver to trip
exports.assign = (req, res) => {
  // Validate input
  const { error, value } = assignSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  const { trip_id, vehicle_id, driver_id } = value;

  // Step 1: Validate trip exists and is in Draft status
  Trip.getById(trip_id, (err, trip) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({
        message: `Cannot assign to trip with status ${trip.status}. Only Draft trips can be assigned.`,
        currentStatus: trip.status
      });
    }

    // Step 2: Validate vehicle
    Vehicle.getById(vehicle_id, (err, vehicle) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      if (vehicle.status !== 'Available') {
        return res.status(400).json({
          message: `Vehicle is not available. Current status: ${vehicle.status}`,
          vehicleStatus: vehicle.status
        });
      }

      // Check cargo weight capacity
      if (trip.cargo_weight_kg > vehicle.max_capacity_kg) {
        return res.status(400).json({
          message: 'Cargo weight exceeds vehicle capacity',
          cargoWeight: trip.cargo_weight_kg,
          maxCapacity: vehicle.max_capacity_kg
        });
      }

      // Step 3: Validate driver
      Driver.getById(driver_id, (err, driver) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (!driver) {
          return res.status(404).json({ message: 'Driver not found' });
        }

        if (driver.status !== 'Available') {
          return res.status(400).json({
            message: `Driver is not available. Current status: ${driver.status}`,
            driverStatus: driver.status
          });
        }

        // Check license expiry
        if (Driver.isLicenseExpired(driver.license_expiry)) {
          return res.status(400).json({
            message: 'Driver license has expired',
            licenseExpiry: driver.license_expiry
          });
        }

        if (driver.status === 'Suspended') {
          return res.status(400).json({
            message: 'Driver is suspended and cannot be assigned'
          });
        }

        // Step 4: Create assignment
        TripAssignment.create({ trip_id, vehicle_id, driver_id }, (err, assignment) => {
          if (err) {
            return res.status(500).json({ message: 'Error creating assignment' });
          }

          // Step 5: Perform all updates (no explicit transaction, but grouped for atomicity)
          const updateTrip = new Promise((resolve, reject) => {
            const tripUpdate = {
              status: 'Dispatched',
              start_time: new Date()
            };
            db.query('UPDATE trips SET ? WHERE id = ?', [tripUpdate, trip_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          const updateVehicle = new Promise((resolve, reject) => {
            db.query('UPDATE vehicles SET status = ? WHERE id = ?', ['On Trip', vehicle_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          const createVehicleHistory = new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO vehicle_status_history (vehicle_id, old_status, new_status, changed_at) VALUES (?, ?, ?, NOW())',
              [vehicle_id, 'Available', 'On Trip'],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          const updateDriver = new Promise((resolve, reject) => {
            db.query('UPDATE drivers SET status = ? WHERE id = ?', ['On Trip', driver_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          const createDriverHistory = new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO driver_status_history (driver_id, old_status, new_status, changed_at) VALUES (?, ?, ?, NOW())',
              [driver_id, 'Available', 'On Trip'],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          Promise.all([updateTrip, updateVehicle, createVehicleHistory, updateDriver, createDriverHistory])
            .then(() => {
              res.status(200).json({
                message: 'Trip assigned successfully',
                data: {
                  assignment_id: assignment.id,
                  trip_id,
                  vehicle_id,
                  driver_id,
                  trip_status: 'Dispatched',
                  vehicle_status: 'On Trip',
                  driver_status: 'On Trip'
                }
              });
            })
            .catch((err) => {
              console.error('Error in assignment:', err);
              res.status(500).json({ message: 'Error completing assignment', error: err.message });
            });
        });
      });
    });
  });
};

// POST /api/dispatch/complete - Complete trip and free resources
exports.complete = (req, res) => {
  // Validate input
  const { error, value } = completeSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  const { trip_id } = value;

  // Get trip and assignment
  Trip.getById(trip_id, (err, trip) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({
        message: `Cannot complete trip with status ${trip.status}. Only Dispatched trips can be completed.`,
        currentStatus: trip.status
      });
    }

    // Get assignment
    TripAssignment.getByTripId(trip_id, (err, assignment) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!assignment) {
        return res.status(400).json({ message: 'No assignment found for this trip' });
      }

      const vehicle_id = assignment.vehicle_id;
      const driver_id = assignment.driver_id;

      // Execute all updates in parallel
      const updateTrip = new Promise((resolve, reject) => {
        db.query(
          'UPDATE trips SET status = ?, end_time = NOW() WHERE id = ?',
          ['Completed', trip_id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const updateVehicle = new Promise((resolve, reject) => {
        db.query('UPDATE vehicles SET status = ? WHERE id = ?', ['Available', vehicle_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const createVehicleHistory = new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO vehicle_status_history (vehicle_id, old_status, new_status, changed_at) VALUES (?, ?, ?, NOW())',
          [vehicle_id, 'On Trip', 'Available'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const updateDriver = new Promise((resolve, reject) => {
        db.query('UPDATE drivers SET status = ? WHERE id = ?', ['Available', driver_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const createDriverHistory = new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO driver_status_history (driver_id, old_status, new_status, changed_at) VALUES (?, ?, ?, NOW())',
          [driver_id, 'On Trip', 'Available'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      Promise.all([updateTrip, updateVehicle, createVehicleHistory, updateDriver, createDriverHistory])
        .then(() => {
          res.status(200).json({
            message: 'Trip completed successfully',
            data: {
              trip_id,
              trip_status: 'Completed',
              vehicle_status: 'Available',
              driver_status: 'Available',
              end_time: new Date()
            }
          });
        })
        .catch((err) => {
          console.error('Error completing trip:', err);
          res.status(500).json({ message: 'Error completing trip', error: err.message });
        });
    });
  });
};

// POST /api/dispatch/cancel - Cancel trip
exports.cancel = (req, res) => {
  // Validate input
  const { error, value } = cancelSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  const { trip_id } = value;

  // Get trip
  Trip.getById(trip_id, (err, trip) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Can only cancel Draft or Dispatched trips
    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      return res.status(400).json({
        message: `Cannot cancel trip with status ${trip.status}`,
        currentStatus: trip.status
      });
    }

    // Get assignment if exists
    TripAssignment.getByTripId(trip_id, (err, assignment) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Update trip status to Cancelled
      db.query('UPDATE trips SET status = ? WHERE id = ?', ['Cancelled', trip_id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating trip' });
        }

        // If trip was dispatched, restore vehicle and driver statuses
        if (assignment && trip.status === 'Dispatched') {
          const vehicle_id = assignment.vehicle_id;
          const driver_id = assignment.driver_id;

          const updateVehicle = new Promise((resolve, reject) => {
            db.query('UPDATE vehicles SET status = ? WHERE id = ?', ['Available', vehicle_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          const createVehicleHistory = new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO vehicle_status_history (vehicle_id, old_status, new_status, changed_at) VALUES (?, ?, ?, NOW())',
              [vehicle_id, 'On Trip', 'Available'],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          const updateDriver = new Promise((resolve, reject) => {
            db.query('UPDATE drivers SET status = ? WHERE id = ?', ['Available', driver_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          const createDriverHistory = new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO driver_status_history (driver_id, old_status, new_status, changed_at) VALUES (?, ?, ?, NOW())',
              [driver_id, 'On Trip', 'Available'],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          Promise.all([updateVehicle, createVehicleHistory, updateDriver, createDriverHistory])
            .then(() => {
              res.status(200).json({
                message: 'Trip cancelled successfully',
                data: {
                  trip_id,
                  trip_status: 'Cancelled',
                  vehicle_status: 'Available',
                  driver_status: 'Available'
                }
              });
            })
            .catch((err) => {
              console.error('Error in cancellation:', err);
              res.status(500).json({ message: 'Error cancelling trip', error: err.message });
            });
        } else {
          // Trip was in Draft status, no resource cleanup needed
          res.status(200).json({
            message: 'Trip cancelled successfully',
            data: {
              trip_id,
              trip_status: 'Cancelled'
            }
          });
        }
      });
    });
  });
};

