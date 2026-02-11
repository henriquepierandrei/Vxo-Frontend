// src/types/auth.types.ts

export interface LoginRequest {
  email: string;
  hashPassword: string;
}

export interface RegisterRequest {
  name: string;
  url: string;
  email: string;
  hashPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

export interface DefaultResponse {
  status: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  slug?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}