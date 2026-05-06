import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { centersApi } from '../api/centersApi';
import { workersApi } from '../api/workersApi';
import { beneficiariesApi } from '../api/beneficiariesApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

/* ===== ReactBits-Inspired: Animated Counter ===== */
function AnimatedCounter({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0 || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

/* ===== ReactBits-Inspired: Spotlight Card ===== */
function SpotlightCard({ children, className = '', color = 'green' }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const colorMap = {
    green: 'rgba(27, 94, 32, 0.08)',
    blue: 'rgba(2, 119, 189, 0.08)',
    orange: 'rgba(230, 81, 0, 0.08)',
    red: 'rgba(186, 26, 26, 0.08)',
  };

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--spotlight-x': `${pos.x}px`,
        '--spotlight-y': `${pos.y}px`,
        '--spotlight-color': colorMap[color] || colorMap.green,
        '--spotlight-opacity': isHovered ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

/* ===== ReactBits-Inspired: Progress Ring ===== */
function ProgressRing({ value, size = 56, stroke = 5, color = 'var(--primary)' }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circ - (value / 100) * circ);
    }, 200);
    return () => clearTimeout(timer);
  }, [value, circ]);

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="var(--surface-container-high)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        style={{ fontSize: size * 0.24, fontWeight: 700, fill: 'var(--on-surface)', fontFamily: 'var(--font-heading)' }}>
        {value}%
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ centers: 0, workers: 0, beneficiaries: 0 });
  const [beneficiaryData, setBeneficiaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const results = await Promise.allSettled([
        user.role !== 'WORKER' ? centersApi.getAll() : Promise.resolve({ data: [] }),
        user.role !== 'WORKER' ? workersApi.getAll() : Promise.resolve({ data: [] }),
        beneficiariesApi.getAll(),
      ]);

      const centersData = results[0].status === 'fulfilled' ? results[0].value.data : [];
      const workersData = results[1].status === 'fulfilled' ? results[1].value.data : [];
      const benData = results[2].status === 'fulfilled' ? results[2].value.data : [];

      setStats({
        centers: centersData.length,
        workers: workersData.length,
        beneficiaries: benData.length,
      });
      setBeneficiaryData(benData);
    } catch (e) {
      console.error('Failed to load stats', e);
    } finally {
      setLoading(false);
    }
  };

  const childCount = beneficiaryData.filter(b => !b.isPregnant).length;
  const motherCount = beneficiaryData.filter(b => b.isPregnant).length;
  const maleCount = beneficiaryData.filter(b => b.gender === 'MALE').length;
  const femaleCount = beneficiaryData.filter(b => b.gender === 'FEMALE').length;

  const pieData = [
    { name: 'Children', value: childCount, color: '#1B5E20' },
    { name: 'Pregnant Mothers', value: motherCount, color: '#E65100' },
  ].filter(d => d.value > 0);

  const genderData = [
    { name: 'Male', value: maleCount, color: '#0277BD' },
    { name: 'Female', value: femaleCount, color: '#AD1457' },
  ].filter(d => d.value > 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = {
    ADMIN: [
      { to: '/centers', icon: 'add_business', label: 'Manage Centers', desc: 'Add or edit centers' },
      { to: '/workers', icon: 'group', label: 'Manage Workers', desc: 'View all workers' },
      { to: '/beneficiaries', icon: 'child_care', label: 'Beneficiaries', desc: 'Register & track' },
      { to: '/reports', icon: 'download', label: 'Reports', desc: 'Download CSV/PDF' },
      { to: '/attendance', icon: 'event_available', label: 'Attendance', desc: 'View records' },
      { to: '/settings', icon: 'settings', label: 'Settings', desc: 'App preferences' },
    ],
    SUPERVISOR: [
      { to: '/beneficiaries', icon: 'child_care', label: 'Beneficiaries', desc: 'View all' },
      { to: '/attendance', icon: 'event_available', label: 'Attendance', desc: 'View records' },
      { to: '/reports', icon: 'download', label: 'Reports', desc: 'Download CSV/PDF' },
      { to: '/centers', icon: 'location_city', label: 'Centers', desc: 'View centers' },
    ],
    WORKER: [
      { to: '/beneficiaries', icon: 'child_care', label: 'My Beneficiaries', desc: 'View & manage' },
      { to: '/attendance', icon: 'event_available', label: 'Mark Attendance', desc: 'Daily attendance' },
      { to: '/beneficiaries', icon: 'monitor_weight', label: 'Growth Records', desc: 'Track growth' },
      { to: '/beneficiaries', icon: 'vaccines', label: 'Vaccinations', desc: 'Immunization records' },
    ],
  };

  return (
    <div className="dashboard-v2">
      {/* Greeting Banner */}
      <div className="dashboard-greeting">
        <div className="greeting-content">
          <div className="greeting-text">
            <h1 className="greeting-title">
              {getGreeting()}, <span className="gradient-text">{user?.role}</span>
            </h1>
            <p className="greeting-subtitle">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="greeting-badge">
            <span className="material-symbols-outlined">eco</span>
            <span>ICDS Tracker</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {user.role !== 'WORKER' && (
          <SpotlightCard color="green" className="stat-card-v2">
            <div className="stat-card-inner">
              <div className="stat-icon-v2 green">
                <span className="material-symbols-outlined">location_city</span>
              </div>
              <div className="stat-data">
                <h3 className="stat-number">{loading ? '—' : <AnimatedCounter target={stats.centers} />}</h3>
                <p className="stat-label">Total Centers</p>
              </div>
            </div>
            <div className="stat-trend positive">
              <span className="material-symbols-outlined">trending_up</span>
              Active
            </div>
          </SpotlightCard>
        )}

        {user.role !== 'WORKER' && (
          <SpotlightCard color="blue" className="stat-card-v2">
            <div className="stat-card-inner">
              <div className="stat-icon-v2 blue">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div className="stat-data">
                <h3 className="stat-number">{loading ? '—' : <AnimatedCounter target={stats.workers} />}</h3>
                <p className="stat-label">Total Workers</p>
              </div>
            </div>
            <div className="stat-trend positive">
              <span className="material-symbols-outlined">groups</span>
              Registered
            </div>
          </SpotlightCard>
        )}

        <SpotlightCard color="orange" className="stat-card-v2">
          <div className="stat-card-inner">
            <div className="stat-icon-v2 orange">
              <span className="material-symbols-outlined">child_care</span>
            </div>
            <div className="stat-data">
              <h3 className="stat-number">{loading ? '—' : <AnimatedCounter target={stats.beneficiaries} />}</h3>
              <p className="stat-label">Total Beneficiaries</p>
            </div>
          </div>
          <div className="stat-trend">
            <span className="chip chip-info" style={{ fontSize: '0.65rem' }}>{childCount} children</span>
            <span className="chip chip-warning" style={{ fontSize: '0.65rem' }}>{motherCount} mothers</span>
          </div>
        </SpotlightCard>

        <SpotlightCard color="red" className="stat-card-v2">
          <div className="stat-card-inner">
            <div className="stat-icon-v2 red">
              <span className="material-symbols-outlined">vaccines</span>
            </div>
            <div className="stat-data">
              <h3 className="stat-number">—</h3>
              <p className="stat-label">Overdue Vaccinations</p>
            </div>
          </div>
          <div className="stat-trend">
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>schedule</span>
            <span style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>Check profiles</span>
          </div>
        </SpotlightCard>
      </div>

      {/* Charts & Quick Actions Row */}
      <div className="dashboard-content-grid">
        {/* Quick Actions */}
        <div className="card dashboard-card-v2">
          <div className="card-header">
            <h3 className="card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8 }}>bolt</span>
              Quick Actions
            </h3>
          </div>
          <div className="quick-actions-v2">
            {(quickActions[user.role] || quickActions.WORKER).map((action, i) => (
              <Link key={i} to={action.to} className="quick-action-card" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="qa-icon">
                  <span className="material-symbols-outlined">{action.icon}</span>
                </div>
                <div className="qa-text">
                  <strong>{action.label}</strong>
                  <span>{action.desc}</span>
                </div>
                <span className="material-symbols-outlined qa-arrow">arrow_forward</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Beneficiary Distribution Chart */}
        <div className="card dashboard-card-v2">
          <div className="card-header">
            <h3 className="card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8 }}>pie_chart</span>
              Beneficiary Distribution
            </h3>
          </div>
          {stats.beneficiaries === 0 ? (
            <div className="chart-empty">
              <span className="material-symbols-outlined">insert_chart</span>
              <p>Add beneficiaries to see distribution</p>
            </div>
          ) : (
            <div className="chart-row">
              <div className="chart-mini">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                      paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {pieData.map((d, i) => (
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span>{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-mini">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={genderData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-high)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {genderData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {genderData.map((d, i) => (
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span>{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="card dashboard-card-v2">
          <div className="card-header">
            <h3 className="card-title">
              <span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8 }}>monitor_heart</span>
              System Status
            </h3>
          </div>
          <div className="status-grid">
            <div className="status-item">
              <ProgressRing value={100} color="var(--primary)" />
              <div className="status-text">
                <strong>Frontend</strong>
                <span className="chip chip-success" style={{ fontSize: '0.6rem' }}>Online</span>
              </div>
            </div>
            <div className="status-item">
              <ProgressRing value={stats.beneficiaries > 0 ? 100 : 0} color={stats.beneficiaries > 0 ? 'var(--primary)' : 'var(--outline-variant)'} />
              <div className="status-text">
                <strong>Backend</strong>
                <span className={`chip ${stats.beneficiaries > 0 ? 'chip-success' : 'chip-warning'}`} style={{ fontSize: '0.6rem' }}>
                  {stats.beneficiaries > 0 ? 'Connected' : 'Check'}
                </span>
              </div>
            </div>
          </div>
          <div className="activity-list" style={{ marginTop: 'var(--space-md)' }}>
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p>Dashboard loaded for <strong>{user.role}</strong></p>
                <span>Just now • System</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot info"></div>
              <div className="activity-content">
                <p>{stats.beneficiaries} beneficiaries in system</p>
                <span>Live data • API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}