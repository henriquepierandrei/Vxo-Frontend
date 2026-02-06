// pages/DashboardInventory.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Package,
  Coins,
  Box,
  Gift,
  X,
  CheckCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Eye,
  Send,
  Filter,
  Search,
  ShoppingBag,
  Frame,
  Award,
  Zap,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

type ItemCategory = "all" | "frames" | "badges" | "effects" | "gifts" | "expired";
type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: Exclude<ItemCategory, "all" | "expired">;
  rarity: ItemRarity;
  image: string;
  isActive: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  obtainedAt: Date;
  giftFrom?: string;
  giftTo?: string;
  isPending?: boolean;
}

interface GiftPending {
  id: string;
  itemId: string;
  from: string;
  sentAt: Date;
  item: InventoryItem;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const RARITY_COLORS: Record<ItemRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    text: "text-gray-400",
    glow: "shadow-gray-500/20",
  },
  uncommon: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    glow: "shadow-green-500/20",
  },
  rare: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  epic: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
  },
  legendary: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
};

const RARITY_NAMES: Record<ItemRarity, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

const CATEGORY_ICONS: Record<ItemCategory, React.ReactNode> = {
  all: <Box size={16} />,
  frames: <Frame size={16} />,
  badges: <Award size={16} />,
  effects: <Zap size={16} />,
  gifts: <Gift size={16} />,
  expired: <Clock size={16} />,
};

const CATEGORY_NAMES: Record<ItemCategory, string> = {
  all: "Todos",
  frames: "Molduras",
  badges: "Insígnias",
  effects: "Efeitos",
  gifts: "Presentes",
  expired: "Expirados",
};

// Dados de exemplo
const MOCK_ITEMS: InventoryItem[] = [
  {
    id: "1",
    name: "Moldura Neon",
    description: "Uma moldura com efeito neon brilhante",
    category: "frames",
    rarity: "rare",
    image: "/frames/neon.png",
    isActive: true,
    isExpired: false,
    obtainedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Insígnia VIP",
    description: "Exclusiva para membros VIP",
    category: "badges",
    rarity: "epic",
    image: "/badges/vip.png",
    isActive: false,
    isExpired: false,
    expiresAt: new Date("2024-12-31"),
    obtainedAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    name: "Efeito Partículas",
    description: "Partículas mágicas ao redor do perfil",
    category: "effects",
    rarity: "legendary",
    image: "/effects/particles.png",
    isActive: true,
    isExpired: false,
    obtainedAt: new Date("2024-03-10"),
  },
  {
    id: "4",
    name: "Moldura Básica",
    description: "Moldura simples e elegante",
    category: "frames",
    rarity: "common",
    image: "/frames/basic.png",
    isActive: false,
    isExpired: true,
    expiresAt: new Date("2024-01-01"),
    obtainedAt: new Date("2023-12-01"),
  },
];

const MOCK_GIFTS: GiftPending[] = [
  {
    id: "g1",
    itemId: "gift1",
    from: "João Silva",
    sentAt: new Date("2024-03-15"),
    item: {
      id: "gift1",
      name: "Moldura Presente",
      description: "Um presente especial!",
      category: "frames",
      rarity: "uncommon",
      image: "/frames/gift.png",
      isActive: false,
      isExpired: false,
      obtainedAt: new Date(),
      isPending: true,
    },
  },
];

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE - TOTALMENTE RESPONSIVOS
// ═══════════════════════════════════════════════════════════

