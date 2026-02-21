const db = require('../config/database');

const Analytics = function() {};

// Get dashboard metrics
Analytics.getDashboardMetrics = (result) => {
  const queries = {
    // Vehicle status metrics
    vehicleStatus: 'SELECT status, COUNT(*) as count FROM vehicles GROUP BY status',
    
    // Driver status metrics
    driverStatus: 'SELECT status, COUNT(*) as count FROM drivers GROUP BY status',
    
    // Trip status metrics
    tripStatus: 'SELECT status, COUNT(*) as count FROM trips GROUP BY status',
    
    // Financial metrics
    totalRevenue: 'SELECT SUM(revenue) as total_revenue FROM trips WHERE status = "Completed"',
    
    // Maintenance cost
    totalMaintenance: 'SELECT SUM(cost) as total_maintenance_cost FROM maintenance_logs',
    
    // Fuel cost
    totalFuel: 'SELECT SUM(cost) as total_fuel_cost FROM fuel_logs',
    
    // Expenses
    totalExpenses: 'SELECT SUM(amount) as total_expenses FROM expenses',
    
    // Fleet efficiency
    fuelEfficiency: `
      SELECT 
        ROUND(SUM(fl.odometer_reading - COALESCE(fl_prev.odometer_reading, 0)) / SUM(fl.liters), 2) as avg_fuel_efficiency_kmpl
      FROM fuel_logs fl
      LEFT JOIN fuel_logs fl_prev ON fl.vehicle_id = fl_prev.vehicle_id 
        AND fl_prev.fuel_date = (
          SELECT MAX(fuel_date) FROM fuel_logs 
          WHERE vehicle_id = fl.vehicle_id AND fuel_date < fl.fuel_date
        )
    `
  };

  // Execute all queries
  let completed = 0;
  const results = {};

  Object.keys(queries).forEach((key) => {
    db.query(queries[key], (err, res) => {
      if (!err) {
        results[key] = res;
      }
      completed++;
      
      if (completed === Object.keys(queries).length) {
        result(null, results);
      }
    });
  });
};

// Get vehicle analytics
Analytics.getVehicleAnalytics = (vehicleId, result) => {
  const query = `
    SELECT 
      v.id,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.vehicle_type,
      v.max_capacity_kg,
      v.acquisition_cost,
      v.odometer_km,
      v.status,
      v.created_at,
      (SELECT COUNT(*) FROM trips t 
       JOIN trip_assignments ta ON t.id = ta.trip_id 
       WHERE ta.vehicle_id = v.id AND t.status = 'Completed') as total_completed_trips,
      (SELECT SUM(t.revenue) FROM trips t 
       JOIN trip_assignments ta ON t.id = ta.trip_id 
       WHERE ta.vehicle_id = v.id AND t.status = 'Completed') as total_trip_revenue,
      (SELECT COUNT(*) FROM maintenance_logs WHERE vehicle_id = v.id) as total_maintenance_count,
      (SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id) as total_maintenance_cost,
      (SELECT SUM(liters) FROM fuel_logs WHERE vehicle_id = v.id) as total_fuel_liters,
      (SELECT SUM(cost) FROM fuel_logs WHERE vehicle_id = v.id) as total_fuel_cost,
      (SELECT SUM(amount) FROM expenses WHERE vehicle_id = v.id) as total_other_expenses,
      (SELECT COUNT(*) FROM fuel_logs WHERE vehicle_id = v.id) as total_refuelings
    FROM vehicles v
    WHERE v.id = ?
  `;

  db.query(query, [vehicleId], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      if (res.length > 0) {
        result(null, res[0]);
      } else {
        result(null, null);
      }
    }
  });
};

