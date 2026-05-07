import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Account settings and preferences</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--space-md)' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile Information</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--primary), #4CAF50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.5rem', fontWeight: 700,
            }}>
              {user?.mobile?.slice(-2) || 'U'}
            </div>
            <div>
              <h3 style={{ marginBottom: 4 }}>{user?.mobile || 'User'}</h3>
              <span className={`chip ${user?.role === 'ADMIN' ? 'chip-error' : user?.role === 'SUPERVISOR' ? 'chip-info' : 'chip-success'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label>Mobile Number</label>
              <span>{user?.mobile || '—'}</span>
            </div>
            <div className="info-item">
              <label>Role</label>
              <span>{user?.role || '—'}</span>
            </div>
          </div>
        </div>

        {/* App Info Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Application</h3>
          </div>
          <div className="info-grid" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="info-item">
              <label>App Name</label>
              <span>ICDS Tracker</span>
            </div>
            <div className="info-item">
              <label>Version</label>
              <span>1.0.0</span>
            </div>
            <div className="info-item">
              <label>Backend</label>
              <span>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}</span>
            </div>
            <div className="info-item">
              <label>Platform</label>
              <span>Anganwadi Management System</span>
            </div>
          </div>
        </div>

        {/* Session Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Session</h3>
          </div>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
            You are currently logged in. Logging out will clear your session and require re-authentication.
          </p>
          <button className="btn btn-danger" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>

        {/* Role Permissions Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Role Permissions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[
              { label: 'View Dashboard', roles: ['ADMIN', 'SUPERVISOR', 'WORKER'] },
              { label: 'Manage Centers', roles: ['ADMIN'] },
              { label: 'Manage Workers', roles: ['ADMIN'] },
              { label: 'View Beneficiaries', roles: ['ADMIN', 'SUPERVISOR', 'WORKER'] },
              { label: 'Add Beneficiaries', roles: ['ADMIN', 'SUPERVISOR', 'WORKER'] },
              { label: 'Mark Attendance', roles: ['ADMIN', 'SUPERVISOR', 'WORKER'] },
              { label: 'View Reports', roles: ['ADMIN', 'SUPERVISOR'] },
              { label: 'Download Reports', roles: ['ADMIN', 'SUPERVISOR'] },
            ].map((perm, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--surface-container-high)' }}>
                <span className="text-sm">{perm.label}</span>
                <span className={`chip ${perm.roles.includes(user?.role) ? 'chip-success' : 'chip-error'}`} style={{ fontSize: '0.6875rem' }}>
                  {perm.roles.includes(user?.role) ? 'Allowed' : 'Denied'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
