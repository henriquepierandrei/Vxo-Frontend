import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

interface RequestPasswordResetProps {
  onCancel?: () => void;
}

const RequestPasswordReset: React.FC<RequestPasswordResetProps> = ({ onCancel }) => {
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState<string>();

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Digite um email válido';
    return undefined;
  };

  const extractErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (typeof axiosError.response?.data === 'string') {
      return axiosError.response.data;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  };

  const handleSendReset = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    setEmailTouched(true);
    setApiError(undefined);

    if (error) return;

    setIsSending(true);

    try {
      await authService.requestPasswordReset(email);
      setStep('success');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const status = axiosError.response?.status;
      
      if (status === 429) {
        setApiError(extractErrorMessage(err));
      } else if (status === 400) {
        setApiError(extractErrorMessage(err));
      } else if (status === 404) {
        setStep('success');
      } else {
        setStep('success');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-background)]">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)' }}
        />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md mx-auto p-8 md:p-10 transition-all duration-500"
        style={{
          backgroundColor: 'var(--card-background-glass)',
          backdropFilter: 'blur(var(--blur-amount))',
          WebkitBackdropFilter: 'blur(var(--blur-amount))',
          borderRadius: 'var(--border-radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        
        {/* Step: Email */}
        {step === 'email' && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-2xl opacity-50 blur-lg animate-pulse"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div
                  className="relative w-full h-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
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
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Recuperar Senha
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                Digite seu email para receber o link de recuperação
              </p>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-500 text-sm font-medium">
                      {apiError}
                    </p>
                    {apiError.includes('24h') && (
                      <p className="text-red-400/70 text-xs mt-1">
                        Por segurança, limitamos a frequência de solicitações.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1" style={{ color: 'var(--color-text)' }}>
                  Email
                </label>
                <div className="relative">
                  <div
                    className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${
                      emailFocused ? 'opacity-60' : 'opacity-0'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      borderRadius: 'var(--border-radius-md)',
                    }}
                  />

                  <div className="relative flex items-center">
                    <div className="absolute left-4 z-10">
                      <div
                        className="w-5 h-5 transition-colors duration-300"
                        style={{ color: emailFocused ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setApiError(undefined);
                        if (emailTouched) {
                          setEmailError(validateEmail(e.target.value));
                        }
                      }}
                      onBlur={() => {
                        setEmailTouched(true);
                        setEmailFocused(false);
                        setEmailError(validateEmail(email));
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReset()}
                      placeholder="seu@email.com"
                      className="w-full py-4 pl-12 pr-12 outline-none transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-md)',
                        border: `1px solid ${emailError && emailTouched ? '#ef4444' : 'var(--color-border)'}`,
                      }}
                    />

                    {emailTouched && (
                      <div className="absolute right-4">
                        {emailError ? (
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

                {emailError && emailTouched && (
                  <p className="text-red-500 text-xs pl-1 flex items-center gap-1 animate-fade-in">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendReset}
                disabled={isSending}
                className={`relative w-full py-4 font-semibold text-base overflow-hidden mt-4 transition-all duration-300 ${
                  isSending ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 active:translate-y-0'
                }`}
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  color: 'var(--color-accent)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                {!isSending && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
                  </div>
                )}

                <span className="relative flex items-center justify-center gap-2">
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar link de recuperação
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              {/* Back to Login */}
              <button
                onClick={onCancel || (() => window.location.href = '/login')}
                className="w-full py-3 text-sm font-medium transition-colors duration-300 hover:opacity-80 flex items-center justify-center gap-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar ao login
              </button>
            </div>
          </div>
        )}

        {/* ✅ TELA DE SUCESSO COMPLETA */}
        {step === 'success' && (
          <div className="animate-fade-in text-center">
            {/* Ícone de Email */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full opacity-30 blur-xl animate-pulse"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              <div 
                className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center animate-scale-in"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              Solicitação Enviada!
            </h1>

            {/* Mensagem Principal */}
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-2">
              Se o email <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{email}</span> existir em nossa base, você receberá as instruções para redefinir sua senha.
            </p>

            {/* Info Box */}
            <div 
              className="p-4 rounded-lg mb-6 mt-6"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-lg">⏱️</span>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    O link expira em <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>15 minutos</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <span className="text-lg">📧</span>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Verifique também a pasta de <span className="font-semibold">spam</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <span className="text-lg">🔒</span>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Por segurança, não revelamos se o email existe
                  </p>
                </div>
              </div>
            </div>

            {/* Botão Voltar ao Login */}
            <button
              onClick={() => window.location.href = '/login'}
              className="relative w-full py-4 font-semibold text-base overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                color: 'var(--color-accent)',
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
              </div>
              <span className="relative flex items-center justify-center gap-2">
                Voltar ao login
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            {/* Link para tentar novamente */}
            <button
              onClick={() => {
                setStep('email');
                setEmail('');
                setEmailTouched(false);
                setApiError(undefined);
              }}
              className="w-full py-3 text-sm font-medium transition-colors duration-300 hover:opacity-80 mt-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Tentar com outro email
            </button>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%) skewX(-12deg); } 100% { transform: translateX(200%) skewX(-12deg); } }
        @keyframes scale-in { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-shimmer { animation: shimmer 3s infinite; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default RequestPasswordReset;