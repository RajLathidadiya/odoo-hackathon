const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const Joi = require('joi');

// Validation schema for fuel log creation
const fuelLogCreateSchema = Joi.object({
  vehicle_id: Joi.number().required(),
  trip_id: Joi.number().optional(),
  liters: Joi.number().positive().required(),
  cost: Joi.number().positive().required(),
  odometer_reading: Joi.number().positive().required(),
  fuel_date: Joi.date().required()
});

// GET /api/fuel - Get all fuel logs
exports.getAll = (req, res) => {
  FuelLog.getAll((err, logs) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Fuel logs retrieved successfully',
      count: logs.length,
      data: logs
    });
  });
};

// GET /api/fuel/:id - Get single fuel log
exports.getById = (req, res) => {
  const fuelLogId = req.params.id;

  FuelLog.getById(fuelLogId, (err, log) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!log) {
      return res.status(404).json({ message: 'Fuel log not found' });
    }

    res.status(200).json({
      message: 'Fuel log retrieved successfully',
      data: log
    });
  });
};

// GET /api/fuel/:vehicleId - Get fuel logs by vehicle with efficiency metrics
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

    FuelLog.getByVehicleId(vehicleId, (err, logs) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Get total fuel cost
      FuelLog.getTotalCostByVehicle(vehicleId, (err, totalCost) => {
        if (err) {
          totalCost = 0;
        }

        // Get total liters
        FuelLog.getTotalLitersByVehicle(vehicleId, (err, totalLiters) => {
          if (err) {
            totalLiters = 0;
          }

          // Get fuel efficiency
          FuelLog.getFuelEfficiencyByVehicle(vehicleId, (err, efficiency) => {
            if (err) {
              efficiency = {
                total_refuelings: 0,
                total_liters: 0,
                total_distance_km: 0,
                fuel_efficiency_kmpl: 0
              };
            }

            // Get refueling count
            FuelLog.getCountByVehicle(vehicleId, (err, count) => {
              if (err) {
                count = 0;
              }

              res.status(200).json({
                message: 'Fuel logs retrieved successfully',
                vehicle: {
                  id: vehicle.id,
                  vehicle_code: vehicle.vehicle_code,
                  license_plate: vehicle.license_plate,
                  model: vehicle.model,
                  status: vehicle.status,
                  current_odometer_km: vehicle.odometer_km
                },
                summary: {
                  total_refuelings: efficiency.total_refuelings,
                  total_liters: parseFloat(efficiency.total_liters) || 0,
                  total_distance_km: efficiency.total_distance_km,
                  total_fuel_cost: parseFloat(totalCost) || 0,
                  fuel_efficiency_kmpl: efficiency.fuel_efficiency_kmpl || 0,
                  average_cost_per_liter: efficiency.total_liters > 0 
                    ? (parseFloat(totalCost) / parseFloat(efficiency.total_liters)).toFixed(2)
                    : 0
                },
                count: logs.length,
                data: logs
              });
            });
          });
        });
      });
    });
  });
};

// POST /api/fuel - Create new fuel log
exports.create = (req, res) => {
  // Validate input
  const { error, value } = fuelLogCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  const { vehicle_id, trip_id, liters, cost, odometer_reading, fuel_date } = value;

  // Verify vehicle exists
  Vehicle.getById(vehicle_id, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Validate odometer reading is not less than vehicle's current odometer
    if (odometer_reading < vehicle.odometer_km) {
      return res.status(400).json({
        message: 'Odometer reading cannot be less than vehicle current odometer',
        current_odometer: vehicle.odometer_km,
        provided_odometer: odometer_reading
      });
    }

    // Create fuel log
    const newFuelLog = {
      vehicle_id,
      trip_id: trip_id || null,
      liters,
      cost,
      odometer_reading,
      fuel_date
    };

    FuelLog.create(newFuelLog, (err, fuelLog) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating fuel log', error: err.message });
      }

      res.status(201).json({
        message: 'Fuel log created successfully',
        data: {
          ...fuelLog,
          vehicle_code: vehicle.vehicle_code,
          license_plate: vehicle.license_plate,
          cost_per_liter: (cost / liters).toFixed(2)
        }
      });
    });
  });
};
