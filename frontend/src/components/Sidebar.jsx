import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, MapPin, Send,
  Wrench, Fuel, Receipt, BarChart3
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vehicles', icon: Truck, label: 'Vehicles' },
  { path: '/drivers', icon: Users, label: 'Drivers' },
  { path: '/trips', icon: MapPin, label: 'Trips' },
  { path: '/dispatch', icon: Send, label: 'Dispatch' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/fuel', icon: Fuel, label: 'Fuel' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
          style={{ animation: 'fadeIn 0.2s ease' }}
        />
      )}

      <aside
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 40,
          width: 72, height: '100vh',
          background: '#fff',
          borderRight: '1px solid #f1f5f9',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 20,
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
        className={collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      >
        {/* Logo */}
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: '#4f46e5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
        }}>
          <Truck size={20} color="#fff" />
        </div>

        {/* Nav icons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, width: '100%', padding: '0 10px' }}>
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <div key={path} className="tooltip-wrapper">
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
                  style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                    color: isActive ? '#4f46e5' : '#94a3b8',
                    background: isActive ? '#eef2ff' : 'transparent',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20, borderRadius: 2,
                      background: '#4f46e5',
                    }} />
                  )}
                  <Icon size={20} />
                </NavLink>
                <span className="tooltip">{label}</span>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
