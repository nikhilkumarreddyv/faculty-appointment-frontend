import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import BookAppointment  from './pages/BookAppointment';
import MyAppointments   from './pages/MyAppointments';
import FacultySchedule  from './pages/FacultySchedule';
import ManageSlots      from './pages/ManageSlots';

// Components
import Navbar from './components/Navbar';

// Route guard: redirects unauthenticated users to /login
function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Redirect logged-in users away from auth pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// Home redirect based on role
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  if (user.role === 'ADMIN')   return <Navigate to="/admin/dashboard"   replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Home redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Student routes */}
            <Route path="/student/dashboard"
              element={<PrivateRoute allowedRoles={['STUDENT']}><StudentDashboard /></PrivateRoute>} />
            <Route path="/student/book/:facultyId"
              element={<PrivateRoute allowedRoles={['STUDENT']}><BookAppointment /></PrivateRoute>} />
            <Route path="/student/appointments"
              element={<PrivateRoute allowedRoles={['STUDENT']}><MyAppointments /></PrivateRoute>} />

            {/* Faculty routes */}
            <Route path="/faculty/dashboard"
              element={<PrivateRoute allowedRoles={['FACULTY']}><FacultyDashboard /></PrivateRoute>} />
            <Route path="/faculty/schedule"
              element={<PrivateRoute allowedRoles={['FACULTY']}><FacultySchedule /></PrivateRoute>} />
            <Route path="/faculty/slots"
              element={<PrivateRoute allowedRoles={['FACULTY']}><ManageSlots /></PrivateRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard"
              element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
