import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import { BarChart3, TrendingUp, DollarSign, Fuel } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [financial, setFinancial] = useState(null);
  const [fuelEfficiency, setFuelEfficiency] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [dashRes, finRes, fuelRes] = await Promise.all([
        analyticsAPI.getDashboard().catch(() => ({ data: {} })),
        analyticsAPI.getFinancialSummary().catch(() => ({ data: {} })),
        analyticsAPI.getFuelEfficiency().catch(() => ({ data: {} })),
      ]);
      setDashboard(dashRes.data?.data || dashRes.data || {});
      setFinancial(finRes.data?.data || finRes.data || {});
      setFuelEfficiency(fuelRes.data?.data || fuelRes.data || {});
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  // Build chart data from financial summary
  const revenueExpenseData = [];
  if (financial?.monthly_summary) {
    financial.monthly_summary.forEach(m => {
      revenueExpenseData.push({ name: m.month || m.period, Revenue: m.revenue || 0, Expenses: m.expenses || 0 });
    });
  } else if (financial?.revenue !== undefined) {
    revenueExpenseData.push({ name: 'Total', Revenue: financial.revenue || 0, Expenses: financial.expenses || 0 });
  }

  // Fuel efficiency data
  const fuelData = [];
  if (Array.isArray(fuelEfficiency)) {
    fuelEfficiency.forEach(f => {
      fuelData.push({ name: f.vehicle_code || f.model || `V${f.vehicle_id}`, efficiency: f.efficiency || f.km_per_liter || 0 });
    });
  } else if (fuelEfficiency?.vehicles) {
    fuelEfficiency.vehicles.forEach(f => {
      fuelData.push({ name: f.vehicle_code || f.model || `V${f.vehicle_id}`, efficiency: f.efficiency || f.km_per_liter || 0 });
    });
  }

  // Expense breakdown for pie chart
  const expenseBreakdown = [];
  if (financial?.expense_breakdown) {
    Object.entries(financial.expense_breakdown).forEach(([key, value]) => {
      expenseBreakdown.push({ name: key, value: typeof value === 'number' ? value : 0 });
    });
  } else if (financial?.by_type) {
    financial.by_type.forEach(item => {
      expenseBreakdown.push({ name: item.type || item.expense_type, value: item.total || item.amount || 0 });
    });
  }

  const totalRevenue = financial?.total_revenue || financial?.revenue || dashboard?.total_revenue || 0;
  const totalExpenses = financial?.total_expenses || financial?.expenses || dashboard?.total_expenses || 0;
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Financial insights and fleet performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Revenue</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20">
              <DollarSign size={20} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Expenses</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${netProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <BarChart3 size={20} className={netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} />
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Net Profit</p>
              <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                ₹{netProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Revenue vs Expenses</h3>
          {revenueExpenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="Revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-surface-400">
              <p>No financial data available</p>
            </div>
          )}
        </div>

        {/* Fuel Efficiency */}
        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Fuel Efficiency by Vehicle</h3>
          {fuelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fuelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => `${value} km/L`}
                />
                <Bar dataKey="efficiency" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-surface-400">
              <p>No fuel efficiency data available</p>
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Expense Breakdown</h3>
          {expenseBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {expenseBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-surface-400">
              <p>No expense breakdown data available</p>
            </div>
          )}
        </div>

        {/* Fleet Status Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Fleet Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Vehicles', value: dashboard?.total_vehicles || dashboard?.vehicles?.total || 0, color: 'bg-blue-500' },
              { label: 'Active Trips', value: dashboard?.active_trips || dashboard?.trips?.active || 0, color: 'bg-emerald-500' },
              { label: 'Vehicles In Shop', value: dashboard?.vehicles_in_shop || dashboard?.vehicles?.in_shop || 0, color: 'bg-amber-500' },
              { label: 'Active Drivers', value: dashboard?.active_drivers || dashboard?.drivers?.active || 0, color: 'bg-violet-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-surface-700 dark:text-surface-300">{item.label}</span>
                </div>
                <span className="text-lg font-bold text-surface-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
