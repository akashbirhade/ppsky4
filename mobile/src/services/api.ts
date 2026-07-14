import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants';

// ─── API CLIENT ───────────────────────────────────────────────────────────────

// Event listeners for auth state changes
type AuthExpiredListener = () => void;
const authExpiredListeners: Set<AuthExpiredListener> = new Set();

export const onAuthExpired = (listener: AuthExpiredListener) => {
  authExpiredListeners.add(listener);
  return () => { authExpiredListeners.delete(listener); };
};

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use(this.attachToken);
    this.client.interceptors.response.use(
      (response) => response,
      this.handleError,
    );
  }

  private attachToken = async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  private handleError = async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshToken();
      }

      try {
        const newToken = await this.refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return this.client(originalRequest);
      } catch {
        await this.clearTokens();
        // Notify listeners that auth has expired
        authExpiredListeners.forEach((fn) => fn());
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    }

    return Promise.reject(error);
  };

  private async refreshToken(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    await SecureStore.setItemAsync('accessToken', data.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
    return data.data.accessToken;
  }

  private async clearTokens() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  // ─── PUBLIC METHODS ─────────────────────────────────────────────────────────

  get<T = any>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  post<T = any>(url: string, data?: any) {
    return this.client.post<T>(url, data);
  }

  put<T = any>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  delete<T = any>(url: string) {
    return this.client.delete<T>(url);
  }

  upload<T = any>(url: string, formData: FormData) {
    return this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const api = new ApiClient();
