const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const db = require('../config/database');
const Joi = require('joi');

// Validation schema for maintenance creation
const maintenanceCreateSchema = Joi.object({
  vehicle_id: Joi.number().required(),
  service_type: Joi.string().max(100).required(),
  cost: Joi.number().positive().required(),
  service_date: Joi.date().required()
});

// GET /api/maintenance - Get all maintenance logs
exports.getAll = (req, res) => {
  Maintenance.getAll((err, logs) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Maintenance logs retrieved successfully',
      count: logs.length,
      data: logs
    });
  });
};

// GET /api/maintenance/:id - Get single maintenance log
exports.getById = (req, res) => {
  const maintenanceId = req.params.id;

  Maintenance.getById(maintenanceId, (err, log) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!log) {
      return res.status(404).json({ message: 'Maintenance log not found' });
    }

    res.status(200).json({
      message: 'Maintenance log retrieved successfully',
      data: log
    });
  });
};

// GET /api/maintenance/:vehicleId - Get maintenance logs by vehicle
exports.getByVehicleId = (req, res) => {
  const vehicleId = req.params.vehicleId;

  // Validate vehicle exists
  Vehicle.getById(vehicleId, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    Maintenance.getByVehicleId(vehicleId, (err, logs) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Get total maintenance cost
      Maintenance.getTotalCostByVehicle(vehicleId, (err, totalCost) => {
        if (err) {
          totalCost = 0;
        }

        // Get maintenance count
        Maintenance.getCountByVehicle(vehicleId, (err, count) => {
          if (err) {
            count = 0;
          }

          res.status(200).json({
            message: 'Maintenance logs retrieved successfully',
            vehicle: {
              id: vehicle.id,
              vehicle_code: vehicle.vehicle_code,
              license_plate: vehicle.license_plate,
              model: vehicle.model,
              status: vehicle.status
            },
            summary: {
              total_maintenance_count: count,
              total_maintenance_cost: totalCost
            },
            count: logs.length,
            data: logs
          });
        });
      });
    });
  });
};

// POST /api/maintenance - Create new maintenance log and set vehicle to In Shop
exports.create = (req, res) => {
  // Validate input
  const { error, value } = maintenanceCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  const { vehicle_id, service_type, cost, service_date } = value;

  // Verify vehicle exists
  Vehicle.getById(vehicle_id, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create maintenance log
    const newMaintenance = {
      vehicle_id,
      service_type,
      cost,
      service_date
    };

    Maintenance.create(newMaintenance, (err, maintenance) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating maintenance log', error: err.message });
      }

      // Update vehicle status to "In Shop" if not already
      if (vehicle.status !== 'In Shop') {
        const oldStatus = vehicle.status;

        db.query('UPDATE vehicles SET status = ? WHERE id = ?', ['In Shop', vehicle_id], (err) => {
          if (err) {
            console.log('Error updating vehicle status:', err);
            // Don't fail the maintenance creation if status update fails
          }

          // Create vehicle status history
          db.query(
            'INSERT INTO vehicle_status_history (vehicle_id, old_status, new_status, changed_at) VALUES (?, ?, ?, NOW())',
            [vehicle_id, oldStatus, 'In Shop'],
            (err) => {
              if (err) {
                console.log('Error creating status history:', err);
              }

              res.status(201).json({
                message: 'Maintenance log created successfully',
                data: {
                  ...maintenance,
                  vehicle_code: vehicle.vehicle_code,
                  license_plate: vehicle.license_plate
                },
                vehicle_status_changed: {
                  old_status: oldStatus,
                  new_status: 'In Shop'
                }
              });
            }
          );
        });
      } else {
        // Vehicle already in shop
        res.status(201).json({
          message: 'Maintenance log created successfully',
          data: {
            ...maintenance,
            vehicle_code: vehicle.vehicle_code,
            license_plate: vehicle.license_plate
          },
          vehicle_status_changed: false
        });
      }
    });
  });
};