// Get fuel efficiency analytics
Analytics.getFuelEfficiencyAnalytics = (result) => {
  const query = `
    SELECT 
      v.id,
      v.vehicle_code,
      v.license_plate,
      v.model,
      v.vehicle_type,
      (SELECT COUNT(*) FROM fuel_logs WHERE vehicle_id = v.id) as refueling_count,
      (SELECT SUM(liters) FROM fuel_logs WHERE vehicle_id = v.id) as total_liters,
      (SELECT MAX(odometer_reading) FROM fuel_logs WHERE vehicle_id = v.id) as max_odometer,
      (SELECT MIN(odometer_reading) FROM fuel_logs WHERE vehicle_id = v.id) as min_odometer,
      (SELECT MAX(odometer_reading) - MIN(odometer_reading) FROM fuel_logs WHERE vehicle_id = v.id) as total_distance_km,
      CASE 
        WHEN (SELECT SUM(liters) FROM fuel_logs WHERE vehicle_id = v.id) > 0 THEN
          ROUND(
            ((SELECT MAX(odometer_reading) FROM fuel_logs WHERE vehicle_id = v.id) - 
             (SELECT MIN(odometer_reading) FROM fuel_logs WHERE vehicle_id = v.id)) / 
            (SELECT SUM(liters) FROM fuel_logs WHERE vehicle_id = v.id), 2
          )
        ELSE 0
      END as fuel_efficiency_kmpl,
      (SELECT SUM(cost) FROM fuel_logs WHERE vehicle_id = v.id) as total_fuel_cost,
      CASE 
        WHEN (SELECT SUM(liters) FROM fuel_logs WHERE vehicle_id = v.id) > 0 THEN
          ROUND(
            (SELECT SUM(cost) FROM fuel_logs WHERE vehicle_id = v.id) / 
            (SELECT SUM(liters) FROM fuel_logs WHERE vehicle_id = v.id), 2
          )
        ELSE 0
      END as average_cost_per_liter
    FROM vehicles v
    LEFT JOIN fuel_logs fl ON v.id = fl.vehicle_id
    GROUP BY v.id
    ORDER BY fuel_efficiency_kmpl DESC
  `;

  db.query(query, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get financial summary
Analytics.getFinancialSummary = (result) => {
  const query = `
    SELECT 
      (SELECT SUM(revenue) FROM trips WHERE status = 'Completed') as total_revenue,
      (SELECT SUM(cost) FROM maintenance_logs) as total_maintenance_cost,
      (SELECT SUM(cost) FROM fuel_logs) as total_fuel_cost,
      (SELECT SUM(amount) FROM expenses) as total_other_expenses,
      (SELECT SUM(revenue) FROM trips WHERE status = 'Completed') -
      ((SELECT SUM(cost) FROM maintenance_logs) +
       (SELECT SUM(cost) FROM fuel_logs) +
       (SELECT SUM(amount) FROM expenses)) as total_profit,
      (SELECT COUNT(*) FROM vehicles) as total_vehicles,
      (SELECT SUM(acquisition_cost) FROM vehicles) as total_fleet_value
    FROM DUAL
  `;

  db.query(query, (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res[0]);
    }
  });
};

// Get top performing vehicles by revenue
Analytics.getTopVehiclesByRevenue = (limit, result) => {
  const query = `
    SELECT 
      v.id,
      v.vehicle_code,
      v.license_plate,
      v.model,
      (SELECT SUM(t.revenue) FROM trips t 
       JOIN trip_assignments ta ON t.id = ta.trip_id 
       WHERE ta.vehicle_id = v.id AND t.status = 'Completed') as total_revenue,
      (SELECT COUNT(*) FROM trips t 
       JOIN trip_assignments ta ON t.id = ta.trip_id 
       WHERE ta.vehicle_id = v.id AND t.status = 'Completed') as completed_trips
    FROM vehicles v
    ORDER BY total_revenue DESC
    LIMIT ?
  `;

  db.query(query, [limit || 5], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

// Get operational cost breakdown by vehicle
Analytics.getOperationalCostByVehicle = (vehicleId, result) => {
  const query = `
    SELECT 
      v.id,
      v.vehicle_code,
      v.license_plate,
      (SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id) as maintenance_cost,
      (SELECT SUM(cost) FROM fuel_logs WHERE vehicle_id = v.id) as fuel_cost,
      (SELECT SUM(amount) FROM expenses WHERE vehicle_id = v.id) as other_expenses,
      (SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id) +
      (SELECT SUM(cost) FROM fuel_logs WHERE vehicle_id = v.id) +
      (SELECT SUM(amount) FROM expenses WHERE vehicle_id = v.id) as total_operational_cost,
      (SELECT SUM(revenue) FROM trips t 
       JOIN trip_assignments ta ON t.id = ta.trip_id 
       WHERE ta.vehicle_id = v.id AND t.status = 'Completed') as total_revenue,
      (SELECT SUM(revenue) FROM trips t 
       JOIN trip_assignments ta ON t.id = ta.trip_id 
       WHERE ta.vehicle_id = v.id AND t.status = 'Completed') -
      ((SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id) +
       (SELECT SUM(cost) FROM fuel_logs WHERE vehicle_id = v.id) +
       (SELECT SUM(amount) FROM expenses WHERE vehicle_id = v.id)) as total_profit,
      v.acquisition_cost
    FROM vehicles v
    WHERE v.id = ?
  `;

  db.query(query, [vehicleId], (err, res) => {
    if (err) {
      console.log('error: ', err);
      result(err, null);
    } else {
      result(null, res[0]);
    }
  });
};

module.exports = Analytics;
