// src/components/FormLogin.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Constantes para localStorage
const STORAGE_KEYS = {
  REMEMBER_ME: 'rememberMe',
  USER_EMAIL: 'userEmail',
  LAST_LOGIN: 'lastLogin'
};

const FormLogin: React.FC = () => {
  const { login, isLoading: authLoading } = useAuth();
  const location = useLocation();
  
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Mensagem de redirecionamento (ex: sessão expirada)
  const redirectMessage = (location.state as { message?: string })?.message;

  // Carrega dados salvos do localStorage ao montar o componente
  useEffect(() => {
    try {
      const savedRememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      const savedEmail = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
      
      // Verifica se o último login foi há menos de 30 dias
      if (savedRememberMe && savedEmail && lastLogin) {
        const lastLoginDate = new Date(lastLogin);
        const daysSinceLogin = Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLogin < 30) {
          setRememberMe(true);
          setFormData(prev => ({ ...prev, email: savedEmail }));
        } else {
          // Limpa dados antigos
          localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
          localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
          localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
  }, []);

  // Gerencia o localStorage quando rememberMe muda
  useEffect(() => {
    try {
      if (!rememberMe) {
        // Remove dados do localStorage se desmarcado
        localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
      } else {
        // Salva o estado rememberMe
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      }
    } catch (error) {
      console.error('Erro ao gerenciar localStorage:', error);
    }
  }, [rememberMe]);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Digite um email válido';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Mínimo de 6 caracteres';
    return undefined;
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
    
    // Limpa erro geral ao digitar
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }

    if (touched[name]) {
      const error = name === 'email' ? validateEmail(value) : validatePassword(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFocusedField(null);

    const error = name === 'email' 
      ? validateEmail(formData.email) 
      : validatePassword(formData.password);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    setErrors(formErrors);
    setTouched({ email: true, password: true });

    if (!formErrors.email && !formErrors.password) {
      setIsSubmitting(true);
      
      try {
        await login(formData.email, formData.password, rememberMe);
        
        // Salva dados no localStorage se rememberMe estiver ativo
        if (rememberMe) {
          try {
            localStorage.setItem(STORAGE_KEYS.USER_EMAIL, formData.email);
            localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
            localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
          } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
          }
        }
        
        // Sucesso! O AuthContext cuida do redirecionamento
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Trata diferentes tipos de erro
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message;
          
          switch (status) {
            case 401:
              setErrors({ general: 'Email ou senha incorretos' });
              break;
            case 403:
              setErrors({ general: 'Conta bloqueada. Entre em contato com o suporte.' });
              break;
            case 404:
              setErrors({ general: 'Usuário não encontrado' });
              break;
            case 429:
              setErrors({ general: 'Muitas tentativas. Aguarde alguns minutos.' });
              break;
            case 500:
              setErrors({ general: 'Erro no servidor. Tente novamente mais tarde.' });
              break;
            default:
              setErrors({ general: message || 'Erro ao fazer login. Tente novamente.' });
          }
        } else if (error.request) {
          setErrors({ general: 'Sem conexão com o servidor. Verifique sua internet.' });
        } else {
          setErrors({ general: 'Erro inesperado. Tente novamente.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { level: 0, text: '', color: 'bg-transparent' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { level: 1, text: 'Muito fraca', color: 'bg-red-500' },
      { level: 2, text: 'Fraca', color: 'bg-orange-500' },
      { level: 3, text: 'Média', color: 'bg-yellow-500' },
      { level: 4, text: 'Forte', color: 'bg-[var(--color-secondary)]' },
      { level: 5, text: 'Muito forte', color: 'bg-green-500' },
    ];

    return levels[Math.min(strength - 1, 4)] || { level: 0, text: '', color: 'bg-transparent' };
  };

  // Função para limpar dados salvos
  const handleClearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
      setFormData(prev => ({ ...prev, email: '' }));
      setRememberMe(false);
    } catch (error) {
      console.error('Erro ao limpar dados salvos:', error);
    }
  };

  const passwordStrength = getPasswordStrength();
  const isLoading = isSubmitting || authLoading;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-background)]">

      {/* Background Decorations - mantido igual */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)` }}
        />
        <div 
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)` }}
        />
      </div>

      {/* Login Card */}
      <div 
        className="relative w-full max-w-md mx-auto p-8 md:p-10 transition-all duration-500"
        style={{
          backgroundColor: 'var(--card-background-glass)',
          backdropFilter: `blur(var(--blur-amount))`,
          WebkitBackdropFilter: `blur(var(--blur-amount))`,
          borderRadius: 'var(--border-radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div 
              className="absolute inset-0 rounded-2xl opacity-50 blur-lg animate-pulse"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <div 
              className="relative w-full h-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
              style={{ 
                background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              <svg 
                className="w-8 h-8"
                style={{ color: 'var(--color-accent)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
                />
              </svg>
            </div>
          </div>

          <h1 
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Bem-vindo de volta
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Indicador de dados salvos */}
        {rememberMe && formData.email && (
          <div 
            className="mb-4 p-3 rounded-lg border flex items-center justify-between animate-fade-in"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-500 text-xs">Dados salvos localmente</span>
            </div>
            <button
              type="button"
              onClick={handleClearSavedData}
              className="text-green-500 hover:text-green-600 transition-colors"
              title="Limpar dados salvos"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Mensagem de redirecionamento */}
        {redirectMessage && (
          <div 
            className="mb-6 p-4 rounded-lg border flex items-center gap-3 animate-fade-in"
            style={{
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              borderColor: 'rgba(251, 191, 36, 0.3)',
            }}
          >
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-500 text-sm">{redirectMessage}</span>
          </div>
        )}

        {/* Erro geral */}
        {errors.general && (
          <div 
            className="mb-6 p-4 rounded-lg border flex items-center gap-3 animate-fade-in"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-500 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label 
              className="block text-sm font-medium pl-1"
              style={{ color: 'var(--color-text)' }}
            >
              Email
            </label>
            <div className="relative">
              <div 
                className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${
                  focusedField === 'email' ? 'opacity-60' : 'opacity-0'
                }`}
                style={{ 
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  borderRadius: 'var(--border-radius-md)',
                }}
              />

              <div className="relative flex items-center">
                <div className="absolute left-4 z-10">
                  <svg 
                    className="w-5 h-5 transition-colors duration-300"
                    style={{ color: focusedField === 'email' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => setFocusedField('email')}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full pl-12 pr-12 py-4 outline-none transition-all duration-300 disabled:opacity-60"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderRadius: 'var(--border-radius-md)',
                    border: `1px solid ${errors.email && touched.email ? '#ef4444' : 'var(--color-border)'}`,
                  }}
                />

                {touched.email && (
                  <div className="absolute right-4">
                    {errors.email ? (
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {errors.email && touched.email && (
              <p className="text-red-500 text-xs pl-1 flex items-center gap-1 animate-fade-in">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label 
              className="block text-sm font-medium pl-1"
              style={{ color: 'var(--color-text)' }}
            >
              Senha
            </label>
            <div className="relative">
              <div 
                className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${
                  focusedField === 'password' ? 'opacity-60' : 'opacity-0'
                }`}
                style={{ 
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  borderRadius: 'var(--border-radius-md)',
                }}
              />

              <div className="relative flex items-center">
                <div className="absolute left-4 z-10">
                  <svg 
                    className="w-5 h-5 transition-colors duration-300"
                    style={{ color: focusedField === 'password' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => setFocusedField('password')}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-4 outline-none transition-all duration-300 disabled:opacity-60"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderRadius: 'var(--border-radius-md)',
                    border: `1px solid ${errors.password && touched.password ? '#ef4444' : 'var(--color-border)'}`,
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 transition-colors duration-300 hover:opacity-80 disabled:opacity-40"
                  style={{ color: 'var(--color-text-muted)' }}
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
            </div>

            {errors.password && touched.password && (
              <p className="text-red-500 text-xs pl-1 flex items-center gap-1 animate-fade-in">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}

            {/* Password Strength */}
            {formData.password && !errors.password && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 transition-all duration-300 ${
                        level <= passwordStrength.level
                          ? passwordStrength.color
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: level <= passwordStrength.level ? undefined : 'var(--color-border)',
                        borderRadius: 'var(--border-radius-sm)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Força: {passwordStrength.text}
                </p>
              </div>
            )}
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={isLoading}
                  className="sr-only"
                />
                <div 
                  className="w-5 h-5 flex items-center justify-center transition-all duration-300"
                  style={{ 
                    backgroundColor: rememberMe ? 'var(--color-primary)' : 'var(--color-surface)',
                    border: `2px solid ${rememberMe ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--border-radius-sm)',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 animate-scale-in" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Lembrar-me
              </span>
            </label>

            <a 
              href="/forgot-password" 
              className="text-sm font-medium transition-opacity duration-300 hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Esqueceu a senha?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              relative w-full py-4 font-semibold text-base overflow-hidden
              transition-all duration-300
              ${isLoading ? 'cursor-not-allowed opacity-80' : 'hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 active:translate-y-0'}
            `}
            style={{
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
              color: 'var(--color-accent)',
              borderRadius: 'var(--border-radius-md)',
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
            </div>

            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
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

          {/* Sign Up Link */}
          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
            Não tem uma conta?{' '}
            <a 
              href="/register" 
              className="font-semibold transition-opacity duration-300 hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Criar conta
            </a>
          </p>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FormLogin;