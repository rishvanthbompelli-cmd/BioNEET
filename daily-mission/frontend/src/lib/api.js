import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard/dashboard'),
  getAnalytics: () => api.get('/dashboard/analytics'),
};

export const notesApi = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
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
};

export const mockTestApi = {
  getAll: (params) => api.get('/mock-tests', { params }),
  getById: (id) => api.get(`/mock-tests/${id}`),
  submit: (id, data) => api.post(`/mock-tests/${id}/submit`, data),
};

export const revisionApi = {
  getAll: () => api.get('/revisions'),
  update: (chapterId, data) => api.put(`/revisions/${chapterId}`, data),
};

export const contentApi = {
  getFormulas: (params) => api.get('/content/formulas', { params }),
  getDiagrams: (params) => api.get('/content/diagrams', { params }),
  getHandbooks: () => api.get('/content/handbooks'),
  getChapters: () => api.get('/content/chapters'),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getAnnouncements: () => api.get('/admin/announcements'),
};
