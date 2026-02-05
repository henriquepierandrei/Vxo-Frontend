import React, { useState, useCallback } from 'react';

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
}

// ✅ COMPONENTE FORA DO FormRegister
interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  error?: string;
  isTouched: boolean;
  isFocused: boolean;
  icon: React.ReactNode;
  showToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  isTouched,
  isFocused,
  icon,
  showToggle = false,
  isVisible = true,
  onToggleVisibility,
  onChange,
  onBlur,
  onFocus,
}) => (
  <div className="space-y-2">
    <label
      className="block text-sm font-medium pl-1"
      style={{ color: 'var(--color-text)' }}
    >
      {label}
    </label>
    <div className="relative">
      {/* Glow on focus */}
      <div
        className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${
          isFocused ? 'opacity-60' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          borderRadius: 'var(--border-radius-md)',
        }}
      />

      <div className="relative flex items-center">
        {/* Icon */}
        <div className="absolute left-4 z-10">
          <div
            className="w-5 h-5 transition-colors duration-300"
            style={{ color: isFocused ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
          >
            {icon}
          </div>
        </div>

        <input
          type={showToggle ? (isVisible ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          autoComplete={showToggle ? 'new-password' : 'off'}
          className="w-full py-4 pl-12 pr-12 outline-none transition-all duration-300"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            borderRadius: 'var(--border-radius-md)',
            border: `1px solid ${error && isTouched ? '#ef4444' : 'var(--color-border)'}`,
          }}
        />

        {/* Toggle password visibility */}
        {showToggle && onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-4 transition-colors duration-300 hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {isVisible ? (
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
        )}

        {/* Validation icon (apenas para campos sem toggle) */}
        {!showToggle && isTouched && (
          <div className="absolute right-4">
            {error ? (
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

    {/* Error message */}
    {error && isTouched && (
      <p className="text-red-500 text-xs pl-1 flex items-center gap-1 animate-fade-in">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// ✅ COMPONENTE PRINCIPAL
const FormRegister: React.FC = () => {
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Validações
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (name.trim().length > 50) return 'Nome deve ter no máximo 50 caracteres';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Digite um email válido';
    return undefined;
  };

  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) return 'Username é obrigatório';
    if (username.length < 3) return 'Mínimo de 3 caracteres';
    if (username.length > 20) return 'Máximo de 20 caracteres';
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Use apenas letras, números, _ ou -';
    if (/^[_-]/.test(username)) return 'Não pode começar com _ ou -';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Mínimo de 6 caracteres';
    if (!/[A-Z]/.test(password)) return 'Inclua uma letra maiúscula';
    if (!/[0-9]/.test(password)) return 'Inclua um número';
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return 'Confirme sua senha';
    if (confirmPassword !== password) return 'As senhas não coincidem';
    return undefined;
  };

  const validateForm = useCallback((): FormErrors => {
    return {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const processedValue = name === 'username'
      ? value.toLowerCase().replace(/\s/g, '')
      : value;

    setFormData(prev => {
      const newData = { ...prev, [name]: processedValue };

      // Validar em tempo real se já foi tocado
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
            // Também revalidar confirmPassword
            if (touched.confirmPassword) {
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
    setFocusedField(null);

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

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

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

    if (!hasErrors && acceptTerms) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      console.log('Register:', formData);
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

  const passwordStrength = getPasswordStrength();

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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary-dark) 0%, transparent 70%)' }}
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

      {/* Register Card */}
      <div
        className="relative w-full max-w-md mx-auto p-8 md:p-10 transition-all duration-500 m-20"
        style={{
          backgroundColor: 'var(--card-background-glass)',
          backdropFilter: 'blur(var(--blur-amount))',
          WebkitBackdropFilter: 'blur(var(--blur-amount))',
          borderRadius: 'var(--border-radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>

          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Criar conta
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Preencha os dados para se cadastrar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome */}
          <InputField
            name="name"
            label="Nome completo"
            placeholder="Seu nome"
            value={formData.name}
            error={errors.name}
            isTouched={touched.name || false}
            isFocused={focusedField === 'name'}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => handleFocus('name')}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          {/* Email */}
          <InputField
            name="email"
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            error={errors.email}
            isTouched={touched.email || false}
            isFocused={focusedField === 'email'}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => handleFocus('email')}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          {/* Username / Link */}
          <div className="space-y-2">
            <label
              className="block text-sm font-medium pl-1"
              style={{ color: 'var(--color-text)' }}
            >
              Seu link
            </label>
            <div className="relative">
              <div
                className={`absolute -inset-[1px] blur-sm transition-opacity duration-300 ${
                  focusedField === 'username' ? 'opacity-60' : 'opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  borderRadius: 'var(--border-radius-md)',
                }}
              />

              <div className="relative flex items-center">
                <div
                  className="absolute left-4 z-10 flex items-center gap-0 select-none"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <svg
                    className="w-5 h-5 mr-2 transition-colors duration-300"
                    style={{ color: focusedField === 'username' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm font-medium">neo.co/</span>
                </div>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => handleFocus('username')}
                  placeholder="seulink"
                  autoComplete="off"
                  className="w-full py-4 outline-none transition-all duration-300"
                  style={{
                    paddingLeft: '8rem',
                    paddingRight: '3rem',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderRadius: 'var(--border-radius-md)',
                    border: `1px solid ${errors.username && touched.username ? '#ef4444' : 'var(--color-border)'}`,
                  }}
                />

                {touched.username && (
                  <div className="absolute right-4">
                    {errors.username ? (
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

            {formData.username && !errors.username && touched.username && (
              <p className="text-xs pl-1 flex items-center gap-1 animate-fade-in" style={{ color: 'var(--color-primary)' }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Seu link: neo.co/{formData.username}
              </p>
            )}

            {errors.username && touched.username && (
              <p className="text-red-500 text-xs pl-1 flex items-center gap-1 animate-fade-in">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.username}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <InputField
              name="password"
              label="Senha"
              placeholder="••••••••"
              value={formData.password}
              error={errors.password}
              isTouched={touched.password || false}
              isFocused={focusedField === 'password'}
              showToggle
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={() => handleFocus('password')}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 transition-all duration-300 ${
                        level <= passwordStrength.level ? passwordStrength.color : ''
                      }`}
                      style={{
                        backgroundColor: level <= passwordStrength.level ? undefined : 'var(--color-border)',
                        borderRadius: 'var(--border-radius-sm)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Força: {passwordStrength.text}
                </p>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <InputField
            name="confirmPassword"
            label="Confirmar senha"
            placeholder="••••••••"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            isTouched={touched.confirmPassword || false}
            isFocused={focusedField === 'confirmPassword'}
            showToggle
            isVisible={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={() => handleFocus('confirmPassword')}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />

          {/* Match indicator */}
          {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
            <p className="text-xs pl-1 flex items-center gap-1 animate-fade-in text-green-500 -mt-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Senhas coincidem
            </p>
          )}

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group pt-2">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)}
                className="sr-only"
              />
              <div
                className="w-5 h-5 flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: acceptTerms ? 'var(--color-primary)' : 'var(--color-surface)',
                  border: `2px solid ${acceptTerms ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--border-radius-sm)',
                }}
              >
                {acceptTerms && (
                  <svg className="w-3 h-3 animate-scale-in" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Aceito os{' '}
              <a href="#" className="font-medium hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                Termos de Uso
              </a>
              {' '}e a{' '}
              <a href="#" className="font-medium hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                Política de Privacidade
              </a>
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !acceptTerms}
            className={`
              relative w-full py-4 font-semibold text-base overflow-hidden mt-6
              transition-all duration-300
              ${isLoading || !acceptTerms ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg hover:shadow-[var(--color-primary)]/25 hover:-translate-y-0.5 active:translate-y-0'}
            `}
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              color: 'var(--color-accent)',
              borderRadius: 'var(--border-radius-md)',
            }}
          >
            {!isLoading && acceptTerms && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
              </div>
            )}

            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          {/* Login Link */}
          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
            Já tem uma conta?{' '}
            <a
              href="/login"
              className="font-semibold transition-opacity duration-300 hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Entrar
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
          animation: scale-in 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
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

export default FormRegister;