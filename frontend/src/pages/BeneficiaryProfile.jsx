import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { beneficiariesApi, riskApi } from '../api/beneficiariesApi';
import { growthApi } from '../api/growthApi';
import { vaccinationApi } from '../api/vaccinationApi';
import { nutritionApi } from '../api/nutritionApi';
import Modal from '../components/Modal';
import VoiceInput from '../components/VoiceInput';
import { parseGrowthVoice } from '../utils/voiceParser';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './BeneficiaryProfile.css';

export default function BeneficiaryProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beneficiary, setBeneficiary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Growth
  const [growthRecords, setGrowthRecords] = useState([]);
  const [growthModal, setGrowthModal] = useState(false);
  const [growthForm, setGrowthForm] = useState({ recordDate: '', weightKg: '', heightCm: '', muacCm: '', notes: '' });

  // Z-Score
  const [growthZData, setGrowthZData] = useState([]);
  const [currentNutritionStatus, setCurrentNutritionStatus] = useState(null);

  // Risk Assessment
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  // Vaccination
  const [vaccineSchedule, setVaccineSchedule] = useState([]);
  const [vaccineModal, setVaccineModal] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({ vaccineId: '', givenDate: '', batchNumber: '' });

  // Nutrition
  const [nutritionRecords, setNutritionRecords] = useState([]);
  const [nutritionModal, setNutritionModal] = useState(false);
  const [nutritionForm, setNutritionForm] = useState({ distributionDate: '', itemName: '', quantity: '', unit: 'piece' });

  useEffect(() => { loadBeneficiary(); }, [id]);

  useEffect(() => {
    if (beneficiary) {
      if (activeTab === 'growth') {
        loadGrowth();
        loadGrowthWithZscore();
      }
      if (activeTab === 'vaccination') loadVaccination();
      if (activeTab === 'nutrition') loadNutrition();
    }
  }, [activeTab, beneficiary]);

  useEffect(() => {
    if (beneficiary && !beneficiary.isPregnant) {
      loadRiskAssessment();
    }
  }, [beneficiary]);

  const loadBeneficiary = async () => {
    try {
      const res = await beneficiariesApi.getById(id);
      setBeneficiary(res.data);
    } catch (e) {
      toast.error('Failed to load beneficiary');
      navigate('/beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const loadGrowth = async () => {
    try {
      const res = await growthApi.getAll(id);
      setGrowthRecords(res.data);
    } catch (e) { console.error(e); }
  };

  const loadGrowthWithZscore = async () => {
    try {
      const res = await growthApi.getWithZscore(id);
      setGrowthZData(res.data);
      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        setCurrentNutritionStatus(latest.classification);
      } else {
        setCurrentNutritionStatus(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRiskAssessment = async () => {
    setLoadingRisk(true);
    try {
      const res = await riskApi.assessBeneficiary(id);
      setRiskAssessment(res.data);
    } catch (e) {
      console.error('Failed to load risk assessment', e);
    } finally {
      setLoadingRisk(false);
    }
  };

  const loadVaccination = async () => {
    try {
      const res = await vaccinationApi.getSchedule(id);
      setVaccineSchedule(res.data);
    } catch (e) { console.error(e); }
  };

  const loadNutrition = async () => {
    try {
      const res = await nutritionApi.getHistory(id);
      setNutritionRecords(res.data);
    } catch (e) { console.error(e); }
  };

  const submitGrowth = async (e) => {
    e.preventDefault();
    try {
      await growthApi.create(id, {
        recordDate: growthForm.recordDate,
        weightKg: parseFloat(growthForm.weightKg),
        heightCm: parseFloat(growthForm.heightCm),
        muacCm: growthForm.muacCm ? parseFloat(growthForm.muacCm) : null,
        notes: growthForm.notes,
      });
      toast.success('Growth record added');
      setGrowthModal(false);
      setGrowthForm({ recordDate: '', weightKg: '', heightCm: '', muacCm: '', notes: '' });
      loadGrowth();
      loadGrowthWithZscore();
      loadRiskAssessment();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add record');
    }
  };

  const submitVaccine = async (e) => {
    e.preventDefault();
    try {
      await vaccinationApi.markGiven(id, {
        vaccineId: parseInt(vaccineForm.vaccineId),
        givenDate: vaccineForm.givenDate,
        batchNumber: vaccineForm.batchNumber,
      });
      toast.success('Vaccination recorded');
      setVaccineModal(false);
      setVaccineForm({ vaccineId: '', givenDate: '', batchNumber: '' });
      loadVaccination();
      loadRiskAssessment();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to record vaccination');
    }
  };

  const submitNutrition = async (e) => {
    e.preventDefault();
    try {
      await nutritionApi.create(id, {
        ...nutritionForm,
        quantity: parseFloat(nutritionForm.quantity),
      });
      toast.success('Nutrition record added');
      setNutritionModal(false);
      setNutritionForm({ distributionDate: '', itemName: '', quantity: '', unit: 'piece' });
      loadNutrition();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add record');
    }
  };

  const getAge = (dob) => {
    if (!dob) return '—';
    const d = new Date(dob);
    const now = new Date();
    const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (months < 12) return `${months} months`;
    return `${Math.floor(months / 12)} years ${months % 12} months`;
  };

  const getStatusColor = (status) => {
    if (!status) return '';
    if (status.includes('Severe')) return 'badge-error';
    if (status.includes('Underweight')) return 'badge-warning';
    if (status.includes('Overweight') || status.includes('Obese')) return 'badge-info';
    return 'badge-success';
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'HIGH': return '#D32F2F';
      case 'MEDIUM': return '#F57C00';
      case 'LOW': return '#FBC02D';
      default: return '#4CAF50';
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!beneficiary) return null;

  const tabs = [
    { key: 'overview', icon: 'person', label: 'Overview' },
    { key: 'growth', icon: 'monitoring', label: 'Growth' },
    { key: 'vaccination', icon: 'vaccines', label: 'Vaccination' },
    { key: 'nutrition', icon: 'restaurant', label: 'Nutrition' },
  ];

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/beneficiaries')}>
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Beneficiaries
      </button>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="profile-header">
          <div className={`profile-avatar ${beneficiary.isPregnant ? 'pregnant' : 'child'}`}>
            {beneficiary.fullName?.charAt(0)}
          </div>
          <div className="profile-info">
            <h2>{beneficiary.fullName}</h2>
            <div className="profile-meta">
              <span className={`chip ${beneficiary.isPregnant ? 'chip-warning' : 'chip-info'}`}>
                {beneficiary.isPregnant ? 'Pregnant Mother' : 'Child'}
              </span>
              <span><span className="material-symbols-outlined">badge</span>{beneficiary.awcBeneficiaryId}</span>
              <span><span className="material-symbols-outlined">cake</span>{getAge(beneficiary.dateOfBirth)}</span>
              <span><span className="material-symbols-outlined">wc</span>{beneficiary.gender}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {tabs.map(tab => (
          <button key={tab.key} className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {riskAssessment && !beneficiary.isPregnant && (
            <div className="card" style={{ marginBottom: 'var(--space-md)', borderLeft: `4px solid ${getRiskColor(riskAssessment.riskLevel)}` }}>
              <div className="card-header">
                <h3 className="card-title">
                  <span className="material-symbols-outlined">analytics</span>
                  Malnutrition Risk Assessment
                </h3>
                <div className={`risk-score-badge ${riskAssessment.riskLevel.toLowerCase()}`}>
                  Risk Score: {riskAssessment.riskScore}% • {riskAssessment.riskLevel}
                </div>
              </div>
              <div className="risk-details">
                {riskAssessment.reasons?.length > 0 && (
                  <div className="risk-section">
                    <strong>⚠️ Risk Factors:</strong>
                    <ul>
                      {riskAssessment.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                    </ul>
                  </div>
                )}
                {riskAssessment.recommendations?.length > 0 && (
                  <div className="risk-section">
                    <strong>✅ Recommendations:</strong>
                    <ul>
                      {riskAssessment.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  </div>
                )}
                {riskAssessment.riskFactors && Object.keys(riskAssessment.riskFactors).length > 0 && (
                  <details className="risk-details-section">
                    <summary>Detailed Risk Breakdown</summary>
                    <pre>{JSON.stringify(riskAssessment.riskFactors, null, 2)}</pre>
                  </details>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><h3 className="card-title">Personal Information</h3></div>
            <div className="info-grid">
              <div className="info-item"><label>Full Name</label><span>{beneficiary.fullName}</span></div>
              <div className="info-item"><label>Date of Birth</label><span>{beneficiary.dateOfBirth}</span></div>
              <div className="info-item"><label>Gender</label><span>{beneficiary.gender}</span></div>
              <div className="info-item"><label>Aadhaar</label><span>{beneficiary.aadhaarNumber || 'Not provided'}</span></div>
              <div className="info-item"><label>Parent/Guardian</label><span>{beneficiary.parentName}</span></div>
              <div className="info-item"><label>Parent Mobile</label><span>{beneficiary.parentMobile}</span></div>
              <div className="info-item"><label>Center ID</label><span>{beneficiary.centerId}</span></div>
              <div className="info-item"><label>Status</label><span className={`chip ${beneficiary.active ? 'chip-success' : 'chip-error'}`}>{beneficiary.active ? 'Active' : 'Inactive'}</span></div>
            </div>
          </div>
        </>
      )}

      {/* Growth Tab */}
      {activeTab === 'growth' && (
        <div>
          <div className="flex justify-between items-center mb-md">
            <h3>Growth Records ({growthRecords.length})</h3>
            <button className="btn btn-primary" onClick={() => setGrowthModal(true)}>
              <span className="material-symbols-outlined">add</span>Add Record
            </button>
          </div>

          {currentNutritionStatus && (
            <div className="card" style={{ marginBottom: 'var(--space-md)', background: 'var(--surface-container-low)' }}>
              <div className="flex justify-between items-center">
                <span className="text-md font-medium">Current Nutritional Status (by WHO Z‑score):</span>
                <span className={`badge ${getStatusColor(currentNutritionStatus)}`}>{currentNutritionStatus}</span>
              </div>
            </div>
          )}

          {growthRecords.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="growth-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthRecords}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-high)" />
                    <XAxis dataKey="recordDate" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="w" orientation="left" tick={{ fontSize: 12 }} label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="h" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'cm', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="w" type="monotone" dataKey="weightKg" stroke="#1B5E20" strokeWidth={2} name="Weight (kg)" dot={{ r: 4 }} />
                    <Line yAxisId="h" type="monotone" dataKey="heightCm" stroke="#0277BD" strokeWidth={2} name="Height (cm)" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {growthZData.length > 1 && (
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Weight‑for‑Age Z‑Score Trend (WHO)</h4>
              <div className="growth-chart-area">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={growthZData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-high)" />
                    <XAxis dataKey="recordDate" tick={{ fontSize: 12 }} />
                    <YAxis
                      domain={[-3.5, 3.5]}
                      ticks={[-3, -2, -1, 0, 1, 2, 3]}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Z‑Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="zScore" stroke="#D32F2F" strokeWidth={2} name="Z‑Score" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="zscore-legend">
                <span style={{ background: '#E8F5E9', padding: '4px 8px', borderRadius: '4px' }}>Normal (-2 to +2)</span>
                <span style={{ background: '#FFF3E0', padding: '4px 8px', borderRadius: '4px' }}>Underweight (-3 to -2)</span>
                <span style={{ background: '#FFEBEE', padding: '4px 8px', borderRadius: '4px' }}>Severe underweight (&lt; -3)</span>
                <span style={{ background: '#E3F2FD', padding: '4px 8px', borderRadius: '4px' }}>Overweight/Obese (&gt; +2)</span>
              </div>
            </div>
          )}

          <div className="card">
            {growthRecords.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined">monitoring</span>
                <h3>No growth records</h3><p>Add the first growth measurement.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Date</th><th>Weight (kg)</th><th>Height (cm)</th><th>MUAC (cm)</th><th>Notes</th><th>Recorded By</th></tr>
                  </thead>
                  <tbody>
                    {growthRecords.map(r => (
                      <tr key={r.id}>
                        <td>{r.recordDate}</td><td>{r.weightKg}</td><td>{r.heightCm}</td>
                        <td>{r.muacCm || '—'}</td><td>{r.notes || '—'}</td><td>{r.workerName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Modal isOpen={growthModal} onClose={() => setGrowthModal(false)} title="Add Growth Record"
            footer={<><button className="btn btn-secondary" onClick={() => setGrowthModal(false)}>Cancel</button><button className="btn btn-primary" onClick={submitGrowth}>Save</button></>}>
            <form onSubmit={submitGrowth}>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label">Quick Voice Entry</label>
                <VoiceInput
                  onResult={(text) => {
                    const parsed = parseGrowthVoice(text);
                    setGrowthForm(prev => ({ ...prev, ...parsed }));
                    toast.success(`Voice parsed: ${Object.keys(parsed).join(', ')}`);
                  }}
                  buttonText="🎤 Fill by voice"
                />
                <small className="text-muted">Try: "Weight 8.2 kg height 72 cm date 5 may 2025"</small>
              </div>
              <div className="form-group"><label className="form-label">Record Date *</label><input className="form-input" type="date" required value={growthForm.recordDate} onChange={(e) => setGrowthForm({ ...growthForm, recordDate: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Weight (kg) *</label><input className="form-input" type="number" step="0.1" min="0.5" max="50" required value={growthForm.weightKg} onChange={(e) => setGrowthForm({ ...growthForm, weightKg: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Height (cm) *</label><input className="form-input" type="number" step="0.1" min="20" max="150" required value={growthForm.heightCm} onChange={(e) => setGrowthForm({ ...growthForm, heightCm: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">MUAC (cm)</label><input className="form-input" type="number" step="0.1" value={growthForm.muacCm} onChange={(e) => setGrowthForm({ ...growthForm, muacCm: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={growthForm.notes} onChange={(e) => setGrowthForm({ ...growthForm, notes: e.target.value })} /></div>
            </form>
          </Modal>
        </div>
      )}

      {/* Vaccination Tab (unchanged) */}
      {activeTab === 'vaccination' && (
        <div>
          <div className="flex justify-between items-center mb-md">
            <h3>Vaccination Schedule</h3>
            <button className="btn btn-primary" onClick={() => setVaccineModal(true)}>
              <span className="material-symbols-outlined">add</span>Mark Vaccine
            </button>
          </div>
          <div className="card">
            {vaccineSchedule.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined">vaccines</span>
                <h3>No vaccination data</h3><p>Schedule data will appear once loaded.</p>
              </div>
            ) : (
              vaccineSchedule.map((v, i) => (
                <div key={i} className="vaccine-card">
                  <div className="vaccine-info">
                    <span className={`chip ${v.status === 'COMPLETED' ? 'chip-success' : v.status === 'OVERDUE' ? 'chip-error' : 'chip-warning'}`}>
                      {v.status}
                    </span>
                    <div>
                      <h4>{v.vaccineName}</h4>
                      <p>Due: {v.dueDate} {v.givenDate ? `• Given: ${v.givenDate}` : ''}</p>
                    </div>
                  </div>
                  {v.batchNumber && <span className="text-sm text-muted">Batch: {v.batchNumber}</span>}
                </div>
              ))
            )}
          </div>

          <Modal isOpen={vaccineModal} onClose={() => setVaccineModal(false)} title="Record Vaccination"
            footer={<><button className="btn btn-secondary" onClick={() => setVaccineModal(false)}>Cancel</button><button className="btn btn-primary" onClick={submitVaccine}>Save</button></>}>
            <form onSubmit={submitVaccine}>
              <div className="form-group">
                <label className="form-label">Vaccine *</label>
                <select className="form-select" required value={vaccineForm.vaccineId} onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineId: e.target.value })}>
                  <option value="">Select vaccine</option>
                  {vaccineSchedule.filter(v => v.status !== 'COMPLETED').map(v => (
                    <option key={v.vaccineId} value={v.vaccineId}>{v.vaccineName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Given Date *</label><input className="form-input" type="date" required value={vaccineForm.givenDate} onChange={(e) => setVaccineForm({ ...vaccineForm, givenDate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Batch Number</label><input className="form-input" value={vaccineForm.batchNumber} onChange={(e) => setVaccineForm({ ...vaccineForm, batchNumber: e.target.value })} /></div>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Nutrition Tab (unchanged) */}
      {activeTab === 'nutrition' && (
        <div>
          <div className="flex justify-between items-center mb-md">
            <h3>Nutrition Distribution ({nutritionRecords.length})</h3>
            <button className="btn btn-primary" onClick={() => setNutritionModal(true)}>
              <span className="material-symbols-outlined">add</span>Add Record
            </button>
          </div>
          <div className="card">
            {nutritionRecords.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined">restaurant</span>
                <h3>No nutrition records</h3><p>Record nutrition distributions.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Date</th><th>Item</th><th>Quantity</th><th>Unit</th></tr></thead>
                  <tbody>
                    {nutritionRecords.map((n, i) => (
                      <tr key={i}>
                        <td>{n.distributionDate}</td><td style={{ fontWeight: 600 }}>{n.itemName}</td>
                        <td>{n.quantity}</td><td>{n.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Modal isOpen={nutritionModal} onClose={() => setNutritionModal(false)} title="Add Nutrition Record"
            footer={<><button className="btn btn-secondary" onClick={() => setNutritionModal(false)}>Cancel</button><button className="btn btn-primary" onClick={submitNutrition}>Save</button></>}>
            <form onSubmit={submitNutrition}>
              <div className="form-group"><label className="form-label">Distribution Date *</label><input className="form-input" type="date" required value={nutritionForm.distributionDate} onChange={(e) => setNutritionForm({ ...nutritionForm, distributionDate: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Item Name *</label><input className="form-input" required value={nutritionForm.itemName} onChange={(e) => setNutritionForm({ ...nutritionForm, itemName: e.target.value })} placeholder="e.g. Egg, Milk, Dal" /></div>
                <div className="form-group"><label className="form-label">Quantity *</label><input className="form-input" type="number" step="0.1" required value={nutritionForm.quantity} onChange={(e) => setNutritionForm({ ...nutritionForm, quantity: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Unit</label>
                <select className="form-select" value={nutritionForm.unit} onChange={(e) => setNutritionForm({ ...nutritionForm, unit: e.target.value })}>
                  <option value="piece">Piece</option><option value="kg">Kg</option><option value="litre">Litre</option><option value="ml">ML</option><option value="grams">Grams</option><option value="packet">Packet</option>
                </select>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}