// Modal Component - RESPONSIVO
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "max-w-[calc(100vw-2rem)] sm:max-w-sm",
    md: "max-w-[calc(100vw-2rem)] sm:max-w-md",
    lg: "max-w-[calc(100vw-2rem)] sm:max-w-2xl",
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
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div 
              className={`
                w-full ${sizeClasses[size]} 
                bg-[var(--color-background)] backdrop-blur-[var(--blur-amount)] 
                border border-[var(--color-border)] 
                rounded-t-[var(--border-radius-xl)] sm:rounded-[var(--border-radius-xl)] 
                shadow-2xl overflow-hidden
                max-h-[90vh] sm:max-h-[85vh]
                flex flex-col
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] flex-shrink-0">
                <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              
              {/* Content - Scrollable */}
              <div className="p-4 overflow-y-auto flex-1">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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
      border border-[var(--color-border)] 
      rounded-[var(--border-radius-lg)] 
      p-3 sm:p-4 md:p-6 
      ${className}
    `}
  >
    {children}
  </motion.div>
);

// Stat Card - RESPONSIVO
const StatCard = ({
  icon: Icon,
  label,
  value,
  sublabel,
  action,
  actionLabel,
  color = "primary",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel: string;
  action?: () => void;
  actionLabel?: string;
  color?: "primary" | "success" | "warning" | "info";
  delay?: number;
}) => {
  const colorClasses = {
    primary: "from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border-[var(--color-primary)]/20",
    success: "from-green-500/20 to-green-500/5 border-green-500/20",
    warning: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
    info: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  };

  const iconColorClasses = {
    primary: "text-[var(--color-primary)] bg-[var(--color-primary)]/10",
    success: "text-green-400 bg-green-500/10",
    warning: "text-amber-400 bg-amber-500/10",
    info: "text-blue-400 bg-blue-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`
        relative overflow-hidden rounded-[var(--border-radius-lg)] border
        bg-gradient-to-br ${colorClasses[color]}
        p-3 sm:p-4
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--border-radius-md)] ${iconColorClasses[color]} flex items-center justify-center mb-2 sm:mb-3`}>
            <Icon size={18} className="sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">{label}</p>
          <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
            <span className="text-lg sm:text-2xl md:text-3xl font-bold text-[var(--color-text)]">{value}</span>
            <span className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">{sublabel}</span>
          </div>
        </div>
        
        {action && actionLabel && (
          <motion.button
            onClick={action}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-all flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLabel}
          </motion.button>
        )}
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-current opacity-5" />
    </motion.div>
  );
};

// Category Tab - RESPONSIVO
const CategoryTab = ({
  category,
  isActive,
  count,
  onClick,
}: {
  category: ItemCategory;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      relative flex items-center gap-1 sm:gap-2 
      px-2.5 sm:px-3 md:px-4 
      py-2 sm:py-2.5 
      rounded-[var(--border-radius-md)]
      font-medium text-[11px] sm:text-xs md:text-sm 
      transition-all whitespace-nowrap
      flex-shrink-0
      ${isActive
        ? "bg-[var(--color-primary)] text-white"
        : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="flex-shrink-0">{CATEGORY_ICONS[category]}</span>
    <span className="hidden xs:inline sm:inline">{CATEGORY_NAMES[category]}</span>
    <span className={`
      px-1 sm:px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold
      ${isActive ? "bg-white/20 text-white" : "bg-[var(--color-background)] text-[var(--color-text-muted)]"}
    `}>
      {count}
    </span>
  </motion.button>
);

// Inventory Item Card - RESPONSIVO
const InventoryItemCard = ({
  item,
  onView,
  onEquip,
  onGift,
}: {
  item: InventoryItem;
  onView: () => void;
  onEquip: () => void;
  onGift: () => void;
}) => {
  const rarityStyle = RARITY_COLORS[item.rarity];
  const [showActions, setShowActions] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      onClick={() => setShowActions(!showActions)}
      className={`
        relative group rounded-[var(--border-radius-md)] sm:rounded-[var(--border-radius-lg)] 
        border overflow-hidden cursor-pointer
        bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
        transition-all duration-300
        ${item.isExpired ? "opacity-60" : ""}
        ${rarityStyle.border}
      `}
    >
      {/* Rarity Glow Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${rarityStyle.bg}`} />
      
      {/* Active Badge */}
      {item.isActive && !item.isExpired && (
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10">
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold bg-green-500 text-white flex items-center gap-0.5 sm:gap-1">
            <CheckCircle size={8} className="sm:w-[10px] sm:h-[10px]" />
            <span className="hidden sm:inline">ATIVO</span>
          </span>
        </div>
      )}
      
      {/* Expired Badge */}
      {item.isExpired && (
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10">
          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold bg-red-500/80 text-white flex items-center gap-0.5 sm:gap-1">
            <Clock size={8} className="sm:w-[10px] sm:h-[10px]" />
            <span className="hidden sm:inline">EXPIRADO</span>
          </span>
        </div>
      )}
      
      {/* Rarity Badge */}
      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10">
        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}`}>
          {RARITY_NAMES[item.rarity].slice(0, 3).toUpperCase()}
        </span>
      </div>
      
      {/* Item Image */}
      <div className="relative aspect-square p-2 sm:p-4 flex items-center justify-center">
        <div className={`w-12 h-12 sm:w-16 md:w-20 lg:w-24 sm:h-16 md:h-20 lg:h-24 rounded-[var(--border-radius-sm)] sm:rounded-[var(--border-radius-md)] ${rarityStyle.bg} flex items-center justify-center`}>
          {item.category === "frames" && <Frame className={`w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 ${rarityStyle.text}`} />}
          {item.category === "badges" && <Award className={`w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 ${rarityStyle.text}`} />}
          {item.category === "effects" && <Sparkles className={`w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 ${rarityStyle.text}`} />}
          {item.category === "gifts" && <Gift className={`w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 ${rarityStyle.text}`} />}
        </div>
        
        {/* Hover/Touch Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5 sm:gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Eye size={14} className="sm:w-[18px] sm:h-[18px]" />
              </motion.button>
              {!item.isExpired && (
                <>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); onEquip(); }}
                    className="p-1.5 sm:p-2 rounded-full bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item.isActive ? <X size={14} className="sm:w-[18px] sm:h-[18px]" /> : <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px]" />}
                  </motion.button>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); onGift(); }}
                    className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send size={14} className="sm:w-[18px] sm:h-[18px]" />
                  </motion.button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Desktop hover overlay */}
        <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-2">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Eye size={18} />
          </motion.button>
          {!item.isExpired && (
            <>
              <motion.button
                onClick={(e) => { e.stopPropagation(); onEquip(); }}
                className="p-2 rounded-full bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {item.isActive ? <X size={18} /> : <CheckCircle size={18} />}
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); onGift(); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Send size={18} />
              </motion.button>
            </>
          )}
        </div>
      </div>
      
      {/* Item Info */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-[var(--color-border)]">
        <h3 className="font-semibold text-[11px] sm:text-xs md:text-sm text-[var(--color-text)] truncate">{item.name}</h3>
        <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] truncate mt-0.5 sm:mt-1 hidden sm:block">{item.description}</p>
        
        {item.expiresAt && !item.isExpired && (
          <div className="flex items-center gap-1 mt-1 sm:mt-2 text-[9px] sm:text-xs text-amber-400">
            <Clock size={10} className="sm:w-3 sm:h-3" />
            <span className="truncate">Expira em {Math.ceil((item.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Gift Pending Card - RESPONSIVO
const GiftPendingCard = ({
  gift,
  onAccept,
  onReject,
}: {
  gift: GiftPending;
  onAccept: () => void;
  onReject: () => void;
}) => {
  const rarityStyle = RARITY_COLORS[gift.item.rarity];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 
        p-3 sm:p-4 rounded-[var(--border-radius-md)]
        border bg-gradient-to-r from-amber-500/10 to-transparent
        border-amber-500/30
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-[var(--border-radius-md)] ${rarityStyle.bg} flex items-center justify-center flex-shrink-0`}>
          <Gift size={18} className={`sm:w-6 sm:h-6 ${rarityStyle.text}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--color-text)] truncate">{gift.item.name}</h3>
            <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${rarityStyle.bg} ${rarityStyle.text} flex-shrink-0`}>
              {RARITY_NAMES[gift.item.rarity]}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mt-0.5">
            Presente de <span className="text-[var(--color-text)] font-medium">{gift.from}</span>
          </p>
          <p className="text-[9px] sm:text-[10px] text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
            <Calendar size={10} />
            {gift.sentAt.toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2">
        <motion.button
          onClick={onAccept}
          className="flex-1 sm:flex-none px-3 sm:px-0 py-2 sm:py-0 sm:p-2 rounded-[var(--border-radius-md)] sm:rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="text-xs sm:hidden">Aceitar</span>
        </motion.button>
        <motion.button
          onClick={onReject}
          className="flex-1 sm:flex-none px-3 sm:px-0 py-2 sm:py-0 sm:p-2 rounded-[var(--border-radius-md)] sm:rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="text-xs sm:hidden">Recusar</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// Empty State - RESPONSIVO
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 text-center px-4"
  >
    <div className="w-14 h-14 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-3 sm:mb-4">
      <Icon size={24} className="sm:w-8 md:w-8 sm:h-8 md:h-8 text-[var(--color-text-muted)]" />
    </div>
    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]">{title}</h3>
    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 sm:mt-2 max-w-xs sm:max-w-sm">{description}</p>
    {action && actionLabel && (
      <motion.button
        onClick={action}
        className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL - TOTALMENTE RESPONSIVA
// ═══════════════════════════════════════════════════════════

const DashboardInventory = () => {
  // Estados
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [gifts, setGifts] = useState<GiftPending[]>(MOCK_GIFTS);
  const [activeCategory, setActiveCategory] = useState<ItemCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftUsername, setGiftUsername] = useState("");
  const [balance] = useState(1250);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar itens
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "expired" ? item.isExpired : item.category === activeCategory && !item.isExpired);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Contadores por categoria
  const getCategoryCount = (category: ItemCategory): number => {
    if (category === "all") return items.filter((i) => !i.isExpired).length;
    if (category === "expired") return items.filter((i) => i.isExpired).length;
    return items.filter((i) => i.category === category && !i.isExpired).length;
  };

  // Handlers
  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEquipItem = (item: InventoryItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, isActive: !i.isActive } : i
      )
    );
  };

  const handleGiftItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsGiftModalOpen(true);
  };

  const handleSendGift = () => {
    if (!giftUsername.trim() || !selectedItem) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
    setIsGiftModalOpen(false);
    setGiftUsername("");
    setSelectedItem(null);
  };

  const handleAcceptGift = (giftId: string) => {
    const gift = gifts.find((g) => g.id === giftId);
    if (gift) {
      setItems((prev) => [...prev, { ...gift.item, isPending: false }]);
      setGifts((prev) => prev.filter((g) => g.id !== giftId));
    }
  };

  const handleRejectGift = (giftId: string) => {
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-6 sm:pb-8">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm text-[var(--color-text-muted)] mb-2 sm:mb-3 md:mb-4 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide"
        >
          <span>Dashboard</span>
          <ChevronRight size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
          <span className="hidden sm:inline">Configurações</span>
          <ChevronRight size={10} className="hidden sm:block sm:w-3 sm:h-3 flex-shrink-0" />
          <span className="text-[var(--color-text)]">Inventário</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Package className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            Inventário
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-[var(--color-text-muted)] mt-1">
            Gerencie suas molduras, insígnias, efeitos e presentes.
          </p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6"
      >
        <StatCard
          icon={Coins}
          label="Saldo"
          value={balance.toLocaleString()}
          sublabel="Zyons"
          action={() => console.log("Obter")}
          actionLabel="Obter"
          color="warning"
          delay={0}
        />
        <StatCard
          icon={Box}
          label="Itens"
          value={items.filter((i) => i.isActive).length}
          sublabel="ativos"
          action={() => setActiveCategory("all")}
          actionLabel="Ver"
          color="info"
          delay={0.1}
        />
        <StatCard
          icon={Gift}
          label="Presentes"
          value={gifts.length}
          sublabel="pendentes"
          action={() => setActiveCategory("gifts")}
          actionLabel="Abrir"
          color="success"
          delay={0.2}
        />
      </motion.div>

      {/* Pending Gifts */}
      <AnimatePresence>
        {gifts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 sm:mb-6"
          >
            <SettingsCard>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-[var(--border-radius-md)] bg-amber-500/10">
                    <Gift size={16} className="sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm md:text-base font-semibold text-[var(--color-text)]">Presentes Pendentes</h2>
                    <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">{gifts.length} presente(s) aguardando</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <AnimatePresence mode="popLayout">
                  {gifts.map((gift) => (
                    <GiftPendingCard
                      key={gift.id}
                      gift={gift}
                      onAccept={() => handleAcceptGift(gift.id)}
                      onReject={() => handleRejectGift(gift.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SettingsCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Inventory */}
      <SettingsCard>
        {/* Filters Header */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Category Tabs - Scrollable */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            {(["all", "frames", "badges", "effects", "gifts", "expired"] as ItemCategory[]).map((category) => (
              <CategoryTab
                key={category}
                category={category}
                isActive={activeCategory === category}
                count={getCategoryCount(category)}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48 md:w-64">
              <Search size={14} className="sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs sm:text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 sm:p-2 rounded-[var(--border-radius-md)] border transition-colors ${
                showFilters 
                  ? "bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            </motion.button>
          </div>
        </div>

        {/* Items Grid - FULLY RESPONSIVE */}
        {filteredItems.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onView={() => handleViewItem(item)}
                  onEquip={() => handleEquipItem(item)}
                  onGift={() => handleGiftItem(item)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon={Package}
            title="Nenhum item encontrado"
            description="Visite a loja para adquirir novos itens!"
            action={() => console.log("Ir para loja")}
            actionLabel="Visitar Loja"
          />
        )}

        {/* Footer Stats */}
        {filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 sm:gap-4"
          >
            <p className="text-[10px] sm:text-xs md:text-sm text-[var(--color-text-muted)]">
              <span className="text-[var(--color-text)] font-medium">{filteredItems.length}</span> de{" "}
              <span className="text-[var(--color-text)] font-medium">{items.length}</span> itens
            </p>
            <motion.button
              className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <RefreshCw size={12} className="sm:w-[14px] sm:h-[14px]" />
              Atualizar
            </motion.button>
          </motion.div>
        )}
      </SettingsCard>

      {/* View Item Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Item"
        size="md"
      >
        {selectedItem && (
          <div className="space-y-3 sm:space-y-4">
            {/* Item Preview */}
            <div className={`relative aspect-[16/10] sm:aspect-video rounded-[var(--border-radius-md)] sm:rounded-[var(--border-radius-lg)] ${RARITY_COLORS[selectedItem.rarity].bg} flex items-center justify-center overflow-hidden`}>
              <div className={`w-16 h-16 sm:w-24 md:w-32 sm:h-24 md:h-32 rounded-[var(--border-radius-md)] ${RARITY_COLORS[selectedItem.rarity].bg} flex items-center justify-center`}>
                {selectedItem.category === "frames" && <Frame className={`w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 ${RARITY_COLORS[selectedItem.rarity].text}`} />}
                {selectedItem.category === "badges" && <Award className={`w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 ${RARITY_COLORS[selectedItem.rarity].text}`} />}
                {selectedItem.category === "effects" && <Sparkles className={`w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 ${RARITY_COLORS[selectedItem.rarity].text}`} />}
                {selectedItem.category === "gifts" && <Gift className={`w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 ${RARITY_COLORS[selectedItem.rarity].text}`} />}
              </div>
              
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${RARITY_COLORS[selectedItem.rarity].bg} ${RARITY_COLORS[selectedItem.rarity].text} border ${RARITY_COLORS[selectedItem.rarity].border}`}>
                  {RARITY_NAMES[selectedItem.rarity]}
                </span>
              </div>
            </div>

            {/* Item Info */}
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[var(--color-text)]">{selectedItem.name}</h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">{selectedItem.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
                <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">Categoria</p>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text)] capitalize flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  {CATEGORY_ICONS[selectedItem.category]}
                  {CATEGORY_NAMES[selectedItem.category as ItemCategory]}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
                <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">Status</p>
                <p className={`text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 ${selectedItem.isActive ? "text-green-400" : "text-[var(--color-text)]"}`}>
                  {selectedItem.isActive ? <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px]" /> : <Box size={12} className="sm:w-[14px] sm:h-[14px]" />}
                  {selectedItem.isActive ? "Equipado" : "Inventário"}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
                <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">Obtido em</p>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text)] flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                  {selectedItem.obtainedAt.toLocaleDateString("pt-BR")}
                </p>
              </div>
              {selectedItem.expiresAt && (
                <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
                  <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)]">Expira em</p>
                  <p className={`text-xs sm:text-sm font-medium mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 ${selectedItem.isExpired ? "text-red-400" : "text-amber-400"}`}>
                    <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                    {selectedItem.expiresAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {!selectedItem.isExpired && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <motion.button
                  onClick={() => {
                    handleEquipItem(selectedItem);
                    setIsViewModalOpen(false);
                  }}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedItem.isActive
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                      : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedItem.isActive ? <X size={16} /> : <CheckCircle size={16} />}
                  {selectedItem.isActive ? "Desequipar" : "Equipar"}
                </motion.button>
                <motion.button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleGiftItem(selectedItem);
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={16} />
                  Presentear
                </motion.button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Gift Modal */}
      <Modal
        isOpen={isGiftModalOpen}
        onClose={() => {
          setIsGiftModalOpen(false);
          setGiftUsername("");
        }}
        title="Enviar Presente"
        size="sm"
      >
        {selectedItem && (
          <div className="space-y-3 sm:space-y-4">
            {/* Item Preview */}
            <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-[var(--border-radius-md)] ${RARITY_COLORS[selectedItem.rarity].bg}`}>
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-[var(--border-radius-md)] ${RARITY_COLORS[selectedItem.rarity].bg} flex items-center justify-center flex-shrink-0`}>
                <Gift size={20} className={`sm:w-6 sm:h-6 ${RARITY_COLORS[selectedItem.rarity].text}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text)] truncate">{selectedItem.name}</h3>
                <span className={`text-[10px] sm:text-xs ${RARITY_COLORS[selectedItem.rarity].text}`}>
                  {RARITY_NAMES[selectedItem.rarity]}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-[var(--border-radius-md)] bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px] text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-amber-400">
                Atenção: O item será removido do seu inventário.
              </p>
            </div>

            {/* Recipient Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-[var(--color-text)]">
                Usuário destinatário
              </label>
              <div className="relative">
                <User size={16} className="sm:w-[18px] sm:h-[18px] absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="@usuario"
                  value={giftUsername}
                  onChange={(e) => setGiftUsername(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm sm:text-base text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
              <motion.button
                onClick={() => {
                  setIsGiftModalOpen(false);
                  setGiftUsername("");
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs sm:text-sm font-medium transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={handleSendGift}
                disabled={!giftUsername.trim()}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={giftUsername.trim() ? { scale: 1.02 } : {}}
                whileTap={giftUsername.trim() ? { scale: 0.98 } : {}}
              >
                <Send size={16} />
                Enviar
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardInventory;