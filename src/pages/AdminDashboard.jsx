import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import './Dashboard.css';

const TABS = ['Overview', 'Students', 'Faculty', 'Appointments'];

export default function AdminDashboard() {
  const [tab,          setTab]         = useState('Overview');
  const [students,     setStudents]    = useState([]);
  const [faculty,      setFaculty]     = useState([]);
  const [appointments, setAppointments]= useState([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState('');
  const [success,      setSuccess]     = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getStudents(),
      adminApi.getFaculty(),
      adminApi.getAppointments(),
    ]).then(([sRes, fRes, aRes]) => {
      setStudents(sRes.data);
      setFaculty(fRes.data);
      setAppointments(aRes.data);
    }).catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(id);
      setSuccess(`User ${name} deleted.`);
      setStudents(s => s.filter(u => u.id !== id));
      setFaculty(f => f.filter(u => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete user.');
    }
  };

  const statusCounts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats */}
      <div className="stats-grid mb-24">
        {[
          { label: 'Students',     value: students.length,     icon: '👨‍🎓' },
          { label: 'Faculty',      value: faculty.length,      icon: '👨‍🏫' },
          { label: 'Appointments', value: appointments.length, icon: '📋' },
          { label: 'Pending',      value: statusCounts.PENDING || 0, icon: '⏳' },
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

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Appointment Status</h3>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Recent Activity</h3>
            {appointments.slice(0, 6).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span>{a.studentName} → {a.facultyName}</span>
                <span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students */}
      {tab === 'Students' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Department</th><th>Phone</th><th>Action</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.department || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(s.id, s.name)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Faculty */}
      {tab === 'Faculty' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Department</th><th>Phone</th><th>Action</th></tr>
              </thead>
              <tbody>
                {faculty.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.name}</td>
                    <td>{f.email}</td>
                    <td>{f.department || '—'}</td>
                    <td>{f.phone || '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(f.id, f.name)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Appointments */}
      {tab === 'Appointments' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Faculty</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th></tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.studentName}</td>
                    <td>{a.facultyName}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{a.slotDate}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{a.startTime} – {a.endTime}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.purpose || '—'}
                    </td>
                    <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
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
