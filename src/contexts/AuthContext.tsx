// src/contexts/AuthContext.tsx

import React, { 
  createContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  type ReactNode 
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import type { User, AuthState, DefaultResponse } from '../types/authtypes/auth.types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, slug: string, password: string) => Promise<DefaultResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        } else {
          const token = await authService.refreshToken();
          if (token) {
            const currentUser = authService.decodeToken(token);
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname, message: 'Sessão expirada. Faça login novamente.' }
      });
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [navigate, location]);

  useEffect(() => {
    if (!user) return;

    const checkAndRefresh = async () => {
      const token = authService.getAccessToken();
      if (token && authService.isTokenExpired(token)) {
        try {
          await authService.refreshToken();
        } catch (error) {
          console.error('Auto refresh failed:', error);
        }
      }
    };

    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const login = useCallback(async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, password, rememberMe);
      setUser(loggedUser);
      
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location]);

  // ✅ NOVO: Método de registro
  const register = useCallback(async (
    name: string,
    email: string,
    slug: string,
    password: string
  ): Promise<DefaultResponse> => {
    const response = await authService.register(name, email, slug, password);
    return response;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const refreshAuth = useCallback(async () => {
    try {
      const token = await authService.refreshToken();
      if (token) {
        const currentUser = authService.decodeToken(token);
        setUser(currentUser);
      }
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  }), [user, isLoading, login, register, logout, refreshAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};