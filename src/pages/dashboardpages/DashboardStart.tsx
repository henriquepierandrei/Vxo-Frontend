import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  LayoutDashboard,
  Eye,
  Zap,
  Award,
  CreditCard,
  User,
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
  ArrowUpRight,
  Copy,
  Settings,
  TrendingUp,
  MousePointerClick,
  Lightbulb,
  ExternalLink,
  Heart,
  MessageCircle,
  Rocket,
  Wand2,
  Tags,
  Store,
  X,
  Trophy,
  CircleGauge,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
}

interface RecentLink {
  id: string;
  title: string;
  url: string;
  clicks: number;
  icon: React.ElementType;
}

interface PremiumFeature {
  id: string;
  name: string;
  icon: React.ElementType;
  available: boolean;
}

interface Tip {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface RankingLevel {
  level: number;
  title: string;
  viewsRequired: number;
  emoji: string;
  color: string;
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
  { level: 1, title: "Iniciante", viewsRequired: 0, emoji: "🔰", color: "#10B981" },
  { level: 2, title: "Popular", viewsRequired: 1000, emoji: "🚀", color: "#3B82F6" },
  { level: 3, title: "Influente", viewsRequired: 5000, emoji: "⭐", color: "#F59E0B" },
  { level: 4, title: "Famoso", viewsRequired: 20000, emoji: "🔥", color: "#EF4444" },
  { level: 5, title: "Celebridade", viewsRequired: 100000, emoji: "👑", color: "#8B5CF6" },
];

const getUserLevel = (views: number): RankingLevel => {
  for (let i = RANKING_LEVELS.length - 1; i >= 0; i--) {
    if (views >= RANKING_LEVELS[i].viewsRequired) {
      return RANKING_LEVELS[i];
    }
  }
  return RANKING_LEVELS[0];
};

const getNextLevel = (views: number): RankingLevel | null => {
  const currentLevel = getUserLevel(views);
  const nextLevelIndex = RANKING_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  return nextLevelIndex < RANKING_LEVELS.length ? RANKING_LEVELS[nextLevelIndex] : null;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
  return num.toString();
};

// ═══════════════════════════════════════════════════════════
// DADOS DE EXEMPLO
// ═══════════════════════════════════════════════════════════

const USER_VIEWS = 204;
const userLevel = getUserLevel(USER_VIEWS);

const STATS: StatCard[] = [
  {
    id: "views",
    label: "Visualizações",
    value: USER_VIEWS,
    icon: Eye,
    color: "var(--color-primary)",
    bgColor: "var(--color-primary-10)",
    trend: { value: 12, isPositive: true },
  },
  {
    id: "level",
    label: "Seu Level",
    value: userLevel.title,
    icon: Trophy,
    color: userLevel.color,
    bgColor: `${userLevel.color}15`,
    isLevel: true,
  },
  {
    id: "vcoins",
    label: "Vcoins",
    value: 150,
    icon: Zap,
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  {
    id: "badges",
    label: "Itens",
    value: 3,
    icon: Award,
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.1)",
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: "profile", label: "Roleta", icon: CircleGauge, color: "var(--color-primary)", path: "/dashboard/roulette" },
  { id: "store", label: "Loja", icon: Store, color: "#F59E0B", path: "/dashboard/store" },
  { id: "links", label: "Editar Links", icon: Link, color: "#3B82F6", path: "/dashboard/links" },
  { id: "images", label: "Editar Mídia", icon: Image, color: "#10B981", path: "/dashboard/customization" },
  { id: "tags", label: "Tags", icon: Tags, color: "#12818B", path: "/dashboard/tags" },
  { id: "settings", label: "Configurações", icon: Settings, color: "#6366F1", path: "/dashboard/settings" },
];

const RECENT_LINKS: RecentLink[] = [
  { id: "1", title: "Instagram", url: "instagram.com/hpf", clicks: 45, icon: Heart },
  { id: "2", title: "Discord", url: "discord.gg/hpf", clicks: 32, icon: MessageCircle },
  { id: "3", title: "GitHub", url: "github.com/hpf", clicks: 12, icon: ExternalLink },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Bem-vindo ao VXO!",
    message: "Seu perfil foi criado com sucesso. Personalize-o agora!",
    time: "Agora",
    read: false,
    icon: Sparkles,
    color: "var(--color-primary)",
  },
  {
    id: "2",
    title: "Novo nível disponível",
    message: "Você está a 796 views de alcançar o nível Emergente!",
    time: "2h atrás",
    read: false,
    icon: Rocket,
    color: "#3B82F6",
  },
  {
    id: "3",
    title: "Dica de crescimento",
    message: "Compartilhe seu perfil nas redes sociais para mais views.",
    time: "1 dia atrás",
    read: true,
    icon: Lightbulb,
    color: "#F59E0B",
  },
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

const TIPS: Tip[] = [
  {
    id: "1",
    title: "Adicione uma foto de perfil",
    description: "Perfis com foto recebem 40% mais visualizações",
    icon: Image,
    color: "var(--color-primary)",
  },
  {
    id: "2",
    title: "Complete sua bio",
    description: "Uma boa descrição aumenta o engajamento",
    icon: Wand2,
    color: "#3B82F6",
  },
  {
    id: "3",
    title: "Adicione mais links",
    description: "Conecte todas suas redes sociais",
    icon: Link,
    color: "#10B981",
  },
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
          {/* Backdrop for mobile */}
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
            {/* Header */}
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

            {/* Notifications List */}
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
                        className={`p-4 hover:bg-[var(--color-surface)] transition-colors cursor-pointer ${
                          !notification.read ? "bg-[var(--color-primary)]/5" : ""
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

            {/* Footer */}
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
// STAT CARD
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
                <span className="text-xl sm:text-2xl">{userLevel.emoji}</span>
                <p className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
                  {stat.value}
                </p>
              </div>
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
                {stat.value}
              </p>
            )}
            {stat.trend && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trend.isPositive ? "text-emerald-400" : "text-red-400"
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

const ProfileCard = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("vxo.lat/hpf");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--border-radius-lg)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl shadow-[var(--color-primary)]/25">
              H
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-[var(--border-radius-sm)] border-[3px] border-[var(--color-background)] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </motion.div>

          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">hpf</h3>
          <p className="text-sm text-[var(--color-text-muted)]">@hpf</p>

          {/* Account Badge */}
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
            <CreditCard size={14} className="text-[var(--color-text-muted)]" />
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Conta Grátis</span>
          </div>
        </div>

        {/* Profile Link */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]">
            <Globe size={16} className="text-[var(--color-primary)] shrink-0" />
            <span className="text-sm text-[var(--color-text)] truncate flex-1">vxo.lat/hpf</span>
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
// QUICK ACTIONS
// ═══════════════════════════════════════════════════════════

const QuickActionsCard = () => {
  const navigate = useNavigate();

  return (
    <DashboardCard delay={0.15} minHeight="160px">
      <SectionHeader icon={Zap} title="Ações Rápidas" />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all group min-h-[80px]"
            >
              <div
                className="p-2.5 rounded-[var(--border-radius-md)] transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors text-center leading-tight">
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
// RECENT LINKS
// ═══════════════════════════════════════════════════════════

const RecentLinksCard = () => {
  const navigate = useNavigate();

  return (
    <DashboardCard delay={0.25} minHeight="280px">
      <SectionHeader
        icon={Link}
        title="Links Populares"
        action={
          <motion.button
            onClick={() => navigate("/dashboard/links")}
            whileHover={{ x: 4 }}
            className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1"
          >
            Ver todos
            <ChevronRight size={14} />
          </motion.button>
        }
      />

      <div className="space-y-3">
        {RECENT_LINKS.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] cursor-pointer transition-all group"
            >
              <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)]/10">
                <Icon size={16} className="text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{link.title}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <MousePointerClick size={12} />
                {link.clicks}
              </div>
              <ArrowUpRight
                size={16}
                className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// RANKING CARD
// ═══════════════════════════════════════════════════════════

const RankingCard = () => {
  const currentLevel = getUserLevel(USER_VIEWS);
  const nextLevel = getNextLevel(USER_VIEWS);

  const progressToNext = nextLevel
    ? ((USER_VIEWS - currentLevel.viewsRequired) /
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
              <span>{formatNumber(USER_VIEWS)} views</span>
              <span>{formatNumber(nextLevel.viewsRequired)} views</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: currentLevel.color }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Faltam {formatNumber(nextLevel.viewsRequired - USER_VIEWS)} views para{" "}
              <span style={{ color: nextLevel.color }}>{nextLevel.title}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* All Levels */}
      <div className="space-y-2">
        {RANKING_LEVELS.map((level, index) => {
          const isUnlocked = USER_VIEWS >= level.viewsRequired;
          const isCurrent = currentLevel.level === level.level;

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] border transition-all ${
                isCurrent
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
// TIPS CARD
// ═══════════════════════════════════════════════════════════

const TipsCard = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const tip = TIPS[currentTip];
  const Icon = tip.icon;

  return (
    <DashboardCard delay={0.35} minHeight="140px">
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-[var(--border-radius-md)] shrink-0"
          style={{ backgroundColor: `${tip.color}15` }}
        >
          <Lightbulb size={24} style={{ color: tip.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Dica do Dia</h3>
            <div className="flex items-center gap-1">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTip(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentTip ? "w-4 bg-[var(--color-primary)]" : "w-1.5 bg-[var(--color-border)]"
                  }`}
                />
              ))}
            </div>
          </div>

          <motion.div
            key={tip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-base font-medium text-[var(--color-text)] mb-1">{tip.title}</h4>
            <p className="text-sm text-[var(--color-text-muted)]">{tip.description}</p>
          </motion.div>
        </div>

        <div
          className="p-2 rounded-[var(--border-radius-sm)] shrink-0 hidden sm:block"
          style={{ backgroundColor: `${tip.color}15` }}
        >
          <Icon size={18} style={{ color: tip.color }} />
        </div>
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// PREMIUM SECTION
// ═══════════════════════════════════════════════════════════

const PremiumSection = () => {
  const navigate = useNavigate();

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
// GOAL PROGRESS
// ═══════════════════════════════════════════════════════════

const GoalProgress = () => {
  const nextLevel = getNextLevel(USER_VIEWS);
  const goal = nextLevel?.viewsRequired || 1000;
  const current = USER_VIEWS;
  const progress = Math.min((current / goal) * 100, 100);

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
              {formatNumber(current)}/{formatNumber(goal)}
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs text-[var(--color-text-muted)]">
              {nextLevel
                ? `Faltam ${formatNumber(goal - current)} views para o próximo nível!`
                : "Você alcançou o nível máximo! 🎉"}
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const DashboardStart = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

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
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10">
                <LayoutDashboard className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              Visão Geral
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-xl">
              Bem-vindo ao seu painel. Acompanhe suas métricas, gerencie seu perfil e
              destaque-se.
            </p>
          </div>

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
              notifications={NOTIFICATIONS}
            />
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {STATS.map((stat, index) => (
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
          <ProfileCard />
          <TipsCard />
          <GoalProgress />
        </div>

        {/* Center Column */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <RecentLinksCard />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <RankingCard />
        </div>
      </div>

      {/* Premium Section */}
      <div className="mt-6">
        <PremiumSection />
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
            <span className="text-sm text-[var(--color-text-muted)]">Última atualização: agora</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2">
              <Gift size={14} />
              <span>Membro desde Jan 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <span>7 dias seguidos ativos</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardStart;