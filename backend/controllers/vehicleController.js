const Vehicle = require('../models/Vehicle');
const Joi = require('joi');

// Validation schema for vehicle creation
const vehicleCreateSchema = Joi.object({
  vehicle_code: Joi.string().min(2).max(50).required(),
  license_plate: Joi.string().min(2).max(20).required(),
  model: Joi.string().max(100).required(),
  max_capacity_kg: Joi.number().positive().required(),
  acquisition_cost: Joi.number().positive().required(),
  odometer_km: Joi.number().min(0).required(),
  vehicle_type: Joi.string().valid('Truck', 'Van', 'Bike').required(),
  region: Joi.string().max(100).required()
});

// Validation schema for vehicle update
const vehicleUpdateSchema = Joi.object({
  vehicle_code: Joi.string().min(2).max(50).optional(),
  license_plate: Joi.string().min(2).max(20).optional(),
  model: Joi.string().max(100).optional(),
  max_capacity_kg: Joi.number().positive().optional(),
  acquisition_cost: Joi.number().positive().optional(),
  odometer_km: Joi.number().min(0).optional(),
  vehicle_type: Joi.string().valid('Truck', 'Van', 'Bike').optional(),
  region: Joi.string().max(100).optional()
});

// Validation schema for status update
const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('Available', 'On Trip', 'In Shop', 'Out of Service').required()
});

// GET /api/vehicles - Get all vehicles
exports.getAll = (req, res) => {
  Vehicle.getAll((err, vehicles) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Vehicles retrieved successfully',
      count: vehicles.length,
      data: vehicles
    });
  });
};

// GET /api/vehicles/:id - Get vehicle by ID
exports.getById = (req, res) => {
  const vehicleId = req.params.id;

  Vehicle.getById(vehicleId, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({
      message: 'Vehicle retrieved successfully',
      data: vehicle
    });
  });
};

// POST /api/vehicles - Create new vehicle
exports.create = (req, res) => {
  // Validate input
  const { error, value } = vehicleCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if vehicle code already exists
  Vehicle.getByCode(value.vehicle_code, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (vehicle) {
      return res.status(409).json({ message: 'Vehicle code already exists' });
    }

    // Create vehicle with default status
    const newVehicle = {
      ...value,
      status: 'Available'
    };

    Vehicle.create(newVehicle, (err, vehicle) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating vehicle', error: err.message });
      }

      res.status(201).json({
        message: 'Vehicle created successfully',
        data: vehicle
      });
    });
  });
};

// PUT /api/vehicles/:id - Update entire vehicle
exports.update = (req, res) => {
  const vehicleId = req.params.id;

  // Validate input
  const { error, value } = vehicleUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if vehicle exists
  Vehicle.getById(vehicleId, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    Vehicle.updateById(vehicleId, value, (err, updatedVehicle) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating vehicle' });
      }

      res.status(200).json({
        message: 'Vehicle updated successfully',
        data: updatedVehicle
      });
    });
  });
};

// DELETE /api/vehicles/:id - Delete vehicle
exports.delete = (req, res) => {
  const vehicleId = req.params.id;

  // Check if vehicle exists
  Vehicle.getById(vehicleId, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    Vehicle.delete(vehicleId, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting vehicle' });
      }

      res.status(200).json({
        message: 'Vehicle deleted successfully'
      });
    });
  });
};

// PATCH /api/vehicles/:id/status - Update vehicle status
exports.updateStatus = (req, res) => {
  const vehicleId = req.params.id;

  // Validate input
  const { error, value } = statusUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if vehicle exists
  Vehicle.getById(vehicleId, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Validate status transition
    const validTransitions = {
      'Available': ['On Trip', 'In Shop', 'Out of Service'],
      'On Trip': ['Available'],
      'In Shop': ['Available'],
      'Out of Service': []
    };

    if (!validTransitions[vehicle.status] || !validTransitions[vehicle.status].includes(value.status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${vehicle.status} to ${value.status}`,
        currentStatus: vehicle.status,
        allowedTransitions: validTransitions[vehicle.status]
      });
    }

    Vehicle.updateStatus(vehicleId, value.status, (err, updatedVehicle) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating vehicle status' });
      }

      res.status(200).json({
        message: 'Vehicle status updated successfully',
        data: updatedVehicle
      });
    });
  });
};
