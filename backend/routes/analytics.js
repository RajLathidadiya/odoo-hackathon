const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// All analytics endpoints are protected
router.use(authenticateToken);

// Dashboard metrics
router.get('/dashboard', analyticsController.getDashboard);

// Financial summary
router.get('/financial-summary', analyticsController.getFinancialSummary);

// Fuel efficiency analytics
router.get('/fuel-efficiency', analyticsController.getFuelEfficiency);

// Vehicle-specific analytics
router.get('/vehicle/:id', analyticsController.getVehicleAnalytics);

module.exports = router;
