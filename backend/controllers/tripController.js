const Trip = require('../models/Trip');
const Joi = require('joi');

// Validation schema for trip creation
const tripCreateSchema = Joi.object({
  trip_code: Joi.string().min(2).max(50).required(),
  origin: Joi.string().max(100).required(),
  destination: Joi.string().max(100).required(),
  cargo_weight_kg: Joi.number().positive().required(),
  revenue: Joi.number().positive().required()
});

// Validation schema for trip update
const tripUpdateSchema = Joi.object({
  trip_code: Joi.string().min(2).max(50).optional(),
  origin: Joi.string().max(100).optional(),
  destination: Joi.string().max(100).optional(),
  cargo_weight_kg: Joi.number().positive().optional(),
  revenue: Joi.number().positive().optional()
});

// Validation schema for status update
const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('Draft', 'Dispatched', 'Completed', 'Cancelled').required()
});

// GET /api/trips - Get all trips
exports.getAll = (req, res) => {
  Trip.getAll((err, trips) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Trips retrieved successfully',
      count: trips.length,
      data: trips
    });
  });
};

// GET /api/trips/:id - Get trip by ID with assignments
exports.getById = (req, res) => {
  const tripId = req.params.id;

  Trip.getTripWithAssignments(tripId, (err, tripData) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!tripData || tripData.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Parse trip data
    const trip = tripData[0];
    const tripWithAssignments = {
      id: trip.id,
      trip_code: trip.trip_code,
      origin: trip.origin,
      destination: trip.destination,
      cargo_weight_kg: trip.cargo_weight_kg,
      revenue: trip.revenue,
      status: trip.status,
      start_time: trip.start_time,
      end_time: trip.end_time,
      assignments: []
    };

    // Add assignment if exists
    if (trip.vehicle_id) {
      tripWithAssignments.assignments.push({
        vehicle_id: trip.vehicle_id,
        vehicle_code: trip.vehicle_code,
        license_plate: trip.license_plate,
        max_capacity_kg: trip.max_capacity_kg,
        vehicle_status: trip.vehicle_status,
        driver_id: trip.driver_id,
        driver_name: trip.full_name,
        license_number: trip.license_number,
        driver_status: trip.driver_status
      });
    }

    res.status(200).json({
      message: 'Trip retrieved successfully',
      data: tripWithAssignments
    });
  });
};

// POST /api/trips - Create new trip
exports.create = (req, res) => {
  // Validate input
  const { error, value } = tripCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if trip code already exists
  Trip.getByCode(value.trip_code, (err, trip) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (trip) {
      return res.status(409).json({ message: 'Trip code already exists' });
    }

    // Create trip with default status
    const newTrip = {
      ...value,
      status: 'Draft'
    };

    Trip.create(newTrip, (err, trip) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating trip', error: err.message });
      }

      res.status(201).json({
        message: 'Trip created successfully',
        data: trip
      });
    });
  });
};

// PUT /api/trips/:id - Update entire trip
exports.update = (req, res) => {
  const tripId = req.params.id;

  // Validate input
  const { error, value } = tripUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if trip exists
  Trip.getById(tripId, (err, trip) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Cannot update dispatched or completed trips
    if (trip.status === 'Dispatched' || trip.status === 'Completed' || trip.status === 'Cancelled') {
      return res.status(400).json({
        message: `Cannot update trip with status ${trip.status}`,
        currentStatus: trip.status
      });
    }

    // If trip code is being changed, check uniqueness
    if (value.trip_code && value.trip_code !== trip.trip_code) {
      Trip.getByCode(value.trip_code, (checkErr, existingTrip) => {
        if (checkErr) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (existingTrip) {
          return res.status(409).json({ message: 'Trip code already exists' });
        }

        performUpdate();
      });
    } else {
      performUpdate();
    }

    function performUpdate() {
      Trip.updateById(tripId, value, (err, updatedTrip) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating trip' });
        }

        res.status(200).json({
          message: 'Trip updated successfully',
          data: updatedTrip
        });
      });
    }
  });
};

// DELETE /api/trips/:id - Delete trip
exports.delete = (req, res) => {
  const tripId = req.params.id;

  // Check if trip exists
  Trip.getById(tripId, (err, trip) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Can only delete Draft trips
    if (trip.status !== 'Draft') {
      return res.status(400).json({
        message: `Cannot delete trip with status ${trip.status}. Only Draft trips can be deleted.`,
        currentStatus: trip.status
      });
    }

    Trip.delete(tripId, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting trip' });
      }

      res.status(200).json({
        message: 'Trip deleted successfully'
      });
    });
  });
};

// PATCH /api/trips/:id/status - Update trip status
exports.updateStatus = (req, res) => {
  const tripId = req.params.id;

  // Validate input
  const { error, value } = statusUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if trip exists
  Trip.getById(tripId, (err, trip) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Validate status transition
    const validTransitions = {
      'Draft': ['Dispatched', 'Cancelled'],
      'Dispatched': ['Completed', 'Cancelled'],
      'Completed': [],
      'Cancelled': []
    };

    if (!validTransitions[trip.status] || !validTransitions[trip.status].includes(value.status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${trip.status} to ${value.status}`,
        currentStatus: trip.status,
        allowedTransitions: validTransitions[trip.status]
      });
    }

    // If transitioning to Dispatched, set start_time
    let updateData = { status: value.status };
    if (value.status === 'Dispatched' && !trip.start_time) {
      updateData.start_time = new Date();
    }

    // If transitioning to Completed, set end_time
    if (value.status === 'Completed' && !trip.end_time) {
      updateData.end_time = new Date();
    }

    Trip.updateById(tripId, updateData, (err, updatedTrip) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating trip status' });
      }

      res.status(200).json({
        message: 'Trip status updated successfully',
        data: updatedTrip
      });
    });
  });
};
