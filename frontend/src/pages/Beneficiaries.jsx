import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { beneficiariesApi, riskApi } from '../api/beneficiariesApi';
import { centersApi } from '../api/centersApi';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import VoiceInput from '../components/VoiceInput';
import { parseBeneficiaryVoice } from '../utils/voiceParser';
import toast from 'react-hot-toast';
import './Beneficiaries.css';

export default function Beneficiaries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [atRiskIds, setAtRiskIds] = useState(new Set());
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);
  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', gender: 'MALE', aadhaarNumber: '',
    parentName: '', parentMobile: '', centerId: '', isPregnant: false,
  });

  useEffect(() => {
    if (searchParams.get('filter') === 'atRisk') {
      setShowAtRiskOnly(true);
    }
  }, [searchParams]);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (user.centerId) {
      loadAtRiskList();
    }
  }, [user.centerId]);

  const loadData = async () => {
    try {
      const [bRes, cRes] = await Promise.allSettled([
        beneficiariesApi.getAll(),
        user.role !== 'WORKER' ? centersApi.getAll() : Promise.resolve({ data: [] }),
      ]);
      if (bRes.status === 'fulfilled') setBeneficiaries(bRes.value.data);
      if (cRes.status === 'fulfilled') setCenters(cRes.value.data);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAtRiskList = async () => {
    try {
      const res = await riskApi.getAtRisk(user.centerId);
      const riskSet = new Set(res.data.map(r => r.beneficiaryId));
      setAtRiskIds(riskSet);
    } catch (e) {
      console.error('Failed to load at-risk list', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, centerId: Number(form.centerId) };
      await beneficiariesApi.create(payload);
      toast.success('Beneficiary registered');
      setModalOpen(false);
      setForm({ fullName: '', dateOfBirth: '', gender: 'MALE', aadhaarNumber: '', parentName: '', parentMobile: '', centerId: '', isPregnant: false });
      loadData();
      loadAtRiskList();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create beneficiary');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this beneficiary?')) return;
    try {
      await beneficiariesApi.delete(id);
      toast.success('Beneficiary removed');
      loadData();
      loadAtRiskList();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const filtered = beneficiaries.filter(b => {
    const matchSearch = b.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.awcBeneficiaryId?.toLowerCase().includes(search.toLowerCase()) ||
      b.parentName?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' ? true :
      filterType === 'children' ? !b.isPregnant :
      filterType === 'pregnant' ? b.isPregnant : true;
    const matchRisk = showAtRiskOnly ? atRiskIds.has(b.id) : true;
    return matchSearch && matchType && matchRisk;
  });

  const getAge = (dob) => {
    if (!dob) return '—';
    const d = new Date(dob);
    const now = new Date();
    const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (months < 12) return `${months}m`;
    return `${Math.floor(months / 12)}y ${months % 12}m`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  // Stats
  const childCount = beneficiaries.filter(b => !b.isPregnant).length;
  const pregnantCount = beneficiaries.filter(b => b.isPregnant).length;
  const maleCount = beneficiaries.filter(b => !b.isPregnant && b.gender === 'MALE').length;
  const femaleCount = beneficiaries.filter(b => !b.isPregnant && b.gender === 'FEMALE').length;

  return (
    <div className="beneficiaries-page">
      {/* Stats Row */}
      <div className="ben-stats-row">
        <div className="ben-stat-card stat-ben-total" onClick={() => setFilterType('all')}>
          <div className="ben-stat-icon"><span className="material-symbols-outlined">people</span></div>
          <div className="ben-stat-info">
            <span className="ben-stat-num">{beneficiaries.length}</span>
            <span className="ben-stat-label">Total Beneficiaries</span>
          </div>
        </div>
        <div className="ben-stat-card stat-ben-children" onClick={() => setFilterType('children')}>
          <div className="ben-stat-icon"><span className="material-symbols-outlined">child_care</span></div>
          <div className="ben-stat-info">
            <span className="ben-stat-num">{childCount}</span>
            <span className="ben-stat-label">Children ({maleCount}M / {femaleCount}F)</span>
          </div>
        </div>
        <div className="ben-stat-card stat-ben-pregnant" onClick={() => setFilterType('pregnant')}>
          <div className="ben-stat-icon"><span className="material-symbols-outlined">pregnant_woman</span></div>
          <div className="ben-stat-info">
            <span className="ben-stat-num">{pregnantCount}</span>
            <span className="ben-stat-label">Pregnant Mothers</span>
          </div>
        </div>
        <div className={`ben-stat-card stat-ben-risk ${showAtRiskOnly ? 'active' : ''}`} onClick={() => setShowAtRiskOnly(!showAtRiskOnly)}>
          <div className="ben-stat-icon"><span className="material-symbols-outlined">warning</span></div>
          <div className="ben-stat-info">
            <span className="ben-stat-num">{atRiskIds.size}</span>
            <span className="ben-stat-label">{showAtRiskOnly ? 'Showing At-Risk' : 'At Risk'}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="ben-controls">
        <div className="search-bar-v2">
          <span className="material-symbols-outlined">search</span>
          <input placeholder="Search by name, ID, or parent..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        <div className="ben-controls-right">
          <div className="filter-chips">
            {[
              { key: 'all', label: 'All', icon: 'people' },
              { key: 'children', label: 'Children', icon: 'child_care' },
              { key: 'pregnant', label: 'Mothers', icon: 'pregnant_woman' },
            ].map(f => (
              <button key={f.key} className={`filter-chip ${filterType === f.key ? 'active' : ''}`}
                onClick={() => setFilterType(f.key)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary add-ben-btn" onClick={() => setModalOpen(true)}>
            <span className="material-symbols-outlined">person_add</span>
            Register
          </button>
        </div>
      </div>

      {/* Beneficiaries Grid */}
      {loading ? (
        <div className="empty-state"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <span className="material-symbols-outlined">child_care</span>
          <h3>No beneficiaries found</h3>
          <p>{search ? 'Try a different search.' : 'Register children or pregnant mothers to begin tracking.'}</p>
        </div>
      ) : (
        <div className="ben-grid">
          {filtered.map((b, idx) => (
            <div className="ben-card" key={b.id} style={{ animationDelay: `${idx * 0.03}s` }}
              onClick={() => navigate(`/beneficiaries/${b.id}`)}>
              <div className={`ben-card-accent ${b.isPregnant ? 'pregnant' : b.gender === 'MALE' ? 'male' : 'female'}`} />
              <div className="ben-card-main">
                <div className="ben-card-top">
                  <div className={`ben-avatar ${b.isPregnant ? 'pregnant' : b.gender === 'MALE' ? 'male' : 'female'}`}>
                    {b.isPregnant ? (
                      <span className="material-symbols-outlined">pregnant_woman</span>
                    ) : (
                      getInitials(b.fullName)
                    )}
                  </div>
                  <div className="ben-card-identity">
                    <h3 className="ben-name">
                      {b.fullName}
                      {atRiskIds.has(b.id) && !b.isPregnant && (
                        <span className="ben-risk-tag">
                          <span className="material-symbols-outlined">warning</span>
                          At Risk
                        </span>
                      )}
                    </h3>
                    <div className="ben-meta-tags">
                      <span className="ben-id-tag">{b.awcBeneficiaryId}</span>
                      <span className={`ben-type-tag ${b.isPregnant ? 'pregnant' : 'child'}`}>
                        {b.isPregnant ? 'Pregnant Mother' : 'Child'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ben-card-details">
                  <div className="ben-detail-row">
                    <span className="material-symbols-outlined">cake</span>
                    <span>{getAge(b.dateOfBirth)}</span>
                  </div>
                  <div className="ben-detail-row">
                    <span className="material-symbols-outlined">wc</span>
                    <span>{b.gender}</span>
                  </div>
                  <div className="ben-detail-row">
                    <span className="material-symbols-outlined">family_restroom</span>
                    <span>{b.parentName || '—'}</span>
                  </div>
                  <div className="ben-detail-row">
                    <span className="material-symbols-outlined">phone</span>
                    <span>{b.parentMobile || '—'}</span>
                  </div>
                </div>

                <div className="ben-card-footer">
                  <button className="ben-view-btn" onClick={(e) => { e.stopPropagation(); navigate(`/beneficiaries/${b.id}`); }}>
                    <span className="material-symbols-outlined">visibility</span>
                    View Profile
                  </button>
                  <button className="ben-delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Beneficiary"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Register</button>
        </>}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Quick Voice Entry</label>
            <VoiceInput
              onResult={(text) => {
                const parsed = parseBeneficiaryVoice(text);
                setForm(prev => ({ ...prev, ...parsed, isPregnant: prev.isPregnant }));
                toast.success(`Voice parsed: ${Object.keys(parsed).join(', ')}`);
              }}
              buttonText="🎤 Fill by voice"
            />
            <small className="text-muted">Try: "Name Radhika, parent Sita, female, age 2 years"</small>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input type="checkbox" checked={form.isPregnant} onChange={(e) => setForm({ ...form, isPregnant: e.target.checked })} style={{ marginRight: 8 }} />
              Pregnant Mother (uncheck for child)
            </label>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input className="form-input" type="date" required value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Aadhaar Number</label>
              <input className="form-input" maxLength={12} value={form.aadhaarNumber} onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })} placeholder="12-digit Aadhaar" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Parent/Guardian Name *</label>
              <input className="form-input" required value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Parent Mobile *</label>
              <input className="form-input" required maxLength={10} value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Center *</label>
            <select className="form-select" required value={form.centerId} onChange={(e) => setForm({ ...form, centerId: e.target.value })}>
              <option value="">Select Center</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.centerCode})</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}