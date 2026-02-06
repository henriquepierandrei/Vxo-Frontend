import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  Lock,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  History,
  Download,
  Filter,
  Search,
  CalendarDays,
  TrendingUp,
  Award,
  Gift,
  ExternalLink,
  Info,
  HelpCircle,
  MessageCircle,
  ArrowUpRight,
  Repeat,
  RotateCcw,
  Receipt,
  ShieldCheck,
  Wallet,
  X,
  Package,
  Link2,
  Coins,
  Send,
  ArrowRightLeft,
  User,
  Box,
  Tag,
  Layers,
  Star,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

type PaymentStatus = "approved" | "pending" | "processing" | "rejected" | "cancelled";
type TransactionCategory = "premium" | "gifts" | "recharges" | "items" | "url";
type SubscriptionType = "subscription" | "renewal" | "return";
type GiftType = "sent" | "received";
type ItemType = "background" | "frame" | "effect" | "badge" | "cursor";

interface BaseTransaction {
  id: string;
  status: PaymentStatus;
  date: string;
  category: TransactionCategory;
}

interface PremiumTransaction extends BaseTransaction {
  category: "premium";
  method: string;
  methodIcon: string;
  value: number;
  subscriptionType: SubscriptionType;
  expiresAt?: string;
}

interface GiftTransaction extends BaseTransaction {
  category: "gifts";
  giftType: GiftType;
  itemName: string;
  itemIcon: string;
  fromUser?: string;
  toUser?: string;
  value: number;
}

interface RechargeTransaction extends BaseTransaction {
  category: "recharges";
  method: string;
  methodIcon: string;
  coins: number;
  bonus?: number;
  value: number;
}

