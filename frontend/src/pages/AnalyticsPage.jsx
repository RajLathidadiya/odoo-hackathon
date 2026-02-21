import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import { BarChart3, TrendingUp, Fuel, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [fuelData, setFuelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
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
    finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  const fmt = (v) => v != null ? `₹${Number(v).toLocaleString()}` : '—';

  const summaryCards = [
    { label: 'Total Revenue', value: fmt(dashboard?.financial?.revenue || dashboard?.total_revenue), icon: DollarSign, bg: '#ecfdf5', color: '#059669' },
    { label: 'Total Expenses', value: fmt(dashboard?.financial?.expenses || dashboard?.total_expenses), icon: TrendingUp, bg: '#fef2f2', color: '#dc2626' },
    { label: 'Fleet Utilization', value: `${dashboard?.fleet_utilization || dashboard?.utilization || '—'}%`, icon: BarChart3, bg: '#eef2ff', color: '#4f46e5' },
    { label: 'Fuel Efficiency', value: fuelData?.avg_efficiency ? `${Number(fuelData.avg_efficiency).toFixed(1)} km/L` : '—', icon: Fuel, bg: '#fffbeb', color: '#d97706' },
  ];

  const finRows = financial ? [
    { label: 'Total Income', value: fmt(financial.total_income || financial.revenue) },
    { label: 'Fuel Costs', value: fmt(financial.fuel_costs || financial.fuel) },
    { label: 'Maintenance Costs', value: fmt(financial.maintenance_costs || financial.maintenance) },
    { label: 'Other Expenses', value: fmt(financial.other_expenses || financial.other) },
    { label: 'Net Profit', value: fmt(financial.net_profit || financial.profit), bold: true },
  ] : [];

  const fuelRows = Array.isArray(fuelData?.vehicles || fuelData) ? (fuelData?.vehicles || fuelData) : [];

  return (
    <div className="anim-fade-up" style={{ width: '100%', padding: 'clamp(12px, 4vw, 24px)' }}>
      {/* Summary Cards */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(160px, 35vw, 220px), 1fr))', gap: 'clamp(10px, 2vw, 16px)', marginBottom: 'clamp(12px, 3vw, 20px)' }}>
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
