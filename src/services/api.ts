// src/services/api.ts

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { cookies, AUTH_COOKIES } from '../utils/cookies';
import type { AuthResponse } from '../types/authtypes/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


// Criar instância do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de Request - Adiciona token automaticamente
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = cookies.get(AUTH_COOKIES.ACCESS_TOKEN);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response - Trata erros e faz refresh do token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Se erro 401 e não é retry e não é a rota de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Se já está fazendo refresh, adiciona na fila
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject: (err: Error) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = cookies.get(AUTH_COOKIES.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Chama o endpoint de refresh
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/user/auth/refresh`,
          { refreshToken }
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        // Salva novos tokens
        cookies.set(AUTH_COOKIES.ACCESS_TOKEN, token, { expires: 1 }); // 1 dia
        cookies.set(AUTH_COOKIES.REFRESH_TOKEN, newRefreshToken, { expires: 7 }); // 7 dias

        // Atualiza header da requisição original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        processQueue(null, token);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        
        // Limpa tokens e redireciona para login
        cookies.remove(AUTH_COOKIES.ACCESS_TOKEN);
        cookies.remove(AUTH_COOKIES.REFRESH_TOKEN);
        cookies.remove(AUTH_COOKIES.USER_DATA);
        
        // Dispara evento customizado para o AuthContext capturar
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;