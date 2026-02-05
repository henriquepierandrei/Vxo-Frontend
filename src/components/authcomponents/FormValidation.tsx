import React, { useState, useRef, useEffect, useCallback } from 'react';

interface EmailVerificationProps {
  onVerified?: (email: string) => void;
  onCancel?: () => void;
}

const FormValidation: React.FC<EmailVerificationProps> = ({ onVerified, onCancel }) => {
  // Estados
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Código simulado (em produção viria do backend)
  const [generatedCode, setGeneratedCode] = useState('');

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'code' && countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, step]);

  // Validação de email
  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Digite um email válido';
    return undefined;
  };

  // Gerar código aleatório
  const generateCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    console.log('📧 Código enviado para', email, ':', newCode); // Simula envio
    return newCode;
  };

  // Enviar código
  const handleSendCode = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    setEmailTouched(true);
    
    if (error) return;
    
    setIsSending(true);
    
    // Simula envio de email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    generateCode();
    setIsSending(false);
    setStep('code');
    setCountdown(60);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    setCodeError(undefined);
    
    // Foca no primeiro input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    generateCode();
    setIsSending(false);
    setCountdown(60);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    setCodeError(undefined);
    
    inputRefs.current[0]?.focus();
  };

  // Verificar código
  const verifyCode = useCallback(async (enteredCode: string) => {
    if (enteredCode.length !== 6) return;
    
    setIsVerifying(true);
    setCodeError(undefined);
    
    // Simula verificação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (enteredCode === generatedCode) {
      setStep('success');
      onVerified?.(email);
    } else {
      setCodeError('Código incorreto. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    
    setIsVerifying(false);
  }, [generatedCode, email, onVerified]);

  // Handling input do código
  const handleCodeChange = (index: number, value: string) => {
    // Aceita apenas números
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setCodeError(undefined);
    
    // Auto-avança para próximo input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Verifica automaticamente quando completo
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      verifyCode(pastedData);
    }
  };

  // Voltar para email
  const handleBack = () => {
    setStep('email');
    setCode(['', '', '', '', '', '']);
    setCodeError(undefined);
    setCountdown(0);
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
        
        <div
          className="absolute top-20 left-[15%] w-2 h-2 rounded-full opacity-40 animate-float-slow"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-3 h-3 rounded-full opacity-30 animate-float-medium"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        />
        <div
          className="absolute bottom-[20%] left-[20%] w-2 h-2 rounded-full opacity-40 animate-float-fast"
          style={{ backgroundColor: 'var(--color-primary-dark)' }}
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Verificar Email
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                Digite seu email para receber o código de verificação
              </p>
            </div>

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
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendCode}
                disabled={isSending}
                className={`
                  relative w-full py-4 font-semibold text-base overflow-hidden mt-4
                  transition-all duration-300
                  ${isSending ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 active:translate-y-0'}
                `}
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
                      Enviar código
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              {/* Cancel */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full py-3 text-sm font-medium transition-colors duration-300 hover:opacity-80"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step: Code */}
        {step === 'code' && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-2xl opacity-50 blur-lg"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                />
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary-dark) 100%)',
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Digite o código
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                Enviamos um código de 6 dígitos para
              </p>
              <p style={{ color: 'var(--color-primary)' }} className="text-sm font-medium mt-1">
                {email}
              </p>
            </div>

            {/* Code Inputs */}
            <div className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleCodePaste}>
                {code.map((digit, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${
                        document.activeElement === inputRefs.current[index] ? 'opacity-60' : 'opacity-0'
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        borderRadius: 'var(--border-radius-md)',
                      }}
                    />
                    <input
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      disabled={isVerifying}
                      className={`
                        relative w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold outline-none
                        transition-all duration-300
                        ${isVerifying ? 'opacity-50' : ''}
                      `}
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-md)',
                        border: `2px solid ${codeError ? '#ef4444' : digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Error */}
              {codeError && (
                <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1 animate-fade-in">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {codeError}
                </p>
              )}

              {/* Verifying indicator */}
              {isVerifying && (
                <div className="flex items-center justify-center gap-2 animate-fade-in" style={{ color: 'var(--color-primary)' }}>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-medium">Verificando...</span>
                </div>
              )}

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Reenviar código em{' '}
                    <span style={{ color: 'var(--color-primary)' }} className="font-semibold">
                      {countdown}s
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendCode}
                    disabled={isSending}
                    className="text-sm font-semibold transition-opacity duration-300 hover:opacity-80 disabled:opacity-50"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {isSending ? 'Reenviando...' : 'Reenviar código'}
                  </button>
                )}
              </div>

              {/* Back button */}
              <button
                onClick={handleBack}
                disabled={isVerifying}
                className="w-full py-3 text-sm font-medium transition-colors duration-300 hover:opacity-80 flex items-center justify-center gap-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Alterar email
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="animate-fade-in text-center">
            {/* Success Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full opacity-30 blur-xl animate-pulse"
                style={{ backgroundColor: '#22c55e' }}
              />
              <div className="relative w-full h-full bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Email verificado!
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-2">
              Seu email foi verificado com sucesso
            </p>
            <p style={{ color: 'var(--color-primary)' }} className="text-sm font-medium mb-8">
              {email}
            </p>

            {/* Continue Button */}
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
                Continuar
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* Demo hint - apenas para desenvolvimento */}
        {step === 'code' && generatedCode && (
          <div className="mt-6 p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              🔧 Demo: O código é <span className="font-mono font-bold" style={{ color: 'var(--color-primary)' }}>{generatedCode}</span>
            </p>
          </div>
        )}
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
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FormValidation;