interface ItemTransaction extends BaseTransaction {
  category: "items";
  itemName: string;
  itemType: ItemType;
  itemIcon: string;
  coins: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UrlTransaction extends BaseTransaction {
  category: "url";
  oldUrl: string;
  newUrl: string;
  reason?: string;
}

type Transaction = PremiumTransaction | GiftTransaction | RechargeTransaction | ItemTransaction | UrlTransaction;

// ═══════════════════════════════════════════════════════════
// DADOS DE EXEMPLO
// ═══════════════════════════════════════════════════════════

const sampleTransactions: Transaction[] = [
  // Premium
  {
    id: "VXO-2025-001234",
    category: "premium",
    method: "PIX",
    methodIcon: "pix",
    status: "approved",
    value: 19.90,
    subscriptionType: "subscription",
    date: "2025-01-15T14:30:00",
    expiresAt: "2025-02-15",
  },
  {
    id: "VXO-2025-001198",
    category: "premium",
    method: "Cartão de Crédito",
    methodIcon: "card",
    status: "approved",
    value: 19.90,
    subscriptionType: "renewal",
    date: "2024-12-15T10:22:00",
  },
  // Gifts
  {
    id: "VXO-GFT-001456",
    category: "gifts",
    giftType: "received",
    itemName: "Moldura Neon",
    itemIcon: "frame",
    fromUser: "player123",
    status: "approved",
    value: 15.00,
    date: "2025-01-10T18:45:00",
  },
  {
    id: "VXO-GFT-001389",
    category: "gifts",
    giftType: "sent",
    itemName: "Background Galaxy",
    itemIcon: "background",
    toUser: "friend456",
    status: "approved",
    value: 25.00,
    date: "2025-01-05T12:30:00",
  },
  {
    id: "VXO-GFT-001290",
    category: "gifts",
    giftType: "received",
    itemName: "Cursor Fire",
    itemIcon: "cursor",
    fromUser: "gamer789",
    status: "pending",
    value: 10.00,
    date: "2025-01-02T09:15:00",
  },
  // Recharges
  {
    id: "VXO-RCH-002345",
    category: "recharges",
    method: "PIX",
    methodIcon: "pix",
    coins: 1000,
    bonus: 100,
    value: 10.00,
    status: "approved",
    date: "2025-01-12T16:20:00",
  },
  {
    id: "VXO-RCH-002298",
    category: "recharges",
    method: "Cartão de Crédito",
    methodIcon: "card",
    coins: 5000,
    bonus: 750,
    value: 45.00,
    status: "approved",
    date: "2024-12-28T11:00:00",
  },
  {
    id: "VXO-RCH-002156",
    category: "recharges",
    method: "PIX",
    methodIcon: "pix",
    coins: 2500,
    bonus: 250,
    value: 22.50,
    status: "rejected",
    date: "2024-12-20T14:45:00",
  },
  // Items
  {
    id: "VXO-ITM-003567",
    category: "items",
    itemName: "Aurora Background",
    itemType: "background",
    itemIcon: "background",
    coins: 500,
    rarity: "epic",
    status: "approved",
    date: "2025-01-14T20:30:00",
  },
  {
    id: "VXO-ITM-003489",
    category: "items",
    itemName: "Golden Frame",
    itemType: "frame",
    itemIcon: "frame",
    coins: 750,
    rarity: "legendary",
    status: "approved",
    date: "2025-01-08T15:10:00",
  },
  {
    id: "VXO-ITM-003345",
    category: "items",
    itemName: "Sparkle Effect",
    itemType: "effect",
    itemIcon: "effect",
    coins: 200,
    rarity: "rare",
    status: "approved",
    date: "2025-01-03T08:55:00",
  },
  {
    id: "VXO-ITM-003234",
    category: "items",
    itemName: "Verified Badge",
    itemType: "badge",
    itemIcon: "badge",
    coins: 1000,
    rarity: "legendary",
    status: "processing",
    date: "2024-12-30T17:40:00",
  },
  // URL Changes
  {
    id: "VXO-URL-004123",
    category: "url",
    oldUrl: "vxo.lat/user123",
    newUrl: "vxo.lat/henrique",
    status: "approved",
    date: "2025-01-11T13:25:00",
  },
  {
    id: "VXO-URL-004089",
    category: "url",
    oldUrl: "vxo.lat/oldname",
    newUrl: "vxo.lat/newname",
    reason: "Mudança de marca pessoal",
    status: "approved",
    date: "2024-11-22T10:15:00",
  },
];

// ═══════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════

// Ícone PIX
const PixIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 512 512" className={className} fill="currentColor">
    <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116zm-188.684 107.62l76.711 76.711c14.192 14.172 22 33.026 22 53.12v9.214l-97.139-97.139c-30.344-30.325-79.523-30.325-109.867 0L0 364.614v-15.096c0-20.075 7.808-38.929 22-53.12l76.712-76.693c14.191-14.192 33.044-22 53.119-22h.02c20.056 0 38.909 7.808 53.1 22zm222.142 53.12c-14.192 14.191-22 33.045-22 53.12v15.098l97.139-97.139c30.344-30.344 30.344-79.523 0-109.867l-97.139-97.139v9.233c0 20.075-7.808 38.929-22 53.12l-76.693 76.693c-5.53 5.55-5.55 14.599 0 20.149l76.693 76.712c14.172 14.192 33.026 22 53.1 22h.02c20.057 0 38.91-7.808 53.1-22l76.713-76.712c14.191-14.172 22-33.026 22-53.1v-.02c0-20.056-7.809-38.909-22-53.1l-76.712-76.693c-14.192-14.191-33.046-22-53.12-22h-9.214l97.139 97.139c30.325 30.344 30.325 79.523 0 109.867l-97.139 97.139z"/>
  </svg>
);

// Toggle Component
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

// Card Component
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
    className={`
      bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
      border border-[var(--color-border)] rounded-[var(--border-radius-lg)]
      p-4 sm:p-6 ${className}
    `}
  >
    {children}
  </motion.div>
);

