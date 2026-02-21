const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All analytics endpoints are protected, all authenticated users can view dashboard
router.get('/dashboard', authenticateToken, analyticsController.getDashboard);

// Financial summary - Financial Analyst, Fleet Manager, Super Admin only
router.get('/financial-summary', 
  authenticateToken, 
  authorizeRoles('Financial Analyst', 'Fleet Manager', 'Super Admin'),
  analyticsController.getFinancialSummary
);

// Fuel efficiency analytics - All authenticated users can view
router.get('/fuel-efficiency', authenticateToken, analyticsController.getFuelEfficiency);

// Vehicle-specific analytics - All authenticated users can view
router.get('/vehicle/:id', authenticateToken, analyticsController.getVehicleAnalytics);

module.exports = router;
