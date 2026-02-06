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
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
type ItemType = "frame" | "badge" | "effect" | "gift";
type ItemStatus = "active" | "inactive" | "expired";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  status: ItemStatus;
  image?: string;
  expiresAt?: Date;
  obtainedAt: Date;
  isNew?: boolean;
  isEquipped?: boolean;
}

interface PendingGift {
  id: string;
  itemName: string;
  itemType: ItemType;
  rarity: Rarity;
  senderName: string;
  senderAvatar?: string;
  sentAt: Date;
  message?: string;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTES E CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════

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
// DADOS MOCK
// ═══════════════════════════════════════════════════════════

const MOCK_ITEMS: InventoryItem[] = [
  {
    id: "1",
    name: "Moldura Neon",
    description: "Uma moldura vibrante com efeito neon pulsante",
    type: "frame",
    rarity: "rare",
    status: "active",
    obtainedAt: new Date("2024-01-15"),
    isEquipped: true,
  },
  {
    id: "2",
    name: "Insígnia VIP",
    description: "Mostre seu status VIP com orgulho",
    type: "badge",
    rarity: "epic",
    status: "active",
    obtainedAt: new Date("2024-02-20"),
    expiresAt: new Date("2024-08-20"),
    isNew: true,
  },
  {
    id: "3",
    name: "Efeito Partículas",
    description: "Partículas brilhantes seguem seu cursor",
    type: "effect",
    rarity: "legendary",
    status: "active",
    obtainedAt: new Date("2024-03-01"),
  },
  {
    id: "4",
    name: "Moldura Cristal",
    description: "Elegante moldura com reflexos de cristal",
    type: "frame",
    rarity: "uncommon",
    status: "expired",
    obtainedAt: new Date("2023-06-10"),
    expiresAt: new Date("2024-01-10"),
  },
  {
    id: "5",
    name: "Insígnia Early Adopter",
    description: "Para os primeiros usuários da plataforma",
    type: "badge",
    rarity: "common",
    status: "active",
    obtainedAt: new Date("2023-01-01"),
  },
  {
    id: "6",
    name: "Efeito Aurora",
    description: "Luzes da aurora boreal em seu perfil",
    type: "effect",
    rarity: "epic",
    status: "inactive",
    obtainedAt: new Date("2024-02-14"),
  },
];

const MOCK_PENDING_GIFTS: PendingGift[] = [
  {
    id: "g1",
    itemName: "Moldura Presente",
    itemType: "frame",
    rarity: "uncommon",
    senderName: "João Silva",
    sentAt: new Date("2024-03-20"),
    message: "Feliz aniversário! 🎉",
  },
];

// ═══════════════════════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS
// ═══════════════════════════════════════════════════════════

const getDaysRemaining = (expiresAt: Date): number => {
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

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

// Card Container - Responsivo
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

// Section Header - Responsivo
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

// Stat Card - Responsivo
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

// Rarity Badge - Responsivo
const RarityBadge = ({
  rarity,
  size = "md",
}: {
  rarity: Rarity;
  size?: "sm" | "md" | "lg";
}) => {
  const config = RARITY_CONFIG[rarity];
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

// Status Badge
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

// Filter Tab - Responsivo
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
      ${
        active
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

// Item Card - Responsivo
const ItemCard = ({
  item,
  onClick,
}: {
  item: InventoryItem;
  onClick: () => void;
}) => {
  const rarityConfig = RARITY_CONFIG[item.rarity];
  const typeConfig = ITEM_TYPE_CONFIG[item.type];
  const TypeIcon = typeConfig.icon;
  const daysRemaining = item.expiresAt ? getDaysRemaining(item.expiresAt) : null;
  const isExpired = item.status === "expired";

  return (
    <motion.div
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
      layout
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.gradient} opacity-50`} />

      {/* New Badge */}
      {item.isNew && (
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

      {/* Equipped Badge */}
      {item.isEquipped && (
        <div className="absolute top-1 sm:top-1.5 lg:top-2 left-1 sm:left-1.5 lg:left-2 z-20">
          <div className="p-0.5 sm:px-1.5 sm:py-0.5 rounded-full bg-green-500/20 text-green-400 text-[6px] sm:text-[8px] lg:text-[10px] font-bold flex items-center gap-0.5 border border-green-500/30">
            <Check size={8} className="sm:w-[10px] sm:h-[10px]" />
            <span className="hidden lg:inline">EQUIPADO</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-2 sm:p-2.5 lg:p-3 xl:p-4">
        {/* Item Icon/Preview */}
        <div
          className={`
            w-full aspect-square rounded-[var(--border-radius-sm)] sm:rounded-[var(--border-radius-md)] mb-1.5 sm:mb-2 lg:mb-3
            bg-gradient-to-br ${rarityConfig.gradient}
            flex items-center justify-center
            border ${rarityConfig.borderColor}
            group-hover:scale-105 transition-transform duration-300
          `}
        >
          <TypeIcon size={20} className={`sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 ${rarityConfig.color} opacity-80`} />
        </div>

        {/* Info */}
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

          {/* Expiration Warning */}
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

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2 sm:pb-3 lg:pb-4">
        <span className="text-[8px] sm:text-[10px] lg:text-xs text-white font-medium flex items-center gap-1">
          <span className="hidden sm:inline">Ver detalhes</span>
          <ArrowRight size={10} className="sm:w-3 sm:h-3" />
        </span>
      </div>
    </motion.div>
  );
};

// Pending Gift Card - Responsivo
const PendingGiftCard = ({
  gift,
  onAccept,
  onDecline,
}: {
  gift: PendingGift;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const rarityConfig = RARITY_CONFIG[gift.rarity];

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
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Gift Icon */}
        <div
          className={`
            w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-[var(--border-radius-md)]
            bg-gradient-to-br ${rarityConfig.gradient}
            border ${rarityConfig.borderColor}
            flex items-center justify-center flex-shrink-0
          `}
        >
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Gift size={16} className={`sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${rarityConfig.color}`} />
          </motion.div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
            <RarityBadge rarity={gift.rarity} size="sm" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)]">
              {formatDate(gift.sentAt)}
            </span>
          </div>
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-[var(--color-text)] truncate">
            {gift.itemName}
          </h3>
          <p className="text-[9px] sm:text-[10px] lg:text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5 truncate">
            <User size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
            <span className="truncate">De {gift.senderName}</span>
          </p>
          {gift.message && (
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-[var(--color-text-muted)] mt-1 sm:mt-1.5 italic line-clamp-1">
              "{gift.message}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 sm:gap-2 sm:flex-col mt-1 sm:mt-0">
          <motion.button
            onClick={onAccept}
            className="flex-1 sm:flex-none px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-[var(--border-radius-sm)] bg-green-500 hover:bg-green-600 text-white text-[9px] sm:text-[10px] lg:text-xs font-medium transition-colors flex items-center justify-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
            <span>Aceitar</span>
          </motion.button>
          <motion.button
            onClick={onDecline}
            className="flex-1 sm:flex-none px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 text-[9px] sm:text-[10px] lg:text-xs font-medium transition-colors flex items-center justify-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
            <span>Recusar</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Modal Component - Responsivo
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

// Item Detail Modal Content - Responsivo
const ItemDetailModal = ({
  item,
  onClose,
  onEquip,
  onUnequip,
  onGift,
}: {
  item: InventoryItem;
  onClose: () => void;
  onEquip: () => void;
  onUnequip: () => void;
  onGift: () => void;
}) => {
  const rarityConfig = RARITY_CONFIG[item.rarity];
  const typeConfig = ITEM_TYPE_CONFIG[item.type];
  const TypeIcon = typeConfig.icon;
  const daysRemaining = item.expiresAt ? getDaysRemaining(item.expiresAt) : null;
  const isExpired = item.status === "expired";

  return (
    <div className="relative overflow-hidden">
      {/* Close button */}
      <motion.button
        onClick={onClose}
        className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 z-20 p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
      </motion.button>

      {/* Header with gradient */}
      <div
        className={`
          relative h-28 sm:h-36 lg:h-48 xl:h-64 bg-gradient-to-br ${rarityConfig.gradient}
          flex items-center justify-center
        `}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className={`
            w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 rounded-full
            bg-gradient-to-br ${rarityConfig.gradient}
            border-2 sm:border-4 ${rarityConfig.borderColor}
            flex items-center justify-center
            shadow-2xl ${rarityConfig.glowColor}
          `}
        >
          <TypeIcon size={24} className={`sm:w-8 sm:h-8 lg:w-12 lg:h-12 xl:w-16 xl:h-16 ${rarityConfig.color}`} />
        </motion.div>

        {/* Rarity Badge */}
        <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4">
          <span
            className={`
              px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full text-[8px] sm:text-[10px] lg:text-xs font-bold
              ${rarityConfig.bgColor} ${rarityConfig.color}
              border ${rarityConfig.borderColor}
            `}
          >
            {rarityConfig.label}
          </span>
        </div>

        {/* Equipped indicator */}
        {item.isEquipped && (
          <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4">
            <span className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full bg-green-500/20 text-green-400 text-[8px] sm:text-[10px] lg:text-xs font-bold border border-green-500/30 flex items-center gap-1">
              <Check size={8} className="sm:w-[10px] sm:h-[10px] lg:w-3 lg:h-3" />
              <span className="hidden sm:inline">Equipado</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-5 xl:p-6">
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-[var(--color-text)] mb-1 sm:mb-2">
            {item.name}
          </h2>
          <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)]">
            {item.description}
          </p>
        </div>

        {/* Info Grid */}
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
                className={`text-[10px] sm:text-xs lg:text-sm font-medium ${
                  daysRemaining <= 7 ? "text-red-400" : "text-[var(--color-text)]"
                }`}
              >
                {daysRemaining <= 0 ? "Expirado" : `${daysRemaining} dias`}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isExpired && (
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 lg:gap-3">
            {item.isEquipped ? (
              <motion.button
                onClick={onUnequip}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-[10px] sm:text-xs lg:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                Desequipar
              </motion.button>
            ) : (
              <motion.button
                onClick={onEquip}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-[10px] sm:text-xs lg:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                Equipar
              </motion.button>
            )}
            <motion.button
              onClick={onGift}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-[var(--border-radius-md)] bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-[10px] sm:text-xs lg:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 border border-pink-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Gift size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              Presentear
            </motion.button>
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

// Gift Opening Animation Modal - Responsivo
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

  const rarityConfig = RARITY_CONFIG[gift.rarity];

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
                      De {gift.senderName}
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
                      `}
                    >
                      <PartyPopper size={32} className={`sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${rarityConfig.color} drop-shadow-lg`} />
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
                      {gift.itemName}
                    </motion.h2>

                    <motion.p
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-1 sm:mt-2 text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)]"
                    >
                      Presente de {gift.senderName}
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
                      Adicionar ao Inventário
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

// Empty State - Responsivo
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

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardInventory = () => {
  // Estados
  const [items] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>(MOCK_PENDING_GIFTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | ItemType | "expired">("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [giftToOpen, setGiftToOpen] = useState<PendingGift | null>(null);
  const [showGiftOpening, setShowGiftOpening] = useState(false);
  const [balance] = useState(1250);

  // Filtros
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

  // Items filtrados
  const filteredItems = useMemo(() => {
    let result = items;

    if (activeFilter !== "all") {
      if (activeFilter === "expired") {
        result = result.filter((item) => item.status === "expired");
      } else {
        result = result.filter((item) => item.type === activeFilter);
      }
    }

    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  // Contadores
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

  // Handlers
  const handleAcceptGift = (gift: PendingGift) => {
    setGiftToOpen(gift);
    setShowGiftOpening(true);
  };

  const handleDeclineGift = (giftId: string) => {
    setPendingGifts((prev) => prev.filter((g) => g.id !== giftId));
  };

  const handleGiftOpenComplete = () => {
    if (giftToOpen) {
      setPendingGifts((prev) => prev.filter((g) => g.id !== giftToOpen.id));
    }
    setShowGiftOpening(false);
    setGiftToOpen(null);
  };

  // Animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
        >
          <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <Package className="text-[var(--color-primary)] w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 flex-shrink-0" />
            <span>Inventário</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1 lg:mt-2">
            Gerencie seus itens e presentes.
          </p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6 xl:mb-8"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Coins}
            label="Saldo"
            value={balance.toLocaleString()}
            subValue="Vcoins"
            variant="premium"
            action="Obter"
            onClick={() => console.log("Obter mais Vcoins")}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={Box}
            label="Itens"
            value={items.filter((i) => i.status === "active").length}
            subValue="ativos"
            variant="primary"
            action="Ver"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={Gift}
            label="Presentes"
            value={pendingGifts.length}
            subValue="novos"
            variant={pendingGifts.length > 0 ? "warning" : "default"}
            action="Abrir"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={Star}
            label="Raros"
            value={items.filter((i) => ["rare", "epic", "legendary"].includes(i.rarity)).length}
            subValue="itens"
            variant="success"
          />
        </motion.div>
      </motion.div>

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
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <InventoryCard noPadding>
          {/* Search and Filter Header */}
          <div className="p-2.5 sm:p-3 lg:p-4 xl:p-6 border-b border-[var(--color-border)]">
            {/* Search Bar */}
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

            {/* Filter Tabs - Scrollable */}
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

          {/* Items Grid */}
          <div className="p-2.5 sm:p-3 lg:p-4 xl:p-6">
            {filteredItems.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-3 xl:gap-4"
                variants={containerVariants}
              >
                {filteredItems.map((item) => (
                  <motion.div key={item.id} variants={itemVariants} layout>
                    <ItemCard item={item} onClick={() => setSelectedItem(item)} />
                  </motion.div>
                ))}
              </motion.div>
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
      </motion.div>

      {/* Item Detail Modal */}
      <Modal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        size="md"
      >
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEquip={() => {
              console.log("Equipar", selectedItem.id);
              setSelectedItem(null);
            }}
            onUnequip={() => {
              console.log("Desequipar", selectedItem.id);
              setSelectedItem(null);
            }}
            onGift={() => {
              console.log("Presentear", selectedItem.id);
              setSelectedItem(null);
            }}
          />
        )}
      </Modal>

      {/* Gift Opening Modal */}
      <GiftOpeningModal
        isOpen={showGiftOpening}
        gift={giftToOpen}
        onComplete={handleGiftOpenComplete}
      />
    </div>
  );
};

export default DashboardInventory;