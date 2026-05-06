import { useState, useEffect } from 'react';
import { workersApi } from '../api/workersApi';
import { centersApi } from '../api/centersApi';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './Workers.css';

export default function Workers() {
  const { hasRole, user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    employeeId: '', fullName: '', mobile: '', email: '', role: 'WORKER', centerId: '', password: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [wRes, cRes] = await Promise.all([workersApi.getAll(), centersApi.getAll()]);
      setWorkers(wRes.data);
      setCenters(cRes.data);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, centerId: form.centerId ? Number(form.centerId) : null };
      if (editing) {
        await workersApi.update(editing.id, payload);
        toast.success('Worker updated');
      } else {
        await workersApi.create(payload);
        toast.success('Worker created');
      }
      setModalOpen(false);
      setEditing(null);
      resetForm();
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => setForm({ employeeId: '', fullName: '', mobile: '', email: '', role: 'WORKER', centerId: '', password: '' });

  const handleDelete = async (id, worker) => {
    if (isSelf(worker)) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!confirm('Delete this worker?')) return;
    try {
      await workersApi.delete(id);
      toast.success('Worker deleted');
      loadData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const isSelf = (worker) => worker.mobile === user?.mobile;

  const filtered = workers.filter(w => {
    const matchSearch = w.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      w.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      w.mobile?.includes(search);
    const matchRole = filterRole === 'all' ? true : w.role === filterRole;
    return matchSearch && matchRole;
  });

  const getCenterName = (centerId) => {
    const c = centers.find(c => c.id === centerId);
    return c ? c.name : '—';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return 'admin_panel_settings';
      case 'SUPERVISOR': return 'supervisor_account';
      default: return 'badge';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return { bg: 'linear-gradient(135deg, #D32F2F, #E53935)', text: '#fff' };
      case 'SUPERVISOR': return { bg: 'linear-gradient(135deg, #1565C0, #1E88E5)', text: '#fff' };
      default: return { bg: 'linear-gradient(135deg, #2E7D32, #43A047)', text: '#fff' };
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  // Stats
  const adminCount = workers.filter(w => w.role === 'ADMIN').length;
  const supervisorCount = workers.filter(w => w.role === 'SUPERVISOR').length;
  const workerCount = workers.filter(w => w.role === 'WORKER').length;

  return (
    <div className="workers-page">
      {/* Stat Cards Row */}
      <div className="workers-stats-row">
        <div className="workers-stat-card stat-total" onClick={() => setFilterRole('all')}>
          <div className="stat-icon-wrap">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="stat-info">
            <span className="stat-num">{workers.length}</span>
            <span className="stat-label">Total Staff</span>
          </div>
        </div>
        <div className="workers-stat-card stat-workers" onClick={() => setFilterRole('WORKER')}>
          <div className="stat-icon-wrap">
            <span className="material-symbols-outlined">badge</span>
          </div>
          <div className="stat-info">
            <span className="stat-num">{workerCount}</span>
            <span className="stat-label">Workers</span>
          </div>
        </div>
        <div className="workers-stat-card stat-supervisors" onClick={() => setFilterRole('SUPERVISOR')}>
          <div className="stat-icon-wrap">
            <span className="material-symbols-outlined">supervisor_account</span>
          </div>
          <div className="stat-info">
            <span className="stat-num">{supervisorCount}</span>
            <span className="stat-label">Supervisors</span>
          </div>
        </div>
        <div className="workers-stat-card stat-admins" onClick={() => setFilterRole('ADMIN')}>
          <div className="stat-icon-wrap">
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <div className="stat-info">
            <span className="stat-num">{adminCount}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="workers-controls">
        <div className="search-bar-v2">
          <span className="material-symbols-outlined">search</span>
          <input placeholder="Search by name, ID, or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        <div className="workers-controls-right">
          <div className="filter-chips">
            {['all', 'WORKER', 'SUPERVISOR', 'ADMIN'].map(r => (
              <button key={r} className={`filter-chip ${filterRole === r ? 'active' : ''}`}
                onClick={() => setFilterRole(r)}>
                {r === 'all' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase() + 's'}
              </button>
            ))}
          </div>
          {hasRole('ADMIN') && (
            <button className="btn btn-primary add-worker-btn" onClick={() => { resetForm(); setEditing(null); setModalOpen(true); }}>
              <span className="material-symbols-outlined">person_add</span>
              Add Staff
            </button>
          )}
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="empty-state"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <span className="material-symbols-outlined">person_off</span>
          <h3>No staff members found</h3>
          <p>{search ? 'Try a different search term.' : 'Register your first Anganwadi staff member.'}</p>
        </div>
      ) : (
        <div className="workers-grid">
          {filtered.map((w, idx) => {
            const roleStyle = getRoleColor(w.role);
            return (
              <div className="worker-card" key={w.id} style={{ animationDelay: `${idx * 0.04}s` }}>
                <div className="worker-card-header" style={{ background: roleStyle.bg }}>
                  <div className="worker-avatar">
                    {getInitials(w.fullName)}
                  </div>
                  <span className="worker-role-badge">
                    <span className="material-symbols-outlined">{getRoleIcon(w.role)}</span>
                    {w.role}
                  </span>
                  {isSelf(w) && <span className="you-badge">YOU</span>}
                </div>
                <div className="worker-card-body">
                  <h3 className="worker-name">{w.fullName}</h3>
                  <span className="worker-eid">{w.employeeId}</span>
                  <div className="worker-details">
                    <div className="worker-detail">
                      <span className="material-symbols-outlined">phone</span>
                      <span>{w.mobile}</span>
                    </div>
                    {w.email && (
                      <div className="worker-detail">
                        <span className="material-symbols-outlined">mail</span>
                        <span>{w.email}</span>
                      </div>
                    )}
                    <div className="worker-detail">
                      <span className="material-symbols-outlined">location_city</span>
                      <span>{getCenterName(w.centerId)}</span>
                    </div>
                  </div>
                </div>
                {hasRole('ADMIN') && !isSelf(w) && (
                  <div className="worker-card-actions">
                    <button className="worker-action-btn delete" onClick={() => handleDelete(w.id, w)} title="Delete">
                      <span className="material-symbols-outlined">delete</span>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Worker' : 'Add New Staff'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</button>
        </>}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input className="form-input" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mobile *</label>
              <input className="form-input" required maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="WORKER">Worker</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Center</label>
              <select className="form-select" value={form.centerId} onChange={(e) => setForm({ ...form, centerId: e.target.value })}>
                <option value="">— None —</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {!editing && (
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
