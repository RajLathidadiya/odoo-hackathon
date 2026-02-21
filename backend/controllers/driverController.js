const Driver = require('../models/Driver');
const Joi = require('joi');

// Validation schema for driver creation
const driverCreateSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  license_number: Joi.string().min(2).max(50).required(),
  license_category: Joi.string().max(50).required(),
  license_expiry: Joi.date().required(),
  safety_score: Joi.number().min(0).max(100).optional()
});

// Validation schema for driver update
const driverUpdateSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  license_number: Joi.string().min(2).max(50).optional(),
  license_category: Joi.string().max(50).optional(),
  license_expiry: Joi.date().optional(),
  safety_score: Joi.number().min(0).max(100).optional()
});

// Validation schema for status update
const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('Available', 'On Trip', 'Off Duty', 'Suspended').required()
});

// GET /api/drivers - Get all drivers
exports.getAll = (req, res) => {
  Driver.getAll((err, drivers) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({
      message: 'Drivers retrieved successfully',
      count: drivers.length,
      data: drivers
    });
  });
};

// GET /api/drivers/:id - Get driver by ID
exports.getById = (req, res) => {
  const driverId = req.params.id;

  Driver.getById(driverId, (err, driver) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check license expiry status
    const isExpired = Driver.isLicenseExpired(driver.license_expiry);

    res.status(200).json({
      message: 'Driver retrieved successfully',
      data: {
        ...driver,
        license_expired: isExpired
      }
    });
  });
};

// POST /api/drivers - Create new driver
exports.create = (req, res) => {
  // Validate input
  const { error, value } = driverCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if license number already exists
  Driver.getByLicense(value.license_number, (err, driver) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (driver) {
      return res.status(409).json({ message: 'License number already registered' });
    }

    // Check if license is already expired
    if (Driver.isLicenseExpired(value.license_expiry)) {
      return res.status(400).json({ message: 'License has already expired' });
    }

    // Create driver with default status
    const newDriver = {
      ...value,
      status: 'Available',
      safety_score: value.safety_score || 0
    };

    Driver.create(newDriver, (err, driver) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating driver', error: err.message });
      }

      res.status(201).json({
        message: 'Driver created successfully',
        data: driver
      });
    });
  });
};

// PUT /api/drivers/:id - Update entire driver
exports.update = (req, res) => {
  const driverId = req.params.id;

  // Validate input
  const { error, value } = driverUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if driver exists
  Driver.getById(driverId, (err, driver) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // If license number is being updated, check uniqueness
    if (value.license_number && value.license_number !== driver.license_number) {
      Driver.getByLicense(value.license_number, (checkErr, existingDriver) => {
        if (checkErr) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (existingDriver) {
          return res.status(409).json({ message: 'License number already registered' });
        }

        // If license expiry is being updated, check it's not expired
        if (value.license_expiry && Driver.isLicenseExpired(value.license_expiry)) {
          return res.status(400).json({ message: 'Cannot set an already expired license' });
        }

        performUpdate();
      });
    } else {
      // If license expiry is being updated, check it's not expired
      if (value.license_expiry && Driver.isLicenseExpired(value.license_expiry)) {
        return res.status(400).json({ message: 'Cannot set an already expired license' });
      }

      performUpdate();
    }

    function performUpdate() {
      Driver.updateById(driverId, value, (err, updatedDriver) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating driver' });
        }

        res.status(200).json({
          message: 'Driver updated successfully',
          data: updatedDriver
        });
      });
    }
  });
};

// DELETE /api/drivers/:id - Delete driver
exports.delete = (req, res) => {
  const driverId = req.params.id;

  // Check if driver exists
  Driver.getById(driverId, (err, driver) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Prevent deletion if driver is on trip
    if (driver.status === 'On Trip') {
      return res.status(400).json({ message: 'Cannot delete driver while on trip' });
    }

    Driver.delete(driverId, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting driver' });
      }

      res.status(200).json({
        message: 'Driver deleted successfully'
      });
    });
  });
};

// PATCH /api/drivers/:id/status - Update driver status
exports.updateStatus = (req, res) => {
  const driverId = req.params.id;

  // Validate input
  const { error, value } = statusUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message
    });
  }

  // Check if driver exists
  Driver.getById(driverId, (err, driver) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Validate status transition
    const validTransitions = {
      'Available': ['On Trip', 'Off Duty', 'Suspended'],
      'On Trip': ['Available'],
      'Off Duty': ['Available'],
      'Suspended': ['Available']
    };

    if (!validTransitions[driver.status] || !validTransitions[driver.status].includes(value.status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${driver.status} to ${value.status}`,
        currentStatus: driver.status,
        allowedTransitions: validTransitions[driver.status]
      });
    }

    // Check license expiry
    if (value.status === 'On Trip' || value.status === 'Available') {
      if (Driver.isLicenseExpired(driver.license_expiry)) {
        return res.status(400).json({
          message: 'Cannot assign driver with expired license',
          license_expiry: driver.license_expiry
        });
      }
    }

    // Check if driver is suspended
    if (driver.status === 'Suspended' && value.status !== 'Available') {
      return res.status(400).json({
        message: 'Suspended driver can only be set to Available status'
      });
    }

    Driver.updateStatus(driverId, value.status, (err, updatedDriver) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating driver status' });
      }

      res.status(200).json({
        message: 'Driver status updated successfully',
        data: updatedDriver
      });
    });
  });
};
