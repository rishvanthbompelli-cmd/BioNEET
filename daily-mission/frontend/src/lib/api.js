import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken || original.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefresh } = res.data;
        useAuthStore.getState().setTokens(token, newRefresh);
        processQueue(null, token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export const healthApi = {
  check: () => axios.get(`${API_URL}/api/health`),
};

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard/dashboard'),
  getAnalytics: () => api.get('/dashboard/analytics'),
};

export const notesApi = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  toggleFavorite: (id) => api.patch(`/notes/${id}/favorite`),
};

export const mcqApi = {
  getAll: (params) => api.get('/mcqs', { params }),
  submitAttempt: (id, data) => api.post(`/mcqs/${id}/attempt`, data),
  getLeaderboard: () => api.get('/mcqs/leaderboard'),
};

export const aiApi = {
  createStudyPlan: (data) => api.post('/ai/study-plan', data),
  getStudyPlans: () => api.get('/ai/study-plans'),
  generateQuiz: (data) => api.post('/ai/quiz', data),
  getQuizzes: () => api.get('/ai/quizzes'),
  generatePlanner: (data) => api.post('/ai/planner/generate', data),
};

export const chatApi = {
  send: (data) => api.post('/chat', data),
  getHistory: (sessionId) => api.get('/chat/history', { params: { sessionId } }),
};

export const papersApi = {
  getAll: (params) => api.get('/papers', { params }),
  getFilters: () => api.get('/papers/filters'),
};

export const mockTestApi = {
  getAll: (params) => api.get('/mock-tests', { params }),
  getById: (id) => api.get(`/mock-tests/${id}`),
  submit: (id, data) => api.post(`/mock-tests/${id}/submit`, data),
};

export const revisionApi = {
  getAll: (params) => api.get('/revisions', { params }),
  getSubjects: (params) => api.get('/revisions/subjects', { params }),
  update: (chapterId, data) => api.put(`/revisions/${chapterId}`, data),
};

export const contentApi = {
  getFormulas: (params) => api.get('/content/formulas', { params }),
  getDiagrams: (params) => api.get('/content/diagrams', { params }),
  getHandbooks: () => api.get('/content/handbooks'),
  getChapters: (params) => api.get('/content/chapters', { params }),
  getSyllabusSummary: () => api.get('/content/syllabus-summary'),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (data) => api.post('/auth/logout', data),
  refresh: (data) => api.post('/auth/refresh', data),
  googleLogin: (data) => api.post('/auth/google', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createNote: (data) => api.post('/admin/notes', data),
  createPaper: (data) => api.post('/admin/papers', data),
  getAnnouncements: () => api.get('/admin/announcements'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteNote: (id) => api.delete(`/admin/notes/${id}`),
  deletePaper: (id) => api.delete(`/admin/papers/${id}`),
  deleteMockTest: (id) => api.delete(`/admin/mocktests/${id}`),
  deleteFormula: (id) => api.delete(`/admin/formulas/${id}`),
  deleteDiagram: (id) => api.delete(`/admin/diagrams/${id}`),
  deleteHandbook: (id) => api.delete(`/admin/handbooks/${id}`),
  purgeData: () => api.delete('/admin/purge'),
  // Mocks for new resource forms
  createMockTest: (data) => api.post('/admin/mock-tests', data),
  createFormula: (data) => api.post('/admin/formulas', data),
  createDiagram: (data) => api.post('/admin/diagrams', data),
  createHandbook: (data) => api.post('/admin/handbooks', data),
};

export const documentApi = {
  getAll: (params) => api.get('/documents', { params }),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
};
