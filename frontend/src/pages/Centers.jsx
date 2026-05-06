import { useState, useEffect } from 'react';
import { centersApi } from '../api/centersApi';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import './Centers.css';

export default function Centers() {
  const { hasRole } = useAuth();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ centerCode: '', name: '', village: '', block: '', district: '' });

  useEffect(() => { loadCenters(); }, []);

  const loadCenters = async () => {
    try {
      const res = await centersApi.getAll();
      setCenters(res.data);
    } catch (e) {
      toast.error('Failed to load centers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await centersApi.update(editing.id, form);
        toast.success('Center updated successfully');
      } else {
        await centersApi.create(form);
        toast.success('Center created successfully');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ centerCode: '', name: '', village: '', block: '', district: '' });
      loadCenters();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (center) => {
    setEditing(center);
    setForm({
      centerCode: center.centerCode || '',
      name: center.name || '',
      village: center.village || '',
      block: center.block || '',
      district: center.district || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this center?')) return;
    try {
      await centersApi.delete(id);
      toast.success('Center deleted');
      loadCenters();
    } catch (e) {
      toast.error('Failed to delete center');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ centerCode: '', name: '', village: '', block: '', district: '' });
    setModalOpen(true);
  };

  const filtered = centers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.centerCode?.toLowerCase().includes(search.toLowerCase()) ||
    c.village?.toLowerCase().includes(search.toLowerCase()) ||
    c.district?.toLowerCase().includes(search.toLowerCase())
  );

  // Gather unique districts for stat
  const districts = [...new Set(centers.map(c => c.district).filter(Boolean))];
  const blocks = [...new Set(centers.map(c => c.block).filter(Boolean))];
  const activeCount = centers.filter(c => c.active !== false).length;

  // Generate deterministic gradient for each center card
  const gradients = [
    'linear-gradient(135deg, #1B5E20, #2E7D32)',
    'linear-gradient(135deg, #0D47A1, #1976D2)',
    'linear-gradient(135deg, #004D40, #00796B)',
    'linear-gradient(135deg, #33691E, #558B2F)',
    'linear-gradient(135deg, #1A237E, #283593)',
    'linear-gradient(135deg, #006064, #00838F)',
    'linear-gradient(135deg, #263238, #455A64)',
    'linear-gradient(135deg, #3E2723, #5D4037)',
    'linear-gradient(135deg, #1B5E20, #388E3C)',
    'linear-gradient(135deg, #004D40, #26A69A)',
  ];

  return (
    <div className="centers-page">
      {/* Stats Row */}
      <div className="centers-stats-row">
        <div className="center-stat-card">
          <div className="center-stat-icon bg-emerald">
            <span className="material-symbols-outlined">location_city</span>
          </div>
          <div className="center-stat-info">
            <span className="center-stat-num">{centers.length}</span>
            <span className="center-stat-label">Total Centers</span>
          </div>
        </div>
        <div className="center-stat-card">
          <div className="center-stat-icon bg-teal">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="center-stat-info">
            <span className="center-stat-num">{activeCount}</span>
            <span className="center-stat-label">Active Centers</span>
          </div>
        </div>
        <div className="center-stat-card">
          <div className="center-stat-icon bg-forest">
            <span className="material-symbols-outlined">map</span>
          </div>
          <div className="center-stat-info">
            <span className="center-stat-num">{districts.length}</span>
            <span className="center-stat-label">Districts Covered</span>
          </div>
        </div>
        <div className="center-stat-card">
          <div className="center-stat-icon bg-sage">
            <span className="material-symbols-outlined">grid_view</span>
          </div>
          <div className="center-stat-info">
            <span className="center-stat-num">{blocks.length}</span>
            <span className="center-stat-label">Blocks Covered</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="centers-controls">
        <div className="search-bar-v2">
          <span className="material-symbols-outlined">search</span>
          <input placeholder="Search centers by name, code, village, or district..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        {hasRole('ADMIN') && (
          <button className="btn btn-primary add-center-btn" onClick={openCreate}>
            <span className="material-symbols-outlined">add_location_alt</span>
            Add Center
          </button>
        )}
      </div>

      {/* Centers Grid */}
      {loading ? (
        <div className="empty-state"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <span className="material-symbols-outlined">location_off</span>
          <h3>No centers found</h3>
          <p>{search ? 'Try a different search term.' : 'Create your first Anganwadi center to get started.'}</p>
        </div>
      ) : (
        <div className="centers-grid">
          {filtered.map((c, idx) => (
            <div className="center-card" key={c.id} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="center-card-header" style={{ background: gradients[idx % gradients.length] }}>
                <div className="center-code-badge">{c.centerCode}</div>
                <span className={`center-status-dot ${c.active !== false ? 'active' : 'inactive'}`}>
                  <span className="material-symbols-outlined">{c.active !== false ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                  {c.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="center-card-body">
                <h3 className="center-name">{c.name}</h3>
                <div className="center-location-details">
                  <div className="center-loc-item">
                    <span className="material-symbols-outlined">cottage</span>
                    <div>
                      <span className="loc-label">Village</span>
                      <span className="loc-value">{c.village || '—'}</span>
                    </div>
                  </div>
                  <div className="center-loc-item">
                    <span className="material-symbols-outlined">domain</span>
                    <div>
                      <span className="loc-label">Block</span>
                      <span className="loc-value">{c.block || '—'}</span>
                    </div>
                  </div>
                  <div className="center-loc-item full-width">
                    <span className="material-symbols-outlined">pin_drop</span>
                    <div>
                      <span className="loc-label">District</span>
                      <span className="loc-value">{c.district || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {hasRole('ADMIN') && (
                <div className="center-card-actions">
                  <button className="center-action-btn edit" onClick={() => handleEdit(c)} title="Edit">
                    <span className="material-symbols-outlined">edit</span>
                    Edit
                  </button>
                  <button className="center-action-btn delete" onClick={() => handleDelete(c.id)} title="Delete">
                    <span className="material-symbols-outlined">delete</span>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Center' : 'Add New Center'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</button>
        </>}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Center Code *</label>
              <input className="form-input" required value={form.centerCode} onChange={(e) => setForm({ ...form, centerCode: e.target.value })} placeholder="e.g. AW001" />
            </div>
            <div className="form-group">
              <label className="form-label">Center Name *</label>
              <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Center name" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Village</label>
              <input className="form-input" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder="Village" />
            </div>
            <div className="form-group">
              <label className="form-label">Block</label>
              <input className="form-input" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} placeholder="Block" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">District</label>
            <input className="form-input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="District" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
