import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import { BarChart3, TrendingUp, Fuel, DollarSign, RefreshCw, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportDashboardToCSV, exportFuelDataToCSV, exportToPDF, getFormattedDateForFilename } from '../utils/exportUtils';

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [fuelData, setFuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [d, f, fuel] = await Promise.allSettled([
        analyticsAPI.getDashboard(),
        analyticsAPI.getFinancialSummary(),
        analyticsAPI.getFuelEfficiency(),
      ]);
      if (d.status === 'fulfilled') setDashboard(d.value.data?.data || d.value.data || {});
      if (f.status === 'fulfilled') setFinancial(f.value.data?.data || f.value.data || {});
      if (fuel.status === 'fulfilled') setFuelData(fuel.value.data?.data || fuel.value.data || {});
    } catch { toast.error('Failed to load analytics'); }
    finally { 
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <PageLoader />;

  const fmt = (v) => v != null ? `₹${Number(v).toLocaleString()}` : '—';

  // Prepare fleet status data for chart
  const fleetStatusData = dashboard?.fleet_status ? [
    { name: 'Vehicles', active: dashboard.fleet_status.vehicles?.active || 0, inactive: dashboard.fleet_status.vehicles?.inactive || 0 },
    { name: 'Drivers', active: dashboard.fleet_status.drivers?.active || 0, inactive: dashboard.fleet_status.drivers?.inactive || 0 },
    { name: 'Trips', completed: dashboard.fleet_status.trips?.completed || 0, pending: dashboard.fleet_status.trips?.pending || 0 },
  ] : [];

  // Prepare financial data for pie chart
  const financialData = dashboard?.financial_overview ? [
    { name: 'Fuel', value: parseFloat(dashboard.financial_overview.total_fuel_cost || 0), color: '#0891b2' },
    { name: 'Maintenance', value: parseFloat(dashboard.financial_overview.total_maintenance_cost || 0), color: '#e11d48' },
    { name: 'Other Expenses', value: parseFloat(dashboard.financial_overview.total_other_expenses || 0), color: '#f59e0b' },
  ].filter(item => item.value > 0) : [];

  const summaryCards = [
    { label: 'Total Revenue', value: fmt(dashboard?.financial_overview?.total_revenue), icon: DollarSign, bg: '#ecfdf5', color: '#059669' },
    { label: 'Total Expenses', value: fmt(dashboard?.financial_overview?.total_operational_cost), icon: TrendingUp, bg: '#fef2f2', color: '#dc2626' },
    { label: 'Net Profit', value: fmt(dashboard?.financial_overview?.total_profit), icon: BarChart3, bg: '#eef2ff', color: '#4f46e5' },
    { label: 'Profit Margin', value: dashboard?.financial_overview?.profit_margin || '—', icon: Fuel, bg: '#fffbeb', color: '#d97706' },
  ];

  const finRows = dashboard?.financial_overview ? [
    { label: 'Total Revenue', value: fmt(dashboard.financial_overview.total_revenue) },
    { label: 'Fuel Costs', value: fmt(dashboard.financial_overview.total_fuel_cost) },
    { label: 'Maintenance Costs', value: fmt(dashboard.financial_overview.total_maintenance_cost) },
    { label: 'Other Expenses', value: fmt(dashboard.financial_overview.total_other_expenses) },
    { label: 'Total Operational Cost', value: fmt(dashboard.financial_overview.total_operational_cost) },
    { label: 'Net Profit', value: fmt(dashboard.financial_overview.total_profit), bold: true },
  ] : [];

  const fuelRows = Array.isArray(fuelData?.vehicles || fuelData) ? (fuelData?.vehicles || fuelData) : [];

  // Export handlers
  const handleExportDashboardCSV = () => {
    const dateStr = getFormattedDateForFilename();
    if (exportDashboardToCSV(dashboard, `fleet-analytics-${dateStr}.csv`)) {
      toast.success('Dashboard exported to CSV');
    } else {
      toast.error('Failed to export dashboard');
    }
  };

  const handleExportFuelCSV = () => {
    const dateStr = getFormattedDateForFilename();
    if (exportFuelDataToCSV(fuelRows, `fuel-report-${dateStr}.csv`)) {
      toast.success('Fuel report exported to CSV');
    } else {
      toast.error('Failed to export fuel report');
    }
  };

  const handleExportPDF = async () => {
    const dateStr = getFormattedDateForFilename();
    const success = await exportToPDF('analytics-container', `fleet-analytics-${dateStr}.pdf`);
    if (success) {
      toast.success('Report exported to PDF');
    } else {
      toast.error('Failed to export to PDF');
    }
  };

  const ExportButton = ({ onClick, icon: Icon, label, color = '#4f46e5' }) => (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        border: `1px solid ${color}20`,
        background: `${color}08`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        color,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}15`;
        e.currentTarget.style.borderColor = `${color}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `${color}08`;
        e.currentTarget.style.borderColor = `${color}20`;
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className="anim-fade-up" id="analytics-container" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      {/* Header with Refresh and Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(12px, 3vw, 20px)', flexWrap: 'wrap', gap: 'clamp(8px, 2vw, 12px)' }}>
        <h1 style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>Analytics</h1>
        
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            disabled={refreshing}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: refreshing ? '#94a3b8' : '#0f172a',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => !refreshing && (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <RefreshCw size={14} style={{ transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {/* Export Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <ExportButton onClick={handleExportDashboardCSV} icon={Download} label="CSV" color="#10b981" />
              <ExportButton onClick={handleExportFuelCSV} icon={Download} label="Fuel CSV" color="#f59e0b" />
              <ExportButton onClick={handleExportPDF} icon={FileText} label="PDF" color="#e11d48" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(160px, 35vw, 220px), 1fr))', gap: 'clamp(10px, 2vw, 16px)', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
        {summaryCards.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="ff-card anim-fade-up" style={{ padding: 'clamp(14px, 3vw, 22px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 12px)', marginBottom: 'clamp(10px, 2vw, 12px)' }}>
              <div style={{ width: 'clamp(34px, 8vw, 40px)', height: 'clamp(34px, 8vw, 40px)', borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
            </div>
            <p style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#0f172a', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(12px, 3vw, 20px)', marginBottom: 'clamp(16px, 4vw, 24px)' }}>
        {/* Fleet Status Chart */}
        <div className="ff-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
          <h3 style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>Fleet Status Overview</h3>
          {fleetStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fleetStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                  formatter={(v) => [Number(v).toLocaleString(), '']}
                />
                <Legend wrapperStyle={{ paddingTop: 16 }} />
                <Bar dataKey="active" fill="#10b981" name="Active" radius={[8, 8, 0, 0]} />
                <Bar dataKey="inactive" fill="#f43f5e" name="Inactive" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No fleet data available</p>
          )}
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="ff-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
          <h3 style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>Expense Breakdown</h3>
          {financialData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ₹${Number(value).toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No expense data available</p>
          )}
        </div>
      </div>

      {/* Financial Summary and Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(12px, 3vw, 20px)' }}>
        {/* Financial Summary */}
        <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'clamp(12px, 3vw, 18px)', borderBottom: '1px solid #f8fafc' }}>
            <h3 style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 700, color: '#0f172a', margin: 0 }}>Financial Summary</h3>
          </div>
          <div style={{ padding: 'clamp(8px, 2vw, 12px) 0' }}>
            {finRows.length === 0 ? (
              <p style={{ padding: 'clamp(14px, 3vw, 20px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No financial data available</p>
            ) : finRows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 3vw, 18px)', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbfd'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: row.bold ? '#0f172a' : '#64748b', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 600, color: row.bold ? '#4f46e5' : '#0f172a' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'clamp(12px, 3vw, 18px)', borderBottom: '1px solid #f8fafc' }}>
            <h3 style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 700, color: '#0f172a', margin: 0 }}>Fuel Efficiency by Vehicle</h3>
          </div>
          {fuelRows.length === 0 ? (
            <p style={{ padding: 'clamp(14px, 3vw, 20px)', color: '#94a3b8', fontSize: 'clamp(12px, 2vw, 13px)' }}>No fuel data available</p>
          ) : (
            <div style={{ overflowX: 'auto', fontSize: 'clamp(11px, 2vw, 13px)' }}>
              <table className="ff-table" style={{ fontSize: 'clamp(11px, 2vw, 13px)' }}>
                <thead><tr style={{ fontSize: 'clamp(11px, 1.8vw, 12px)' }}><th>Vehicle</th><th>Avg km/L</th><th>Total Fuel (L)</th></tr></thead>
                <tbody>
                  {fuelRows.slice(0, 10).map((v, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{v.vehicle_code || v.vehicle || `Vehicle ${i + 1}`}</td>
                      <td>{v.avg_efficiency ? Number(v.avg_efficiency).toFixed(1) : '—'}</td>
                      <td>{v.total_fuel ? `${Number(v.total_fuel).toFixed(0)} L` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
