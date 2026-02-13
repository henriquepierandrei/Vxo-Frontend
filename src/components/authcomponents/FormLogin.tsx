// src/components/FormLogin.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

// ============================================================================
// TIPOS
// ============================================================================
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================
const STORAGE_KEYS = {
  REMEMBER_ME: 'vxo_remember_me',
  USER_EMAIL: 'vxo_user_email',
  USER_PASSWORD: 'vxo_user_password', // ATENÇÃO: Salvar senha em localStorage não é recomendado para produção
  LAST_LOGIN: 'vxo_last_login'
} as const;

const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Digite seu email',
  EMAIL_INVALID: 'Email inválido',
  PASSWORD_REQUIRED: 'Digite sua senha',
  PASSWORD_MIN: 'Mínimo 6 caracteres',
  INVALID_CREDENTIALS: 'Email ou senha incorretos',
  ACCOUNT_BLOCKED: 'Conta bloqueada. Contate o suporte',
  USER_NOT_FOUND: 'Conta não encontrada',
  TOO_MANY_ATTEMPTS: 'Muitas tentativas. Aguarde alguns minutos',
  SERVER_ERROR: 'Erro no servidor. Tente novamente',
  NO_CONNECTION: 'Sem conexão. Verifique sua internet',
  GENERIC_ERROR: 'Erro ao fazer login. Tente novamente'
} as const;

const REMEMBER_ME_DAYS = 30;

// ============================================================================
// UTILITÁRIOS
// ============================================================================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!emailRegex.test(email)) return ERROR_MESSAGES.EMAIL_INVALID;
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return ERROR_MESSAGES.PASSWORD_REQUIRED;
  if (password.length < 6) return ERROR_MESSAGES.PASSWORD_MIN;
  return undefined;
};

const isRememberMeValid = (lastLogin: string | null): boolean => {
  if (!lastLogin) return false;
  const lastLoginDate = new Date(lastLogin);
  const daysSinceLogin = Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceLogin < REMEMBER_ME_DAYS;
};

// Função simples de encoding/decoding (NÃO É SEGURANÇA REAL - apenas ofuscação básica)
const encodeData = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return str;
  }
};

