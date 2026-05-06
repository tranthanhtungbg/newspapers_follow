import axios, { AxiosInstance } from 'axios';
import { getAccessToken, refreshTokens, clearTokens } from './auth';

// ─── Axios instance ───────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — inject access token ─────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — auto-refresh on 401 ───────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { accessToken } = await refreshTokens();
        refreshQueue.forEach((cb) => cb(accessToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        clearTokens();
        if (typeof window !== 'undefined') {
          const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
          if (!isAuthPage) {
            window.location.href = '/login';
          }
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// ─── Typed API namespaces ─────────────────────────────────────

export const authApi = {
  login: (dto: { email: string; password: string }) =>
    api.post('/auth/login', dto),
  register: (dto: { email: string; password: string; name: string }) =>
    api.post('/auth/register', dto),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateSettings: (data: Record<string, unknown>) =>
    api.patch('/user/settings', data),
};

export const readerApi = {
  fetch: (url: string) => api.post('/reader/fetch', { url }),
  summarize: (articleId: string, targetLang: string, level: string) =>
    api.post('/reader/summarize', { articleId, targetLang, level }),
};

export const translationApi = {
  contextual: (dto: {
    text: string;
    sourceLang: string;
    targetLang: string;
    contextParagraph: string;
    articleId?: string;
  }) => api.post('/translation/contextual', dto),
  fullPage: (articleId: string, targetLang: string) =>
    api.post('/translation/full-page', { articleId, targetLang }),
};

export const vocabularyApi = {
  list: (params: Record<string, unknown>) => api.get('/vocabulary', { params }),
  create: (data: Record<string, unknown>) => api.post('/vocabulary', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/vocabulary/${id}`, data),
  delete: (id: string) => api.delete(`/vocabulary/${id}`),
  bulkDelete: (ids: string[]) => api.post('/vocabulary/bulk-delete', { ids }),
  exportCsv: () => api.get('/vocabulary/export', { responseType: 'blob' }),
  pin: (id: string, categoryId?: string) => api.post(`/vocabulary/${id}/pin`, { categoryId }),
  unpin: (id: string) => api.delete(`/vocabulary/${id}/pin`),
  getPins: () => api.get('/vocabulary/pins'),
  reorderPins: (orderedIds: string[]) =>
    api.patch('/vocabulary/pins/reorder', { orderedIds }),
  getCategories: () => api.get('/vocabulary/categories'),
  createCategory: (name: string, color?: string) => api.post('/vocabulary/categories', { name, color }),
  updateCategory: (id: string, name?: string, color?: string) => api.patch(`/vocabulary/categories/${id}`, { name, color }),
  deleteCategory: (id: string) => api.delete(`/vocabulary/categories/${id}`),
};

export const flashcardApi = {
  getDueToday: (cram = false, date?: string) => 
    api.get('/flashcards/due-today', { params: { cram, ...(date && { date }) } }),
  review: (id: string, score: number, durationMs: number) =>
    api.post(`/flashcards/${id}/review`, { score, durationMs }),
  getStats: () => api.get('/flashcards/stats'),
  startSession: () => api.post('/flashcards/session/start'),
  endSession: (data: Record<string, unknown>) =>
    api.post('/flashcards/session/end', data),
};

export const ttsApi = {
  generate: (text: string, lang: string, voice?: string) =>
    api.post('/tts/generate', { text, lang, voice }),
};

export const libraryApi = {
  list: (params: Record<string, unknown>) => api.get('/library', { params }),
  create: (data: Record<string, unknown>) => api.post('/library', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/library/${id}`, data),
  delete: (id: string) => api.delete(`/library/${id}`),
};
