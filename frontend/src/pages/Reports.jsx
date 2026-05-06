import { useState, useEffect } from 'react';
import { centersApi } from '../api/centersApi';
import { reportsApi } from '../api/reportsApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Pages.css';

export default function Reports() {
  const { hasRole } = useAuth();
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    if (hasRole('ADMIN', 'SUPERVISOR')) {
      centersApi.getAll().then(res => setCenters(res.data)).catch(() => {});
    }
  }, []);

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (type, format) => {
    if (!selectedCenter) { toast.error('Please select a center'); return; }
    setDownloading(`${type}-${format}`);
    try {
      let res;
      let filename;
      switch (type) {
        case 'growth':
          res = await reportsApi.downloadGrowthSummary(selectedCenter, year, month, format);
          filename = `growth_summary_${year}_${month}.${format}`;
          break;
        case 'vaccination':
          res = await reportsApi.downloadVaccinationCoverage(selectedCenter, format);
          filename = `vaccination_coverage.${format}`;
          break;
        case 'nutrition':
          res = await reportsApi.downloadNutritionSummary(selectedCenter, year, month, format);
          filename = `nutrition_summary_${year}_${month}.${format}`;
          break;
        default: return;
      }
      downloadFile(res.data, filename);
      toast.success(`Downloaded ${filename}`);
    } catch (e) {
      toast.error('Download failed. Make sure the backend is running.');
    } finally {
      setDownloading('');
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const reportCards = [
    {
      id: 'growth',
      icon: 'monitoring',
      title: 'Monthly Growth Summary',
      description: 'Weight gain/loss/no change for each beneficiary in the selected month.',
      color: 'green',
      needsMonth: true,
    },
    {
      id: 'vaccination',
      icon: 'vaccines',
      title: 'Vaccination Coverage',
      description: 'Coverage percentage per vaccine across all beneficiaries in the center.',
      color: 'blue',
      needsMonth: false,
    },
    {
      id: 'nutrition',
      icon: 'restaurant',
      title: 'Nutrition Summary',
      description: 'Aggregated nutrition distribution totals per item for the selected month.',
      color: 'orange',
      needsMonth: true,
    },
  ];

  if (!hasRole('ADMIN', 'SUPERVISOR')) {
    return (
      <div className="card">
        <div className="empty-state">
          <span className="material-symbols-outlined">lock</span>
          <h3>Access Restricted</h3>
          <p>Reports are only available for Supervisors and Admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Generate and download reports for your centers</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Report Parameters</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Center *</label>
            <select className="form-select" value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}>
              <option value="">Select a center</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.centerCode})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Year</label>
            <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Month</label>
            <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-md)' }}>
        {reportCards.map((r) => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-md mb-md">
              <div className={`stat-icon ${r.color}`}>
                <span className="material-symbols-outlined">{r.icon}</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>{r.title}</h3>
                <p className="text-sm text-muted">{r.description}</p>
              </div>
            </div>
            <div className="flex gap-sm" style={{ marginTop: 'auto' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleDownload(r.id, 'csv')}
                disabled={!!downloading}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_chart</span>
                {downloading === `${r.id}-csv` ? 'Downloading...' : 'CSV'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleDownload(r.id, 'pdf')}
                disabled={!!downloading}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
                {downloading === `${r.id}-pdf` ? 'Downloading...' : 'PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
