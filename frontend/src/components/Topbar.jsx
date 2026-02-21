import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Fleet overview & KPIs' },
  '/vehicles': { title: 'Vehicles', subtitle: 'Manage your fleet inventory' },
  '/drivers': { title: 'Drivers', subtitle: 'Driver profiles & compliance' },
  '/trips': { title: 'Trips', subtitle: 'Trip lifecycle management' },
  '/dispatch': { title: 'Dispatch', subtitle: 'Assign vehicles & drivers' },
  '/maintenance': { title: 'Maintenance', subtitle: 'Service logs & schedules' },
  '/fuel': { title: 'Fuel Logs', subtitle: 'Track fuel consumption' },
  '/expenses': { title: 'Expenses', subtitle: 'Operational expense tracking' },
  '/analytics': { title: 'Analytics', subtitle: 'Performance & financial insights' },
};

const roleColors = {
  'Super Admin': { bg: '#fee2e2', color: '#dc2626', label: 'Super Admin' },
  'Fleet Manager': { bg: '#eef2ff', color: '#4f46e5', label: 'Fleet Manager' },
  'Dispatcher': { bg: '#eff6ff', color: '#2563eb', label: 'Dispatcher' },
  'Safety Officer': { bg: '#f0fdf4', color: '#059669', label: 'Safety Officer' },
  'Financial Analyst': { bg: '#fffbeb', color: '#d97706', label: 'Financial Analyst' },
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const page = pageTitles[location.pathname] || { title: 'FleetFlow', subtitle: 'Fleet Management' };

  const roleInfo = roleColors[user?.role_name] || { bg: '#f1f5f9', color: '#64748b', label: 'User' };
  const initials = (user?.username || user?.full_name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header style={{
      height: 64,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 28px)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>

      {/* Left: hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <Menu size={17} />
        </button>

        <div>
          <h1 style={{
            fontSize: 'clamp(15px, 3vw, 18px)',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            {page.title}
          </h1>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            {page.subtitle}
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Search */}
        <div style={{ position: 'relative' }} className="hidden md:block">
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            placeholder="Search..."
            className="ff-input"
            style={{
              width: 180,
              paddingLeft: 32,
              height: 36,
              borderRadius: 10,
              fontSize: 12.5,
              background: '#f8fafc',
              border: '1.5px solid #f1f5f9',
            }}
            onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.width = '220px'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
            onBlur={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.width = '180px'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
          />
        </div>

        {/* Notification bell */}
        <button style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: '#fff',
          border: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748b',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f7ff'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            background: '#4f46e5',
            border: '2px solid #fff',
          }} />
        </button>

        {/* User pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '5px 10px 5px 5px',
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(79,70,229,0.3)',
            }}>
              {initials}
            </div>

            <div className="hidden sm:block" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                {user?.username || user?.full_name || 'User'}
              </p>
              <p style={{ fontSize: 10, color: roleInfo.color, margin: 0, fontWeight: 600 }}>
                {roleInfo.label}
              </p>
            </div>

            <ChevronDown
              size={13}
              color="#94a3b8"
              style={{
                transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="anim-scale-in" style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #f1f5f9',
              boxShadow: '0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
              minWidth: 220,
              padding: '6px',
              zIndex: 100,
              overflow: 'hidden',
            }}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              {/* User info card */}
              <div style={{
                padding: '10px 12px',
                marginBottom: 4,
                background: 'linear-gradient(135deg, #f5f7ff, #fff)',
                borderRadius: 10,
                border: '1px solid #eef2ff',
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {user?.username || user?.full_name || 'User'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  {user?.email || '—'}
                </p>
                <span style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '2px 8px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  background: roleInfo.bg,
                  color: roleInfo.color,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}>
                  {roleInfo.label}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={() => { logout(); setUserMenuOpen(false); }}
                style={{
                  width: '100%', padding: '9px 12px',
                  display: 'flex', alignItems: 'center', gap: 9,
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  borderRadius: 10, color: '#dc2626', fontSize: 13, fontWeight: 500,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
