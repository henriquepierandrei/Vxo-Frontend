// pages/Dashboard/DashboardStart.tsx
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  LayoutDashboard,
  Eye,
  Zap,
  CreditCard,
  Image,
  Link,
  LogOut,
  Bell,
  Sparkles,
  Crown,
  CheckCircle,
  Palette,
  BookImage,
  EyeOff,
  Globe,
  Target,
  Flame,
  Gift,
  Copy,
  Settings,
  TrendingUp,
  ExternalLink,
  Rocket,
  Wand2,
  Tags,
  Store,
  X,
  Trophy,
  CircleGauge,
  RefreshCw,
  Loader2,
  AlertCircle,
  Star,
  PartyPopper,
  Sun,
  Moon,
  Sunrise,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../contexts/UserContext";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLevel?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  path: string;
  description?: string;
}

interface PremiumFeature {
  id: string;
  name: string;
  icon: React.ElementType;
  available: boolean;
}

interface RankingLevel {
  level: number;
  title: string;
  viewsRequired: number;
  emoji: string;
  color: string;
  apiKey: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ElementType;
  color: string;
}

// ═══════════════════════════════════════════════════════════
// RANKING LEVELS
// ═══════════════════════════════════════════════════════════

const RANKING_LEVELS: RankingLevel[] = [
  { level: 1, title: "Iniciante", viewsRequired: 0, emoji: "🔰", color: "#10B981", apiKey: "BEGINNER" },
  { level: 2, title: "Popular", viewsRequired: 1000, emoji: "🚀", color: "#3B82F6", apiKey: "POPULAR" },
  { level: 3, title: "Influente", viewsRequired: 5000, emoji: "⭐", color: "#F59E0B", apiKey: "INFLUENTIAL" },
  { level: 4, title: "Famoso", viewsRequired: 20000, emoji: "🔥", color: "#EF4444", apiKey: "FAMOUS" },
  { level: 5, title: "Celebridade", viewsRequired: 100000, emoji: "👑", color: "#8B5CF6", apiKey: "CELEBRITY" },
];

const getLevelByApiKey = (apiKey: string): RankingLevel => {
  return RANKING_LEVELS.find(l => l.apiKey === apiKey) || RANKING_LEVELS[0];
};

const getUserLevel = (views: number): RankingLevel => {
  for (let i = RANKING_LEVELS.length - 1; i >= 0; i--) {
    if (views >= RANKING_LEVELS[i].viewsRequired) {
      return RANKING_LEVELS[i];
    }
  }
  return RANKING_LEVELS[0];
};

const getNextLevel = (currentLevel: RankingLevel): RankingLevel | null => {
  const nextLevelIndex = RANKING_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  return nextLevelIndex < RANKING_LEVELS.length ? RANKING_LEVELS[nextLevelIndex] : null;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
  return num.toString();
};

const getGreeting = (): { text: string; icon: React.ElementType } => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Bom dia", icon: Sunrise };
  if (hour >= 12 && hour < 18) return { text: "Boa tarde", icon: Sun };
  return { text: "Boa noite", icon: Moon };
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return "Data desconhecida";
  }
};

const getDaysSinceCreation = (dateString: string): number => {
  try {
    const created = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

// ═══════════════════════════════════════════════════════════
// DADOS ESTÁTICOS
// ═══════════════════════════════════════════════════════════

const QUICK_ACTIONS: QuickAction[] = [
  { id: "profile", label: "Roleta", icon: CircleGauge, color: "var(--color-primary)", path: "/dashboard/roulette", description: "Gire e ganhe prêmios" },
  { id: "store", label: "Loja", icon: Store, color: "#F59E0B", path: "/dashboard/store", description: "Compre itens exclusivos" },
  { id: "links", label: "Links", icon: Link, color: "#3B82F6", path: "/dashboard/links", description: "Gerencie seus links" },
  { id: "images", label: "Mídia", icon: Image, color: "#10B981", path: "/dashboard/customization", description: "Personalize seu perfil" },
  { id: "tags", label: "Tags", icon: Tags, color: "#12818B", path: "/dashboard/tags", description: "Configure suas tags" },
  { id: "settings", label: "Config", icon: Settings, color: "#6366F1", path: "/dashboard/settings", description: "Ajuste suas preferências" },
];

const PREMIUM_FEATURES: PremiumFeature[] = [
  { id: "frame", name: "Moldura", icon: Image, available: false },
  { id: "premium-tag", name: "Tag premium", icon: Crown, available: false },
  { id: "verified-tag", name: "Tag verificado", icon: CheckCircle, available: false },
  { id: "neon-card", name: "Neon no card", icon: Sparkles, available: false },
  { id: "neon-color", name: "Cor do Neon", icon: Palette, available: false },
  { id: "favicon", name: "Favicon", icon: Globe, available: false },
  { id: "album", name: "Album de fotos", icon: BookImage, available: false },
  { id: "hide-views", name: "Ocultar Views", icon: EyeOff, available: false },
];

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

const DashboardCard = ({
  children,
  className = "",
  delay = 0,
  minHeight,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  minHeight?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    className={`bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-5 lg:p-6 ${className}`}
    style={{ minHeight }}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  action,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3 mb-4 lg:mb-5 min-h-[40px]">
    <div className="flex items-center gap-2.5">
      <div className="p-2 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 shrink-0">
        <Icon size={18} className="text-[var(--color-primary)]" />
      </div>
      <h2 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">
        {title}
      </h2>
    </div>
    {action}
  </div>
);

// ═══════════════════════════════════════════════════════════
// MASCOTE ANIMADO
// ═══════════════════════════════════════════════════════════

const AnimatedMascot = ({ isPremium }: { isPremium: boolean }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }}
      className="relative"
    >
      {/* Círculos decorativos de fundo */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent blur-xl"
      />

      {/* Container do mascote */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-28 h-28 sm:w-36 sm:h-36"
      >
        {/* Corpo principal */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-2xl shadow-[var(--color-primary)]/30">
          {/* Brilho */}
          <div className="absolute top-2 left-4 w-6 h-6 rounded-full bg-white/30 blur-sm" />

          {/* Olhos */}
          <motion.div
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 4
            }}
            className="absolute top-1/3 left-1/4 flex gap-4"
          >
            <div className="w-4 h-5 sm:w-5 sm:h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[var(--color-background)] rounded-full" />
            </div>
            <div className="w-4 h-5 sm:w-5 sm:h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[var(--color-background)] rounded-full" />
            </div>
          </motion.div>

          {/* Boca sorrindo */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-8 h-4 sm:w-10 sm:h-5"
          >
            <div className="w-full h-full border-b-4 border-white rounded-b-full" />
          </motion.div>

          {/* Bochechas */}
          <div className="absolute bottom-8 sm:bottom-10 left-3 w-3 h-2 sm:w-4 sm:h-3 bg-pink-300/50 rounded-full blur-sm" />
          <div className="absolute bottom-8 sm:bottom-10 right-3 w-3 h-2 sm:w-4 sm:h-3 bg-pink-300/50 rounded-full blur-sm" />
        </div>

        {/* Coroa para premium */}
        {isPremium && (
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <Crown size={28} className="text-amber-400 drop-shadow-lg" />
          </motion.div>
        )}

        {/* Estrelinhas flutuando */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 5, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles size={16} className="text-amber-400" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            x: [0, -5, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 1
          }}
          className="absolute -top-4 -left-2"
        >
          <Star size={14} className="text-[var(--color-primary)]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// WELCOME HERO SECTION
// ═══════════════════════════════════════════════════════════

const WelcomeHero = ({
  name,
  isPremium,
  level,
  coins,
  daysSinceCreation
}: {
  name: string;
  isPremium: boolean;
  level: RankingLevel;
  coins: number;
  daysSinceCreation: number;
}) => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const motivationalMessages = [
    "Pronto para brilhar hoje?",
    "Vamos conquistar novos seguidores!",
    "Seu perfil está incrível!",
    "Continue crescendo!",
    "O sucesso te espera!",
  ];

  const randomMessage = useMemo(() =>
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
    []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--card-background-glass)] to-[var(--color-primary)]/5 backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-xl)] p-6 sm:p-8 mb-6"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-primary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
        {/* Mascote */}
        <div className="shrink-0">
          <AnimatedMascot isPremium={isPremium} />
        </div>

        {/* Conteúdo de boas-vindas */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center lg:justify-start gap-2 mb-2"
          >
            <GreetingIcon size={20} className="text-amber-400" />
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              {greeting.text}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-2"
          >
            Olá, <span className="text-[var(--color-primary)]">{name}</span>!
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block ml-2"
            >
              👋
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-[var(--color-text-muted)] mb-4"
          >
            {randomMessage}
          </motion.p>

          {/* Tags de status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-2"
          >
            {/* Level Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${level.color}20`,
                color: level.color,
                border: `1px solid ${level.color}40`
              }}
            >
              <span>{level.emoji}</span>
              <span>{level.title}</span>
            </div>

            {/* Coins Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
              <Zap size={12} />
              <span>{coins} Vcoins</span>
            </div>

            {/* Premium Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isPremium
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
              }`}>
              {isPremium ? <Crown size={12} /> : <CreditCard size={12} />}
              <span>{isPremium ? 'Premium' : 'Grátis'}</span>
            </div>

            {/* Days Badge */}
            {daysSinceCreation > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-medium border border-[var(--color-border)]">
                <Flame size={12} className="text-orange-400" />
                <span>{daysSinceCreation} dias conosco</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Ação rápida */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="shrink-0"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/dashboard/customization"}
            className="flex items-center gap-2 px-5 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium shadow-lg shadow-[var(--color-primary)]/25 transition-colors"
          >
            <Wand2 size={18} />
            <span>Personalizar</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS DROPDOWN
// ═══════════════════════════════════════════════════════════

const NotificationsDropdown = ({
  isOpen,
  onClose,
  notifications,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={onClose}
          />

          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed sm:absolute right-4 sm:right-0 top-20 sm:top-full sm:mt-2 w-[calc(100%-2rem)] sm:w-96 max-h-[70vh] bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--border-radius-xl)] shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[var(--color-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary)] text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[var(--border-radius-sm)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <X size={16} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-80">
              {notifications.length > 0 ? (
                <div className="divide-y divide-[var(--color-border)]">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-[var(--color-surface)] transition-colors cursor-pointer ${!notification.read ? "bg-[var(--color-primary)]/5" : ""
                          }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className="p-2 rounded-[var(--border-radius-md)] shrink-0 h-fit"
                            style={{ backgroundColor: `${notification.color}15` }}
                          >
                            <Icon size={16} style={{ color: notification.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-[var(--color-text)] truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-[var(--color-text-muted)] opacity-60 mt-1 block">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell size={32} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--color-text-muted)]">Nenhuma notificação</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-[var(--color-border)]">
                <button className="w-full py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-[var(--border-radius-md)] transition-colors">
                  Marcar todas como lidas
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════

const StatCardComponent = ({ stat, index }: { stat: StatCard; index: number }) => {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-5 group cursor-pointer min-h-[120px]"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${stat.color}15, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between h-full">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-2">
            {stat.isLevel ? (
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
                  {stat.value}
                </p>
              </div>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
              </p>
            )}
            {stat.trend && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${stat.trend.isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
              >
                <TrendingUp
                  size={12}
                  className={stat.trend.isPositive ? "" : "rotate-180"}
                />
                {stat.trend.value}%
              </span>
            )}
          </div>
        </div>

        <div
          className="p-2.5 rounded-[var(--border-radius-md)] transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: stat.bgColor }}
        >
          <Icon size={20} style={{ color: stat.color }} />
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// PROFILE CARD
// ═══════════════════════════════════════════════════════════

const ProfileCard = ({
  name,
  slug,
  isPremium,
  avatarUrl,
  level
}: {
  name: string;
  slug: string;
  isPremium: boolean;
  avatarUrl?: string;
  level: RankingLevel;
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`vxo.lat/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [slug]);

  return (
    <DashboardCard delay={0.1} minHeight="320px">
      <div className="flex flex-col h-full">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative mb-3"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--border-radius-lg)] object-cover shadow-xl"
                style={{ boxShadow: `0 10px 40px ${level.color}40` }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--border-radius-lg)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl shadow-[var(--color-primary)]/25"
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-[var(--border-radius-sm)] border-[3px] border-[var(--color-background)] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </motion.div>

          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">{name}</h3>
          <p className="text-sm text-[var(--color-text-muted)]">@{slug}</p>

          {/* Account Badge */}
          <div className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isPremium
              ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'
              : 'bg-[var(--color-surface)] border-[var(--color-border)]'
            }`}>
            {isPremium ? (
              <Crown size={14} className="text-amber-400" />
            ) : (
              <CreditCard size={14} className="text-[var(--color-text-muted)]" />
            )}
            <span className={`text-xs font-medium ${isPremium ? 'text-amber-400' : 'text-[var(--color-text-muted)]'}`}>
              {isPremium ? 'Premium' : 'Conta Grátis'}
            </span>
          </div>
        </div>

        {/* Profile Link */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]">
            <Globe size={16} className="text-[var(--color-primary)] shrink-0" />
            <span className="text-sm text-[var(--color-text)] truncate flex-1">vxo.lat/{slug}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="p-1.5 rounded-[var(--border-radius-sm)] hover:bg-[var(--color-background)] transition-colors shrink-0"
            >
              {copied ? (
                <CheckCircle size={16} className="text-emerald-400" />
              ) : (
                <Copy size={16} className="text-[var(--color-text-muted)]" />
              )}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <motion.button
              onClick={() => navigate("/dashboard/profile")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-medium transition-colors"
            >
              <Eye size={16} />
              Ver Perfil
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-sm font-medium border border-[var(--color-border)] transition-colors"
            >
              <LogOut size={16} />
              Sair
            </motion.button>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// QUICK ACTIONS - ENHANCED
// ═══════════════════════════════════════════════════════════

const QuickActionsCard = () => {
  const navigate = useNavigate();

  return (
    <DashboardCard delay={0.15} minHeight="160px">
      <SectionHeader icon={Zap} title="Ações Rápidas" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="relative flex flex-col items-center gap-2 p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all group overflow-hidden"
            >
              {/* Hover glow effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${action.color}10, transparent 70%)`
                }}
              />

              <div
                className="relative p-3 rounded-[var(--border-radius-md)] transition-all group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  backgroundColor: `${action.color}15`,
                  boxShadow: `0 0 0 0 ${action.color}00`
                }}
              >
                <Icon size={20} style={{ color: action.color }} />
              </div>
              <span className="relative text-xs font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors text-center leading-tight">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// RANKING CARD
// ═══════════════════════════════════════════════════════════

const RankingCard = ({ currentLevel, views }: { currentLevel: RankingLevel; views: number }) => {
  const nextLevel = getNextLevel(currentLevel);

  const progressToNext = nextLevel
    ? ((views - currentLevel.viewsRequired) /
      (nextLevel.viewsRequired - currentLevel.viewsRequired)) *
    100
    : 100;

  return (
    <DashboardCard delay={0.3} minHeight="380px">
      <SectionHeader icon={Trophy} title="Ranking de Views" />

      {/* Current Level Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-5 p-4 rounded-[var(--border-radius-lg)] border-2 text-center"
        style={{
          borderColor: currentLevel.color,
          background: `linear-gradient(135deg, ${currentLevel.color}10, transparent)`,
        }}
      >
        <span className="text-4xl mb-2 block">{currentLevel.emoji}</span>
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{currentLevel.title}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Level {currentLevel.level}</p>

        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-2">
              <span>{formatNumber(views)} views</span>
              <span>{formatNumber(nextLevel.viewsRequired)} views</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, progressToNext))}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: currentLevel.color }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Faltam {formatNumber(Math.max(0, nextLevel.viewsRequired - views))} views para{" "}
              <span style={{ color: nextLevel.color }}>{nextLevel.title}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* All Levels */}
      <div className="space-y-2">
        {RANKING_LEVELS.map((level, index) => {
          const isUnlocked = views >= level.viewsRequired;
          const isCurrent = currentLevel.level === level.level;

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] border transition-all ${isCurrent
                  ? "border-2"
                  : isUnlocked
                    ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] opacity-50"
                }`}
              style={{
                borderColor: isCurrent ? level.color : undefined,
                background: isCurrent ? `${level.color}10` : undefined,
              }}
            >
              <span className="text-xl w-8 text-center">{level.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-text)]">{level.title}</span>
                  {isCurrent && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${level.color}20`, color: level.color }}
                    >
                      Atual
                    </span>
                  )}
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {level.viewsRequired === 0 ? "0" : formatNumber(level.viewsRequired)} views
                </span>
              </div>
              <div className="shrink-0">
                {isUnlocked ? (
                  <CheckCircle size={18} style={{ color: level.color }} />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-[var(--color-border)]" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// GOAL PROGRESS
// ═══════════════════════════════════════════════════════════

const GoalProgress = ({ views, currentLevel }: { views: number; currentLevel: RankingLevel }) => {
  const nextLevel = getNextLevel(currentLevel);
  const goal = nextLevel?.viewsRequired || currentLevel.viewsRequired;
  const progress = nextLevel ? Math.min(((views - currentLevel.viewsRequired) / (goal - currentLevel.viewsRequired)) * 100, 100) : 100;

  return (
    <DashboardCard delay={0.45} minHeight="140px">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 shrink-0">
          <Target size={24} className="text-[var(--color-primary)]" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Meta de Visualizações</h3>
            <span className="text-sm font-medium text-[var(--color-primary)]">
              {formatNumber(views)}/{formatNumber(goal)}
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, progress)}%` }}
              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs text-[var(--color-text-muted)]">
              {nextLevel
                ? `Faltam ${formatNumber(Math.max(0, goal - views))} views para o próximo nível!`
                : "Você alcançou o nível máximo! 🎉"}
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// PREMIUM SECTION
// ═══════════════════════════════════════════════════════════

const PremiumSection = ({ isPremium }: { isPremium: boolean }) => {
  const navigate = useNavigate();

  if (isPremium) {
    return (
      <DashboardCard delay={0.4} minHeight="120px">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--border-radius-md)] bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Crown size={24} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[var(--color-text)] flex items-center gap-2">
              Você é Premium!
              <PartyPopper size={18} className="text-amber-400" />
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Aproveite todos os recursos exclusivos disponíveis para você.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard/premium")}
            className="px-4 py-2 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-400 text-sm font-medium border border-amber-500/30 transition-all"
          >
            Ver benefícios
          </motion.button>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard delay={0.4} minHeight="180px">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Premium Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-[var(--border-radius-md)] bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Crown size={22} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">
                Atualize para Premium
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                Desbloqueie todos os recursos exclusivos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PREMIUM_FEATURES.slice(0, 6).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                >
                  <Icon size={12} />
                  <span className="text-xs">{feature.name}</span>
                </motion.div>
              );
            })}
            <div className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[var(--color-text-muted)]">
              +{PREMIUM_FEATURES.length - 6} mais
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-col shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard/premium")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold transition-all shadow-lg shadow-amber-500/25"
          >
            <Sparkles size={18} />
            Assinar Premium
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard/premium")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-sm font-medium border border-[var(--color-border)] transition-colors"
          >
            Ver benefícios
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// ACTIVITY FEED (substitui os top links)
// ═══════════════════════════════════════════════════════════


const ActivityFeed = ({ receiveGifts, isPremium }: { receiveGifts: boolean; isPremium: boolean }) => {
  const activities = [
    {
      id: "1",
      icon: Sparkles,
      color: "var(--color-primary)",
      title: "Perfil criado",
      description: "Bem-vindo ao VXO!",
      time: "Agora",
    },
    {
      id: "2",
      icon: Gift,
      color: "#10B981",
      title: receiveGifts ? "Presentes ativados" : "Presentes desativados",
      description: receiveGifts ? "Você pode receber presentes" : "Ative para receber presentes",
      time: "Configuração",
    },
    {
      id: "3",
      icon: isPremium ? Crown : Rocket,
      color: isPremium ? "#F59E0B" : "#6366F1",
      title: isPremium ? "Conta Premium" : "Pronto para crescer",
      description: isPremium ? "Recursos exclusivos liberados" : "Compartilhe seu perfil",
      time: "Dica",
    },
  ];

  return (
    <DashboardCard delay={0.25} minHeight="280px">
      <SectionHeader
        icon={Rocket}
        title="Atividade Recente"
        action={
          <span className="text-xs text-[var(--color-text-muted)]">
            Últimas atualizações
          </span>
        }
      />

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <div
                className="p-2 rounded-[var(--border-radius-sm)] shrink-0"
                style={{ backgroundColor: `${activity.color}15` }}
              >
                <Icon size={16} style={{ color: activity.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)]">{activity.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{activity.description}</p>
              </div>
              <span className="text-xs text-[var(--color-text-muted)] shrink-0">{activity.time}</span>
            </motion.div>
          );
        })}
      </div>

      {/* CTA para compartilhar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 p-4 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-surface)] to-transparent border border-[var(--color-primary)]"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[var(--color-primary)]">
            <ExternalLink size={16} className="text-[var(--color-primary)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">Compartilhe seu perfil</p>
            <p className="text-xs text-[var(--color-text-muted)]">Ganhe mais visualizações</p>
          </div>
        

        </div>
      </motion.div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const DashboardStart = () => {
  const navigate = useNavigate();
  const { profileData, isLoadingProfile, refreshProfile } = useProfile();



  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dados derivados do perfil
  const userLevel = useMemo(() => {
    if (!profileData) return RANKING_LEVELS[0];
    return getLevelByApiKey(profileData.level);
  }, [profileData]);

  const views = 0; // A API não retorna views, então usamos 0 por padrão

  const daysSinceCreation = useMemo(() => {
    if (!profileData) return 0;
    return getDaysSinceCreation(profileData.createdAt);
  }, [profileData]);

  // Stats dinâmicos baseados nos dados da API
  const stats: StatCard[] = useMemo(() => {
    if (!profileData) return [];

    return [
      {
        id: "views",
        label: "Visualizações",
        value: views,
        icon: Eye,
        color: "var(--color-primary)",
        bgColor: "var(--color-primary-10)",
        trend: { value: 0, isPositive: true },
      },
      {
        id: "level",
        label: "Seu Level",
        value: `${userLevel.emoji} ${userLevel.title}`,
        icon: Trophy,
        color: userLevel.color,
        bgColor: `${userLevel.color}15`,
        isLevel: true,
      },
      {
        id: "vcoins",
        label: "Vcoins",
        value: profileData.coins,
        icon: Zap,
        color: "#F59E0B",
        bgColor: "rgba(245, 158, 11, 0.1)",
      },
      {
        id: "premium",
        label: "Plano",
        value: profileData.isPremium ? "Premium" : "Grátis",
        icon: profileData.isPremium ? Crown : CreditCard,
        color: profileData.isPremium ? "#F59E0B" : "#10B981",
        bgColor: profileData.isPremium ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
      },
    ];
  }, [profileData, userLevel, views]);

  // Notificações dinâmicas
  const notifications: Notification[] = useMemo(() => {
    if (!profileData) return [];

    const notifs: Notification[] = [
      {
        id: "1",
        title: `Bem-vindo, ${profileData.name}!`,
        message: "Seu perfil foi criado com sucesso. Personalize-o agora!",
        time: "Agora",
        read: false,
        icon: Sparkles,
        color: "var(--color-primary)",
      },
    ];

    if (!profileData.isPremium) {
      notifs.push({
        id: "2",
        title: "Torne-se Premium",
        message: "Desbloqueie recursos exclusivos e destaque-se!",
        time: "Sugestão",
        read: false,
        icon: Crown,
        color: "#F59E0B",
      });
    }

    if (profileData.coins > 0) {
      notifs.push({
        id: "3",
        title: `Você tem ${profileData.coins} Vcoins`,
        message: "Use suas moedas na loja para itens especiais!",
        time: "Loja",
        read: true,
        icon: Zap,
        color: "#F59E0B",
      });
    }

    return notifs;
  }, [profileData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfile]);

  // Loading State
  if (isLoadingProfile && !profileData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-[var(--color-primary)]" />
          <p className="text-[var(--color-text-muted)]">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!profileData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Erro ao carregar perfil
          </h2>
          <p className="text-[var(--color-text-muted)] mb-4">
            Não foi possível carregar seus dados.
          </p>
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 mx-auto rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium text-sm transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRefreshing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            Tentar Novamente
          </motion.button>
        </div>
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
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--color-text-muted)] mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap pb-2 min-h-[24px]"
        >
          <span>Dashboard</span>
          <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px] shrink-0" />
          <span className="text-[var(--color-text)]">Visão Geral</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10">
              <LayoutDashboard className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
                Visão Geral
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingProfile}
              className="p-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Atualizar dados"
            >
              <RefreshCw size={18} className={(isRefreshing || isLoadingProfile) ? "animate-spin" : ""} />
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-medium transition-colors shrink-0"
              >
                <Bell size={16} />
                <span className="hidden sm:inline">Notificações</span>
                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full bg-red-500 text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <NotificationsDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Welcome Hero with Mascot */}
      <WelcomeHero
        name={profileData.name}
        isPremium={profileData.isPremium}
        level={userLevel}
        coins={profileData.coins}
        daysSinceCreation={daysSinceCreation}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCardComponent key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActionsCard />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <ProfileCard
            name={profileData.name}
            slug={profileData.slug}
            isPremium={profileData.isPremium}
            avatarUrl={profileData.pageSettings?.mediaUrls?.profileImageUrl}
            level={userLevel}
          />
          <GoalProgress views={views} currentLevel={userLevel} />
        </div>

        {/* Center Column - Activity Feed (substituindo top links) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <ActivityFeed
            receiveGifts={profileData.receiveGifts}
            isPremium={profileData.isPremium}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <RankingCard currentLevel={userLevel} views={views} />
        </div>
      </div>

      {/* Premium Section */}
      <div className="mt-6">
        <PremiumSection isPremium={profileData.isPremium} />
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 sm:p-5 rounded-[var(--border-radius-lg)] bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] min-h-[72px]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-[var(--color-text-muted)]">Online agora</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2">
              <Gift size={14} />
              <span>Membro desde {formatDate(profileData.createdAt)}</span>
            </div>
            {daysSinceCreation > 0 && (
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-orange-400" />
                <span>{daysSinceCreation} dias conosco</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardStart;