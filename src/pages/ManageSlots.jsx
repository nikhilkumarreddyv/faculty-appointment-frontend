import { useState, useEffect } from 'react';
import { slotApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(t) {
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

// Get today's date string for the date input min
const todayStr = new Date().toISOString().split('T')[0];

export default function ManageSlots() {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    slotDate: '', startTime: '09:00', endTime: '09:30', notes: '', maxStudents: 1,
  });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const load = () => {
    setLoading(true);
    slotApi.getAll(user.id)
      .then(res => setSlots(res.data))
      .catch(() => setError('Failed to load slots.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user.id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await slotApi.create(form);
      setSuccess('Slot created successfully!');
      setShowForm(false);
      setForm({ slotDate: '', startTime: '09:00', endTime: '09:30', notes: '', maxStudents: 1 });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot? This cannot be undone.')) return;
    try {
      await slotApi.delete(id);
      setSuccess('Slot deleted.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete slot.');
    }
  };

  return (
    <>
      <div className="page-header flex-between">
        <div>
          <h1>Manage Slots</h1>
          <p>Create and manage your available time slots</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Slot'}
        </button>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create form */}
      {showForm && (
        <div className="card mb-24">
          <h3 style={{ marginBottom: 18, fontSize: 16, fontWeight: 600 }}>New Time Slot</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" name="slotDate" className="form-input"
                  value={form.slotDate} onChange={handleChange}
                  min={todayStr} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Start Time</label>
                <input type="time" name="startTime" className="form-input"
                  value={form.startTime} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">End Time</label>
                <input type="time" name="endTime" className="form-input"
                  value={form.endTime} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group mt-16">
              <label className="form-label">Notes (optional)</label>
              <input type="text" name="notes" className="form-input"
                placeholder="e.g. Project discussions, Lab guidance…"
                value={form.notes} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create Slot'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots table */}
      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      ) : slots.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📅</div>
          <h3>No slots created yet</h3>
          <p>Click "Add Slot" to make yourself available for appointments.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td>{formatDate(slot.slotDate)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </td>
                    <td>{slot.notes || <span className="text-muted">—</span>}</td>
                    <td>
                      <span className={`badge ${slot.isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
                        {slot.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </td>
                    <td>
                      {slot.isAvailable && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(slot.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
