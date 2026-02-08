// pages/Settings/Settings.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Gift,
  Shield,
  Calendar,
  Crown,
  ChevronRight,
  Sparkles,
  Frame,
  BadgeCheck,
  Verified,
  Zap,
  Palette,
  Image,
  Images,
  Eye,
  EyeOff,
  Fingerprint,
  Settings as SettingsIcon,
  User,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useProfile } from "../../contexts/UserContext";
import api from "../../services/api"; // ajuste o path conforme seu projeto

// ═══════════════════════════════════════════════════════════
// ÍCONES CUSTOMIZADOS
// ═══════════════════════════════════════════════════════════

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

const Toggle = ({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <motion.button
    onClick={onChange}
    disabled={disabled}
    className={`
      relative w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-all duration-300 flex-shrink-0
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${enabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-hover)]"}
    `}
    whileTap={disabled ? {} : { scale: 0.95 }}
  >
    <motion.div
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
      animate={{ left: enabled ? 24 : 4 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </motion.button>
);

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  error?: string;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-4 py-3 rounded-[var(--border-radius-md)]
          bg-[var(--color-surface)] border transition-all duration-300
          text-[var(--color-text)] placeholder-[var(--color-text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
          ${Icon ? "pl-10" : ""}
          ${error
            ? "border-red-500/50 focus:border-red-500"
            : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
          }
        `}
      />
    </div>
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-[var(--color-background)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-xl)] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">{title}</h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>
            <div className="p-4 sm:p-6">{children}</div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const SettingsCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
    <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
      <Icon size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)]" />
    </div>
    <div className="min-w-0">
      <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1">{description}</p>
    </div>
  </div>
);

const SettingsRow = ({
  icon: Icon,
  title,
  description,
  action,
  isLast = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: React.ReactNode;
  isLast?: boolean;
}) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4 ${!isLast ? "border-b border-[var(--color-border)]" : ""}`}
  >
    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
      <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] flex-shrink-0">
        <Icon size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--color-text-muted)]" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-[var(--color-text)]">{title}</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{description}</p>
      </div>
    </div>
    <div className="flex justify-end sm:justify-start flex-shrink-0">{action}</div>
  </div>
);

const ConnectionCard = ({
  icon,
  name,
  description,
  connected,
  comingSoon = false,
  onConnect,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  connected: boolean;
  comingSoon?: boolean;
  onConnect: () => void;
}) => (
  <motion.div
    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-[var(--border-radius-md)] border transition-all duration-300 ${
      comingSoon
        ? "border-[var(--color-border)] bg-[var(--color-surface)] opacity-70"
        : connected
          ? "border-green-500/30 bg-green-500/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
    }`}
    whileHover={comingSoon ? {} : { scale: 1.01 }}
  >
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-medium text-[var(--color-text)]">{name}</h3>
          {comingSoon ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
              <Clock size={10} />
              Em breve
            </span>
          ) : connected ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
              <CheckCircle size={10} />
              Conectado
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
              Desconectado
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
      </div>
    </div>
    <motion.button
      onClick={comingSoon ? undefined : onConnect}
      disabled={comingSoon}
      className={`px-3 sm:px-4 py-2 rounded-[var(--border-radius-sm)] text-xs sm:text-sm font-medium transition-all duration-300 flex-shrink-0 w-full sm:w-auto ${
        comingSoon
          ? "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-not-allowed"
          : connected
            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
      }`}
      whileHover={comingSoon ? {} : { scale: 1.05 }}
      whileTap={comingSoon ? {} : { scale: 0.95 }}
    >
      {comingSoon ? "Em breve" : connected ? "Desconectar" : "Conectar"}
    </motion.button>
  </motion.div>
);

const PremiumFeature = ({
  icon: Icon,
  title,
  enabled,
  locked = true,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  enabled: boolean;
  locked?: boolean;
  onToggle: () => void;
}) => (
  <motion.div
    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-[var(--border-radius-sm)] border transition-all duration-300 ${
      locked
        ? "border-[var(--color-border)] bg-[var(--color-surface)] opacity-60"
        : enabled
          ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
    }`}
    whileHover={locked ? {} : { scale: 1.02 }}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${locked ? "text-[var(--color-text-muted)]" : "text-[var(--color-primary)]"}`} />
      <span className={`text-xs sm:text-sm font-medium ${locked ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"}`}>
        {title}
      </span>
    </div>
    {locked ? <Lock size={14} className="text-[var(--color-text-muted)]" /> : <Toggle enabled={enabled} onChange={onToggle} />}
  </motion.div>
);

