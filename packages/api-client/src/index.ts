import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Browser / Vite env
    return (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:3000';
  }
  // Node env
  return process.env.API_URL || 'http://localhost:3000';
};

const API_BASE_URL = getBaseUrl();
const TOKEN_KEY = 'etaxwala_token';
const REFRESH_TOKEN_KEY = 'etaxwala_refresh_token';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefresh: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefresh: (): void => localStorage.removeItem(REFRESH_TOKEN_KEY),
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─── Create base Axios instance ───────────────────────────────────────────────
function createApiClient(config?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...config,
  });

  // ── Request interceptor: attach JWT token ──────────────────────────────────
  instance.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const token = tokenStorage.get();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error: unknown) => Promise.reject(error)
  );

  // ── Response interceptor: handle 401, error normalization ─────────────────
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
      const axiosError = error as {
        config?: InternalAxiosRequestConfig & { _retry?: boolean };
        response?: { status: number; data?: { error?: { message: string }; message?: string } };
        message?: string;
      };
      const originalRequest = axiosError.config;

      // Handle 401 — token expired → attempt refresh
      if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = tokenStorage.getRefresh();

        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, { refreshToken });
            tokenStorage.set(data.token as string);
            if (data.refreshToken) tokenStorage.setRefresh(data.refreshToken as string);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.token as string}`;
            }
            return instance(originalRequest);
          } catch {
            tokenStorage.clear();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
          }
        } else {
          tokenStorage.clear();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
        }
      }

      // Normalize error shape
      const normalizedError = {
        message:
          axiosError.response?.data?.error?.message ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'An unexpected error occurred',
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      };

      return Promise.reject(normalizedError);
    }
  );

  return instance;
}

// ─── Singleton instances ──────────────────────────────────────────────────────
/** Main authenticated API client (attaches JWT automatically) */
export const apiClient = createApiClient();

/** Flutter-compatible API client (uses /api/* prefix) */
export const flutterApiClient = createApiClient({ baseURL: `${API_BASE_URL}/api` });

// ─── Typed API helpers ────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { message: string; code?: string };
}

export interface ApiListResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** Unwraps the data field from an ApiResponse */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  return response.data.data as T;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, body);
  return response.data.data as T;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, body);
  return response.data.data as T;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  return response.data.data as T;
}

export default apiClient;
