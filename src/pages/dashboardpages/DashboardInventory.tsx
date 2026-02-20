import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronRight,
  Search,
  Gift,
  Coins,
  Sparkles,
  Frame,
  BadgeCheck,
  Zap,
  Clock,
  X,
  Check,
  AlertTriangle,
  Star,
  Eye,
  Timer,
  ArrowRight,
  User,
  Box,
  PartyPopper,
  RefreshCw,
  Loader2,
  Award,
  Video,
} from "lucide-react";
import { useInventory, type InventoryItem, type PendingGift, type Rarity } from "../../contexts/InventoryContext";
import { useProfile } from "../../contexts/UserContext";

// ═══════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════

type ItemType = "frame" | "badge" | "effect" | "gift";
type ItemStatus = "active" | "inactive" | "expired";

// ═══════════════════════════════════════════════════════════
// CONSTANTES E CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════

const PREVIEW_PROFILE_IMAGE = "https://i.pravatar.cc/300?u=preview";

const RARITY_CONFIG: Record<
  Rarity,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    gradient: string;
  }
> = {
  common: {
    label: "Comum",
    shortLabel: "COM",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    glowColor: "shadow-gray-500/20",
    gradient: "from-gray-500/20 to-gray-600/20",
  },
  uncommon: {
    label: "Incomum",
    shortLabel: "INC",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    glowColor: "shadow-green-500/20",
    gradient: "from-green-500/20 to-emerald-600/20",
  },
  rare: {
    label: "Raro",
    shortLabel: "RAR",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/20",
    gradient: "from-blue-500/20 to-cyan-600/20",
  },
  epic: {
    label: "Épico",
    shortLabel: "ÉPI",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/20",
    gradient: "from-purple-500/20 to-pink-600/20",
  },
  legendary: {
    label: "Lendário",
    shortLabel: "LEN",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    gradient: "from-amber-500/20 to-orange-600/20",
  },
};

const ITEM_TYPE_CONFIG: Record<
  ItemType,
  { label: string; icon: React.ElementType; color: string }
> = {
  frame: { label: "Moldura", icon: Frame, color: "text-pink-400" },
  badge: { label: "Insígnia", icon: BadgeCheck, color: "text-blue-400" },
  effect: { label: "Efeito", icon: Zap, color: "text-yellow-400" },
  gift: { label: "Presente", icon: Gift, color: "text-red-400" },
};

// ═══════════════════════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS
// ═══════════════════════════════════════════════════════════

const getDaysRemaining = (expiresAt?: Date): number | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRarityColor = (rarity: Rarity): string => {
  const colors: Record<Rarity, string> = {
    common: "#9CA3AF",
    uncommon: "#10B981",
    rare: "#3B82F6",
    epic: "#A855F7",
    legendary: "#F59E0B",
  };
  return colors[rarity] || colors.common;
};

const getRarityGlow = (rarity: Rarity): string => {
  const glows: Record<Rarity, string> = {
    common: "0 0 20px rgba(156, 163, 175, 0.5)",
    uncommon: "0 0 20px rgba(16, 185, 129, 0.6)",
    rare: "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)",
    epic: "0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)",
    legendary: "0 0 25px rgba(245, 158, 11, 0.7), 0 0 50px rgba(245, 158, 11, 0.5)",
  };
  return glows[rarity] || glows.common;
};

const getRarityConfig = (rarity: Rarity) => {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Preview de Moldura
// ═══════════════════════════════════════════════════════════

const FramePreview = ({
  frameUrl,
  size = "medium",
  profileImageUrl = PREVIEW_PROFILE_IMAGE,
  rarity,
  onLoadComplete,
}: {
  frameUrl: string;
  size?: "small" | "medium" | "large";
  profileImageUrl?: string;
  rarity: Rarity;
  onLoadComplete?: () => void;
}) => {
  const [frameError, setFrameError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeConfig = {
    small: { container: 80, frame: 80, profile: 60 },
    medium: { container: 140, frame: 140, profile: 110 },
    large: { container: 200, frame: 200, profile: 160 },
  };

  const config = sizeConfig[size];

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoadComplete?.();
  };

  const handleImageError = () => {
    setProfileError(true);
    setIsLoading(false);
    onLoadComplete?.();
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: config.container,
        height: config.container,
        filter: `drop-shadow(${getRarityGlow(rarity)})`,
      }}
    >
      {isLoading && (
        <div
          className="absolute z-30 bg-[var(--color-surface)] rounded-full flex items-center justify-center"
          style={{
            width: config.profile,
            height: config.profile,
          }}
        >
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      )}

      <div
        className="absolute rounded-full overflow-hidden z-10"
        style={{
          width: config.profile,
          height: config.profile,
        }}
      >
        {!profileError ? (
          <img
            src={profileImageUrl || PREVIEW_PROFILE_IMAGE}
            alt="Preview do perfil"
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-white/80" />
          </div>
        )}
      </div>

      {!frameError && frameUrl && (
        <img
          src={frameUrl}
          alt="Moldura"
          className="absolute z-20 pointer-events-none"
          style={{
            width: config.frame,
            height: config.frame,
            objectFit: 'contain',
          }}
          onError={() => setFrameError(true)}
        />
      )}

      {rarity === "legendary" && (
        <motion.div
          className="absolute rounded-full z-5 pointer-events-none"
          style={{
            width: config.frame,
            height: config.frame,
            background: `radial-gradient(circle, transparent 40%, ${getRarityColor(rarity)}20 100%)`
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Preview de Mídia
// ═══════════════════════════════════════════════════════════

const ItemMediaPreview = ({
  item,
  size = "medium",
  showPlayButton = false,
  userProfileImage,
}: {
  item: InventoryItem;
  size?: "small" | "medium" | "large";
  showPlayButton?: boolean;
  userProfileImage?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeConfig = {
    small: { container: "w-16 h-16", svg: "w-10 h-10", icon: "w-8 h-8" },
    medium: { container: "w-full h-40", svg: "w-20 h-20", icon: "w-16 h-16" },
    large: { container: "w-full h-64", svg: "w-32 h-32", icon: "w-24 h-24" },
  };

  const config = sizeConfig[size];

  // Badge
  if (item.type === "badge") {
    if (item.imageUrl && !imageError) {
      return (
        <div
          className={`${config.container} flex items-center justify-center p-4 relative`}
          style={{ contain: 'layout style paint' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)] z-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-muted)]" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center" style={{ filter: "blur(20px)", opacity: 0.6 }}>
            <div className={`${config.svg} rounded-full`} style={{ backgroundColor: getRarityColor(item.rarity) }} />
          </div>
          <img
            src={item.imageUrl}
            alt={item.name}
            className={config.svg}
            style={{
              filter: "invert(100%) sepia(100%) saturate(0%) hue-rotate(200deg)",
            }}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => { setImageError(true); setIsLoading(false); }}
          />
        </div>
      );
    }
    return (
      <div
        className={`${config.container} flex items-center justify-center relative`}
        style={{ contain: 'layout style paint' }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ filter: "blur(20px)", opacity: 0.5 }}>
          <div className={`${config.svg} rounded-full`} style={{ backgroundColor: getRarityColor(item.rarity) }} />
        </div>
        <Award className={`${config.icon} relative z-10`} style={{ color: "white", filter: `drop-shadow(${getRarityGlow(item.rarity)})` }} />
      </div>
    );
  }

  // Frame
  if (item.type === "frame") {
    return (
      <div
        className={`${config.container} flex items-center justify-center relative`}
        style={{
          background: `radial-gradient(circle, ${getRarityColor(item.rarity)}10, transparent)`,
          contain: 'layout style paint'
        }}
      >
        <FramePreview
          frameUrl={item.imageUrl || ''}
          size={size}
          profileImageUrl={userProfileImage || PREVIEW_PROFILE_IMAGE}
          rarity={item.rarity}
        />
      </div>
    );
  }

  // Effect
  if (item.type === "effect") {
    if (item.imageUrl && !imageError) {
      return (
        <div
          className={`${config.container} relative overflow-hidden bg-black`}
          style={{ contain: 'layout style paint' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => { setImageError(true); setIsLoading(false); }}
          />
          {showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Video className="w-6 h-6 text-black" />
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div
        className={`${config.container} flex items-center justify-center bg-black`}
        style={{ contain: 'layout style paint' }}
      >
        <Zap className={`${config.icon} text-white/50`} />
      </div>
    );
  }

  // Gift (fallback)
  if (item.imageUrl && !imageError) {
    return (
      <div
        className={`${config.container} relative overflow-hidden`}
        style={{ contain: 'layout style paint' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)] z-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-muted)]" />
          </div>
        )}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => { setImageError(true); setIsLoading(false); }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${config.container} flex items-center justify-center relative`}
      style={{ contain: 'layout style paint' }}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ filter: "blur(20px)", opacity: 0.5 }}>
        <div className={`${config.svg} rounded-full`} style={{ backgroundColor: getRarityColor(item.rarity) }} />
      </div>
      <Package className={`${config.icon} relative z-10`} style={{ color: "white", filter: `drop-shadow(${getRarityGlow(item.rarity)})` }} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

const InventoryCard = ({
  children,
  className = "",
  onClick,
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`
      bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
      border border-[var(--color-border)] rounded-[var(--border-radius-lg)]
      ${noPadding ? "" : "p-3 sm:p-4 lg:p-6"}
      ${onClick ? "cursor-pointer" : ""}
      overflow-hidden
      ${className}
    `}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4 lg:mb-6">
    <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
      <div className="p-1.5 sm:p-2 lg:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
        <Icon size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--color-primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text)] truncate">{title}</h2>
        <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)] mt-0.5">{description}</p>
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  variant = "default",
  action,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  variant?: "default" | "primary" | "success" | "warning" | "premium";
  action?: string;
  onClick?: () => void;
}) => {
  const variants = {
    default: {
      iconBg: "bg-[var(--color-surface)]",
      iconColor: "text-[var(--color-text-muted)]",
    },
    primary: {
      iconBg: "bg-[var(--color-primary)]/10",
      iconColor: "text-[var(--color-primary)]",
    },
    success: {
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    warning: {
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    premium: {
      iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
  };

  const config = variants[variant];

  return (
    <motion.div
      onClick={onClick}
      className={`
        relative overflow-hidden p-2.5 sm:p-3 lg:p-4 rounded-[var(--border-radius-md)] lg:rounded-[var(--border-radius-lg)]
        bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
        border border-[var(--color-border)]
        ${onClick ? "cursor-pointer hover:border-[var(--color-primary)]/50" : ""}
        transition-all duration-300 group
      `}
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {variant === "premium" && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className={`p-1.5 sm:p-2 lg:p-2.5 rounded-[var(--border-radius-sm)] sm:rounded-[var(--border-radius-md)] ${config.iconBg}`}>
            <Icon size={14} className={`sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${config.iconColor}`} />
          </div>
          {action && (
            <span className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
              {action}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-text-muted)] mb-0.5 truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-[var(--color-text)]">
              {value}
            </span>
            {subValue && (
              <span className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-text-muted)]">
                {subValue}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RarityBadge = ({
  rarity,
  size = "md",
}: {
  rarity: Rarity;
  size?: "sm" | "md" | "lg";
}) => {
  const config = getRarityConfig(rarity);
  const sizes = {
    sm: "text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5",
    md: "text-[8px] sm:text-[9px] lg:text-[10px] px-1.5 sm:px-2 py-0.5",
    lg: "text-[9px] sm:text-[10px] lg:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1",
  };

  return (
    <span
      className={`
        ${sizes[size]} font-bold rounded-md
        ${config.bgColor} ${config.color} ${config.borderColor}
        border backdrop-blur-sm whitespace-nowrap
      `}
    >
      {config.shortLabel}
    </span>
  );
};

const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const configs = {
    active: { label: "Ativo", color: "text-green-400", bg: "bg-green-500/10" },
    inactive: { label: "Inativo", color: "text-gray-400", bg: "bg-gray-500/10" },
    expired: { label: "Expirado", color: "text-red-400", bg: "bg-red-500/10" },
  };

  const config = configs[status];

  return (
    <span className={`text-[8px] sm:text-[9px] lg:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  );
};

const FilterTab = ({
  label,
  count,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon?: React.ElementType;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-[var(--border-radius-md)]
      text-[9px] sm:text-[10px] lg:text-xs font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0
      ${active
        ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25"
        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
      }
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {Icon && <Icon size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />}
    <span className="hidden xs:inline sm:inline">{label}</span>
    <span className="xs:hidden">{label.slice(0, 3)}</span>
    <span
      className={`
        min-w-[16px] sm:min-w-[18px] px-1 sm:px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] lg:text-[10px] font-bold text-center
        ${active ? "bg-white/20 text-white" : "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"}
      `}
    >
      {count}
    </span>
  </motion.button>
);

// ✅ CORRIGIDO: ItemCard completo
const ItemCard = ({
  item,
  onClick,
  userProfileImage,
}: {
  item: InventoryItem;
  onClick: () => void;
  userProfileImage?: string;
}) => {
  const rarityConfig = getRarityConfig(item.rarity);
  const daysRemaining = getDaysRemaining(item.expiresAt);
  const isExpired = item.status === "expired";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[var(--border-radius-md)] sm:rounded-[var(--border-radius-lg)]
        border ${isExpired ? "border-red-500/30 opacity-60" : rarityConfig.borderColor}
        bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
        cursor-pointer group transition-all duration-300
        hover:shadow-lg ${!isExpired ? rarityConfig.glowColor : ""}
      `}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.gradient} opacity-50`} />

      {/* Badge Premium */}
      {item.isPremium && (
        <div className="absolute top-1 sm:top-1.5 lg:top-2 right-1 sm:right-1.5 lg:right-2 z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-0.5 sm:p-1 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/50"
            title="Item Premium"
          >
            <Sparkles size={8} className="sm:w-[10px] sm:h-[10px] text-amber-400" />
          </motion.div>
        </div>
      )}

      {/* Badge Novo (só aparece se não for premium) */}
      {item.isNew && !item.isPremium && (
        <div className="absolute top-1 sm:top-1.5 lg:top-2 right-1 sm:right-1.5 lg:right-2 z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-1 sm:px-1.5 lg:px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[6px] sm:text-[8px] lg:text-[10px] font-bold flex items-center gap-0.5"
          >
            <Sparkles size={6} className="sm:w-2 sm:h-2 lg:w-[10px] lg:h-[10px]" />
            <span className="hidden sm:inline">NOVO</span>
            <span className="sm:hidden">!</span>
          </motion.div>
        </div>
      )}

      {/* Badge Equipado */}
      {item.isEquipped && (
        <div className="absolute top-1 sm:top-1.5 lg:top-2 left-1 sm:left-1.5 lg:left-2 z-20">
          <div className="p-0.5 sm:px-1.5 sm:py-0.5 rounded-full bg-green-900/20 text-green-700 text-[6px] sm:text-[8px] lg:text-[10px] font-bold flex items-center gap-0.5 border border-green-500/30">
            <Check size={8} className="sm:w-[10px] sm:h-[10px]" />
            <span className="hidden lg:inline">EQUIPADO</span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-2 sm:p-2.5 lg:p-3 xl:p-4">
        <div
          className={`
            w-full aspect-square rounded-[var(--border-radius-sm)] sm:rounded-[var(--border-radius-md)] mb-1.5 sm:mb-2 lg:mb-3
            bg-gradient-to-br ${rarityConfig.gradient}
            flex items-center justify-center
            border ${rarityConfig.borderColor}
            group-hover:scale-105 transition-transform duration-300
            overflow-hidden
          `}
        >
          <ItemMediaPreview
            item={item}
            size="medium"
            showPlayButton={item.type === "effect"}
            userProfileImage={userProfileImage}
          />
        </div>

        <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
          <div className="flex items-start justify-between gap-1">
            <RarityBadge rarity={item.rarity} size="sm" />
            {isExpired && (
              <span className="text-[7px] sm:text-[8px] lg:text-[10px] text-red-400 flex items-center gap-0.5 flex-shrink-0">
                <AlertTriangle size={8} className="sm:w-[10px] sm:h-[10px]" />
              </span>
            )}
          </div>

          <h3 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-[var(--color-text)] line-clamp-1">
            {item.name}
          </h3>

          <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)] line-clamp-2 hidden sm:block">
            {item.description}
          </p>

          {daysRemaining !== null && !isExpired && (
            <div
              className={`
                flex items-center gap-0.5 sm:gap-1 text-[7px] sm:text-[8px] lg:text-[10px] font-medium
                ${daysRemaining <= 7 ? "text-red-400" : daysRemaining <= 30 ? "text-amber-400" : "text-[var(--color-text-muted)]"}
              `}
            >
              <Timer size={8} className="sm:w-[10px] sm:h-[10px] lg:w-3 lg:h-3 flex-shrink-0" />
              <span className="truncate">{daysRemaining}d</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2 sm:pb-3 lg:pb-4 z-30">
        <span className="text-[8px] sm:text-[10px] lg:text-xs text-white font-medium flex items-center gap-1">
          <span className="hidden sm:inline">Ver detalhes</span>
          <ArrowRight size={10} className="sm:w-3 sm:h-3" />
        </span>
      </div>
    </motion.div>
  );
};

const PendingGiftCard = ({
  gift,
  onAccept,
}: {
  gift: PendingGift;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const rarityConfig = getRarityConfig(gift.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        relative overflow-hidden p-2.5 sm:p-3 lg:p-4 rounded-[var(--border-radius-md)] sm:rounded-[var(--border-radius-lg)]
        border ${rarityConfig.borderColor}
        bg-gradient-to-r ${rarityConfig.gradient}
        backdrop-blur-[var(--blur-amount)]
      `}
    >
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4">
        <div
          className={`
            w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-[var(--border-radius-md)]
            bg-gradient-to-br ${rarityConfig.gradient}
            border ${rarityConfig.borderColor}
            flex items-center justify-center flex-shrink-0
            overflow-hidden
          `}
        >
          {gift.itemUrl ? (
            <img src={gift.itemUrl} alt={gift.itemName} className="w-full h-full object-cover" />
          ) : (
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Gift size={16} className={`sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${rarityConfig.color}`} />
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
            <RarityBadge rarity={gift.rarity} size="sm" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)]">
              {formatDate(gift.sentAt)}
            </span>
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-[var(--color-text)] truncate">
            {gift.hasCoinOffered && gift.amountCoinsOffered
              ? `${gift.amountCoinsOffered} Vcoins`
              : gift.itemName || "Presente"}
          </h3>
          <p className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5 truncate">
            <User size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
            <span className="truncate">De {gift.fromSlug}</span>
          </p>
          {gift.message && (
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)] mt-1 sm:mt-1.5 italic line-clamp-1">
              "{gift.message}"
            </p>
          )}
        </div>

        <div className="flex gap-1.5 sm:gap-2 sm:flex-col mt-1 sm:mt-0">
          <motion.button
            onClick={onAccept}
            className="flex-1 sm:flex-none px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-[var(--border-radius-sm)] bg-green-500 hover:bg-green-600 text-white text-[9px] sm:text-[10px] lg:text-xs font-medium transition-colors flex items-center justify-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
            <span>Marcar como visto</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "max-w-[90vw] sm:max-w-sm",
    md: "max-w-[95vw] sm:max-w-md",
    lg: "max-w-[95vw] sm:max-w-2xl",
  };

  return (
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
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 lg:p-4"
          >
            <div
              className={`
                w-full ${sizes[size]}
                bg-[var(--color-background)] backdrop-blur-[var(--blur-amount)]
                border border-[var(--color-border)] rounded-[var(--border-radius-lg)] sm:rounded-[var(--border-radius-xl)]
                shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] overflow-y-auto
              `}
            >
              {title && (
                <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-[var(--color-border)]">
                  <h2 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-[var(--color-text)] truncate pr-2">
                    {title}
                  </h2>
                  <motion.button
                    onClick={onClose}
                    className="p-1.5 sm:p-2 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                  </motion.button>
                </div>
              )}

              <div className={title ? "p-3 sm:p-4 lg:p-6" : ""}>{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ItemDetailModal = ({
  item,
  onClose,
  onEquip,
  onUnequip,
  userProfileImage,
  isEquipping = false,
}: {
  item: InventoryItem;
  onClose: () => void;
  onEquip: () => void;
  onUnequip: () => void;
  onGift: () => void;
  userProfileImage?: string;
  isEquipping?: boolean;
}) => {
  const rarityConfig = getRarityConfig(item.rarity);
  const typeConfig = ITEM_TYPE_CONFIG[item.type];
  const TypeIcon = typeConfig.icon;
  const daysRemaining = getDaysRemaining(item.expiresAt);
  const isExpired = item.status === "expired";

  // ✅ Verificar se pode equipar (não pode se for premium)

  const { profileData } = useProfile();


  const canEquip = !item.isPremium || profileData?.isPremium;
  return (
    <div className="relative overflow-hidden">
      <motion.button
        onClick={onClose}
        className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 z-20 p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
      </motion.button>

      <div
        className={`
          relative h-40 sm:h-48 lg:h-64 xl:h-80 bg-gradient-to-br ${rarityConfig.gradient}
          flex items-center justify-center overflow-hidden
        `}
      >
        <ItemMediaPreview
          item={item}
          size="large"
          showPlayButton={item.type === "effect"}
          userProfileImage={userProfileImage}
        />

        <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 flex flex-wrap gap-1.5">
          <span
            className={`
              px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full text-[8px] sm:text-[10px] lg:text-xs font-bold
              ${rarityConfig.bgColor} ${rarityConfig.color}
              border ${rarityConfig.borderColor}
            `}
          >
            {rarityConfig.label}
          </span>

          {/* Badge Premium */}
          {item.isPremium && (
            <span className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 text-[8px] sm:text-[10px] lg:text-xs font-bold border border-amber-500/30 flex items-center gap-1">
              <Sparkles size={8} className="sm:w-[10px] sm:h-[10px] lg:w-3 lg:h-3" />
              <span className="hidden sm:inline">Premium</span>
            </span>
          )}
        </div>

        {item.isEquipped && (
          <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4">
            <span className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full bg-green-500/20 text-green-400 text-[8px] sm:text-[10px] lg:text-xs font-bold border border-green-500/30 flex items-center gap-1">
              <Check size={8} className="sm:w-[10px] sm:h-[10px] lg:w-3 lg:h-3" />
              <span className="hidden sm:inline">Equipado</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 lg:p-5 xl:p-6">
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-[var(--color-text)] mb-1 sm:mb-2">
            {item.name}
          </h2>
          <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)]">
            {item.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:gap-3 mb-3 sm:mb-4 lg:mb-6">
          <div className="p-2 sm:p-2.5 lg:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)] mb-0.5">Tipo</p>
            <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-[var(--color-text)] flex items-center gap-1 sm:gap-2">
              <TypeIcon size={10} className={`sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 ${typeConfig.color} flex-shrink-0`} />
              <span className="truncate">{typeConfig.label}</span>
            </p>
          </div>
          <div className="p-2 sm:p-2.5 lg:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)] mb-0.5">Status</p>
            <StatusBadge status={item.status} />
          </div>
          <div className="p-2 sm:p-2.5 lg:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)] mb-0.5">Obtido em</p>
            <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-[var(--color-text)]">
              {formatDate(item.obtainedAt)}
            </p>
          </div>
          {daysRemaining !== null && (
            <div className="p-2 sm:p-2.5 lg:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
              <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)] mb-0.5">Expira em</p>
              <p
                className={`text-[10px] sm:text-xs lg:text-sm font-medium ${daysRemaining <= 7 ? "text-red-400" : "text-[var(--color-text)]"
                  }`}
              >
                {daysRemaining <= 0 ? "Expirado" : `${daysRemaining} dias`}
              </p>
            </div>
          )}
        </div>
        {item.isPremium && !isExpired && (
          <motion.div
            className="p-2.5 sm:p-3 lg:p-4 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 mb-3 sm:mb-4 lg:mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-amber-500/20 flex-shrink-0">
                <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-amber-400">
                  Item Premium Exclusivo
                </p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-text-muted)] mt-0.5">
                  Este item é decorativo e não pode ser equipado. Itens premium são exclusivos para colecionadores.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!isExpired && (
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 lg:gap-3">
            {item.isEquipped ? (
              <motion.button
                onClick={onUnequip}
                disabled={isEquipping}
                className={`
                  flex-1 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-[var(--border-radius-md)]
                  bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
                  text-[var(--color-text)] text-[10px] sm:text-xs lg:text-sm font-medium
                  transition-all flex items-center justify-center gap-1.5 sm:gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                whileHover={!isEquipping ? { scale: 1.02 } : {}}
                whileTap={!isEquipping ? { scale: 0.98 } : {}}
              >
                {isEquipping ? (
                  <>
                    <Loader2 size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Eye size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    <span>Desequipar</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={onEquip}
                disabled={isEquipping || !canEquip}
                className={`
                  flex-1 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-[var(--border-radius-md)]
                  ${canEquip
                    ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                    : "bg-gray-500/50 cursor-not-allowed"
                  }
                  text-white text-[10px] sm:text-xs lg:text-sm font-medium
                  transition-all flex items-center justify-center gap-1.5 sm:gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                whileHover={!isEquipping && canEquip ? { scale: 1.02 } : {}}
                whileTap={!isEquipping && canEquip ? { scale: 0.98 } : {}}
              >
                {isEquipping ? (
                  <>
                    <Loader2 size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 animate-spin" />
                    <span>Equipando...</span>
                  </>
                ) : !canEquip ? (
                  <>
                    <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    <span>Item Premium</span>
                  </>
                ) : (
                  <>
                    <Check size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    <span>Equipar</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        )}

        {isExpired && (
          <motion.div
            className="p-2.5 sm:p-3 lg:p-4 rounded-[var(--border-radius-md)] bg-red-500/10 border border-red-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-red-400">Item Expirado</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-text-muted)]">
                  Este item não pode mais ser usado.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const GiftOpeningModal = ({
  isOpen,
  gift,
  onComplete,
}: {
  isOpen: boolean;
  gift: PendingGift | null;
  onComplete: () => void;
}) => {
  const [stage, setStage] = useState<"closed" | "opening" | "revealed">("closed");

  const handleOpen = () => {
    setStage("opening");
    setTimeout(() => setStage("revealed"), 1500);
  };

  const handleClose = () => {
    setStage("closed");
    onComplete();
  };

  if (!gift) return null;

  const rarityConfig = getRarityConfig(gift.rarity);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
          >
            <div className="text-center w-full max-w-sm sm:max-w-md">
              <AnimatePresence mode="wait">
                {stage === "closed" && (
                  <motion.div
                    key="closed"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className={`
                        w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-2xl sm:rounded-3xl
                        bg-gradient-to-br ${rarityConfig.gradient}
                        border-2 sm:border-4 ${rarityConfig.borderColor}
                        flex items-center justify-center
                        shadow-2xl cursor-pointer
                      `}
                      onClick={handleOpen}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Gift size={40} className={`sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${rarityConfig.color} drop-shadow-lg`} />
                    </motion.div>
                    <p className="mt-4 sm:mt-6 text-xs sm:text-sm lg:text-base text-[var(--color-text)] font-medium">
                      Toque para abrir!
                    </p>
                    <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)]">
                      De {gift.fromSlug}
                    </p>
                  </motion.div>
                )}

                {stage === "opening" && (
                  <motion.div
                    key="opening"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1.3, 0], rotate: [0, 0, 0, 360] }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="relative"
                  >
                    <motion.div
                      className={`
                        w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-2xl sm:rounded-3xl mx-auto
                        bg-gradient-to-br ${rarityConfig.gradient}
                        border-2 sm:border-4 ${rarityConfig.borderColor}
                        flex items-center justify-center
                      `}
                    >
                      <Gift size={40} className={`sm:w-12 sm:h-12 lg:w-16 lg:h-16 ${rarityConfig.color}`} />
                    </motion.div>
                  </motion.div>
                )}

                {stage === "revealed" && (
                  <motion.div
                    key="revealed"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      className={`absolute w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full blur-3xl opacity-30 ${rarityConfig.bgColor}`}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    <motion.div
                      initial={{ y: 50 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className={`
                        relative w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-xl sm:rounded-2xl
                        bg-gradient-to-br ${rarityConfig.gradient}
                        border-2 sm:border-4 ${rarityConfig.borderColor}
                        flex items-center justify-center
                        shadow-2xl
                        overflow-hidden
                      `}
                    >
                      {gift.itemUrl ? (
                        <img src={gift.itemUrl} alt={gift.itemName} className="w-full h-full object-cover" />
                      ) : gift.hasCoinOffered ? (
                        <Coins size={32} className={`sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${rarityConfig.color} drop-shadow-lg`} />
                      ) : (
                        <PartyPopper size={32} className={`sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${rarityConfig.color} drop-shadow-lg`} />
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-3 sm:mt-4 lg:mt-6"
                    >
                      <span
                        className={`
                          px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-[10px] sm:text-xs lg:text-sm font-bold
                          ${rarityConfig.bgColor} ${rarityConfig.color}
                          border ${rarityConfig.borderColor}
                        `}
                      >
                        {rarityConfig.label}
                      </span>
                    </motion.div>

                    <motion.h2
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2 sm:mt-3 lg:mt-4 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[var(--color-text)] px-4"
                    >
                      {gift.hasCoinOffered && gift.amountCoinsOffered
                        ? `${gift.amountCoinsOffered} Vcoins`
                        : gift.itemName || "Presente Especial"}
                    </motion.h2>

                    <motion.p
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)]"
                    >
                      Presente de {gift.fromSlug}
                    </motion.p>

                    <motion.button
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      onClick={handleClose}
                      className="mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-full bg-[var(--color-primary)] text-white text-[10px] sm:text-xs lg:text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Visualizar no Inventário
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 px-4"
  >
    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
      <Icon size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-[var(--color-text-muted)]" />
    </div>
    <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-[var(--color-text)] mb-1 sm:mb-2 text-center">{title}</h3>
    <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)] text-center max-w-[250px] sm:max-w-xs lg:max-w-sm mb-2 sm:mb-3 lg:mb-4">
      {description}
    </p>
    {action && (
      <motion.button
        onClick={action.onClick}
        className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] text-white text-[10px] sm:text-xs lg:text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {action.label}
      </motion.button>
    )}
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full mx-auto mb-4"
      />
      <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">Carregando inventário...</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardInventory = () => {
  const {
    items,
    pendingGifts,
    unviewedGiftsCount,
    isLoadingInventory,
    refreshInventory,
    markGiftAsViewed,
    markAllGiftsAsViewed,
    toggleEquipItem,
  } = useInventory();

  const { profileData } = useProfile();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | ItemType | "expired">("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [giftToOpen, setGiftToOpen] = useState<PendingGift | null>(null);
  const [showGiftOpening, setShowGiftOpening] = useState(false);
  const [isEquipping, setIsEquipping] = useState(false);

  const userProfileImage = profileData?.pageSettings?.mediaUrls?.profileImageUrl;
  const userIsPremium = profileData?.isPremium;

  const filters: {
    key: "all" | ItemType | "expired";
    label: string;
    icon?: React.ElementType;
  }[] = [
      { key: "all", label: "Todos" },
      { key: "frame", label: "Molduras", icon: Frame },
      { key: "badge", label: "Insígnias", icon: BadgeCheck },
      { key: "effect", label: "Efeitos", icon: Zap },
      { key: "gift", label: "Presentes", icon: Gift },
      { key: "expired", label: "Expirados", icon: Clock },
    ];

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (activeFilter !== "all") {
      if (activeFilter === "expired") {
        result = result.filter((item) => item.status === "expired");
      } else {
        result = result.filter((item) => item.type === activeFilter);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      frame: items.filter((i) => i.type === "frame").length,
      badge: items.filter((i) => i.type === "badge").length,
      effect: items.filter((i) => i.type === "effect").length,
      gift: items.filter((i) => i.type === "gift").length,
      expired: items.filter((i) => i.status === "expired").length,
    };
  }, [items]);

  const handleAcceptGift = async (gift: PendingGift) => {
    setGiftToOpen(gift);
    setShowGiftOpening(true);
  };

  const handleDeclineGift = async (giftId: string) => {
    try {
      await markGiftAsViewed(giftId);
    } catch (error) {
      console.error("Erro ao recusar presente:", error);
    }
  };

  const handleGiftOpenComplete = async () => {
    if (giftToOpen) {
      try {
        await markGiftAsViewed(giftToOpen.id);
      } catch (error) {
        console.error("Erro ao aceitar presente:", error);
      }
    }
    setShowGiftOpening(false);
    setGiftToOpen(null);
  };

  // handleEquipItem — remova a validação errada
  const handleEquipItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);

    // ✅ Bloqueia só se item é premium E user NÃO é premium
    if (item?.isPremium && !item?.isEquipped && !userIsPremium) {
      console.warn("[Inventory] Tentativa de equipar item premium bloqueada");
      return;
    }

    try {
      setIsEquipping(true);
      await toggleEquipItem(itemId);
      // ...resto igual
    } catch (error) {
      console.error("Erro ao equipar item:", error);
    } finally {
      setIsEquipping(false);
    }
  };

  if (isLoadingInventory && items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-4 sm:pb-6 lg:pb-8 overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] lg:text-xs xl:text-sm text-[var(--color-text-muted)] mb-2 sm:mb-3 lg:mb-4"
        >
          <span>Dashboard</span>
          <ChevronRight size={10} className="sm:w-3 sm:h-3 lg:w-[14px] lg:h-[14px] flex-shrink-0" />
          <span className="text-[var(--color-text)]">Inventário</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start justify-between gap-2"
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
              <Package className="text-[var(--color-primary)] w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 flex-shrink-0" />
              <span>Inventário</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1 lg:mt-2">
              Gerencie seus itens e presentes.
            </p>
          </div>

          <motion.button
            onClick={refreshInventory}
            disabled={isLoadingInventory}
            className="p-2 sm:p-2.5 lg:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 transition-all flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Atualizar inventário"
          >
            <RefreshCw
              size={14}
              className={`sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[var(--color-text-muted)] ${isLoadingInventory ? 'animate-spin' : ''}`}
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
        <StatCard
          icon={Box}
          label="Itens"
          value={items.filter((i) => i.status === "active").length}
          subValue="ativos"
          variant="primary"
          action="Ver"
        />

        <StatCard
          icon={Gift}
          label="Presentes"
          value={unviewedGiftsCount}
          subValue="novos"
          variant={unviewedGiftsCount > 0 ? "warning" : "default"}
          action={unviewedGiftsCount > 0 ? "Abrir" : undefined}
        />

        <StatCard
          icon={Star}
          label="Raros"
          value={items.filter((i) => ["rare", "epic", "legendary"].includes(i.rarity)).length}
          subValue="itens"
          variant="success"
        />

        <StatCard
          icon={Sparkles}
          label="Premium"
          value={items.filter((i) => i.isPremium).length}
          subValue="itens"
          variant="premium"
        />
      </div>

      {/* Pending Gifts Section */}
      <AnimatePresence>
        {pendingGifts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 sm:mb-4 lg:mb-6 xl:mb-8"
          >
            <InventoryCard>
              <SectionHeader
                icon={Gift}
                title="Presentes Pendentes"
                description={`${pendingGifts.length} aguardando`}
                action={
                  pendingGifts.length > 1 ? (
                    <motion.button
                      onClick={markAllGiftsAsViewed}
                      className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-primary)] hover:underline font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Aceitar todos
                    </motion.button>
                  ) : undefined
                }
              />

              <div className="space-y-2 sm:space-y-3">
                {pendingGifts.map((gift) => (
                  <PendingGiftCard
                    key={gift.id}
                    gift={gift}
                    onAccept={() => handleAcceptGift(gift)}
                    onDecline={() => handleDeclineGift(gift.id)}
                  />
                ))}
              </div>
            </InventoryCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <InventoryCard noPadding>
        <div className="p-2.5 sm:p-3 lg:p-4 xl:p-6 border-b border-[var(--color-border)]">
          <div className="relative mb-2.5 sm:mb-3 lg:mb-4">
            <Search
              size={12}
              className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 xl:w-[18px] xl:h-[18px] absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-7 sm:pl-8 lg:pl-9 xl:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 lg:py-2.5 xl:py-3 rounded-[var(--border-radius-md)]
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[10px] sm:text-xs lg:text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
                focus:border-[var(--color-primary)] transition-all
              "
            />
          </div>

          <div className="flex gap-1 sm:gap-1.5 lg:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {filters.map((filter) => (
              <FilterTab
                key={filter.key}
                label={filter.label}
                count={counts[filter.key]}
                active={activeFilter === filter.key}
                onClick={() => setActiveFilter(filter.key)}
                icon={filter.icon}
              />
            ))}
          </div>
        </div>
        <p className="p-3 opacity-[0.5] text-xs flex gap-1 bg-[red] bg-opacity-[0.2] rounded-4xl "><AlertTriangle size={16} /> Caso seu Premium tenha <strong>expirado,</strong> os itens premium serão desabilitados para uso, porém, <strong>serão  permanecidos na conta</strong>. </p>
        <div className="p-2.5 sm:p-3 lg:p-4 xl:p-6">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 xl:gap-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                    userProfileImage={userProfileImage}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState
              icon={searchQuery ? Search : Package}
              title={searchQuery ? "Nenhum item encontrado" : "Inventário vazio"}
              description={
                searchQuery
                  ? "Tente buscar por outro termo ou remova os filtros."
                  : "Você ainda não possui itens. Visite a loja para adquirir novos itens!"
              }
              action={
                !searchQuery
                  ? { label: "Ir para a Loja", onClick: () => console.log("Ir para loja") }
                  : undefined
              }
            />
          )}
        </div>
      </InventoryCard>

      {/* Modal de Detalhes do Item */}
      <Modal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        size="md"
      >
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEquip={() => handleEquipItem(selectedItem.id)}
            onUnequip={() => handleEquipItem(selectedItem.id)}
            onGift={() => {
              console.log("Presentear", selectedItem.id);
              setSelectedItem(null);
            }}
            userProfileImage={userProfileImage}
            isEquipping={isEquipping}
          />
        )}
      </Modal>

      <GiftOpeningModal
        isOpen={showGiftOpening}
        gift={giftToOpen}
        onComplete={handleGiftOpenComplete}
      />
    </div>
  );
};

export default DashboardInventory;