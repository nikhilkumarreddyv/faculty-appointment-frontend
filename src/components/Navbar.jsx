import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">AppointEdu</span>
        </Link>

        {user && (
          <div className="navbar-links">
            {/* Student links */}
            {user.role === 'STUDENT' && (
              <>
                <Link to="/student/dashboard"    className={`nav-link ${isActive('/student/dashboard')}`}>Faculty</Link>
                <Link to="/student/appointments" className={`nav-link ${isActive('/student/appointments')}`}>My Appointments</Link>
              </>
            )}

            {/* Faculty links */}
            {user.role === 'FACULTY' && (
              <>
                <Link to="/faculty/dashboard" className={`nav-link ${isActive('/faculty/dashboard')}`}>Requests</Link>
                <Link to="/faculty/slots"     className={`nav-link ${isActive('/faculty/slots')}`}>My Slots</Link>
                <Link to="/faculty/schedule"  className={`nav-link ${isActive('/faculty/schedule')}`}>Schedule</Link>
              </>
            )}

            {/* Admin links */}
            {user.role === 'ADMIN' && (
              <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>Dashboard</Link>
            )}
          </div>
        )}

        <div className="navbar-right">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-8">
              <Link to="/login"    className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
