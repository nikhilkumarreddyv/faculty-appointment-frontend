import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function StudentDashboard() {
  const [faculty, setFaculty]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    facultyApi.getAll()
      .then(res => setFaculty(res.data))
      .catch(() => setError('Failed to load faculty list.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1>Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Browse faculty members and book an appointment</p>
      </div>

      <div className="dashboard-search">
        <input
          type="text"
          className="form-input"
          placeholder="🔍  Search by name or department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👨‍🏫</div>
          <h3>No faculty found</h3>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(f => (
            <div key={f.id} className="faculty-card">
              <div className="faculty-avatar">{f.name.charAt(0)}</div>
              <div className="faculty-info">
                <h3 className="faculty-name">{f.name}</h3>
                <p className="faculty-dept">{f.department || 'Department N/A'}</p>
                <p className="faculty-email text-muted text-sm">{f.email}</p>
              </div>
              <div className="faculty-slots-badge">
                <span className={`badge ${f.availableSlots > 0 ? 'badge-available' : 'badge-unavailable'}`}>
                  {f.availableSlots > 0 ? `${f.availableSlots} slots open` : 'No slots'}
                </span>
              </div>
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate(`/student/book/${f.id}`)}
                disabled={f.availableSlots === 0}
              >
                {f.availableSlots > 0 ? 'Book Appointment' : 'No Availability'}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
