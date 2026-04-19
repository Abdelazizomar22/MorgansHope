// ─────────────────────────────────────────────────────────────
//  Morgan's Hope — Axios API Client  (Professional Edition)
// ─────────────────────────────────────────────────────────────
import axios, { AxiosRequestConfig } from 'axios';
import type { SafeUser, AnalysisResult, Hospital, City, UploadResponse, PaginatedResponse, ApiResponse } from '../types';
import { API_BASE_URL } from './env';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  withCredentials: true, // send HttpOnly refresh cookie on every request
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medtech_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Silent refresh logic ──────────────────────────────────────────────────────
let isRefreshing = false;
// Queue of resolve/reject pairs for requests that arrived while a refresh was in flight
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  refreshQueue = [];
}

// ── Response interceptor: handle 401 → silent refresh → retry ────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh for 401s NOT coming from auth endpoints themselves
    const isAuthEndpoint = original.url?.includes('/auth/login')
      || original.url?.includes('/auth/register')
      || original.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers = original.headers || {};
          (original.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<ApiResponse<{ token: string; user: SafeUser }>>('/auth/refresh');
        const newToken = data.data!.token;
        localStorage.setItem('medtech_token', newToken);
        processQueue(null, newToken);

        original.headers = original.headers || {};
        (original.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — truly expired, log out cleanly
        localStorage.removeItem('medtech_token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    firstName: string; lastName: string; email: string;
    password: string; confirmPassword: string;
    acceptedDisclaimer: boolean;
    phone?: string; age?: number;
    gender?: 'male' | 'female' | 'other';
    smokingHistory?: 'never' | 'former' | 'current';
    medicalHistory?: string;
  }) => api.post<ApiResponse<{ user: SafeUser; token: string }>>('/auth/register', data),

  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<ApiResponse<{ user: SafeUser; token: string }>>('/auth/login', data),

  logout: () => api.post<ApiResponse>('/auth/logout'),

  refresh: () => api.post<ApiResponse<{ token: string; user: SafeUser }>>('/auth/refresh'),

  me: () => api.get<ApiResponse<SafeUser>>('/auth/me'),

  updateProfile: (data: {
    firstName?: string; lastName?: string; phone?: string;
    age?: number; gender?: 'male' | 'female' | 'other';
    smokingHistory?: 'never' | 'former' | 'current';
    medicalHistory?: string;
    currentPassword?: string; newPassword?: string;
  }) => api.put<ApiResponse<SafeUser>>('/auth/profile', data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post<ApiResponse<SafeUser>>('/auth/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Analysis ────────────────────────────────────────────────────────────────
export const analysisApi = {
  upload: (file: File, imageType: 'xray' | 'ct', sessionId?: string) => {
    const form = new FormData();
    form.append('image', file);
    form.append('imageType', imageType);
    if (sessionId) form.append('sessionId', sessionId);
    return api.post<ApiResponse<UploadResponse>>('/analysis/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getHistory: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<AnalysisResult>>('/analysis/history', { params: { page, limit } }),
  getById: (id: number) =>
    api.get<ApiResponse<AnalysisResult>>(`/analysis/${id}`),
  delete: (id: number) =>
    api.delete<ApiResponse>(`/analysis/${id}`),
};

// ── Hospitals ───────────────────────────────────────────────────────────────
export const hospitalsApi = {
  getAll: (params?: { city?: string; specialization?: string; search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Hospital>>('/hospitals', { params }),
  getCities: () =>
    api.get<ApiResponse<City[]>>('/hospitals/cities'),
  getById: (id: number) =>
    api.get<ApiResponse<Hospital>>(`/hospitals/${id}`),
};

// ── Health ──────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () =>
    api.get<ApiResponse<{ server: string; ai: { ctService: string; xrayService: string }; timestamp: string }>>('/health'),
};

export const chatApi = {
  send: (data: { message: string; history: Array<{ role: 'user' | 'assistant'; content: string }> }) =>
    api.post<ApiResponse<{ reply: string; usedLatestAnalysis: boolean; memoryTurnsUsed: number }>>('/chat', data),

  getHistory: () =>
    api.get<ApiResponse<Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }>>>('/chat/history'),
};

export default api;
