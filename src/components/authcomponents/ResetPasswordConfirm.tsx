// src/components/authcomponents/ResetPasswordConfirm.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPasswordConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [apiError, setApiError] = useState<string>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Verifica se tem token
  useEffect(() => {
    if (!token) {
      setStep('error');
      setApiError('Link inválido ou expirado');
    }
  }, [token]);

  // Validação de senha
  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Senha é obrigatória';
    if (value.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'Deve conter uma letra maiúscula';
    if (!/[a-z]/.test(value)) return 'Deve conter uma letra minúscula';
    if (!/[0-9]/.test(value)) return 'Deve conter um número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Deve conter um caractere especial';
    return undefined;
  };

  // Validação de confirmação
  const validateConfirm = (value: string): string | undefined => {
    if (!value) return 'Confirme sua senha';
    if (value !== password) return 'As senhas não coincidem';
    return undefined;
  };

  // Força da senha
  const getPasswordStrength = (pass: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    if (score <= 2) return { level: 1, label: 'Fraca', color: '#ef4444' };
    if (score <= 4) return { level: 2, label: 'Média', color: '#f59e0b' };
    return { level: 3, label: 'Forte', color: '#22c55e' };
  };

  const strength = getPasswordStrength(password);

  // Submit
  const handleSubmit = async () => {
    const passError = validatePassword(password);
    const confError = validateConfirm(confirmPassword);
    
    setPasswordError(passError);
    setConfirmError(confError);
    setApiError(undefined);

    if (passError || confError || !token) return;

    setIsSubmitting(true);

    try {
      // ✅ CORRETO - Dois argumentos separados
      await authService.confirmPasswordReset(token!, password);
      setStep('success');
    } catch (err: any) {
      if (err.response?.data) {
        setApiError(err.response.data);
      } else {
        setApiError('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-background)]">
      
      {/* Background */}
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
        className="relative w-full max-w-md mx-auto p-8 md:p-10"
        style={{
          backgroundColor: 'var(--card-background-glass)',
          backdropFilter: 'blur(var(--blur-amount))',
          borderRadius: 'var(--border-radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        
        {/* Step: Form */}
        {step === 'form' && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-2xl opacity-50 blur-lg"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    borderRadius: 'var(--border-radius-md)',
                  }}
                >
                  <svg className="w-8 h-8" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Nova Senha
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                Digite sua nova senha abaixo
              </p>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-500 text-sm text-center">{apiError}</p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1" style={{ color: 'var(--color-text)' }}>
                  Nova Senha
                </label>
                <div className="relative">
                  <div
                    className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${passwordFocused ? 'opacity-60' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', borderRadius: 'var(--border-radius-md)' }}
                  />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 z-10">
                      <svg className="w-5 h-5" style={{ color: passwordFocused ? 'var(--color-primary)' : 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(validatePassword(e.target.value));
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••"
                      className="w-full py-4 pl-12 pr-12 outline-none"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-md)',
                        border: `1px solid ${passwordError ? '#ef4444' : 'var(--color-border)'}`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 z-10 p-1"
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

                {/* Password Strength */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: strength.level >= level ? strength.color : 'var(--color-border)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs pl-1" style={{ color: strength.color }}>
                      Força: {strength.label}
                    </p>
                  </div>
                )}

                {passwordError && (
                  <p className="text-red-500 text-xs pl-1">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium pl-1" style={{ color: 'var(--color-text)' }}>
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div
                    className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${confirmFocused ? 'opacity-60' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', borderRadius: 'var(--border-radius-md)' }}
                  />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 z-10">
                      <svg className="w-5 h-5" style={{ color: confirmFocused ? 'var(--color-primary)' : 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmError(validateConfirm(e.target.value));
                      }}
                      onFocus={() => setConfirmFocused(true)}
                      onBlur={() => setConfirmFocused(false)}
                      placeholder="••••••••"
                      className="w-full py-4 pl-12 pr-12 outline-none"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-md)',
                        border: `1px solid ${confirmError ? '#ef4444' : 'var(--color-border)'}`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 z-10 p-1"
                      style={{ color: 'var(--color-text-muted)' }}
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
                </div>
                {confirmError && (
                  <p className="text-red-500 text-xs pl-1">{confirmError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`relative w-full py-4 font-semibold text-base overflow-hidden mt-4 transition-all duration-300 ${
                  isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:-translate-y-0.5'
                }`}
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  color: 'var(--color-accent)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      Redefinir Senha
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="animate-fade-in text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full opacity-30 blur-xl animate-pulse" style={{ backgroundColor: '#22c55e' }} />
              <div className="relative w-full h-full bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Senha Redefinida!
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-8">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
            </p>

            <button
              onClick={() => window.location.href = '/login'}
              className="relative w-full py-4 font-semibold text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                color: 'var(--color-accent)',
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              <span className="relative flex items-center justify-center gap-2">
                Ir para Login
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div className="animate-fade-in text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full opacity-30 blur-xl" style={{ backgroundColor: '#ef4444' }} />
              <div className="relative w-full h-full bg-red-500/20 rounded-full flex items-center justify-center">
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Link Inválido
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-8">
              {apiError || 'O link de recuperação é inválido ou expirou. Solicite um novo link.'}
            </p>

            <button
              onClick={() => window.location.href = '/forgot-password'}
              className="relative w-full py-4 font-semibold text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                color: 'var(--color-accent)',
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              Solicitar novo link
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in { 0% { transform: scale(0); } 100% { transform: scale(1); } }
        @keyframes fade-in { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ResetPasswordConfirm;