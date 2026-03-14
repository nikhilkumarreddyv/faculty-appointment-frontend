import { useState, useEffect } from 'react';
import { appointmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import './Dashboard.css';

const FILTERS = ['ALL', 'PENDING', 'BOOKED', 'CANCELLED', 'REJECTED', 'COMPLETED'];

export default function FacultyDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [filter,   setFilter]   = useState('PENDING');
  const { user } = useAuth();

  const load = () => {
    setLoading(true);
    appointmentApi.getForFaculty(user.id)
      .then(res => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user.id]);

  const handleAccept = async (id) => {
    try {
      await appointmentApi.updateStatus(id, { status: 'BOOKED', facultyNotes: 'Appointment confirmed.' });
      setSuccess('Appointment accepted!');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not accept appointment.');
    }
  };

  const handleReject = async (id) => {
    const note = window.prompt('Reason for rejection (optional):');
    if (note === null) return; // cancelled
    try {
      await appointmentApi.updateStatus(id, { status: 'REJECTED', facultyNotes: note || 'Rejected by faculty.' });
      setSuccess('Appointment rejected.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reject appointment.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentApi.updateStatus(id, { status: 'COMPLETED', facultyNotes: 'Appointment marked as completed.' });
      setSuccess('Appointment marked as completed!');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not complete appointment.');
    }
  };

  const displayed = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'ALL' ? appointments.length : appointments.filter(a => a.status === f).length;
    return acc;
  }, {});

  const pending = appointments.filter(a => a.status === 'PENDING').length;

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Appointment Requests</h1>
          <p>Manage student appointment requests</p>
        </div>
        {pending > 0 && (
          <span className="badge badge-pending" style={{ fontSize: 14, padding: '6px 14px' }}>
            {pending} pending request{pending > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid mb-24">
        {[
          { label: 'Total',     value: counts.ALL,       icon: '📋' },
          { label: 'Pending',   value: counts.PENDING,   icon: '⏳' },
          { label: 'Confirmed', value: counts.BOOKED,    icon: '✅' },
          { label: 'Cancelled', value: counts.CANCELLED, icon: '❌' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {error   && <div className="alert alert-error"   onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      <div className="tabs">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {counts[f] > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No {filter === 'ALL' ? '' : filter.toLowerCase()} appointments</h3>
          <p>Appointments will appear here once students book with you.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {displayed.map(appt => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              role="FACULTY"
              onAccept={handleAccept}
              onReject={handleReject}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </>
  );
}
