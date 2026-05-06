import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/centers': 'Centers Management',
  '/workers': 'Workers Management',
  '/beneficiaries': 'Beneficiaries',
  '/attendance': 'Attendance',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/beneficiaries/')) return 'Beneficiary Profile';
    return pageTitles[location.pathname] || 'ICDS Tracker';
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <header className="layout-header">
          <div className="layout-header-left">
            <button className="layout-hamburger" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="layout-page-title">{getPageTitle()}</h1>
          </div>
          <div className="layout-header-right">
            <span className="header-role-chip">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>shield_person</span>
              {user?.role}
            </span>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
