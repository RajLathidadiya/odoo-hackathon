import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F8FB' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main area — offset by sidebar width (72px) on desktop */}
      <div className="lg:ml-[72px] transition-[margin-left] duration-300">

        <Topbar onMenuClick={() => setCollapsed(!collapsed)} />
        <main style={{ padding: '20px 28px 28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
