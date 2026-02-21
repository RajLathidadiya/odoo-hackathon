import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import {
  Truck, MapPin, Wrench, DollarSign, TrendingUp, TrendingDown,
  Fuel, Users, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const kpis = [
  { key: 'total_vehicles', label: 'Total Vehicles', icon: Truck, color: '#4f46e5', bg: '#eef2ff' },
  { key: 'active_trips', label: 'Active Trips', icon: MapPin, color: '#059669', bg: '#ecfdf5' },
  { key: 'vehicles_in_shop', label: 'In Maintenance', icon: Wrench, color: '#d97706', bg: '#fffbeb' },
  { key: 'total_drivers', label: 'Total Drivers', icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'total_revenue', label: 'Revenue', icon: DollarSign, color: '#059669', bg: '#ecfdf5', currency: true },
  { key: 'total_expenses', label: 'Expenses', icon: TrendingUp, color: '#dc2626', bg: '#fef2f2', currency: true },
];

const quickLinks = [
  { label: 'Manage Vehicles', to: '/vehicles', desc: 'View & edit fleet inventory', color: '#4f46e5' },
  { label: 'Active Trips', to: '/trips', desc: 'Monitor ongoing deliveries', color: '#059669' },
  { label: 'Dispatch Center', to: '/dispatch', desc: 'Assign drivers & vehicles', color: '#d97706' },
  { label: 'Maintenance', to: '/maintenance', desc: 'Service schedule & logs', color: '#7c3aed' },
  { label: 'Analytics', to: '/analytics', desc: 'Performance insights', color: '#2563eb' },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  const d = data?.data || data || {};
  const fs = d.fleet_status || {};
  const fin = d.financial_overview || {};
  const get = (key) => {
    const map = {
      total_vehicles: Object.values(fs.vehicles || {}).reduce((s, v) => s + (v || 0), 0),
      active_trips: fs.trips?.Dispatched || 0,
      vehicles_in_shop: fs.vehicles?.['In Shop'] || 0,
      total_drivers: Object.values(fs.drivers || {}).reduce((s, v) => s + (v || 0), 0),
      total_revenue: fin.total_revenue || 0,
      total_expenses: fin.total_operational_cost || 0,
    };
    return map[key] ?? 0;
  };

  const fmt = (v, isCurrency) => isCurrency
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0)
    : (v ?? 0);

  return (
    <div className="anim-fade-up" style={{ maxWidth: 1200 }}>
      {/* KPI Cards */}
      <div className="stagger" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {kpis.map(({ key, label, icon: Icon, color, bg, currency }) => (
          <div key={key} className="ff-card anim-fade-up" style={{ padding: '20px 22px', cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>vs last month</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 2px', lineHeight: 1 }}>
              {fmt(get(key), currency)}
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Quick Actions</h3>
          <span className="badge badge-gray">{quickLinks.length}</span>
        </div>
        {quickLinks.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 24px',
              borderBottom: i < quickLinks.length - 1 ? '1px solid #fafbfc' : 'none',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafbfd'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{item.desc}</p>
              </div>
            </div>
            <ArrowRight size={14} color="#cbd5e1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
