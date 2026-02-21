import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';
import {
  Truck, MapPin, Wrench, DollarSign, TrendingUp,
  Users, ArrowRight, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const kpis = [
  { key: 'total_vehicles', label: 'Total Vehicles', icon: Truck, color: '#4f46e5', bg: '#eef2ff', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
  { key: 'active_trips', label: 'Active Trips', icon: MapPin, color: '#059669', bg: '#ecfdf5', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
  { key: 'vehicles_in_shop', label: 'In Maintenance', icon: Wrench, color: '#d97706', bg: '#fffbeb', gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
  { key: 'total_drivers', label: 'Total Drivers', icon: Users, color: '#7c3aed', bg: '#f5f3ff', gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' },
  { key: 'total_revenue', label: 'Revenue', icon: DollarSign, color: '#059669', bg: '#ecfdf5', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', currency: true },
  { key: 'total_expenses', label: 'Expenses', icon: TrendingUp, color: '#dc2626', bg: '#fef2f2', gradient: 'linear-gradient(135deg, #fef2f2, #fee2e2)', currency: true },
];

const quickLinks = [
  { label: 'Manage Vehicles', to: '/vehicles', desc: 'View & edit fleet inventory', color: '#4f46e5', icon: Truck },
  { label: 'Active Trips', to: '/trips', desc: 'Monitor ongoing deliveries', color: '#059669', icon: MapPin },
  { label: 'Dispatch Center', to: '/dispatch', desc: 'Assign drivers & vehicles', color: '#d97706', icon: Activity },
  { label: 'Maintenance', to: '/maintenance', desc: 'Service schedule & logs', color: '#7c3aed', icon: Wrench },
  { label: 'Analytics', to: '/analytics', desc: 'Performance insights & reports', color: '#2563eb', icon: DollarSign },
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
    <div className="anim-fade-up" style={{ width: '100%' }}>

      {/* KPI Cards */}
      <div className="stagger" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(145px, 28vw, 185px), 1fr))',
        gap: 'clamp(10px, 2vw, 16px)',
        marginBottom: 'clamp(14px, 3vw, 22px)',
      }}>
        {kpis.map(({ key, label, icon: Icon, color, gradient, currency }) => (
          <div key={key} className="ff-card-kpi" style={{ padding: 'clamp(16px, 3.5vw, 22px)' }}>
            {/* Icon */}
            <div style={{
              width: 'clamp(34px, 7vw, 42px)',
              height: 'clamp(34px, 7vw, 42px)',
              borderRadius: 12,
              background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 'clamp(12px, 2.5vw, 16px)',
              flexShrink: 0,
              boxShadow: `0 2px 8px ${color}20`,
            }}>
              <Icon size={17} color={color} />
            </div>

            {/* Value */}
            <p style={{
              fontSize: 'clamp(17px, 4vw, 22px)',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 3px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              {fmt(get(key), currency)}
            </p>

            {/* Label */}
            <p style={{
              fontSize: 'clamp(10px, 1.8vw, 11.5px)',
              color: '#94a3b8',
              margin: 0,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {label}
            </p>

            {/* Bottom accent line */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 3, borderRadius: '0 0 18px 18px',
              background: `linear-gradient(90deg, ${color}50, transparent)`,
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }} className="kpi-accent" />
          </div>
        ))}
      </div>

      {/* Quick Actions Card */}
      <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3.5vw, 24px)',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #fafbff, #fff)',
        }}>
          <div>
            <h3 style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Quick Actions
            </h3>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
              Jump to key areas
            </p>
          </div>
          <span className="badge badge-gray" style={{ fontSize: 11 }}>{quickLinks.length} shortcuts</span>
        </div>

        {/* Links */}
        <div>
          {quickLinks.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex', alignItems: 'center',
                padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3.5vw, 24px)',
                borderBottom: i < quickLinks.length - 1 ? '1px solid #f8fafc' : 'none',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                gap: 14,
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `linear-gradient(90deg, ${item.color}06, transparent)`;
                e.currentTarget.style.paddingLeft = `clamp(20px, 4vw, 28px)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.paddingLeft = `clamp(16px, 3.5vw, 24px)`;
              }}
            >
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${item.color}10`,
                border: `1px solid ${item.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
                <item.icon size={15} color={item.color} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 'clamp(12px, 2.2vw, 13px)', fontWeight: 600, color: '#0f172a',
                  margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </p>
                <p style={{
                  fontSize: 'clamp(10px, 1.8vw, 11px)', color: '#94a3b8',
                  margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.desc}
                </p>
              </div>

              <ArrowRight size={14} color="#cbd5e1" style={{ flexShrink: 0, transition: 'transform 0.2s ease, color 0.2s ease' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
