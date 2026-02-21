const Analytics = require('../models/Analytics');
const Joi = require('joi');

// GET /api/analytics/dashboard
exports.getDashboard = (req, res) => {
  Analytics.getDashboardMetrics((err, data) => {
    if (err) {
      console.log('err: ', err);
      return res.status(500).json({
        message: 'Error retrieving dashboard metrics',
        error: err.message
      });
    }

    // Transform database results into structured dashboard
    const vehicleStatus = {};
    const driverStatus = {};
    const tripStatus = {};

    if (data.vehicleStatus) {
      data.vehicleStatus.forEach((item) => {
        vehicleStatus[item.status] = item.count;
      });
    }

    if (data.driverStatus) {
      data.driverStatus.forEach((item) => {
        driverStatus[item.status] = item.count;
      });
    }

    if (data.tripStatus) {
      data.tripStatus.forEach((item) => {
        tripStatus[item.status] = item.count;
      });
    }

    const totalRevenue = data.totalRevenue[0].total_revenue || 0;
    const totalMaintenance = data.totalMaintenance[0].total_maintenance_cost || 0;
    const totalFuel = data.totalFuel[0].total_fuel_cost || 0;
    const totalExpenses = data.totalExpenses[0].total_expenses || 0;
    const totalOperationalCost = totalMaintenance + totalFuel + totalExpenses;
    const totalProfit = totalRevenue - totalOperationalCost;

    res.status(200).json({
      message: 'Dashboard metrics retrieved successfully',
      data: {
        fleet_status: {
          vehicles: vehicleStatus,
          drivers: driverStatus,
          trips: tripStatus
        },
        financial_overview: {
          total_revenue: totalRevenue,
          total_maintenance_cost: totalMaintenance,
          total_fuel_cost: totalFuel,
          total_other_expenses: totalExpenses,
          total_operational_cost: totalOperationalCost,
          total_profit: totalProfit,
          profit_margin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) + '%' : '0%'
        },
        fleet_efficiency: {
          average_fuel_efficiency_kmpl: data.fuelEfficiency[0].avg_fuel_efficiency_kmpl || 0
        }
      }
    });
  });
};

// GET /api/analytics/vehicle/:id
exports.getVehicleAnalytics = (req, res) => {
  const schema = Joi.object({
    id: Joi.number().required()
  });

  const { error, value } = schema.validate({ id: parseInt(req.params.id) });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((e) => ({ field: e.path[0], message: e.message }))
    });
  }

  Analytics.getVehicleAnalytics(value.id, (err, data) => {
    if (err) {
      console.log('err: ', err);
      return res.status(500).json({
        message: 'Error retrieving vehicle analytics',
        error: err.message
      });
    }

    if (!data) {
      return res.status(404).json({
        message: 'Vehicle not found'
      });
    }

    // Calculate derived metrics
    const totalOperationalCost =
      (data.total_maintenance_cost || 0) + (data.total_fuel_cost || 0) + (data.total_other_expenses || 0);
    const totalRevenue = data.total_trip_revenue || 0;
    const totalProfit = totalRevenue - totalOperationalCost;
    const fuelEfficiency =
      data.total_fuel_liters && data.total_fuel_liters > 0
        ? ((data.odometer_km - 0) / data.total_fuel_liters).toFixed(2)
        : 0;

    // ROI calculation
    const roi =
      data.acquisition_cost && data.acquisition_cost > 0
        ? (((totalProfit) / data.acquisition_cost) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      message: 'Vehicle analytics retrieved successfully',
      data: {
        vehicle_info: {
          id: data.id,
          vehicle_code: data.vehicle_code,
          license_plate: data.license_plate,
          model: data.model,
          vehicle_type: data.vehicle_type,
          capacity_kg: data.max_capacity_kg,
          acquisition_cost: data.acquisition_cost,
          status: data.status,
          current_odometer_km: data.odometer_km
        },
        trip_metrics: {
          total_completed_trips: data.total_completed_trips,
          total_trip_revenue: totalRevenue
        },
        maintenance_metrics: {
          total_maintenance_count: data.total_maintenance_count,
          total_maintenance_cost: data.total_maintenance_cost
        },
        fuel_metrics: {
          total_refuelings: data.total_refuelings,
          total_fuel_liters: data.total_fuel_liters,
          total_fuel_cost: data.total_fuel_cost,
          fuel_efficiency_kmpl: fuelEfficiency
        },
        operational_metrics: {
          maintenance_cost: data.total_maintenance_cost,
          fuel_cost: data.total_fuel_cost,
          other_expenses: data.total_other_expenses,
          total_operational_cost: totalOperationalCost
        },
        financial_metrics: {
          total_revenue: totalRevenue,
          total_operational_cost: totalOperationalCost,
          total_profit: totalProfit,
          roi_percentage: roi + '%'
        }
      }
    });
  });
};

