import { useState, useEffect } from 'react';
import { appointmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}
function formatTime(t) {
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

const STATUS_COLOR = {
  PENDING:   '#fef3c7',
  BOOKED:    '#d1fae5',
  CANCELLED: '#fee2e2',
  REJECTED:  '#fce7f3',
  COMPLETED: '#dbeafe',
};
const STATUS_TEXT = {
  PENDING:   '#92400e',
  BOOKED:    '#065f46',
  CANCELLED: '#991b1b',
  REJECTED:  '#9d174d',
  COMPLETED: '#1e40af',
};

export default function FacultySchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [view,     setView]     = useState('week'); // 'week' | 'all'
  const { user } = useAuth();

  useEffect(() => {
    appointmentApi.getForFaculty(user.id)
      .then(res => setAppointments(res.data))
      .catch(() => setError('Failed to load schedule.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  // Group appointments by date
  const grouped = appointments.reduce((acc, appt) => {
    const date = appt.slotDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});

  // Filter to this week if needed
  const today = new Date();
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
  const dates = Object.keys(grouped).sort().filter(d => {
    if (view === 'all') return true;
    const date = new Date(d + 'T00:00:00');
    return date >= today && date <= weekEnd;
  });

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>My Schedule</h1>
          <p>View your upcoming appointments in calendar view</p>
        </div>
        <div className="flex gap-8">
          <button className={`btn ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('week')}>This Week</button>
          <button className={`btn ${view === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('all')}>All</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      ) : dates.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🗓️</div>
          <h3>No appointments scheduled</h3>
          <p>{view === 'week' ? 'No appointments for this week.' : 'No appointments found.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {dates.map(date => (
            <div key={date} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: 'var(--primary)', color: '#fff' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{formatDate(date)}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                  {grouped[date].length} appointment{grouped[date].length > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ padding: '12px 0' }}>
                {grouped[date]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(appt => (
                    <div key={appt.id} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '12px 20px', borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{ minWidth: 100, whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{formatTime(appt.startTime)}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>– {formatTime(appt.endTime)}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{appt.studentName}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{appt.purpose || 'No purpose specified'}</div>
                        {appt.studentEmail && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{appt.studentEmail}</div>
                        )}
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: STATUS_COLOR[appt.status] || '#f1f5f9',
                        color: STATUS_TEXT[appt.status] || 'var(--text)',
                      }}>
                        {appt.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
