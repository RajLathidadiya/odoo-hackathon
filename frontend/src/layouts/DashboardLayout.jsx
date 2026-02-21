import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F8' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main area: 72px sidebar offset on desktop */}
      <div
        className="lg:ml-[72px]"
        style={{ transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <Topbar onMenuClick={() => setCollapsed(!collapsed)} />
        <main style={{
          padding: 'clamp(16px, 3vw, 28px) clamp(16px, 4vw, 32px) clamp(24px, 4vw, 36px)',
          minHeight: 'calc(100vh - 64px)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
