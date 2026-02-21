import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import { Truck, MapPin, Wrench, DollarSign, TrendingUp, Fuel, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const kpiConfig = [
  { key: 'total_vehicles', label: 'Total Vehicles', icon: Truck, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'active_trips', label: 'Active Trips', icon: MapPin, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'vehicles_in_shop', label: 'In Maintenance', icon: Wrench, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', isCurrency: true },
  { key: 'total_expenses', label: 'Total Expenses', icon: TrendingUp, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', isCurrency: true },
  { key: 'fuel_efficiency', label: 'Fuel Efficiency', icon: Fuel, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', suffix: ' km/L' },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const dashData = data?.data || data || {};

  const getValue = (key) => {
    if (dashData[key] !== undefined) return dashData[key];
    // Try nested structures
    if (key === 'total_vehicles') return dashData.vehicles?.total || dashData.totalVehicles || 0;
    if (key === 'active_trips') return dashData.trips?.active || dashData.activeTrips || 0;
    if (key === 'vehicles_in_shop') return dashData.vehicles?.in_shop || dashData.vehiclesInShop || 0;
    if (key === 'total_revenue') return dashData.financial?.revenue || dashData.totalRevenue || 0;
    if (key === 'total_expenses') return dashData.financial?.expenses || dashData.totalExpenses || 0;
    if (key === 'fuel_efficiency') return dashData.fuel?.efficiency || dashData.fuelEfficiency || 0;
    return 0;
  };

  const formatValue = (value, isCurrency, suffix) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
    }
    if (suffix) return `${(value || 0).toFixed?.(1) || value}${suffix}`;
    return value ?? 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Fleet overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiConfig.map(({ key, label, icon: Icon, color, bg, isCurrency, suffix }) => (
          <div key={key} className="card card-hover group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{label}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white mt-2">
                  {formatValue(getValue(key), isCurrency, suffix)}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={22} className={`bg-gradient-to-r ${color} bg-clip-text`} style={{color: 'inherit'}} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats / Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Add New Vehicle', href: '/vehicles', color: 'bg-blue-500' },
              { label: 'Create Trip', href: '/trips', color: 'bg-emerald-500' },
              { label: 'Dispatch Assignment', href: '/dispatch', color: 'bg-violet-500' },
              { label: 'Log Maintenance', href: '/maintenance', color: 'bg-amber-500' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 group"
              >
                <div className={`w-2 h-2 rounded-full ${action.color}`} />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-white">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Backend API</span>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
              <span className="text-sm text-surface-600 dark:text-surface-400">Fleet Utilization</span>
              <span className="text-sm font-semibold text-surface-900 dark:text-white">
                {dashData.fleet_utilization || dashData.utilization || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
              <span className="text-sm text-surface-600 dark:text-surface-400">Active Drivers</span>
              <span className="text-sm font-semibold text-surface-900 dark:text-white">
                {dashData.active_drivers || dashData.activeDrivers || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
