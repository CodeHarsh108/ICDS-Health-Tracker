import { useState, useEffect, useRef } from 'react';
import { attendanceApi } from '../api/attendanceApi';
import { beneficiariesApi } from '../api/beneficiariesApi';
import { centersApi } from '../api/centersApi';
import { useAuth } from '../context/AuthContext';
import VoiceInput from '../components/VoiceInput';
import { parseAttendanceVoice } from '../utils/voiceParser';
import toast from 'react-hot-toast';
import './Attendance.css';

/* ===== ReactBits-Inspired: Animated Number ===== */
function AnimNum({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === display) return;
    const start = performance.now();
    const from = display;
    const step = (now) => {
      const p = Math.min((now - start) / 500, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

export default function Attendance() {
  const { user, hasRole } = useAuth();
  const [centers, setCenters] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('CHILD_SESSION');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'

  useEffect(() => { loadInitial(); }, []);

  const loadInitial = async () => {
    try {
      const [bRes, cRes] = await Promise.allSettled([
        beneficiariesApi.getAll(),
        hasRole('ADMIN', 'SUPERVISOR') ? centersApi.getAll() : Promise.resolve({ data: [] }),
      ]);
      if (bRes.status === 'fulfilled') setBeneficiaries(bRes.value.data);
      if (cRes.status === 'fulfilled') setCenters(cRes.value.data);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadExisting = async (centerId, date) => {
    if (!centerId && !hasRole('WORKER')) return;
    try {
      const res = await attendanceApi.getByCenter(centerId || user?.centerId, date);
      const map = {};
      res.data.forEach(r => { map[r.beneficiaryId] = r.isPresent; });
      setAttendanceMap(map);
    } catch (e) { setAttendanceMap({}); }
  };

  const loadMonthlyStats = async (centerId) => {
    if (!centerId && !hasRole('WORKER')) return;
    try {
      const cid = centerId || user?.centerId;
      if (!cid) return;
      const res = await attendanceApi.getMonthlyStats(cid, currentMonth.getFullYear(), currentMonth.getMonth() + 1);
      setMonthlyStats(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setMonthlyStats([]); }
  };

  useEffect(() => {
    loadExisting(selectedCenter, selectedDate);
  }, [selectedCenter, selectedDate]);

  useEffect(() => {
    if (selectedCenter || hasRole('WORKER')) {
      loadMonthlyStats(selectedCenter);
    }
  }, [selectedCenter, currentMonth]);

  const filteredBeneficiaries = beneficiaries.filter(b => {
    if (selectedCenter && b.centerId !== Number(selectedCenter)) return false;
    if (sessionType === 'CHILD_SESSION') return !b.isPregnant;
    if (sessionType === 'PREGNANT_MOTHER_SESSION') return b.isPregnant;
    return true;
  });

  const toggleAttendance = (beneficiaryId) => {
    setAttendanceMap(prev => ({ ...prev, [beneficiaryId]: !prev[beneficiaryId] }));
  };

  const markAll = (present) => {
    const map = {};
    filteredBeneficiaries.forEach(b => { map[b.id] = present; });
    setAttendanceMap(map);
  };

  const submitBatch = async () => {
    setSubmitting(true);
    try {
      const attendances = filteredBeneficiaries.map(b => ({
        beneficiaryId: b.id,
        isPresent: !!attendanceMap[b.id],
      }));
      await attendanceApi.markBatch({
        attendanceDate: selectedDate,
        sessionType,
        attendances,
      });
      toast.success('Attendance saved successfully!');
      setMarkedDates(prev => ({ ...prev, [selectedDate]: true }));
      if (selectedCenter || hasRole('WORKER')) loadMonthlyStats(selectedCenter);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = filteredBeneficiaries.filter(b => attendanceMap[b.id]).length;
  const totalCount = filteredBeneficiaries.length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // ===== Calendar Logic =====
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const calendarDays = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, date: dateStr });
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(today);
  };

  const monthName = currentMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="attendance-v2">
      {/* Header */}
      <div className="attendance-header">
        <div className="attendance-header-left">
          <h1>Attendance</h1>
          <p>Mark daily attendance for beneficiaries</p>
        </div>
        <div className="attendance-header-right">
          <div className="view-toggle">
            <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="attendance-stats-row">
        <div className="att-stat-card primary">
          <span className="material-symbols-outlined">groups</span>
          <div>
            <h4><AnimNum value={totalCount} /></h4>
            <p>Total</p>
          </div>
        </div>
        <div className="att-stat-card success">
          <span className="material-symbols-outlined">check_circle</span>
          <div>
            <h4><AnimNum value={presentCount} /></h4>
            <p>Present</p>
          </div>
        </div>
        <div className="att-stat-card error">
          <span className="material-symbols-outlined">cancel</span>
          <div>
            <h4><AnimNum value={totalCount - presentCount} /></h4>
            <p>Absent</p>
          </div>
        </div>
        <div className="att-stat-card info">
          <div className="att-ring">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="var(--surface-container-high)" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="var(--primary)" strokeWidth="4"
                strokeLinecap="round" strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeDashoffset="25" style={{ transition: 'all 0.6s ease' }} />
            </svg>
          </div>
          <div>
            <h4><AnimNum value={percentage} suffix="%" /></h4>
            <p>Rate</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="attendance-filters card">
        {hasRole('ADMIN', 'SUPERVISOR') && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Center</label>
            <select className="form-select" value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}>
              <option value="">All Centers</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Session Type</label>
          <select className="form-select" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
            <option value="CHILD_SESSION">Child Session</option>
            <option value="PREGNANT_MOTHER_SESSION">Pregnant Mother Session</option>
          </select>
        </div>
      </div>

      <div className="attendance-body">
        {/* Calendar Panel */}
        {view === 'calendar' && (
          <div className="calendar-panel card">
            <div className="calendar-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="cal-month">{monthName}</h3>
              <button className="cal-nav-btn" onClick={nextMonth}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="btn btn-sm btn-secondary cal-today-btn" onClick={goToToday}>Today</button>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="cal-day-header">{d}</div>
              ))}
              {calendarDays.map((item, idx) => {
                if (!item) return <div key={`empty-${idx}`} className="cal-day empty" />;
                const isSelected = item.date === selectedDate;
                const isToday = item.date === today;
                const isMarked = markedDates[item.date];
                const isFuture = item.date > today;

                return (
                  <button
                    key={item.date}
                    className={`cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isMarked ? 'marked' : ''} ${isFuture ? 'future' : ''}`}
                    onClick={() => !isFuture && setSelectedDate(item.date)}
                    disabled={isFuture}
                  >
                    <span className="cal-day-num">{item.day}</span>
                    {isMarked && <span className="cal-day-dot" />}
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span><span className="cal-legend-dot today" /> Today</span>
              <span><span className="cal-legend-dot selected" /> Selected</span>
              <span><span className="cal-legend-dot marked" /> Submitted</span>
            </div>
          </div>
        )}

        {/* Attendance List Panel */}
        <div className="attendance-list-panel card">
          <div className="att-list-header">
            <div>
              <h3>{new Date(selectedDate + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</h3>
              <p className="text-sm text-muted">{sessionType === 'CHILD_SESSION' ? 'Child Session' : 'Pregnant Mother Session'}</p>
            </div>
            <div className="flex gap-sm">
              <button className="btn btn-sm btn-secondary" onClick={() => markAll(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>done_all</span>
                All Present
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => markAll(false)}>Clear</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="spinner"></div></div>
          ) : filteredBeneficiaries.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined">event_available</span>
              <h3>No beneficiaries found</h3>
              <p>Select a center or register beneficiaries first.</p>
            </div>
          ) : (
            <>
              <div className="att-beneficiary-list">
                {filteredBeneficiaries.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`att-beneficiary-row ${attendanceMap[b.id] ? 'present' : 'absent'}`}
                    onClick={() => toggleAttendance(b.id)}
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    <div className="att-checkbox" data-checked={!!attendanceMap[b.id]}>
                      {attendanceMap[b.id] && (
                        <span className="material-symbols-outlined">check</span>
                      )}
                    </div>
                    <div className="att-avatar">
                      {b.fullName?.charAt(0)}
                    </div>
                    <div className="att-info">
                      <strong>{b.fullName}</strong>
                      <span>{b.awcBeneficiaryId} • {b.parentName || '—'}</span>
                    </div>
                    <div className="att-status-chip">
                      {attendanceMap[b.id] ? (
                        <span className="chip chip-success">Present</span>
                      ) : (
                        <span className="chip chip-error">Absent</span>
                      )}
                    </div>
                    <div className="att-voice" onClick={(e) => e.stopPropagation()}>
                      <VoiceInput
                        onResult={(text) => {
                          const parsed = parseAttendanceVoice(text);
                          if (parsed !== null) {
                            setAttendanceMap(prev => ({ ...prev, [b.id]: parsed.isPresent }));
                            toast.success(`${b.fullName} → ${parsed.isPresent ? 'Present' : 'Absent'}`);
                          } else {
                            toast.error("Say 'present' or 'absent'");
                          }
                        }}
                        className="voice-inline"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="att-submit-bar">
                <div className="att-submit-info">
                  <span className="material-symbols-outlined">info</span>
                  <span>{presentCount} of {totalCount} marked present ({percentage}%)</span>
                </div>
                <button className="btn btn-primary btn-lg" onClick={submitBatch} disabled={submitting}>
                  <span className="material-symbols-outlined">save</span>
                  {submitting ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}