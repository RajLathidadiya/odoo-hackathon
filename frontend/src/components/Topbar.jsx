import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/vehicles': 'Vehicles',
  '/drivers': 'Drivers',
  '/trips': 'Trips',
  '/dispatch': 'Dispatch',
  '/maintenance': 'Maintenance',
  '/fuel': 'Fuel Logs',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'FleetFlow';

  return (
    <header style={{
      height: 64,
      background: '#F6F8FB',
      borderBottom: '1px solid #e9edf3',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Left: menu + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid #e2e8f0', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
            {title}
          </h1>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
            Fleet & Logistics Management
          </p>
        </div>
      </div>

      {/* Right: search + notifications + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div style={{ position: 'relative' }} className="hidden md:block">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            placeholder="Search..."
            className="ff-input"
            style={{ width: 200, paddingLeft: 34, height: 38, borderRadius: 10, fontSize: 13 }}
          />
        </div>

        {/* Notification */}
        <button style={{
          width: 38, height: 38, borderRadius: 10,
          background: '#fff', border: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748b', position: 'relative',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <Bell size={17} />
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            background: '#4f46e5', border: '2px solid #F6F8FB',
          }} />
        </button>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 14px 6px 6px',
          background: '#fff', borderRadius: 14,
          border: '1px solid #f1f5f9',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>
            {(user?.username || user?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              {user?.username || user?.full_name || 'User'}
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Admin</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            fontSize: 12, fontWeight: 500, color: '#94a3b8',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
            padding: '6px 10px', borderRadius: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
