import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, MapPin, Send,
  Wrench, Fuel, Receipt, BarChart3, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: '#4f46e5' },
  { path: '/vehicles', icon: Truck, label: 'Vehicles', color: '#2563eb' },
  { path: '/drivers', icon: Users, label: 'Drivers', color: '#7c3aed' },
  { path: '/trips', icon: MapPin, label: 'Trips', color: '#059669' },
  { path: '/dispatch', icon: Send, label: 'Dispatch', color: '#d97706' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance', color: '#e11d48' },
  { path: '/fuel', icon: Fuel, label: 'Fuel', color: '#0891b2' },
  { path: '/expenses', icon: Receipt, label: 'Expenses', color: '#dc2626' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', color: '#4f46e5' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const isExpanded = !collapsed || hovered;

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 30,
            animation: 'fadeIn 0.2s ease',
          }}
          className="lg:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 40,
          width: isExpanded ? 220 : 72,
          height: '100vh',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 0,
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
        }}
        className={collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      >
        {/* Logo Area */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: isExpanded ? '0 18px' : '0',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          transition: 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          gap: 12,
        }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 11,
            background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 12px rgba(79, 70, 229, 0.5)',
          }}>
            <Truck size={18} color="#fff" />
          </div>
          <div style={{
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>FleetFlow</p>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Fleet Mgmt</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 10px',
          gap: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {navItems.map(({ path, icon: Icon, label, color }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
                title={!isExpanded ? label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: isExpanded ? '10px 12px' : '10px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  background: isActive
                    ? `linear-gradient(135deg, ${color}22, ${color}15)`
                    : 'transparent',
                  border: isActive
                    ? `1px solid ${color}30`
                    : '1px solid transparent',
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 22,
                    borderRadius: '0 3px 3px 0',
                    background: color,
                    boxShadow: `0 0 8px ${color}80`,
                    animation: 'fadeIn 0.2s ease',
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 32, height: 32,
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? `${color}22` : 'rgba(255,255,255,0.04)',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}>
                  <Icon
                    size={17}
                    color={isActive ? color : 'rgba(255,255,255,0.45)'}
                    style={{ transition: 'color 0.2s ease' }}
                  />
                </div>

                {/* Label */}
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateX(0)' : 'translateX(-6px)',
                  transition: 'opacity 0.22s ease, transform 0.22s ease, color 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  letterSpacing: '0.005em',
                }}>
                  {label}
                </span>

                {/* Arrow for active */}
                {isActive && isExpanded && (
                  <ChevronRight
                    size={13}
                    color={color}
                    style={{ marginLeft: 'auto', opacity: 0.7, flexShrink: 0 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section — version tag */}
        <div style={{
          padding: '14px 12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            justifyContent: isExpanded ? 'flex-start' : 'center',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b98180',
              flexShrink: 0,
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
            <span style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 500,
              opacity: isExpanded ? 1 : 0,
              transition: 'opacity 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              System Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
