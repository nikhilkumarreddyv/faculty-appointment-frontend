import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyApi, slotApi, appointmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

export default function BookAppointment() {
  const { facultyId } = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [faculty,  setFaculty]  = useState(null);
  const [slots,    setSlots]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [purpose,  setPurpose]  = useState('');
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [booking,  setBooking]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  useEffect(() => {
    Promise.all([
      facultyApi.getById(facultyId),
      slotApi.getAvailable(facultyId),
    ]).then(([fRes, sRes]) => {
      setFaculty(fRes.data);
      setSlots(sRes.data);
    }).catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selected) { setError('Please select a time slot.'); return; }
    setBooking(true); setError(''); setSuccess('');
    try {
      await appointmentApi.book({
        slotId: selected.id,
        facultyId: parseInt(facultyId),
        purpose,
        studentNotes: notes,
      });
      setSuccess('✅ Appointment booked successfully! Awaiting faculty confirmation.');
      setSelected(null);
      setPurpose(''); setNotes('');
      // Refresh slots
      const sRes = await slotApi.getAvailable(facultyId);
      setSlots(sRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Book Appointment</h1>
          <p>Select an available slot with {faculty?.name}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {faculty && (
        <div className="card mb-24" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div className="faculty-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
            {faculty.name?.charAt(0)}
          </div>
          <div>
            <div className="font-semibold">{faculty.name}</div>
            <div className="text-muted text-sm">{faculty.department}</div>
            <div className="text-muted text-sm">{faculty.email}</div>
          </div>
        </div>
      )}

      {error   && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">
          {success}
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => navigate('/student/appointments')}>View My Appointments</button>
        </div>
      )}

      {slots.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📅</div>
          <h3>No available slots</h3>
          <p>This faculty member has no open slots at the moment.</p>
        </div>
      ) : (
        <form onSubmit={handleBook}>
          <h2 style={{ marginBottom: 14, fontSize: 16, fontWeight: 600 }}>
            Available Slots ({slots.length})
          </h2>

          <div className="slot-picker">
            {slots.map(slot => (
              <div
                key={slot.id}
                className={`slot-item ${selected?.id === slot.id ? 'selected' : ''}`}
                onClick={() => setSelected(slot)}
              >
                <div className="slot-date">{formatDate(slot.slotDate)}</div>
                <div className="slot-time">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</div>
                {slot.notes && <div className="slot-note">{slot.notes}</div>}
              </div>
            ))}
          </div>

          {selected && (
            <div className="card mt-16">
              <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>
                Selected: {formatDate(selected.slotDate)} · {formatTime(selected.startTime)} – {formatTime(selected.endTime)}
              </h3>

              <div className="form-group">
                <label className="form-label">Purpose of Appointment <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Project guidance, Doubt clearing…"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Any additional context you'd like to share…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={booking}>
                {booking ? 'Booking…' : '📅 Confirm Booking'}
              </button>
            </div>
          )}
        </form>
      )}
    </>
  );
}