// Section Header
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
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
        <Icon size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)]" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1">{description}</p>
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  const statusConfig = {
    approved: {
      label: "Aprovado",
      icon: CheckCircle,
      className: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    pending: {
      label: "Pendente",
      icon: Clock,
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    processing: {
      label: "Processando",
      icon: RefreshCw,
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    rejected: {
      label: "Rejeitado",
      icon: XCircle,
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    cancelled: {
      label: "Cancelado",
      icon: XCircle,
      className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border ${config.className}
      `}
    >
      <Icon size={12} className={status === "processing" ? "animate-spin" : ""} />
      {config.label}
    </motion.span>
  );
};

// Rarity Badge
const RarityBadge = ({ rarity }: { rarity: ItemTransaction["rarity"] }) => {
  const rarityConfig = {
    common: { label: "Comum", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    rare: { label: "Raro", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    epic: { label: "Épico", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    legendary: { label: "Lendário", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  };

  const config = rarityConfig[rarity];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.className}`}>
      <Star size={10} />
      {config.label}
    </span>
  );
};

// Gift Type Badge
const GiftTypeBadge = ({ type }: { type: GiftType }) => {
  const config = type === "sent" 
    ? { label: "Enviado", icon: Send, className: "bg-orange-500/10 text-orange-400" }
    : { label: "Recebido", icon: Gift, className: "bg-green-500/10 text-green-400" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.className}`}>
      <config.icon size={12} />
      {config.label}
    </span>
  );
};

// Item Icon Component
const ItemIcon = ({ type }: { type: ItemType | string }) => {
  const icons: Record<string, React.ElementType> = {
    background: Image,
    frame: Frame,
    effect: Sparkles,
    badge: BadgeCheck,
    cursor: Zap,
  };
  
  const Icon = icons[type] || Package;
  return <Icon size={16} className="text-[var(--color-primary)]" />;
};

// Payment Method Icon
const PaymentMethodIcon = ({ method }: { method: string }) => {
  if (method === "pix") {
    return <PixIcon className="w-5 h-5 text-[#32BCAD]" />;
  }
  return <CreditCard className="w-5 h-5 text-[var(--color-text-muted)]" />;
};

// Stat Card
const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  iconColor = "text-[var(--color-primary)]",
  iconBg = "bg-[var(--color-primary)]/10",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  iconColor?: string;
  iconBg?: string;
}) => {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-[var(--color-text-muted)]",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="p-3 sm:p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2 rounded-[var(--border-radius-sm)] ${iconBg}`}>
          <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${iconColor}`} />
        </div>
        {trend && trendLabel && (
          <span className={`text-[10px] sm:text-xs font-medium ${trendColors[trend]} flex items-center gap-1`}>
            {trend === "up" && <TrendingUp size={10} />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-lg sm:text-2xl font-bold text-[var(--color-text)]">{value}</p>
      <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 sm:mt-1">{label}</p>
    </motion.div>
  );
};

// Category Tab Component
const CategoryTab = ({
  icon: Icon,
  label,
  count,
  isActive,
  onClick,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  color: string;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)]
      font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap
      ${isActive 
        ? `bg-${color}/10 text-${color} border border-${color}/30` 
        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent"
      }
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    style={isActive ? {
      backgroundColor: `var(--color-primary)`.replace(')', ', 0.1)').replace('var(', 'rgba(143, 124, 255'),
      color: 'var(--color-primary)',
      borderColor: `var(--color-primary)`.replace(')', ', 0.3)').replace('var(', 'rgba(143, 124, 255'),
    } : {}}
  >
    <Icon size={16} />
    <span className="hidden sm:inline">{label}</span>
    {count > 0 && (
      <span className={`
        px-1.5 py-0.5 rounded-full text-[10px] font-semibold
        ${isActive ? "bg-[var(--color-primary)]/20" : "bg-[var(--color-surface-hover)]"}
      `}>
        {count}
      </span>
    )}
    
    {isActive && (
      <motion.div
        layoutId="activeTabIndicator"
        className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--color-primary)] rounded-full"
      />
    )}
  </motion.button>
);

// Empty State Component
const EmptyState = ({ category }: { category: TransactionCategory }) => {
  const emptyConfig = {
    premium: {
      icon: Crown,
      title: "Nenhuma compra Premium",
      description: "Você ainda não realizou nenhuma compra Premium. Desbloqueie recursos exclusivos!",
      cta: "Ver planos Premium",
    },
    gifts: {
      icon: Gift,
      title: "Nenhum presente",
      description: "Você ainda não enviou ou recebeu presentes. Surpreenda seus amigos!",
      cta: "Enviar presente",
    },
    recharges: {
      icon: Coins,
      title: "Nenhuma recarga",
      description: "Você ainda não fez nenhuma recarga de moedas. Carregue sua conta!",
      cta: "Recarregar moedas",
    },
    items: {
      icon: Package,
      title: "Nenhum item comprado",
      description: "Você ainda não comprou nenhum item. Explore a loja!",
      cta: "Ver loja",
    },
    url: {
      icon: Link2,
      title: "Nenhuma troca de URL",
      description: "Você ainda não alterou sua URL personalizada.",
      cta: "Alterar URL",
    },
  };

  const config = emptyConfig[category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-10 sm:py-16"
    >
      <div className="relative mb-4 sm:mb-6">
        <motion.div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(143, 124, 255, 0)",
              "0 0 0 15px rgba(143, 124, 255, 0.1)",
              "0 0 0 0 rgba(143, 124, 255, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon size={28} className="sm:w-8 sm:h-8 text-[var(--color-text-muted)]" />
        </motion.div>
      </div>
      
      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)] mb-2 text-center">
        {config.title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] text-center max-w-xs mb-4 sm:mb-6 px-4">
        {config.description}
      </p>
      
      <motion.button
        className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/25 flex items-center gap-2"
        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(143, 124, 255, 0.3)" }}
        whileTap={{ scale: 0.95 }}
      >
        {config.cta}
        <ArrowUpRight size={14} />
      </motion.button>
    </motion.div>
  );
};

// Info Card Component
const InfoCard = ({
  icon: Icon,
  title,
  description,
  variant = "default",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: "default" | "primary" | "warning";
}) => {
  const variantStyles = {
    default: "bg-[var(--color-surface)] border-[var(--color-border)]",
    primary: "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20",
    warning: "bg-yellow-500/5 border-yellow-500/20",
  };

  const iconStyles = {
    default: "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]",
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    warning: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-3 sm:p-4 rounded-[var(--border-radius-md)] border ${variantStyles[variant]} transition-all duration-300`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={`p-1.5 sm:p-2 rounded-[var(--border-radius-sm)] flex-shrink-0 ${iconStyles[variant]}`}>
          <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">{title}</h4>
          <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 sm:mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Premium Feature Card
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
    className={`
      flex items-center justify-between p-2 sm:p-2.5 rounded-[var(--border-radius-sm)]
      border transition-all duration-300
      ${locked
        ? "border-[var(--color-border)] bg-[var(--color-surface)] opacity-60"
        : enabled
          ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }
    `}
    whileHover={locked ? {} : { scale: 1.02 }}
  >
    <div className="flex items-center gap-2">
      <Icon
        size={14}
        className={`sm:w-4 sm:h-4 ${locked ? "text-[var(--color-text-muted)]" : "text-[var(--color-primary)]"}`}
      />
      <span className={`text-[11px] sm:text-xs font-medium ${locked ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"}`}>
        {title}
      </span>
    </div>

    {locked ? (
      <Lock size={12} className="text-[var(--color-text-muted)]" />
    ) : (
      <Toggle enabled={enabled} onChange={onToggle} />
    )}
  </motion.div>
);

// Status Legend Item
const StatusLegendItem = ({
  icon: Icon,
  label,
  description,
  color,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
}) => (
  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors">
    <div className={`p-1 sm:p-1.5 rounded-full ${color}`}>
      <Icon size={12} className="sm:w-[14px] sm:h-[14px]" />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-medium text-[var(--color-text)]">{label}</p>
      <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">{description}</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// COMPONENTES DE TABELA POR CATEGORIA
// ═══════════════════════════════════════════════════════════

// Format helpers
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Premium Table Row
const PremiumRow = ({ transaction, index }: { transaction: PremiumTransaction; index: number }) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group hover:bg-[var(--color-surface-hover)] transition-colors"
  >
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <code className="text-[10px] sm:text-xs font-mono text-[var(--color-text)] bg-[var(--color-surface)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
        {transaction.id}
      </code>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <PaymentMethodIcon method={transaction.methodIcon} />
        <span className="text-xs sm:text-sm text-[var(--color-text)] hidden sm:inline">{transaction.method}</span>
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <StatusBadge status={transaction.status} />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <span className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">
        {formatCurrency(transaction.value)}
      </span>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
        transaction.subscriptionType === "subscription" 
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          : transaction.subscriptionType === "renewal"
            ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
            : "bg-purple-500/10 text-purple-400"
      }`}>
        {transaction.subscriptionType === "subscription" && <Award size={12} />}
        {transaction.subscriptionType === "renewal" && <Repeat size={12} />}
        {transaction.subscriptionType === "return" && <RotateCcw size={12} />}
        {transaction.subscriptionType === "subscription" ? "Inscrição" : 
         transaction.subscriptionType === "renewal" ? "Renovação" : "Retorno"}
      </span>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--color-text-muted)]">
        <CalendarDays size={12} />
        {formatDate(transaction.date)}
      </div>
    </td>
  </motion.tr>
);

// Gifts Table Row
const GiftsRow = ({ transaction, index }: { transaction: GiftTransaction; index: number }) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group hover:bg-[var(--color-surface-hover)] transition-colors"
  >
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <code className="text-[10px] sm:text-xs font-mono text-[var(--color-text)] bg-[var(--color-surface)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
        {transaction.id}
      </code>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-2">
        <ItemIcon type={transaction.itemIcon} />
        <span className="text-xs sm:text-sm text-[var(--color-text)]">{transaction.itemName}</span>
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <GiftTypeBadge type={transaction.giftType} />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--color-text-muted)]">
        <User size={12} />
        {transaction.giftType === "sent" ? transaction.toUser : transaction.fromUser}
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <StatusBadge status={transaction.status} />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--color-text-muted)]">
        <CalendarDays size={12} />
        {formatDate(transaction.date)}
      </div>
    </td>
  </motion.tr>
);

// Recharges Table Row
const RechargesRow = ({ transaction, index }: { transaction: RechargeTransaction; index: number }) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group hover:bg-[var(--color-surface-hover)] transition-colors"
  >
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <code className="text-[10px] sm:text-xs font-mono text-[var(--color-text)] bg-[var(--color-surface)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
        {transaction.id}
      </code>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <PaymentMethodIcon method={transaction.methodIcon} />
        <span className="text-xs sm:text-sm text-[var(--color-text)] hidden sm:inline">{transaction.method}</span>
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1.5">
        <Coins size={14} className="text-yellow-400" />
        <span className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">{transaction.coins.toLocaleString()}</span>
        {transaction.bonus && (
          <span className="text-[10px] sm:text-xs text-green-400 font-medium">+{transaction.bonus}</span>
        )}
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <span className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">
        {formatCurrency(transaction.value)}
      </span>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <StatusBadge status={transaction.status} />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--color-text-muted)]">
        <CalendarDays size={12} />
        {formatDate(transaction.date)}
      </div>
    </td>
  </motion.tr>
);

// Items Table Row
const ItemsRow = ({ transaction, index }: { transaction: ItemTransaction; index: number }) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group hover:bg-[var(--color-surface-hover)] transition-colors"
  >
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <code className="text-[10px] sm:text-xs font-mono text-[var(--color-text)] bg-[var(--color-surface)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
        {transaction.id}
      </code>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-2">
        <ItemIcon type={transaction.itemType} />
        <div>
          <span className="text-xs sm:text-sm text-[var(--color-text)] block">{transaction.itemName}</span>
          <span className="text-[10px] text-[var(--color-text-muted)] capitalize hidden sm:block">{transaction.itemType}</span>
        </div>
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <RarityBadge rarity={transaction.rarity} />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1">
        <Coins size={14} className="text-yellow-400" />
        <span className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">{transaction.coins}</span>
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <StatusBadge status={transaction.status} />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--color-text-muted)]">
        <CalendarDays size={12} />
        {formatDate(transaction.date)}
      </div>
    </td>
  </motion.tr>
);

// URL Table Row
const UrlRow = ({ transaction, index }: { transaction: UrlTransaction; index: number }) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group hover:bg-[var(--color-surface-hover)] transition-colors"
  >
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <code className="text-[10px] sm:text-xs font-mono text-[var(--color-text)] bg-[var(--color-surface)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
        {transaction.id}
      </code>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1.5">
        <Link2 size={14} className="text-red-400" />
        <code className="text-[10px] sm:text-xs text-red-400 line-through">{transaction.oldUrl}</code>
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1.5">
        <ArrowRightLeft size={14} className="text-[var(--color-text-muted)]" />
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1.5">
        <Link2 size={14} className="text-green-400" />
        <code className="text-[10px] sm:text-xs text-green-400">{transaction.newUrl}</code>
      </div>
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3">
      <StatusBadge status={transaction.status} />
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--color-text-muted)]">
        <CalendarDays size={12} />
        {formatDate(transaction.date)}
      </div>
    </td>
  </motion.tr>
);

// Table Headers by Category
const tableHeaders: Record<TransactionCategory, { key: string; label: string; hideOnMobile?: boolean }[]> = {
  premium: [
    { key: "id", label: "ID" },
    { key: "method", label: "Método" },
    { key: "status", label: "Status" },
    { key: "value", label: "Valor" },
    { key: "type", label: "Tipo", hideOnMobile: true },
    { key: "date", label: "Data", hideOnMobile: true },
  ],
  gifts: [
    { key: "id", label: "ID" },
    { key: "item", label: "Item" },
    { key: "type", label: "Tipo" },
    { key: "user", label: "Usuário", hideOnMobile: true },
    { key: "status", label: "Status" },
    { key: "date", label: "Data", hideOnMobile: true },
  ],
  recharges: [
    { key: "id", label: "ID" },
    { key: "method", label: "Método" },
    { key: "coins", label: "Moedas" },
    { key: "value", label: "Valor" },
    { key: "status", label: "Status" },
    { key: "date", label: "Data", hideOnMobile: true },
  ],
  items: [
    { key: "id", label: "ID" },
    { key: "item", label: "Item" },
    { key: "rarity", label: "Raridade" },
    { key: "price", label: "Preço" },
    { key: "status", label: "Status" },
    { key: "date", label: "Data", hideOnMobile: true },
  ],
  url: [
    { key: "id", label: "ID" },
    { key: "old", label: "URL Antiga" },
    { key: "arrow", label: "" },
    { key: "new", label: "Nova URL" },
    { key: "status", label: "Status" },
    { key: "date", label: "Data", hideOnMobile: true },
  ],
};

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const LogsPremium = () => {
  // Estados
  const [isPremium] = useState(false);
  const [activeCategory, setActiveCategory] = useState<TransactionCategory>("premium");
  const [transactions] = useState<Transaction[]>(sampleTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Premium features state
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

  // Category config
  const categories = [
    { id: "premium" as const, icon: Crown, label: "Premium", color: "primary" },
    { id: "gifts" as const, icon: Gift, label: "Presentes", color: "orange" },
    { id: "recharges" as const, icon: Coins, label: "Recargas", color: "yellow" },
    { id: "items" as const, icon: Package, label: "Itens", color: "purple" },
    { id: "url" as const, icon: Link2, label: "Troca URL", color: "blue" },
  ];

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesCategory = t.category === activeCategory;
      const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [transactions, activeCategory, searchTerm, statusFilter]);

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<TransactionCategory, number> = {
      premium: 0,
      gifts: 0,
      recharges: 0,
      items: 0,
      url: 0,
    };
    transactions.forEach((t) => {
      counts[t.category]++;
    });
    return counts;
  }, [transactions]);

  // Estatísticas baseadas na categoria ativa
  const stats = useMemo(() => {
    const categoryTransactions = transactions.filter(t => t.category === activeCategory);
    const approved = categoryTransactions.filter(t => t.status === "approved");
    
    switch (activeCategory) {
      case "premium":
        const premiumTx = approved as PremiumTransaction[];
        return {
          total: categoryTransactions.length,
          approved: approved.length,
          value: premiumTx.reduce((acc, t) => acc + t.value, 0),
          extra: "meses ativos",
        };
      case "gifts":
        const giftsTx = categoryTransactions as GiftTransaction[];
        return {
          total: categoryTransactions.length,
          sent: giftsTx.filter(t => t.giftType === "sent").length,
          received: giftsTx.filter(t => t.giftType === "received").length,
          extra: "presentes",
        };
      case "recharges":
        const rechargesTx = approved as RechargeTransaction[];
        return {
          total: categoryTransactions.length,
          approved: approved.length,
          coins: rechargesTx.reduce((acc, t) => acc + t.coins + (t.bonus || 0), 0),
          value: rechargesTx.reduce((acc, t) => acc + t.value, 0),
        };
      case "items":
        const itemsTx = approved as ItemTransaction[];
        return {
          total: categoryTransactions.length,
          approved: approved.length,
          coins: itemsTx.reduce((acc, t) => acc + t.coins, 0),
          extra: "itens",
        };
      case "url":
        return {
          total: categoryTransactions.length,
          approved: approved.length,
          extra: "trocas",
        };
      default:
        return { total: 0, approved: 0 };
    }
  }, [transactions, activeCategory]);

  // Animação de entrada escalonada
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

  // Renderizar linha da tabela baseado na categoria
  const renderTableRow = (transaction: Transaction, index: number) => {
    switch (transaction.category) {
      case "premium":
        return <PremiumRow key={transaction.id} transaction={transaction} index={index} />;
      case "gifts":
        return <GiftsRow key={transaction.id} transaction={transaction} index={index} />;
      case "recharges":
        return <RechargesRow key={transaction.id} transaction={transaction} index={index} />;
      case "items":
        return <ItemsRow key={transaction.id} transaction={transaction} index={index} />;
      case "url":
        return <UrlRow key={transaction.id} transaction={transaction} index={index} />;
      default:
        return null;
    }
  };

  // Renderizar stats baseado na categoria
  const renderStats = () => {
    switch (activeCategory) {
      case "premium":
        return (
          <>
            <StatCard icon={Receipt} label="Total de Compras" value={stats.total.toString()} />
            <StatCard icon={CheckCircle} label="Aprovadas" value={stats.approved?.toString() || "0"} iconColor="text-green-400" iconBg="bg-green-500/10" />
            <StatCard icon={Wallet} label="Total Investido" value={formatCurrency(stats.value || 0)} trend="up" trendLabel="+R$ 19,90" />
            <StatCard icon={Crown} label="Premium Ativo" value={stats.approved && stats.approved > 0 ? "Sim" : "Não"} iconColor="text-yellow-400" iconBg="bg-yellow-500/10" />
          </>
        );
      case "gifts":
        return (
          <>
            <StatCard icon={Gift} label="Total de Presentes" value={stats.total.toString()} />
            <StatCard icon={Send} label="Enviados" value={stats.sent?.toString() || "0"} iconColor="text-orange-400" iconBg="bg-orange-500/10" />
            <StatCard icon={Package} label="Recebidos" value={stats.received?.toString() || "0"} iconColor="text-green-400" iconBg="bg-green-500/10" />
            <StatCard icon={Star} label="Amigos Presenteados" value={stats.sent?.toString() || "0"} iconColor="text-purple-400" iconBg="bg-purple-500/10" />
          </>
        );
      case "recharges":
        return (
          <>
            <StatCard icon={Receipt} label="Total de Recargas" value={stats.total.toString()} />
            <StatCard icon={CheckCircle} label="Aprovadas" value={stats.approved?.toString() || "0"} iconColor="text-green-400" iconBg="bg-green-500/10" />
            <StatCard icon={Coins} label="Moedas Totais" value={stats.coins?.toLocaleString() || "0"} iconColor="text-yellow-400" iconBg="bg-yellow-500/10" trend="up" trendLabel="+bônus" />
            <StatCard icon={Wallet} label="Total Investido" value={formatCurrency(stats.value || 0)} />
          </>
        );
      case "items":
        return (
          <>
            <StatCard icon={Package} label="Total de Itens" value={stats.total.toString()} />
            <StatCard icon={CheckCircle} label="Comprados" value={stats.approved?.toString() || "0"} iconColor="text-green-400" iconBg="bg-green-500/10" />
            <StatCard icon={Coins} label="Moedas Gastas" value={stats.coins?.toLocaleString() || "0"} iconColor="text-yellow-400" iconBg="bg-yellow-500/10" />
            <StatCard icon={Layers} label="Coleção" value={`${stats.approved || 0} itens`} iconColor="text-purple-400" iconBg="bg-purple-500/10" />
          </>
        );
      case "url":
        return (
          <>
            <StatCard icon={Link2} label="Total de Trocas" value={stats.total.toString()} />
            <StatCard icon={CheckCircle} label="Aprovadas" value={stats.approved?.toString() || "0"} iconColor="text-green-400" iconBg="bg-green-500/10" />
            <StatCard icon={Clock} label="Última Troca" value={stats.total > 0 ? "Recente" : "—"} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
            <StatCard icon={Tag} label="URL Atual" value="vxo.lat/henrique" iconColor="text-[var(--color-primary)]" />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-8">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-[var(--color-text-muted)] mb-2 sm:mb-4 overflow-x-auto whitespace-nowrap pb-2"
        >
          <span>Dashboard</span>
          <ChevronRight size={10} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
          <span>Configurações</span>
          <ChevronRight size={10} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
          <span className="text-[var(--color-text)]">Histórico</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <History className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            Histórico
          </h1>
          <p className="text-[10px] sm:text-sm lg:text-base text-[var(--color-text-muted)] mt-1 sm:mt-2">
            Acompanhe todo o seu histórico de transações dentro da Vxo.
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6"
      >
        {/* Category Tabs */}
        <motion.div variants={itemVariants} className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => (
              <CategoryTab
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                count={categoryCounts[cat.id]}
                isActive={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                color={cat.color}
              />
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {renderStats()}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Transaction History Table */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <SettingsCard>
              <SectionHeader
                icon={categories.find(c => c.id === activeCategory)?.icon || Receipt}
                title={categories.find(c => c.id === activeCategory)?.label || "Histórico"}
                description={`Acompanhe seu histórico de ${categories.find(c => c.id === activeCategory)?.label.toLowerCase()}.`}
                action={
                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative hidden sm:block">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="text"
                        placeholder="Buscar por ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors w-40 lg:w-48"
                      />
                    </div>

                    {/* Filter Button */}
                    <div className="relative">
                      <motion.button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-2 rounded-[var(--border-radius-sm)] border transition-all ${
                          statusFilter !== "all"
                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Filter size={16} />
                      </motion.button>

                      {/* Filter Dropdown */}
                      <AnimatePresence>
                        {isFilterOpen && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40"
                              onClick={() => setIsFilterOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--border-radius-md)] shadow-xl z-50 overflow-hidden"
                            >
                              <div className="p-2 space-y-1">
                                {[
                                  { value: "all", label: "Todos" },
                                  { value: "approved", label: "Aprovados" },
                                  { value: "pending", label: "Pendentes" },
                                  { value: "processing", label: "Processando" },
                                  { value: "rejected", label: "Rejeitados" },
                                  { value: "cancelled", label: "Cancelados" },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setStatusFilter(option.value as PaymentStatus | "all");
                                      setIsFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-[var(--border-radius-sm)] transition-colors ${
                                      statusFilter === option.value
                                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                        : "text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Export Button */}
                    <motion.button
                      className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all hidden sm:block"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Exportar histórico"
                    >
                      <Download size={16} />
                    </motion.button>
                  </div>
                }
              />

              {/* Table or Empty State */}
              <AnimatePresence mode="wait">
                {filteredTransactions.length > 0 ? (
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overflow-x-auto -mx-4 sm:-mx-6"
                  >
                    <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-[var(--color-border)]">
                            {tableHeaders[activeCategory].map((header) => (
                              <th
                                key={header.key}
                                className={`px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider ${
                                  header.hideOnMobile ? "hidden lg:table-cell" : ""
                                }`}
                              >
                                {header.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                          {filteredTransactions.map((transaction, index) => renderTableRow(transaction, index))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${activeCategory}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState category={activeCategory} />
                  </motion.div>
                )}
              </AnimatePresence>
            </SettingsCard>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
            {/* Important Info */}
            <SettingsCard>
              <SectionHeader
                icon={Info}
                title="Importante"
                description="Informações sobre transações."
              />

              <div className="space-y-2 sm:space-y-3">
                <InfoCard
                  icon={CreditCard}
                  title="Pagamentos"
                  description="Todas as transações são processadas automaticamente sem intervenção manual."
                  variant="primary"
                />

                <InfoCard
                  icon={ShieldCheck}
                  title="Segurança"
                  description="Seus dados estão protegidos e todas as transações são criptografadas."
                />

                <InfoCard
                  icon={MessageCircle}
                  title="Suporte"
                  description="Em caso de problemas, fale com nossa equipe no Discord."
                  variant="warning"
                />
              </div>
            </SettingsCard>

            {/* Status Legend */}
            <SettingsCard>
              <SectionHeader
                icon={AlertCircle}
                title="Status"
                description="Entenda os status."
              />

              <div className="space-y-1 sm:space-y-2">
                <StatusLegendItem icon={CheckCircle} label="Aprovado" description="Confirmado" color="bg-green-500/10 text-green-400" />
                <StatusLegendItem icon={Clock} label="Pendente" description="Aguardando" color="bg-yellow-500/10 text-yellow-400" />
                <StatusLegendItem icon={RefreshCw} label="Processando" description="Em análise" color="bg-blue-500/10 text-blue-400" />
                <StatusLegendItem icon={XCircle} label="Rejeitado" description="Recusado" color="bg-red-500/10 text-red-400" />
                <StatusLegendItem icon={X} label="Cancelado" description="Cancelado" color="bg-gray-500/10 text-gray-400" />
              </div>
            </SettingsCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LogsPremium;