import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const api = axios.create({ baseURL: API_BASE });

export function extractError(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong. Is the backend running?';
}

export const StudentsApi = {
  list: () => api.get('/api/students').then((r) => r.data),
  get: (prn) => api.get(`/api/students/${prn}`).then((r) => r.data),
};

export const SubjectsApi = {
  list: (params = {}) => api.get('/api/subjects', { params }).then((r) => r.data),
};

export const MarksApi = {
  forSubject: (year, semester, subjectCode) =>
    api.get('/api/marks', { params: { year, semester, subjectCode } }).then((r) => r.data),
};

export const GradecardApi = {
  get: (prn, name, year, semester) =>
    api.get('/api/gradecard', { params: { prn, name, year, semester } }).then((r) => r.data),
  pdfUrl: (prn, name, year, semester) =>
    `${API_BASE}/api/gradecard/pdf?prn=${encodeURIComponent(prn)}&name=${encodeURIComponent(name)}&year=${encodeURIComponent(year)}&semester=${encodeURIComponent(semester)}`,
};

export const AdminMarksApi = {
  search: (params = {}) => api.get('/api/admin/marks', { params }).then((r) => r.data),
  get: (id) => api.get(`/api/admin/marks/${id}`).then((r) => r.data),
  create: (body) => api.post('/api/admin/marks', body).then((r) => r.data),
  update: (id, body) => api.put(`/api/admin/marks/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/admin/marks/${id}`),
};
