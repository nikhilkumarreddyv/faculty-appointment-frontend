import { useState, useEffect } from 'react';
import { appointmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import './Dashboard.css';

const FILTERS = ['ALL', 'PENDING', 'BOOKED', 'CANCELLED', 'REJECTED', 'COMPLETED'];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [filter,   setFilter]   = useState('ALL');
  const { user } = useAuth();

  const load = () => {
    setLoading(true);
    appointmentApi.getForStudent(user.id)
      .then(res => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user.id]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentApi.cancel(id);
      setSuccess('Appointment cancelled successfully.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not cancel appointment.');
    }
  };

  const displayed = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'ALL' ? appointments.length : appointments.filter(a => a.status === f).length;
    return acc;
  }, {});

  return (
    <>
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>Track and manage your booked appointments</p>
      </div>

      {error   && <div className="alert alert-error"   onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      {/* Filter tabs */}
      <div className="tabs">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {counts[f] > 0 && <span style={{ marginLeft: 6, background: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{counts[f]}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No appointments found</h3>
          <p>{filter === 'ALL' ? 'Book an appointment with a faculty member to get started.' : `No ${filter.toLowerCase()} appointments.`}</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {displayed.map(appt => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              role="STUDENT"
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </>
  );
}
