import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/centers', icon: 'location_city', label: 'Centers' },
    { to: '/workers', icon: 'badge', label: 'Workers' },
    { to: '/beneficiaries', icon: 'child_care', label: 'Beneficiaries' },
    { to: '/attendance', icon: 'event_available', label: 'Attendance' },
    { to: '/reports', icon: 'assessment', label: 'Reports' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ];

  const supervisorLinks = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/centers', icon: 'location_city', label: 'Centers' },
    { to: '/beneficiaries', icon: 'child_care', label: 'Beneficiaries' },
    { to: '/attendance', icon: 'event_available', label: 'Attendance' },
    { to: '/reports', icon: 'assessment', label: 'Reports' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ];

  const workerLinks = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/beneficiaries', icon: 'child_care', label: 'Beneficiaries' },
    { to: '/attendance', icon: 'event_available', label: 'Attendance' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'ADMIN': return adminLinks;
      case 'SUPERVISOR': return supervisorLinks;
      case 'WORKER': return workerLinks;
      default: return workerLinks;
    }
  };

  const getInitials = () => {
    if (!user?.mobile) return 'U';
    return user.mobile.slice(-2);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <span className="material-symbols-outlined">child_care</span>
          </div>
          <div className="sidebar-brand-text">
            <h2>ICDS Tracker</h2>
            <span>Anganwadi Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {getLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials()}</div>
            <div className="sidebar-user-info">
              <p>{user?.mobile || 'User'}</p>
              <span>{user?.role || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