// GET /api/analytics/financial-summary
exports.getFinancialSummary = (req, res) => {
  Analytics.getFinancialSummary((err, data) => {
    if (err) {
      console.log('err: ', err);
      return res.status(500).json({
        message: 'Error retrieving financial summary',
        error: err.message
      });
    }

    const totalOperationalCost =
      (data.total_maintenance_cost || 0) + (data.total_fuel_cost || 0) + (data.total_other_expenses || 0);
    const totalProfit = (data.total_revenue || 0) - totalOperationalCost;
    const profitMargin = data.total_revenue > 0 ? ((totalProfit / data.total_revenue) * 100).toFixed(2) : 0;
    const avgProfitPerVehicle = data.total_vehicles > 0 ? (totalProfit / data.total_vehicles).toFixed(2) : 0;

    res.status(200).json({
      message: 'Financial summary retrieved successfully',
      data: {
        revenue: {
          total_revenue: data.total_revenue || 0
        },
        operational_costs: {
          maintenance_cost: data.total_maintenance_cost || 0,
          fuel_cost: data.total_fuel_cost || 0,
          other_expenses: data.total_other_expenses || 0,
          total_operational_cost: totalOperationalCost
        },
        profitability: {
          total_profit: totalProfit,
          profit_margin_percentage: profitMargin + '%',
          average_profit_per_vehicle: avgProfitPerVehicle
        },
        fleet_info: {
          total_vehicles: data.total_vehicles,
          total_fleet_acquisition_cost: data.total_fleet_value || 0
        }
      }
    });
  });
};

// GET /api/analytics/fuel-efficiency
exports.getFuelEfficiency = (req, res) => {
  Analytics.getFuelEfficiencyAnalytics((err, data) => {
    if (err) {
      console.log('err: ', err);
      return res.status(500).json({
        message: 'Error retrieving fuel efficiency data',
        error: err.message
      });
    }

    // Calculate fleet statistics
    const vehicles = data.map((vehicle) => ({
      id: vehicle.id,
      vehicle_code: vehicle.vehicle_code,
      license_plate: vehicle.license_plate,
      model: vehicle.model,
      vehicle_type: vehicle.vehicle_type,
      refueling_count: vehicle.refueling_count,
      total_liters: vehicle.total_liters,
      total_distance_km: vehicle.total_distance_km || 0,
      fuel_efficiency_kmpl: vehicle.fuel_efficiency_kmpl || 0,
      total_fuel_cost: vehicle.total_fuel_cost || 0,
      average_cost_per_liter: vehicle.average_cost_per_liter || 0
    }));

    // Sort by fuel efficiency
    vehicles.sort((a, b) => b.fuel_efficiency_kmpl - a.fuel_efficiency_kmpl);

    // Calculate fleet averages
    const totalEfficiency = vehicles.reduce((sum, v) => sum + v.fuel_efficiency_kmpl, 0);
    const avgEfficiency = vehicles.length > 0 ? (totalEfficiency / vehicles.length).toFixed(2) : 0;
    const bestVehicle = vehicles.length > 0 ? vehicles[0] : null;
    const worstVehicle = vehicles.length > 0 ? vehicles[vehicles.length - 1] : null;
    const totalCost = vehicles.reduce((sum, v) => sum + (v.total_fuel_cost || 0), 0);
    const avgCostPerLiter =
      vehicles.reduce((sum, v) => sum + (v.average_cost_per_liter || 0), 0) / (vehicles.length || 1);

    res.status(200).json({
      message: 'Fuel efficiency analytics retrieved successfully',
      data: {
        fleet_statistics: {
          total_vehicles_tracked: vehicles.length,
          fleet_average_fuel_efficiency_kmpl: parseFloat(avgEfficiency),
          fleet_average_cost_per_liter: avgCostPerLiter.toFixed(2),
          total_fuel_cost: totalCost.toFixed(2)
        },
        best_performing: bestVehicle,
        worst_performing: worstVehicle,
        vehicle_efficiency_ranking: vehicles
      }
    });
  });
};