const InfoBadge = ({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: "default" | "success" | "warning" | "error";
}) => {
  const variantStyles = {
    default: "bg-[var(--color-surface)] text-[var(--color-text)]",
    success: "bg-green-500/10 text-green-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    error: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
      <div className={`p-1.5 sm:p-2 rounded-full ${variantStyles[variant]} flex-shrink-0`}>
        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className="text-xs sm:text-sm font-semibold text-[var(--color-text)] truncate">{value}</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardSettings = () => {
  // ── Dados do perfil via Context ──────────────────────────
  const { profileData, isLoadingProfile } = useProfile();

  const displayName = profileData?.name || "Usuário";
  const profileUrl = profileData?.url || "usuario";
  const isPremium = profileData?.isPremium ?? false;

  // ── Estados locais ───────────────────────────────────────
  const [acceptGifts, setAcceptGifts] = useState<boolean>(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(false);

  // Sincroniza receiveGifts com o dado vindo da API
  useEffect(() => {
    if (profileData) {
      setAcceptGifts(profileData.receiveGifts ?? false);
    }
  }, [profileData]);

  // ── Modais ───────────────────────────────────────────────
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // ── Formulários ──────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({
    currentEmail: "",
    password: "",
    newEmail: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  // ── Premium features ────────────────────────────────────
  const [premiumFeatures, setPremiumFeatures] = useState({
    frame: false,
    premiumTag: false,
    verifiedTag: false,
    neonCard: false,
    neonColor: false,
    favicon: false,
    photoAlbum: false,
    hideViews: false,
    hideBrand: false,
  });

  const togglePremiumFeature = (feature: keyof typeof premiumFeatures) => {
    if (!isPremium) return;
    setPremiumFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }));
  };

  // ═══════════════════════════════════════════════════════════
  // HANDLER: Alterar E-mail  →  PUT /update/email
  // Body: { email, password, newEmail }
  // ═══════════════════════════════════════════════════════════
  const handleEmailSubmit = async () => {
    setFormErrors({});
    setApiError("");

    const errors: Record<string, string> = {};

    if (!emailForm.currentEmail) {
      errors.currentEmail = "Digite seu e-mail atual";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.currentEmail)) {
      errors.currentEmail = "E-mail inválido";
    }

    if (!emailForm.newEmail) {
      errors.newEmail = "Digite o novo e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      errors.newEmail = "E-mail inválido";
    }

    if (!emailForm.password) {
      errors.password = "Digite sua senha para confirmar";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put("/user/profile/update/email", {
        email: emailForm.currentEmail,
        password: emailForm.password,
        newEmail: emailForm.newEmail,
      });

      setSuccessMessage("E-mail alterado com sucesso!");

      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailForm({ currentEmail: "", password: "", newEmail: "" });
        setSuccessMessage("");
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erro ao alterar e-mail. Verifique os dados e tente novamente.";
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // HANDLER: Alterar Senha  →  PUT /user/profile/update/password
  // Body: { oldPassword, newPassword }
  // ═══════════════════════════════════════════════════════════
  const handlePasswordSubmit = async () => {
    setFormErrors({});
    setApiError("");

    const errors: Record<string, string> = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = "Digite sua senha atual";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "Digite a nova senha";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "A senha deve ter pelo menos 8 caracteres";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Confirme a nova senha";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put("/user/profile/update/password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccessMessage("Senha alterada com sucesso!");

      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setSuccessMessage("");
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erro ao alterar senha. Verifique os dados e tente novamente.";
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset modais ─────────────────────────────────────────
  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailForm({ currentEmail: "", password: "", newEmail: "" });
    setFormErrors({});
    setSuccessMessage("");
    setApiError("");
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setFormErrors({});
    setSuccessMessage("");
    setApiError("");
  };

  // ── Animações ────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ── Loading skeleton ────────────────────────────────────
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--color-text-muted)] mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap pb-2"
        >
          <span>Dashboard</span>
          <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
          <span>Ver Perfil</span>
          <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
          <span className="text-[var(--color-text)]">Configurações</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <SettingsIcon className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            Configurações da Conta
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-[var(--color-text-muted)] mt-1 sm:mt-2">
            Gerencie as configurações, a segurança e as preferências da sua conta.
          </p>
        </motion.div>
      </div>

      {/* Settings Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* ── Informações da Conta ───────────────────────── */}
        <motion.div variants={itemVariants}>
          <SettingsCard>
            <SectionHeader
              icon={User}
              title="Informações da Conta"
              description="Veja as informações importantes de sua conta nesta página."
            />

            <div className="space-y-0">
              <SettingsRow
                icon={Mail}
                title="E-mail"
                description="Altere o e-mail vinculado à sua conta."
                action={
                  <motion.button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Alterar
                    <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </motion.button>
                }
              />

              <SettingsRow
                icon={Lock}
                title="Senha"
                description="Mude a senha de sua conta."
                action={
                  <motion.button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Alterar
                    <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </motion.button>
                }
              />

              <SettingsRow
                icon={Gift}
                title="Receber Presentes"
                description={
                  acceptGifts
                    ? "Você ESTÁ aceitando presentes."
                    : "Você NÃO está aceitando presentes."
                }
                action={<Toggle enabled={acceptGifts} onChange={() => setAcceptGifts(!acceptGifts)} />}
                isLast
              />
            </div>
          </SettingsCard>
        </motion.div>

        {/* ── Conexões e Segurança ──────────────────────── */}
        <motion.div variants={itemVariants}>
          <SettingsCard>
            <SectionHeader
              icon={Shield}
              title="Conexões e Segurança"
              description="Vincule sua conta Vxo as redes disponíveis abaixo."
            />

            <div className="space-y-3">
              <ConnectionCard
                icon={<GoogleIcon />}
                name="Conta do Google"
                description="Conecte sua conta do Google para maior conectividade"
                connected={googleConnected}
                comingSoon={true}
                onConnect={() => setGoogleConnected(!googleConnected)}
              />
              <ConnectionCard
                icon={<DiscordIcon />}
                name="Conta do Discord"
                description="Conecte sua conta do Discord para obter recursos adicionais"
                connected={discordConnected}
                comingSoon={true}
                onConnect={() => setDiscordConnected(!discordConnected)}
              />
            </div>
          </SettingsCard>
        </motion.div>

        {/* ── Informações ───────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <SettingsCard>
            <SectionHeader
              icon={Fingerprint}
              title="Informações"
              description="Acompanhe as informações básicas de sua conta."
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <InfoBadge
                icon={Calendar}
                label="Criação"
                value={formatDate(profileData?.createdAt)}
              />
              <InfoBadge
                icon={Crown}
                label="Premium"
                value={isPremium ? "Ativo" : "Inativo"}
                variant={isPremium ? "success" : "error"}
              />
            </div>
          </SettingsCard>
        </motion.div>

        {/* ── Premium Section ───────────────────────────── */}
        <motion.div variants={itemVariants}>
          <SettingsCard
            className={`relative overflow-hidden ${!isPremium ? "border-[var(--color-primary)]/30" : "border-green-500/30"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-secondary)]/5 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex-shrink-0">
                    <Crown size={20} className="sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">
                      Melhore sua experiência
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1">
                      Desbloqueie recursos premium e destaque seu perfil.
                    </p>
                  </div>
                </div>

                {!isPremium && (
                  <motion.button
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/25"
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(143, 124, 255, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Obter Premium
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <PremiumFeature icon={Frame} title="Moldura" enabled={premiumFeatures.frame} locked={!isPremium} onToggle={() => togglePremiumFeature("frame")} />
                <PremiumFeature icon={BadgeCheck} title="Tag premium" enabled={premiumFeatures.premiumTag} locked={!isPremium} onToggle={() => togglePremiumFeature("premiumTag")} />
                <PremiumFeature icon={Verified} title="Tag verificado" enabled={premiumFeatures.verifiedTag} locked={!isPremium} onToggle={() => togglePremiumFeature("verifiedTag")} />
                <PremiumFeature icon={Zap} title="Neon no card" enabled={premiumFeatures.neonCard} locked={!isPremium} onToggle={() => togglePremiumFeature("neonCard")} />
                <PremiumFeature icon={Palette} title="Cor do Neon" enabled={premiumFeatures.neonColor} locked={!isPremium} onToggle={() => togglePremiumFeature("neonColor")} />
                <PremiumFeature icon={Image} title="Favicon" enabled={premiumFeatures.favicon} locked={!isPremium} onToggle={() => togglePremiumFeature("favicon")} />
                <PremiumFeature icon={Images} title="Album de fotos" enabled={premiumFeatures.photoAlbum} locked={!isPremium} onToggle={() => togglePremiumFeature("photoAlbum")} />
                <PremiumFeature icon={EyeOff} title="Ocultar Views" enabled={premiumFeatures.hideViews} locked={!isPremium} onToggle={() => togglePremiumFeature("hideViews")} />
                <PremiumFeature icon={Eye} title="Ocultar Marca" enabled={premiumFeatures.hideBrand} locked={!isPremium} onToggle={() => togglePremiumFeature("hideBrand")} />
              </div>

              {!isPremium && (
                <motion.div
                  className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border border-[var(--color-primary)/30]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Sparkles size={18} className="sm:w-5 sm:h-5 text-[var(--color-primary)] flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                      <span className="text-[var(--color-text)] font-medium">Desbloqueie todos os recursos</span>{" "}
                      e personalize seu perfil do seu jeito!
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </SettingsCard>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODAL: Alterar E-mail                                      */}
      {/* PUT /user/profile/update/email  →  { email, password, newEmail }        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal isOpen={isEmailModalOpen} onClose={handleCloseEmailModal} title="Alterar E-mail">
        {successMessage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <p className="text-lg font-semibold text-[var(--color-text)]">{successMessage}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Para alterar seu e-mail, preencha os campos abaixo e confirme com sua senha.
            </p>

            {/* Erro da API */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-[var(--border-radius-sm)] bg-red-500/10 border border-red-500/30 flex items-center gap-2"
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-400">{apiError}</p>
              </motion.div>
            )}

            <Input
              label="E-mail Atual"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={emailForm.currentEmail}
              onChange={(value) => setEmailForm({ ...emailForm, currentEmail: value })}
              icon={Mail}
              error={formErrors.currentEmail}
            />

            <Input
              label="Novo E-mail"
              type="email"
              placeholder="novoemail@exemplo.com"
              value={emailForm.newEmail}
              onChange={(value) => setEmailForm({ ...emailForm, newEmail: value })}
              icon={Mail}
              error={formErrors.newEmail}
            />

            <Input
              label="Confirme sua Senha"
              type="password"
              placeholder="Digite sua senha atual"
              value={emailForm.password}
              onChange={(value) => setEmailForm({ ...emailForm, password: value })}
              icon={Lock}
              error={formErrors.password}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <motion.button
                onClick={handleCloseEmailModal}
                className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={handleEmailSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Alterando...
                  </>
                ) : (
                  "Confirmar Alteração"
                )}
              </motion.button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODAL: Alterar Senha                                       */}
      {/* PUT /user/profile/update/password  →  { oldPassword, newPassword }      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal isOpen={isPasswordModalOpen} onClose={handleClosePasswordModal} title="Alterar Senha">
        {successMessage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <p className="text-lg font-semibold text-[var(--color-text)]">{successMessage}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Para sua segurança, digite sua senha atual antes de criar uma nova.
            </p>

            {/* Erro da API */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-[var(--border-radius-sm)] bg-red-500/10 border border-red-500/30 flex items-center gap-2"
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-400">{apiError}</p>
              </motion.div>
            )}

            <Input
              label="Senha Atual"
              type="password"
              placeholder="Digite sua senha atual"
              value={passwordForm.oldPassword}
              onChange={(value) => setPasswordForm({ ...passwordForm, oldPassword: value })}
              icon={Lock}
              error={formErrors.oldPassword}
            />

            <div className="h-px bg-[var(--color-border)] my-2" />

            <Input
              label="Nova Senha"
              type="password"
              placeholder="Digite a nova senha"
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
              icon={Lock}
              error={formErrors.newPassword}
            />

            <Input
              label="Confirmar Nova Senha"
              type="password"
              placeholder="Confirme a nova senha"
              value={passwordForm.confirmPassword}
              onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
              icon={Lock}
              error={formErrors.confirmPassword}
            />

            {/* Password requirements */}
            <div className="p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
              <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">A senha deve conter:</p>
              <ul className="space-y-1">
                {[
                  { text: "Mínimo de 8 caracteres", valid: passwordForm.newPassword.length >= 8 },
                  {
                    text: "Letras e números",
                    valid: /[a-zA-Z]/.test(passwordForm.newPassword) && /[0-9]/.test(passwordForm.newPassword),
                  },
                  {
                    text: "Senhas coincidem",
                    valid:
                      passwordForm.newPassword === passwordForm.confirmPassword &&
                      passwordForm.confirmPassword.length > 0,
                  },
                ].map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    {req.valid ? (
                      <CheckCircle size={12} className="text-green-400" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-[var(--color-text-muted)]" />
                    )}
                    <span className={req.valid ? "text-green-400" : "text-[var(--color-text-muted)]"}>
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <motion.button
                onClick={handleClosePasswordModal}
                className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={handlePasswordSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Alterando...
                  </>
                ) : (
                  "Confirmar Alteração"
                )}
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardSettings;