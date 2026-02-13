// src/components/FormRegister.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ============================================================================
// TIPOS
// ============================================================================
interface FormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================
const ERROR_MESSAGES = {
  NAME_REQUIRED: 'Digite seu nome',
  NAME_MIN: 'Mínimo 2 caracteres',
  NAME_MAX: 'Máximo 50 caracteres',
  EMAIL_REQUIRED: 'Digite seu email',
  EMAIL_INVALID: 'Email inválido',
  USERNAME_REQUIRED: 'Escolha um link',
  USERNAME_MIN: 'Mínimo 3 caracteres',
  USERNAME_MAX: 'Máximo 20 caracteres',
  USERNAME_INVALID: 'Use apenas letras, números, _ ou -',
  USERNAME_START: 'Não pode começar com _ ou -',
  PASSWORD_REQUIRED: 'Digite uma senha',
  PASSWORD_MIN: 'Mínimo 6 caracteres',
  PASSWORD_UPPERCASE: 'Inclua uma letra maiúscula',
  PASSWORD_NUMBER: 'Inclua um número',
  CONFIRM_REQUIRED: 'Confirme sua senha',
  CONFIRM_MATCH: 'As senhas não coincidem',
} as const;

const URL_BASE = 'vxo.lat/';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_-]+$/;

// ============================================================================
// VALIDAÇÕES
// ============================================================================
const validateName = (name: string): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) return ERROR_MESSAGES.NAME_REQUIRED;
  if (trimmed.length < 2) return ERROR_MESSAGES.NAME_MIN;
  if (trimmed.length > 50) return ERROR_MESSAGES.NAME_MAX;
  return undefined;
};

const validateEmail = (email: string): string | undefined => {
  const trimmed = email.trim();
  if (!trimmed) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!emailRegex.test(trimmed)) return ERROR_MESSAGES.EMAIL_INVALID;
  return undefined;
};

const validateUsername = (username: string): string | undefined => {
  if (!username) return ERROR_MESSAGES.USERNAME_REQUIRED;
  if (username.length < 3) return ERROR_MESSAGES.USERNAME_MIN;
  if (username.length > 20) return ERROR_MESSAGES.USERNAME_MAX;
  if (!usernameRegex.test(username)) return ERROR_MESSAGES.USERNAME_INVALID;
  if (/^[_-]/.test(username)) return ERROR_MESSAGES.USERNAME_START;
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return ERROR_MESSAGES.PASSWORD_REQUIRED;
  if (password.length < 6) return ERROR_MESSAGES.PASSWORD_MIN;
  if (!/[A-Z]/.test(password)) return ERROR_MESSAGES.PASSWORD_UPPERCASE;
  if (!/[0-9]/.test(password)) return ERROR_MESSAGES.PASSWORD_NUMBER;
  return undefined;
};

const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
  if (!confirmPassword) return ERROR_MESSAGES.CONFIRM_REQUIRED;
  if (confirmPassword !== password) return ERROR_MESSAGES.CONFIRM_MATCH;
  return undefined;
};

const getPasswordStrength = (password: string) => {
  if (!password) return { level: 0, text: '', color: '' };

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { level: 1, text: 'Muito fraca', color: '#ef4444' },
    { level: 2, text: 'Fraca', color: '#f97316' },
    { level: 3, text: 'Média', color: '#eab308' },
    { level: 4, text: 'Forte', color: '#22c55e' },
    { level: 5, text: 'Muito forte', color: '#10b981' },
  ];

  return levels[Math.min(strength - 1, 4)] || { level: 0, text: '', color: '' };
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const FormRegister: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Estados
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-focus
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Validação do form
  const validateForm = useCallback((): FormErrors => {
    return {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };
  }, [formData]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Limpa mensagens
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
    if (successMessage) setSuccessMessage(null);

    // Processa valor
    const processedValue = name === 'username' 
      ? value.toLowerCase().replace(/\s/g, '') 
      : value;

    setFormData(prev => {
      const newData = { ...prev, [name]: processedValue };

      // Valida em tempo real se já tocou
      if (touched[name]) {
        let error: string | undefined;
        switch (name) {
          case 'name':
            error = validateName(processedValue);
            break;
          case 'email':
            error = validateEmail(processedValue);
            break;
          case 'username':
            error = validateUsername(processedValue);
            break;
          case 'password':
            error = validatePassword(processedValue);
            // Re-valida confirmPassword se já foi preenchido
            if (touched.confirmPassword && prev.confirmPassword) {
              setErrors(prevErrors => ({
                ...prevErrors,
                password: error,
                confirmPassword: validateConfirmPassword(prev.confirmPassword, processedValue),
              }));
              return newData;
            }
            break;
          case 'confirmPassword':
            error = validateConfirmPassword(processedValue, prev.password);
            break;
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
      }

      return newData;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let error: string | undefined;
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    setErrors(formErrors);
    setTouched({
      name: true,
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    const hasErrors = Object.values(formErrors).some(error => error !== undefined);

    if (hasErrors || !acceptTerms) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.username.trim(),
        formData.password
      );

      setSuccessMessage(response.message || 'Conta criada com sucesso!');

      // Limpa formulário
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      });
      setTouched({});
      setAcceptTerms(false);

      // Redireciona
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Conta criada! Faça login para continuar.',
            email: formData.email
          }
        });
      }, 2000);

    } catch (error: any) {
      console.error('Register error:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        const errorMap: Record<number, () => void> = {
          400: () => {
            if (message?.toLowerCase().includes('email')) {
              setErrors({ email: message });
            } else if (message?.toLowerCase().includes('url') || message?.toLowerCase().includes('link')) {
              setErrors({ username: message });
            } else if (message?.toLowerCase().includes('senha') || message?.toLowerCase().includes('password')) {
              setErrors({ password: message });
            } else {
              setErrors({ general: message || 'Dados inválidos' });
            }
          },
          409: () => {
            if (message?.toLowerCase().includes('email')) {
              setErrors({ email: 'Email já cadastrado' });
            } else if (message?.toLowerCase().includes('url') || message?.toLowerCase().includes('link')) {
              setErrors({ username: 'Link já em uso' });
            } else {
              setErrors({ general: message || 'Email ou link já existe' });
            }
          },
          422: () => setErrors({ general: message || 'Dados inválidos' }),
          429: () => setErrors({ general: 'Muitas tentativas. Aguarde' }),
          500: () => setErrors({ general: 'Erro no servidor. Tente novamente' }),
        };

        const errorHandler = errorMap[status];
        if (errorHandler) {
          errorHandler();
        } else {
          setErrors({ general: message || 'Erro ao criar conta' });
        }
      } else if (error.request) {
        setErrors({ general: 'Sem conexão. Verifique sua internet' });
      } else {
        setErrors({ general: 'Erro inesperado. Tente novamente' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative py-16"
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
        className="relative w-full max-w-md p-8 md:p-10 my-8 transition-all duration-300"
        style={{
          backgroundColor: 'var(--card-background-glass)',
          backdropFilter: 'blur(var(--blur-amount))',
          borderRadius: 'var(--border-radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>

          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Criar sua conta
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Comece grátis na Vxo
          </p>
        </div>

        {/* Alert de Sucesso */}
        {successMessage && (
          <div
            className="mb-6 p-4 rounded-lg border flex items-start gap-3 animate-slide-down"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
            role="alert"
          >
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-600 dark:text-green-400 text-sm">{successMessage}</span>
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Nome */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Nome completo
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <svg
                  className="w-5 h-5"
                  style={{ color: errors.name && touched.name ? '#ef4444' : 'var(--color-text-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <input
                ref={nameInputRef}
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Seu nome"
                disabled={isLoading}
                autoComplete="name"
                aria-invalid={!!(errors.name && touched.name)}
                aria-describedby={errors.name && touched.name ? "name-error" : undefined}
                className="w-full pl-12 pr-12 py-3.5 outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--border-radius-md)',
                  border: `2px solid ${errors.name && touched.name ? '#ef4444' : 'var(--color-border)'}`,
                }}
              />

              {/* Ícone de Validação */}
              {touched.name && formData.name && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {errors.name ? (
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

            {errors.name && touched.name && (
              <p id="name-error" className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
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
                  className="w-5 h-5"
                  style={{ color: errors.email && touched.email ? '#ef4444' : 'var(--color-text-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>

              <input
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
                className="w-full pl-12 pr-12 py-3.5 outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--border-radius-md)',
                  border: `2px solid ${errors.email && touched.email ? '#ef4444' : 'var(--color-border)'}`,
                }}
              />

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

          {/* Username / Link */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Seu link personalizado
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 pointer-events-none"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm font-medium">{URL_BASE}</span>
              </div>

              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="seulink"
                disabled={isLoading}
                autoComplete="off"
                aria-invalid={!!(errors.username && touched.username)}
                aria-describedby={errors.username && touched.username ? "username-error" : undefined}
                className="w-full py-3.5 pr-12 outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  paddingLeft: '8.5rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--border-radius-md)',
                  border: `2px solid ${errors.username && touched.username ? '#ef4444' : 'var(--color-border)'}`,
                }}
              />

              {touched.username && formData.username && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {errors.username ? (
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

            {/* Preview do link */}
            {formData.username && !errors.username && touched.username && (
              <p className="mt-2 text-sm flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Seu link: {URL_BASE}{formData.username}
              </p>
            )}

            {errors.username && touched.username && (
              <p id="username-error" className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.username}
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Senha
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <svg
                  className="w-5 h-5"
                  style={{ color: errors.password && touched.password ? '#ef4444' : 'var(--color-text-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="new-password"
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

            {/* Indicador de Força */}
            {formData.password && !errors.password && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="h-1.5 flex-1 transition-all duration-300 rounded-full"
                      style={{
                        backgroundColor: level <= passwordStrength.level ? passwordStrength.color : 'var(--color-border)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: passwordStrength.color || 'var(--color-text-muted)' }}>
                  Força da senha: {passwordStrength.text}
                </p>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Confirmar senha
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <svg
                  className="w-5 h-5"
                  style={{ color: errors.confirmPassword && touched.confirmPassword ? '#ef4444' : 'var(--color-text-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="new-password"
                aria-invalid={!!(errors.confirmPassword && touched.confirmPassword)}
                aria-describedby={errors.confirmPassword && touched.confirmPassword ? "confirmPassword-error" : undefined}
                className="w-full pl-12 pr-12 py-3.5 outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--border-radius-md)',
                  border: `2px solid ${errors.confirmPassword && touched.confirmPassword ? '#ef4444' : 'var(--color-border)'}`,
                }}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ color: 'var(--color-text-muted)' }}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
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

            {errors.confirmPassword && touched.confirmPassword && (
              <p id="confirmPassword-error" className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.confirmPassword}
              </p>
            )}

            {/* Senhas Coincidem */}
            {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
              <p className="mt-2 text-sm text-green-500 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Senhas coincidem
              </p>
            )}
          </div>

          {/* Termos */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={isLoading}
                className="w-5 h-5 mt-0.5 cursor-pointer transition-all accent-[var(--color-primary)] disabled:opacity-60"
              />
              <span className="text-sm leading-relaxed select-none" style={{ color: 'var(--color-text-muted)' }}>
                Aceito os{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Termos de Uso
                </a>
                {' '}e a{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Política de Privacidade
                </a>
              </span>
            </label>
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isLoading || !acceptTerms}
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
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta grátis
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Link de Login */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Já tem uma conta?{' '}
            <a
              href="/login"
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Entrar
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

export default FormRegister;