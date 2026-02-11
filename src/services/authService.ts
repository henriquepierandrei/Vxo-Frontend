// src/services/authService.ts

import api from './api';
import { cookies, AUTH_COOKIES } from '../utils/cookies';
import type{ 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  DefaultResponse, 
  User 
} from '../types/authtypes/auth.types';

class AuthService {
  
  // ==================== LOGIN ====================
  async login(email: string, password: string, rememberMe: boolean = false): Promise<User | null> {
    const loginData: LoginRequest = {
      email,
      hashPassword: password,
    };

    const response = await api.post<AuthResponse>('/user/auth/login', loginData);
    const { token, refreshToken } = response.data;

    const tokenExpires = rememberMe ? 7 : 1;
    const refreshExpires = rememberMe ? 30 : 7;

    cookies.set(AUTH_COOKIES.ACCESS_TOKEN, token, { expires: tokenExpires });
    cookies.set(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, { expires: refreshExpires });

    const user = this.decodeToken(token);
    
    if (user) {
      cookies.set(AUTH_COOKIES.USER_DATA, JSON.stringify(user), { expires: tokenExpires });
    }

    return user;
  }

  // ==================== REGISTER ====================
  async register(
    name: string, 
    email: string, 
    url: string, 
    password: string
  ): Promise<DefaultResponse> {
    const registerData: RegisterRequest = {
      name,
      email,
      url,
      hashPassword: password,
    };

    const response = await api.post<DefaultResponse>('/user/auth/register', registerData);
    return response.data;
  }

  // ==================== LOGOUT ====================
  async logout(): Promise<void> {
    const refreshToken = cookies.get(AUTH_COOKIES.REFRESH_TOKEN);
    
    try {
      if (refreshToken) {
        // ✅ Envia refreshToken como query parameter
        await api.post(`/user/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`);
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continua mesmo se falhar - limpa tokens locais de qualquer forma
    } finally {
      // ✅ SEMPRE limpa os cookies locais
      this.clearAuth();
    }
  }

  // ✅ Limpa todos os dados de autenticação
  clearAuth(): void {
    cookies.remove(AUTH_COOKIES.ACCESS_TOKEN);
    cookies.remove(AUTH_COOKIES.REFRESH_TOKEN);
    cookies.remove(AUTH_COOKIES.USER_DATA);
  }

  // ==================== REFRESH TOKEN ====================
  async refreshToken(): Promise<string | null> {
    const refreshToken = cookies.get(AUTH_COOKIES.REFRESH_TOKEN);
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await api.post<AuthResponse>('/user/auth/refresh?refreshToken=' + encodeURIComponent(refreshToken));

      const { token, refreshToken: newRefreshToken } = response.data;

      cookies.set(AUTH_COOKIES.ACCESS_TOKEN, token, { expires: 1 });
      cookies.set(AUTH_COOKIES.REFRESH_TOKEN, newRefreshToken, { expires: 7 });

      return token;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  // ==================== UTILS ====================
  decodeToken(token: string): User | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      
      return {
        id: payload.sub || payload.id,
        email: payload.email,
        name: payload.name,
        slug: payload.slug,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      if (!payload.exp) return false;
      
      return Date.now() >= (payload.exp * 1000) - 30000;
    } catch {
      return true;
    }
  }

  getCurrentUser(): User | null {
    const userData = cookies.get(AUTH_COOKIES.USER_DATA);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = cookies.get(AUTH_COOKIES.ACCESS_TOKEN);
    return !!token && !this.isTokenExpired(token);
  }

  getAccessToken(): string | null {
    return cookies.get(AUTH_COOKIES.ACCESS_TOKEN);
  }
}

export const authService = new AuthService();
export default authService;