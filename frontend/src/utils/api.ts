import axios from 'axios';
import type {
  SafeUser,
  AnalysisResult,
  Hospital,
  City,
  UploadResponse,
  UploadIntentResponse,
  AnalysisSubmitResponse,
  AnalysisStatusResponse,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import { API_BASE_URL } from './env';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  withCredentials: true,
});

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;
let isRefreshing = false;
let refreshQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

function processQueue(error?: unknown) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
}

async function fetchCsrfToken() {
  const response = await api.get<ApiResponse<{ csrfToken: string }>>('/auth/csrf');
  const nextToken = response.data.data?.csrfToken;
  if (!nextToken) {
    throw new Error('CSRF token was not returned by the server.');
  }
  csrfToken = nextToken;
  return nextToken;
}

export async function ensureCsrfToken(force = false) {
  if (!force && csrfToken) return csrfToken;
  if (!force && csrfPromise) return csrfPromise;

  csrfPromise = fetchCsrfToken().finally(() => {
    csrfPromise = null;
  });

  return csrfPromise;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();
  const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  if (needsCsrf) {
    const token = await ensureCsrfToken();
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    const status = error.response?.status;
    const url = String(original?.url || '');
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/csrf', '/auth/me', '/auth/bootstrap'].some((segment) => url.includes(segment));

    if (status === 403 && error.response?.data?.message?.includes('CSRF')) {
      csrfToken = null;
    }

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const token = await ensureCsrfToken(status === 403);
        await api.post<ApiResponse<{ user: SafeUser }>>('/auth/refresh', undefined, {
          headers: { 'X-CSRF-Token': token },
        });
        processQueue();
        return api(original);
      } catch (refreshError: unknown) {
        processQueue(refreshError);
        csrfToken = null;
        if (!axios.isAxiosError(refreshError) || refreshError.response?.status !== 401) {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptedDisclaimer: boolean;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    smokingHistory?: 'never' | 'former' | 'current';
    medicalHistory?: string;
    role?: 'user' | 'admin';
  }) => api.post<ApiResponse<{
    user: SafeUser;
    verification?: { required: boolean; channel: 'email' | 'phone'; devCode?: string };
  }>>('/auth/register', data),

  login: (data: { email?: string; identifier?: string; password: string; rememberMe?: boolean }) =>
    api.post<ApiResponse<{ user: SafeUser }>>('/auth/login', data),

  logout: () => api.post<ApiResponse>('/auth/logout'),

  refresh: () => api.post<ApiResponse<{ user: SafeUser }>>('/auth/refresh'),

  bootstrap: () => api.get<ApiResponse<SafeUser | null>>('/auth/bootstrap'),

  me: () => api.get<ApiResponse<SafeUser>>('/auth/me'),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    smokingHistory?: 'never' | 'former' | 'current';
    medicalHistory?: string;
    acceptedDisclaimer?: boolean;
    onboardingCompleted?: boolean;
    currentPassword?: string;
    newPassword?: string;
  }) => api.put<ApiResponse<SafeUser>>('/auth/profile', data),

  verifyContact: (code: string) =>
    api.post<ApiResponse<SafeUser>>('/auth/verify-contact', { code }),

  sendPhoneOtp: () =>
    api.post<ApiResponse<{ devCode?: string }>>('/auth/send-phone-otp'),

  verifyPhoneOtp: (otp: string) =>
    api.post<ApiResponse<SafeUser>>('/auth/verify-phone-otp', { otp }),

  resendVerification: (channel?: 'email' | 'phone') =>
    api.post<ApiResponse<{ channel: 'email' | 'phone'; devCode?: string }>>('/auth/resend-verification', { channel }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post<ApiResponse<SafeUser>>('/auth/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const analysisApi = {
  validate: (file: File, imageType: 'xray' | 'ct') => {
    const form = new FormData();
    form.append('image', file);
    form.append('imageType', imageType);
    return api.post<ApiResponse<{
      valid: boolean;
      classification: 'Chest_XRay' | 'Chest_CT' | 'Other_Medical' | 'Non_Medical';
      confidence: number | null;
      detectedImageType: 'xray' | 'ct' | null;
      message: string | null;
    }>>('/analysis/validate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  upload: (file: File, imageType: 'xray' | 'ct', sessionId?: string) => {
    const form = new FormData();
    form.append('image', file);
    form.append('imageType', imageType);
    if (sessionId) form.append('sessionId', sessionId);
    return api.post<ApiResponse<UploadResponse>>('/analysis/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createUploadIntent: (data: {
    originalFilename: string;
    imageType: 'xray' | 'ct';
    mimeType: string;
    fileSizeBytes: number;
    sessionId?: string;
  }) => api.post<ApiResponse<UploadIntentResponse>>('/analysis/upload-intent', data),
  uploadToSignedUrl: (signedUrl: string, file: File, mimeType: string) =>
    axios.put(signedUrl, file, {
      headers: {
        'Content-Type': mimeType,
        'x-upsert': 'false',
      },
    }),
  submit: (analysisId: number) =>
    api.post<ApiResponse<AnalysisSubmitResponse>>(`/analysis/${analysisId}/submit`),
  getStatus: (analysisId: number) =>
    api.get<ApiResponse<AnalysisStatusResponse>>(`/analysis/${analysisId}/status`),
  getHistory: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<AnalysisResult>>('/analysis/history', { params: { page, limit } }),
  getById: (id: number) =>
    api.get<ApiResponse<AnalysisResult>>(`/analysis/${id}`),
  delete: (id: number) =>
    api.delete<ApiResponse>(`/analysis/${id}`),
};

export const hospitalsApi = {
  getAll: (params?: { city?: string; specialization?: string; search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Hospital>>('/hospitals', { params }),
  getCities: () =>
    api.get<ApiResponse<City[]>>('/hospitals/cities'),
  getById: (id: number) =>
    api.get<ApiResponse<Hospital>>(`/hospitals/${id}`),
};

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

export const contactApi = {
  send: (data: { name: string; email: string; phone?: string; message: string }) =>
    api.post<ApiResponse>('/contact', data),
};

export default api;