const decodeData = (str: string): string => {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return str;
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const FormLogin: React.FC = () => {
  const { login, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  // Estados
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const redirectMessage = (location.state as { message?: string })?.message;

  // ============================================================================
  // EFEITOS
  // ============================================================================
  
  // Auto-focus no email ou senha ao montar
  useEffect(() => {
    // Se já tem email preenchido, foca na senha
    if (formData.email && !formData.password) {
      passwordInputRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }
  }, []);

  // Carrega dados salvos
  useEffect(() => {
    try {
      const savedRememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      const savedEmail = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      const savedPassword = localStorage.getItem(STORAGE_KEYS.USER_PASSWORD);
      const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
      
      if (savedRememberMe && savedEmail && isRememberMeValid(lastLogin)) {
        setRememberMe(true);
        setFormData({
          email: savedEmail,
          password: savedPassword ? decodeData(savedPassword) : ''
        });
        
        // Se tem email e senha salvos, não precisa digitar nada
        if (savedPassword) {
          // Opcionalmente, pode até fazer auto-login aqui
          // handleSubmit(new Event('submit') as any);
        }
      } else {
        clearSavedData();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      clearSavedData();
    }
  }, []);

  // Gerencia localStorage quando rememberMe muda
  useEffect(() => {
    try {
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        if (formData.email) {
          localStorage.setItem(STORAGE_KEYS.USER_EMAIL, formData.email);
        }
        // A senha será salva apenas após login bem-sucedido
      } else {
        clearSavedData();
      }
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
    }
  }, [rememberMe, formData.email]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const clearSavedData = () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  };

  const validateForm = useCallback((): FormErrors => {
    return {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa erros ao digitar
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
    if (touched[name]) {
      const error = name === 'email' ? validateEmail(value) : validatePassword(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = name === 'email' ? validateEmail(value) : validatePassword(value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    setErrors(formErrors);
    setTouched({ email: true, password: true });

    if (formErrors.email || formErrors.password) return;

    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password, rememberMe);
      
      // Salva dados se rememberMe ativo
      if (rememberMe) {
        try {
          localStorage.setItem(STORAGE_KEYS.USER_EMAIL, formData.email);
          localStorage.setItem(STORAGE_KEYS.USER_PASSWORD, encodeData(formData.password)); // Salva a senha ofuscada
          localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
          localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        } catch (error) {
          console.error('Erro ao salvar dados:', error);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Tratamento de erros
      if (error.response) {
        const status = error.response.status;
        const errorMap: Record<number, string> = {
          401: ERROR_MESSAGES.INVALID_CREDENTIALS,
          403: ERROR_MESSAGES.ACCOUNT_BLOCKED,
          404: ERROR_MESSAGES.USER_NOT_FOUND,
          429: ERROR_MESSAGES.TOO_MANY_ATTEMPTS,
          500: ERROR_MESSAGES.SERVER_ERROR,
        };
        
        setErrors({ 
          general: errorMap[status] || error.response.data?.message || ERROR_MESSAGES.GENERIC_ERROR 
        });
      } else if (error.request) {
        setErrors({ general: ERROR_MESSAGES.NO_CONNECTION });
      } else {
        setErrors({ general: ERROR_MESSAGES.GENERIC_ERROR });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || authLoading;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Background Sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ 
            background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ 
            background: `radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)`,
            transform: 'translate(-30%, 30%)'
          }}
        />
      </div>

      {/* Card Principal */}
      <div 
        className="relative w-full max-w-md p-8 md:p-10 transition-all duration-300"
        style={{
          backgroundColor: 'var(--card-background-glass)',
          backdropFilter: 'blur(var(--blur-amount))',
          borderRadius: 'var(--border-radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo Minimalista */}
          <div 
            className="w-14 h-14 mx-auto mb-6 flex items-center justify-center transition-transform duration-300 hover:scale-105"
            style={{ 
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: '0 4px 20px rgba(143, 124, 255, 0.25)'
            }}
          >
            <svg 
              className="w-7 h-7"
              style={{ color: 'var(--color-accent)' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>

          <h1 
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Bem-vindo de volta!
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Entre para continuar na Vxo
          </p>
        </div>

        {/* Alert de Redirecionamento */}
        {redirectMessage && (
          <div 
            className="mb-6 p-4 rounded-lg border flex items-start gap-3 animate-slide-down"
            style={{
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              borderColor: 'rgba(251, 191, 36, 0.3)',
            }}
            role="alert"
          >
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-600 dark:text-yellow-400 text-sm">{redirectMessage}</span>
          </div>
        )}

        {/* Alert de Erro Geral */}
        {errors.general && (
          <div 
            className="mb-6 p-4 rounded-lg border flex items-start gap-3 animate-slide-down"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
            role="alert"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600 dark:text-red-400 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Indicador de dados salvos */}
        {rememberMe && formData.email && formData.password && (
          <div 
            className="mb-4 p-3 rounded-lg border flex items-center gap-2 animate-slide-down"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600 dark:text-green-400 text-xs">
              Dados salvos para próximo acesso
            </span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          
          {/* Campo Email */}
          <div>
            <label 
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <svg 
                  className="w-5 h-5 transition-colors"
                  style={{ color: errors.email && touched.email ? '#ef4444' : 'var(--color-text-muted)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>

              <input
                ref={emailInputRef}
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="seu@email.com"
                disabled={isLoading}
                autoComplete="email"
                aria-invalid={!!(errors.email && touched.email)}
                aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                className="w-full pl-12 pr-4 py-3.5 outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--border-radius-md)',
                  border: `2px solid ${errors.email && touched.email ? '#ef4444' : 'var(--color-border)'}`,
                }}
              />

              {/* Ícone de Validação */}
              {touched.email && formData.email && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {errors.email ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}
            </div>

            {errors.email && touched.email && (
              <p id="email-error" className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Senha
              </label>
              <a 
                href="/forgot-password" 
                className="text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-primary)' }}
                tabIndex={-1}
              >
                Esqueceu?
              </a>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <svg 
                  className="w-5 h-5 transition-colors"
                  style={{ color: errors.password && touched.password ? '#ef4444' : 'var(--color-text-muted)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <input
                ref={passwordInputRef}
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                aria-invalid={!!(errors.password && touched.password)}
                aria-describedby={errors.password && touched.password ? "password-error" : undefined}
                className="w-full pl-12 pr-12 py-3.5 outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--border-radius-md)',
                  border: `2px solid ${errors.password && touched.password ? '#ef4444' : 'var(--color-border)'}`,
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ color: 'var(--color-text-muted)' }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && touched.password && (
              <p id="password-error" className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Lembrar-me */}
          <div className="flex items-center">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-5 h-5 cursor-pointer transition-all accent-[var(--color-primary)] disabled:opacity-60"
              />
              <span className="text-sm select-none" style={{ color: 'var(--color-text-muted)' }}>
                Lembrar email e senha por {REMEMBER_ME_DAYS} dias
              </span>
            </label>
          </div>

          {/* Aviso de Segurança (opcional - remover em produção se não quiser mostrar) */}
          {rememberMe && (
            <div className="text-xs flex items-start gap-2 p-3 rounded-lg" style={{
              backgroundColor: 'rgba(251, 191, 36, 0.05)',
              color: 'var(--color-text-muted)'
            }}>
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>
                Use apenas em dispositivos pessoais e seguros. Os dados serão removidos após {REMEMBER_ME_DAYS} dias.
              </span>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full py-4 font-semibold text-base overflow-hidden transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 hover:shadow-lg active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              color: 'var(--color-accent)',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: '0 4px 15px rgba(143, 124, 255, 0.3)',
            }}
          >
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Link de Cadastro */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Ainda não tem conta?{' '}
            <a 
              href="/register" 
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Criar conta grátis
            </a>
          </p>
        </div>
      </div>

      {/* Animações */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Remove autofill background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px var(--color-surface) inset;
          -webkit-text-fill-color: var(--color-text);
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default FormLogin;