import axios from 'axios';

// Create a configured axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://faculty-appointment-backend.onrender.com'
    : '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor: attach token from localStorage if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 by redirecting to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// ---- Auth API ----
export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
};

// ---- Faculty API ----
export const facultyApi = {
  getAll: () => axiosInstance.get('/faculty'),
  getById: (id) => axiosInstance.get(`/faculty/${id}`),
};

// ---- Slots API ----
export const slotApi = {
  getAvailable: (facultyId) => axiosInstance.get(`/slots/${facultyId}`),
  getAll: (facultyId) => axiosInstance.get(`/slots/${facultyId}/all`),
  create: (data) => axiosInstance.post('/slots', data),
  delete: (id) => axiosInstance.delete(`/slots/${id}`),
};

// ---- Appointments API ----
export const appointmentApi = {
  book: (data) => axiosInstance.post('/appointments/book', data),
  getForStudent: (studentId) => axiosInstance.get(`/appointments/student/${studentId}`),
  getForFaculty: (facultyId) => axiosInstance.get(`/appointments/faculty/${facultyId}`),
  updateStatus: (id, data) => axiosInstance.put(`/appointments/${id}/status`, data),
  cancel: (id) => axiosInstance.delete(`/appointments/${id}`),
  getAll: () => axiosInstance.get('/appointments/all'),
};

// ---- Admin API ----
export const adminApi = {
  getStudents: () => axiosInstance.get('/admin/students'),
  getFaculty: () => axiosInstance.get('/admin/faculty'),
  getAppointments: () => axiosInstance.get('/admin/appointments'),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
};
