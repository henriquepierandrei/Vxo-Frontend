// pages/dashboard/DashboardStore.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useProfile } from "../../contexts/UserContext";
import {
  useStore,
  type StoreItem,
  type StoreItemType,
  type ItemRarity,
  type SendGiftRequest
} from "../../contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Award,
  Frame,
  Sparkles,
  Package,
  ChevronRight,
  Star,
  Check,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Gift,
  Filter,
  Search,
  Coins,
  AlertCircle,
  X,
  Lock,
  Crown,
  Zap,
  Tag,
  Video,
  FileCode,
  User,
  Send,
  MessageSquare,
  AtSign,
  ArrowRight,
  Sparkle,
  CreditCard,
  TrendingUp,
  Percent,
  BadgeCheck,
  Link2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import React from "react";
import { checkoutService } from "../../services/checkoutService";
import { COIN_PACKAGES, getSavingsPercentage, type CoinPackage, type CoinAmount } from "../../types/checkout.type";

// ═══════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════

interface GiftFormData {
  recipientUsername: string;
  message: string;
}

type MainTab = "store" | "coins" | "customize";

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════

const PREVIEW_PROFILE_IMAGE = "https://i.pravatar.cc/300?u=preview";
const SLUG_CHANGE_COST = 500; // Custo em moedas para trocar o slug

// ═══════════════════════════════════════════════════════════
// UTILITÁRIOS - COM FALLBACK PARA RARIDADE NULA
// ═══════════════════════════════════════════════════════════

const normalizeRarity = (rarity: string | null | undefined): ItemRarity => {
  if (!rarity) return "common";
  const normalized = rarity.toLowerCase();
  if (normalized === "rare") return "rare";
  if (normalized === "epic") return "epic";
  if (normalized === "legendary") return "legendary";
  return "common";
};

const getRarityColor = (rarity: ItemRarity): string => {
  const colors = {
    common: "#9CA3AF",
    rare: "#3B82F6",
    epic: "#A855F7",
    legendary: "#F59E0B",
  };
  return colors[rarity] || colors.common;
};

const getRarityGradient = (rarity: ItemRarity): string => {
  const gradients = {
    common: "from-gray-400/20 via-gray-500/10 to-transparent",
    rare: "from-blue-500/30 via-blue-400/15 to-transparent",
    epic: "from-purple-500/30 via-purple-400/15 to-transparent",
    legendary: "from-amber-500/40 via-yellow-400/20 to-transparent",
  };
  return gradients[rarity] || gradients.common;
};

const getRarityGlow = (rarity: ItemRarity): string => {
  const glows = {
    common: "0 0 20px rgba(156, 163, 175, 0.3)",
    rare: "0 0 25px rgba(59, 130, 246, 0.5), 0 0 50px rgba(59, 130, 246, 0.3)",
    epic: "0 0 25px rgba(168, 85, 247, 0.5), 0 0 50px rgba(168, 85, 247, 0.3)",
    legendary: "0 0 30px rgba(245, 158, 11, 0.6), 0 0 60px rgba(245, 158, 11, 0.4), 0 0 90px rgba(245, 158, 11, 0.2)",
  };
  return glows[rarity] || glows.common;
};

const getRarityLabel = (rarity: ItemRarity): string => {
  const labels = {
    common: "Comum",
    rare: "Raro",
    epic: "Épico",
    legendary: "Lendário",
  };
  return labels[rarity] || labels.common;
};

const getRarityIcon = (rarity: ItemRarity) => {
  const icons = {
    common: null,
    rare: Sparkle,
    epic: Zap,
    legendary: Crown,
  };
  return icons[rarity];
};

const getTypeIcon = (type: StoreItemType) => {
  const icons = {
    badge: Award,
    frame: Frame,
    effect: Sparkles,
    bundle: Package,
  };
  return icons[type] || Package;
};

const getTypeLabel = (type: StoreItemType): string => {
  const labels = {
    badge: "Insígnia",
    frame: "Moldura",
    effect: "Efeito",
    bundle: "Pacote",
  };
  return labels[type] || "Item";
};

const calculateDiscount = (price: number, discount?: number): number => {
  if (!discount) return price;
  return Math.floor(price * (1 - discount / 100));
};

// Validação do slug
const validateSlug = (slug: string): { isValid: boolean; error?: string } => {
  if (!slug || slug.trim().length === 0) {
    return { isValid: false, error: "A URL não pode estar vazia" };
  }
  
  if (slug.length < 1) {
    return { isValid: false, error: "A URL deve ter no mínimo 1 caractér" };
  }
  
  if (slug.length > 30) {
    return { isValid: false, error: "A URL deve ter no máximo 30 caracteres" };
  }
  
  // Apenas letras, números, underscores e hífens
  const slugRegex = /^[a-zA-Z0-9_-]+$/;
  if (!slugRegex.test(slug)) {
    return { isValid: false, error: "Use apenas letras, números, _ ou -" };
  }
  
  // Não pode começar ou terminar com hífen/underscore
  if (/^[-_]|[-_]$/.test(slug)) {
    return { isValid: false, error: "Não pode começar ou terminar com - ou _" };
  }
  
  return { isValid: true };
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Preview de Moldura (Melhorado)
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
  rarity: ItemRarity;
  onLoadComplete?: () => void;
}) => {
  const [frameError, setFrameError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const sizeConfig = {
    small: { container: 80, frame: 80, profile: 60 },
    medium: { container: 140, frame: 140, profile: 110 },
    large: { container: 200, frame: 200, profile: 160 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight !== 0) {
      setIsLoading(false);
      onLoadComplete?.();
    }
  }, [profileImageUrl, onLoadComplete]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        onLoadComplete?.();
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isLoading, onLoadComplete]);

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
    <motion.div
      className="relative flex items-center justify-center"
      style={{
        width: config.container,
        height: config.container,
        filter: `drop-shadow(${getRarityGlow(rarity)})`,
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {isLoading && (
        <div
          className="absolute z-30 bg-[var(--color-surface)] rounded-full flex items-center justify-center"
          style={{ width: config.profile, height: config.profile }}
        >
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      )}

      <div
        className="absolute rounded-full overflow-hidden z-10 ring-2 ring-white/10"
        style={{ width: config.profile, height: config.profile }}
      >
        {!profileError ? (
          <img
            ref={imgRef}
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
        <motion.img
          src={frameUrl}
          alt="Moldura"
          className="absolute z-20 pointer-events-none"
          style={{ width: config.frame, height: config.frame, objectFit: 'contain' }}
          onError={() => setFrameError(true)}
          animate={rarity === "legendary" ? { rotate: [0, 1, -1, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {rarity === "legendary" && (
        <motion.div
          className="absolute rounded-full z-5 pointer-events-none"
          style={{
            width: config.frame + 20,
            height: config.frame + 20,
            background: `radial-gradient(circle, transparent 40%, ${getRarityColor(rarity)}30 100%)`
          }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Preview de Mídia (Melhorado)
// ═══════════════════════════════════════════════════════════

const ItemMediaPreview = ({
  item,
  size = "medium",
  showPlayButton = false,
  userProfileImage,
}: {
  item: StoreItem;
  size?: "small" | "medium" | "large";
  showPlayButton?: boolean;
  userProfileImage?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const normalizedRarity = normalizeRarity(item.rarity);

  const sizeConfig = {
    small: { container: "w-16 h-16", svg: "w-10 h-10", icon: "w-8 h-8" },
    medium: { container: "w-full h-44", svg: "w-20 h-20", icon: "w-16 h-16" },
    large: { container: "w-full h-72", svg: "w-32 h-32", icon: "w-24 h-24" },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (item.type === "effect" && videoRef.current && !videoError) {
      videoRef.current.play().catch(() => { });
    }
  }, [item.type, videoError]);

  const containerStyle = {
    background: `linear-gradient(135deg, ${getRarityColor(normalizedRarity)}25, ${getRarityColor(normalizedRarity)}05)`,
    contain: 'layout style paint'
  };

  if (item.type === "badge") {
    if (item.svgUrl) {
      return (
        <div className={`${config.container} flex items-center justify-center p-4 relative`} style={containerStyle}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]/50 z-20 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-muted)]" />
            </div>
          )}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ filter: "blur(40px)", opacity: 0.4 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className={`${config.svg} rounded-full`} style={{ backgroundColor: getRarityColor(normalizedRarity) }} />
          </motion.div>
          <motion.img
            src={item.svgUrl}
            alt={item.name}
            className={`${config.svg} relative z-10`}
            style={{ filter: "invert(100%) sepia(100%) saturate(0%) hue-rotate(200deg)" }}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => { setImageError(true); setIsLoading(false); }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>
      );
    }
    return (
      <div className={`${config.container} flex items-center justify-center relative`} style={containerStyle}>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ filter: "blur(30px)", opacity: 0.3 }}
        >
          <div className={`${config.svg} rounded-full`} style={{ backgroundColor: getRarityColor(normalizedRarity) }} />
        </motion.div>
        <FileCode
          className={`${config.icon} relative z-10 text-white`}
          style={{ filter: `drop-shadow(${getRarityGlow(normalizedRarity)})` }}
        />
      </div>
    );
  }

  if (item.type === "frame") {
    return (
      <div className={`${config.container} flex items-center justify-center relative`} style={containerStyle}>
        <FramePreview
          frameUrl={item.imageUrl || ''}
          size={size}
          profileImageUrl={userProfileImage || PREVIEW_PROFILE_IMAGE}
          rarity={normalizedRarity}
        />
      </div>
    );
  }

  if (item.type === "effect") {
    if (item.videoUrl && !videoError) {
      return (
        <div className={`${config.container} relative overflow-hidden bg-black/50`} style={{ contain: 'layout style paint' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
          <video
            ref={videoRef}
            src={item.videoUrl}
            className="w-full h-full object-cover"
            loop muted playsInline
            poster={item.thumbnailUrl}
            onLoadedData={() => setIsLoading(false)}
            onError={() => { setVideoError(true); setIsLoading(false); }}
          />
          {showPlayButton && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/20"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.1 }}
              >
                <Video className="w-6 h-6 text-black ml-1" />
              </motion.div>
            </motion.div>
          )}
        </div>
      );
    }
    return (
      <div className={`${config.container} flex items-center justify-center`} style={containerStyle}>
        <Video className={`${config.icon} text-white/50`} />
      </div>
    );
  }

  if (item.type === "bundle") {
    if (item.imageUrl && !imageError) {
      return (
        <div className={`${config.container} relative overflow-hidden`} style={{ contain: 'layout style paint' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]/50 z-20 backdrop-blur-sm">
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
      <div className={`${config.container} flex items-center justify-center relative`} style={containerStyle}>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ filter: "blur(30px)", opacity: 0.3 }}
        >
          <div className={`${config.svg} rounded-full`} style={{ backgroundColor: getRarityColor(normalizedRarity) }} />
        </motion.div>
        <Package
          className={`${config.icon} relative z-10 text-white`}
          style={{ filter: `drop-shadow(${getRarityGlow(normalizedRarity)})` }}
        />
      </div>
    );
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE (Melhorados)
// ═══════════════════════════════════════════════════════════

const StoreCard = ({ children, className = "", gradient = false }: {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}) => (
  <motion.div
    className={`
      relative overflow-hidden
      bg-[var(--card-background-glass)] backdrop-blur-xl 
      border border-[var(--color-border)]
      rounded-2xl p-5 sm:p-6 
      ${gradient ? 'bg-gradient-to-br from-[var(--color-surface)]/80 to-[var(--color-background)]/50' : ''}
      ${className}
    `}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`
              w-full ${sizeClasses[size]} 
              bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)]
              backdrop-blur-xl border border-[var(--color-border)]
              rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto
            `}>
              <div className="relative p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent">
                <div className="flex items-start gap-4">
                  {Icon && (
                    <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]">
                      <Icon size={24} className="text-[var(--color-primary)]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">{title}</h2>
                    {subtitle && (
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">{subtitle}</p>
                    )}
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap
      ${active
        ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-lg shadow-[var(--color-primary)]/25"
        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
      }
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon size={16} className="flex-shrink-0" />
    <span className="hidden sm:inline">{label}</span>
    {count !== undefined && (
      <span className={`
        min-w-[22px] px-1.5 py-0.5 rounded-full text-xs font-bold text-center
        ${active ? "bg-white/20" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"}
      `}>
        {count}
      </span>
    )}
  </motion.button>
);

const MainTabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge?: string;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      relative flex items-center gap-3 px-3 py-2 rounded-2xl font-semibold text-base transition-all
      ${active
        ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-xl shadow-[var(--color-primary)]/30"
        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
      }
    `}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon size={22} />
    <span>{label}</span>
    {badge && (
      <span className={`
        px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
        ${active ? "bg-white/20" : "bg-yellow-500/20 text-yellow-500"}
      `}>
        {badge}
      </span>
    )}
  </motion.button>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <motion.div
        key={i}
        className="h-[420px] bg-[var(--color-surface)]/50 rounded-2xl border border-[var(--color-border)] overflow-hidden"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
      >
        <div className="h-44 bg-[var(--color-surface)]" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-[var(--color-surface)] rounded-lg w-3/4" />
          <div className="h-3 bg-[var(--color-surface)] rounded w-1/2" />
          <div className="h-10 bg-[var(--color-surface)] rounded-lg" />
          <div className="h-12 bg-[var(--color-surface)] rounded-xl mt-4" />
        </div>
      </motion.div>
    ))}
  </div>
);

const EmptyState = ({ type, searchQuery }: { type: StoreItemType | "all"; searchQuery?: string }) => {
  const messages = {
    all: { title: "Nenhum item encontrado", description: "Não há itens disponíveis na loja no momento." },
    badge: { title: "Nenhuma insígnia encontrada", description: "Não há insígnias disponíveis no momento." },
    frame: { title: "Nenhuma moldura encontrada", description: "Não há molduras disponíveis no momento." },
    effect: { title: "Nenhum efeito encontrado", description: "Não há efeitos disponíveis no momento." },
    bundle: { title: "Nenhum pacote encontrado", description: "Não há pacotes disponíveis no momento." },
  };

  const message = messages[type];
  const Icon = type === "all" ? Store : getTypeIcon(type as StoreItemType);

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 min-h-[400px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center mb-6 shadow-xl"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={40} className="text-[var(--color-text-muted)]" />
      </motion.div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{message.title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] text-center max-w-sm">
        {searchQuery ? `Nenhum resultado para "${searchQuery}"` : message.description}
      </p>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Card de Pacote de Moedas
// ═══════════════════════════════════════════════════════════

const CoinPackageCard = ({
  pkg,
  onPurchase,
  isProcessing,
  processingAmount,
  index = 0,
}: {
  pkg: CoinPackage;
  onPurchase: (amount: CoinAmount) => void;
  isProcessing: boolean;
  processingAmount: CoinAmount | null;
  index?: number;
}) => {
  const isThisProcessing = processingAmount === pkg.amount;
  const savings = getSavingsPercentage(pkg);
  const totalCoins = pkg.coins + (pkg.bonus || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-2xl
        border-2 transition-all duration-300
        ${pkg.isBestValue 
          ? "border-yellow-500 bg-gradient-to-b from-yellow-500/10 via-amber-500/5 to-transparent" 
          : pkg.isPopular 
            ? "border-[var(--color-primary)] bg-gradient-to-b from-[var(--color-primary)]/10 to-transparent"
            : "border-[var(--color-border)] bg-[var(--color-surface)]"
        }
        ${isProcessing && !isThisProcessing ? "opacity-50 pointer-events-none" : ""}
      `}
      style={{
        boxShadow: pkg.isBestValue 
          ? "0 0 40px rgba(234, 179, 8, 0.2), 0 0 80px rgba(234, 179, 8, 0.1)"
          : pkg.isPopular
            ? "0 0 30px rgba(var(--color-primary-rgb), 0.15)"
            : undefined
      }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
        <div className="flex gap-2">
          {pkg.isBestValue && (
            <motion.span
              className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown size={12} />
              MELHOR VALOR
            </motion.span>
          )}
          {pkg.isPopular && !pkg.isBestValue && (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
              <TrendingUp size={12} />
              POPULAR
            </span>
          )}
        </div>
        {savings > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold flex items-center gap-1">
            <Percent size={10} />
            {savings}% OFF
          </span>
        )}
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isThisProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-2xl"
          >
            <Loader2 size={40} className="text-yellow-500 animate-spin mb-3" />
            <p className="text-white font-medium">Preparando checkout...</p>
            <p className="text-white/60 text-sm mt-1">Você será redirecionado</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6 pt-14">
        {/* Coin Icon & Amount */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            className="relative mb-4"
            animate={{ 
              rotate: pkg.isBestValue ? [0, 5, -5, 0] : 0,
              scale: pkg.isBestValue ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: pkg.isBestValue 
                  ? "linear-gradient(135deg, #F59E0B, #D97706)"
                  : pkg.isPopular
                    ? "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
                    : "linear-gradient(135deg, #EAB308, #CA8A04)"
              }}
            >
              <Coins size={40} className="text-white" />
            </div>
            {pkg.isBestValue && (
              <motion.div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(234, 179, 8, 0.3), transparent 70%)"
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-[var(--color-text)]">
                {pkg.coins.toLocaleString()}
              </span>
              {pkg.bonus && (
                <span className="text-lg font-bold text-green-400">
                  +{pkg.bonus}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {pkg.bonus ? `${totalCoins.toLocaleString()} moedas no total` : "moedas"}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-sm text-[var(--color-text-muted)]">R$</span>
            <span className="text-3xl font-bold text-[var(--color-text)]">
              {pkg.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            ≈ R${(pkg.price / totalCoins).toFixed(4).replace('.', ',')} por moeda
          </p>
        </div>

        {/* Features */}
        {pkg.bonus && (
          <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
              <Gift size={16} />
              <span>{pkg.bonusLabel}</span>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <motion.button
          onClick={() => onPurchase(pkg.amount)}
          disabled={isProcessing}
          className={`
            w-full py-4 rounded-xl font-semibold text-base
            flex items-center justify-center gap-2
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
            ${pkg.isBestValue 
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white shadow-lg shadow-yellow-500/25"
              : pkg.isPopular
                ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:shadow-lg hover:shadow-[var(--color-primary)]/25 text-white"
                : "bg-[var(--color-surface-hover)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text)] border border-[var(--color-border)]"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CreditCard size={18} />
          Comprar Agora
        </motion.button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Seção de Compra de Moedas
// ═══════════════════════════════════════════════════════════

const CoinsPurchaseSection = ({
  userCoins,
  onNotification,
}: {
  userCoins: number;
  onNotification: (type: "success" | "error" | "info", message: string) => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAmount, setProcessingAmount] = useState<CoinAmount | null>(null);

  const handlePurchaseCoins = async (amount: CoinAmount) => {
    console.log('[CoinsPurchase] Iniciando compra de moedas:', amount);
    
    setIsProcessing(true);
    setProcessingAmount(amount);
    
    try {
      onNotification('info', 'Preparando checkout...');
      
      const response = await checkoutService.checkoutCoins(amount);
      
      console.log('[CoinsPurchase] Resposta do checkout:', response);
      
      if (response.success && response.checkoutUrl) {
        onNotification('success', 'Redirecionando para o pagamento...');
        
        // Pequeno delay para mostrar a notificação
        setTimeout(() => {
          checkoutService.redirectToCheckout(response.checkoutUrl!);
        }, 500);
      } else {
        throw new Error(response.error || 'Erro ao criar checkout');
      }
      
    } catch (error: any) {
      console.error('[CoinsPurchase] Erro ao processar compra:', error);
      onNotification('error', error.message || 'Erro ao processar compra. Tente novamente.');
      setIsProcessing(false);
      setProcessingAmount(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <StoreCard gradient>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Coins size={32} className="text-yellow-500" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                Comprar Moedas
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Adquira moedas para comprar itens exclusivos na loja
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20">
            <Coins size={24} className="text-yellow-500" />
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Seu saldo atual</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {userCoins.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </StoreCard>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {COIN_PACKAGES.map((pkg, index) => (
          <CoinPackageCard
            key={pkg.amount}
            pkg={pkg}
            onPurchase={handlePurchaseCoins}
            isProcessing={isProcessing}
            processingAmount={processingAmount}
            index={index}
          />
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StoreCard className="text-center">
          <div className="p-3 rounded-xl bg-green-500/10 w-fit mx-auto mb-3">
            <BadgeCheck size={24} className="text-green-400" />
          </div>
          <h4 className="font-semibold text-[var(--color-text)] mb-1">Pagamento Seguro</h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            Processado pelo Mercado Pago com total segurança
          </p>
        </StoreCard>

        <StoreCard className="text-center">
          <div className="p-3 rounded-xl bg-blue-500/10 w-fit mx-auto mb-3">
            <Zap size={24} className="text-blue-400" />
          </div>
          <h4 className="font-semibold text-[var(--color-text)] mb-1">Entrega Instantânea</h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            Moedas creditadas imediatamente após a confirmação
          </p>
        </StoreCard>

        <StoreCard className="text-center">
          <div className="p-3 rounded-xl bg-purple-500/10 w-fit mx-auto mb-3">
            <Gift size={24} className="text-purple-400" />
          </div>
          <h4 className="font-semibold text-[var(--color-text)] mb-1">Bônus Exclusivos</h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            Ganhe moedas extras em pacotes maiores
          </p>
        </StoreCard>
      </div>

      {/* Payment Methods */}
      <div className="text-center">
        <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-2">
          <Lock size={12} />
          Pagamento seguro processado pelo Mercado Pago • PIX, Cartão de Crédito, Boleto
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Seção de Personalização (Troca de Slug)
// ═══════════════════════════════════════════════════════════

const CustomizeSection = ({
  currentSlug,
  userCoins,
  onNotification,
  onSlugChanged,
}: {
  currentSlug: string;
  userCoins: number;
  onNotification: (type: "success" | "error" | "info", message: string) => void;
  onSlugChanged: () => void;
}) => {
  const [newSlug, setNewSlug] = useState(currentSlug);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canAfford = userCoins >= SLUG_CHANGE_COST;
  const hasChanged = newSlug !== currentSlug;

  // Validação em tempo real
  useEffect(() => {
    if (newSlug === currentSlug) {
      setValidationError(null);
      return;
    }

    const validation = validateSlug(newSlug);
    setValidationError(validation.isValid ? null : validation.error || null);
  }, [newSlug, currentSlug]);

  const handleSlugChange = (value: string) => {
    // Remove espaços e converte para minúsculas
    const sanitized = value.toLowerCase().replace(/\s/g, '');
    setNewSlug(sanitized);
  };

  const handleSubmit = async () => {
    if (!hasChanged || validationError || !canAfford) return;

    setIsProcessing(true);

    try {
      onNotification('info', 'Alterando sua URL...');
      
      await checkoutService.changeSlug(newSlug);
      
      onNotification('success', `URL alterada com sucesso para /${newSlug}!`);
      onSlugChanged();
      
    } catch (error: any) {
      console.error('[CustomizeSection] Erro ao alterar slug:', error);
      onNotification('error', error.message || 'Erro ao alterar URL. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyUrl = () => {
    const fullUrl = `vxo.lat/${currentSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewUrl = `vxo.lat/${newSlug || 'sua-url'}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <StoreCard gradient>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Link2 size={32} className="text-purple-500" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                Personalizar URL
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Altere a URL do seu perfil para algo mais pessoal
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20">
            <Coins size={24} className="text-yellow-500" />
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Seu saldo atual</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {userCoins.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </StoreCard>

      {/* URL Atual */}
      <StoreCard>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 size={18} className="text-green-400" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)]">Sua URL Atual</h3>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <ExternalLink size={18} className="text-[var(--color-text-muted)]" />
            <code className="flex-1 text-sm text-[var(--color-text)] font-mono">
              vxo.lat/{currentSlug}
            </code>
            <motion.button
              onClick={handleCopyUrl}
              className="p-2 rounded-lg bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </motion.button>
          </div>
        </div>
      </StoreCard>

      {/* Alterar URL */}
      <StoreCard>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Edit3 size={18} className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)]">Nova URL</h3>
          </div>

          {/* Input */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--color-text-muted)] text-sm">
                <span className="hidden sm:inline">vxo.lat/</span>
                <span className="sm:hidden">/</span>
              </div>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="sua-nova-url"
                maxLength={30}
                className={`
                  w-full pl-[140px] sm:pl-[200px] pr-4 py-4 rounded-xl
                  bg-[var(--color-surface)] border-2 
                  text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 
                  transition-all font-mono
                  ${validationError 
                    ? 'border-red-500 focus:border-red-500' 
                    : hasChanged && !validationError
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
                  }
                `}
              />
            </div>

            {/* Validation Message */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle size={14} />
                  <span>{validationError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Character Count */}
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>Use letras, números, _ ou -</span>
              <span className={newSlug.length > 25 ? "text-yellow-400" : ""}>
                {newSlug.length}/30
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Preview da URL:</p>
            <code className="text-sm text-[var(--color-text)] font-mono break-all">
              {previewUrl}
            </code>
          </div>

          {/* Cost Info */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Coins size={20} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Custo da alteração</p>
                <p className="text-xs text-[var(--color-text-muted)]">Cobrado ao confirmar</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-[var(--color-text)]">
              {SLUG_CHANGE_COST.toLocaleString()}
            </span>
          </div>

          {/* Warning if insufficient coins */}
          {!canAfford && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Moedas insuficientes</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Você precisa de mais {(SLUG_CHANGE_COST - userCoins).toLocaleString()} moedas.
                </p>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={isProcessing || !hasChanged || !!validationError || !canAfford}
            className="w-full py-4 rounded-xl bg-[var(--color-text)] text-[var(--color-background)] font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            whileHover={!isProcessing && hasChanged && !validationError && canAfford ? { scale: 1.02 } : {}}
            whileTap={!isProcessing && hasChanged && !validationError && canAfford ? { scale: 0.98 } : {}}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Alterando...
              </>
            ) : (
              <>
                <Check size={20} />
                Confirmar Alteração
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {SLUG_CHANGE_COST} moedas
                </span>
              </>
            )}
          </motion.button>
        </div>
      </StoreCard>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StoreCard>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
              <Zap size={18} className="text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-text)] mb-1">Dica</h4>
              <p className="text-xs text-[var(--color-text-muted)]">
                Escolha uma URL fácil de lembrar e compartilhar. URLs curtas são mais práticas!
              </p>
            </div>
          </div>
        </StoreCard>

        <StoreCard>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 flex-shrink-0">
              <AlertCircle size={18} className="text-yellow-400" />
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-text)] mb-1">Atenção</h4>
              <p className="text-xs text-[var(--color-text-muted)]">
                Após alterar, a URL antiga não estará mais disponível e poderá ser usada por outra pessoa.
              </p>
            </div>
          </div>
        </StoreCard>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Card do Item (Redesenhado)
// ═══════════════════════════════════════════════════════════

const StoreItemCard = ({
  item,
  userCoins,
  userProfileImage,
  onGift,
  onPurchase,
  onEquip,
  onFavorite,
  disabled,
  index = 0,
}: {
  item: StoreItem;
  userCoins: number;
  userProfileImage?: string;
  onGift: () => void;
  onPurchase: () => void;
  onEquip: () => void;
  onFavorite: () => void;
  disabled: boolean;
  index?: number;
}) => {
  const TypeIcon = getTypeIcon(item.type);
  const normalizedRarity = normalizeRarity(item.rarity);
  const rarityColor = getRarityColor(normalizedRarity);
  const RarityIcon = getRarityIcon(normalizedRarity);
  const finalPrice = calculateDiscount(item.price, item.discount);
  const canAfford = userCoins >= finalPrice;
  const isLocked = !!(item.quantityAvailable !== undefined && item.quantityAvailable !== null && item.quantityAvailable <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`
        group relative overflow-hidden
        bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface)]/50
        border-2 rounded-2xl
        transition-all duration-300
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
      style={{
        borderColor: item.isEquipped ? rarityColor : "var(--color-border)",
        boxShadow: item.isEquipped ? `0 0 30px ${rarityColor}30` : undefined,
        minHeight: '420px',
      }}
    >
      {/* Glow Effect for Equipped Items */}
      {item.isEquipped && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${rarityColor}10, transparent 70%)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-20">
        <div className="flex flex-wrap gap-1.5">
          {item.isLimited && (
            <motion.span
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={10} />
              LIMITADO
            </motion.span>
          )}
          {item.discount && item.discount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
              <Tag size={10} />
              -{item.discount}%
            </span>
          )}
          {item.isOwned && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
              <Check size={10} />
              SEU
            </span>
          )}
          {item.type === "frame" && item.imageUrl?.toLowerCase().endsWith(".gif") && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
              <Sparkles size={10} />
              ANIMADA
            </span>
          )}
          {item.isPremium && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
              <Crown size={10} />
              VIP
            </span>
          )}
        </div>

        <motion.button
          onClick={(e) => { e.stopPropagation(); onFavorite(); }}
          className={`
            p-2 rounded-full backdrop-blur-md transition-all shadow-lg
            ${item.isFavorite
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
              : "bg-black/30 text-white/70 hover:text-white hover:bg-black/50"
            }
          `}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Star size={14} fill={item.isFavorite ? "currentColor" : "none"} />
        </motion.button>
      </div>

      {/* Preview Area */}
      <div
        className={`relative overflow-hidden bg-gradient-to-b ${getRarityGradient(normalizedRarity)}`}
        style={{ height: '180px' }}
      >
        {isLocked && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Lock size={36} className="text-white/70 mx-auto mb-2" />
              </motion.div>
              <p className="text-white text-sm font-bold">Esgotado</p>
            </div>
          </motion.div>
        )}
        <ItemMediaPreview
          item={item}
          size="medium"
          showPlayButton={item.type === "effect"}
          userProfileImage={userProfileImage}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-surface)] to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Type */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-sm text-[var(--color-text)] line-clamp-1 flex-1">
              {item.name}
            </h3>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--color-background)]/50">
              <TypeIcon size={12} className="text-[var(--color-text-muted)]" />
              <span className="text-[10px] text-[var(--color-text-muted)]">{getTypeLabel(item.type)}</span>
            </div>
          </div>

          {/* Rarity Badge */}
          <div className="flex items-center gap-1.5">
            {RarityIcon && <RarityIcon size={12} style={{ color: rarityColor }} />}
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: rarityColor }}>
              {getRarityLabel(normalizedRarity)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed min-h-[32px]">
          {item.description}
        </p>

        {/* Availability */}
        {item.quantityAvailable !== null && item.quantityAvailable !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-background)]/50">
            <Package size={12} className="text-[var(--color-text-muted)]" />
            <span className="text-[11px] text-[var(--color-text-muted)]">
              <strong>{item.quantityAvailable.toLocaleString()}</strong> disponíveis
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: rarityColor,
                  width: `${Math.min(100, (item.quantityAvailable / 100) * 100)}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (item.quantityAvailable / 100) * 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Price & Actions */}
        <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
          {!item.isOwned ? (
            <>
              {/* Price Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="p-1.5 rounded-lg bg-yellow-500/10"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Coins size={16} className="text-yellow-500" />
                  </motion.div>
                  <div className="flex items-baseline gap-1.5">
                    {item.discount && item.discount > 0 ? (
                      <>
                        <span className="text-xs text-[var(--color-text-muted)] line-through">
                          {item.price.toLocaleString()}
                        </span>
                        <span className="text-lg font-bold text-[var(--color-text)]">
                          {finalPrice.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-[var(--color-text)]">
                        {item.price === 0 ? "Grátis" : finalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {!canAfford && item.price > 0 && (
                  <span className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle size={10} />
                    Saldo insuficiente
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={onGift}
                  disabled={disabled}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border border-pink-500/20 text-[var(--color-text)] text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gift size={14} />
                  Presentear
                </motion.button>

                <motion.button
                  onClick={onPurchase}
                  disabled={disabled || !canAfford || isLocked}
                  className={`
                    flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                    ${canAfford && !isLocked
                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:shadow-lg hover:shadow-[var(--color-primary)]/25 text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                    }
                  `}
                  whileHover={canAfford && !isLocked ? { scale: 1.02 } : {}}
                  whileTap={canAfford && !isLocked ? { scale: 0.98 } : {}}
                >
                  <ShoppingCart size={14} />
                  {isLocked ? "Esgotado" : "Comprar"}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {/* Owned Status */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
                  <Check size={14} />
                  Você possui este item
                </span>
                {item.isEquipped && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white font-bold">
                    EQUIPADO
                  </span>
                )}
              </div>

              {/* Action Buttons for Owned Items */}
              <div className="flex gap-2">
                <motion.button
                  onClick={onGift}
                  disabled={disabled}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border border-pink-500/20 text-pink-400 text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gift size={14} />
                  Presentear
                </motion.button>
                <motion.button
                  onClick={onEquip}
                  disabled={disabled}
                  className={`
                    flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5
                    ${item.isEquipped
                      ? "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400"
                      : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white"
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.isEquipped ? (
                    <><X size={14} />Desequipar</>
                  ) : (
                    <><Check size={14} />Equipar</>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Modal de Presente
// ═══════════════════════════════════════════════════════════

const GiftModal = ({
  isOpen,
  onClose,
  item,
  userCoins,
  userProfileImage,
  onSendGift,
  isSubmitting,
  giftError,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: StoreItem | null;
  userCoins: number;
  userProfileImage?: string;
  onSendGift: (data: GiftFormData) => void;
  isSubmitting: boolean;
  giftError: string | null;
}) => {
  const [formData, setFormData] = useState<GiftFormData>({
    recipientUsername: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<GiftFormData>>({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({ recipientUsername: "", message: "" });
      setErrors({});
    }
  }, [isOpen]);

  if (!item) return null;

  const normalizedRarity = normalizeRarity(item.rarity);
  const rarityColor = getRarityColor(normalizedRarity);
  const finalPrice = calculateDiscount(item.price, item.discount);
  const canAfford = userCoins >= finalPrice;

  const handleSubmit = () => {
    const newErrors: Partial<GiftFormData> = {};

    if (!formData.recipientUsername.trim()) {
      newErrors.recipientUsername = "Digite o nome de usuário";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSendGift(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Presente"
      subtitle="Surpreenda alguém especial com este item"
      icon={Gift}
      size="md"
    >
      <div className="space-y-6">
        {/* Item Preview */}
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br opacity-30"
            style={{ background: `linear-gradient(135deg, ${rarityColor}40, transparent)` }}
          />
          <div className="relative flex items-center gap-4 p-4 bg-[var(--color-surface)]/50 backdrop-blur-sm border border-[var(--color-border)]">
            <div
              className="rounded-xl overflow-hidden flex-shrink-0 w-20 h-20 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${rarityColor}30, ${rarityColor}10)` }}
            >
              <ItemMediaPreview item={item} size="small" userProfileImage={userProfileImage} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[var(--color-text)] truncate">{item.name}</h3>
              <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase"
                  style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
                >
                  {getRarityLabel(normalizedRarity)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Coins size={12} className="text-yellow-500" />
                  {finalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gift Form */}
        <div className="space-y-4">
          {/* Recipient Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
              <AtSign size={16} className="text-[var(--color-primary)]" />
              Para quem você quer enviar?
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Digite o nome de usuário..."
                value={formData.recipientUsername}
                onChange={(e) => {
                  setFormData({ ...formData, recipientUsername: e.target.value });
                  setErrors({ ...errors, recipientUsername: undefined });
                }}
                className={`
                  w-full pl-12 pr-4 py-3.5 rounded-xl 
                  bg-[var(--color-surface)] border-2 
                  text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 
                  transition-all text-sm
                  ${errors.recipientUsername ? 'border-red-500' : 'border-[var(--color-border)]'}
                `}
              />
            </div>
            {errors.recipientUsername && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 flex items-center gap-1"
              >
                <AlertCircle size={12} />
                {errors.recipientUsername}
              </motion.p>
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
              <MessageSquare size={16} className="text-[var(--color-primary)]" />
              Mensagem (opcional)
            </label>
            <textarea
              placeholder="Escreva uma mensagem especial..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              maxLength={200}
              className="
                w-full px-4 py-3.5 rounded-xl 
                bg-[var(--color-surface)] border-2 border-[var(--color-border)]
                text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 
                transition-all text-sm resize-none
              "
            />
            <p className="text-xs text-[var(--color-text-muted)] text-right">
              {formData.message.length}/200
            </p>
          </div>
        </div>

        <AnimatePresence>
          {giftError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Erro ao enviar presente</p>
                <p className="text-xs text-red-300 mt-1">{giftError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cost Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent border border-[var(--color-primary)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-muted)]">Custo do presente</span>
            <span className="text-lg font-bold text-[var(--color-text)] flex items-center gap-1">
              <Coins size={18} className="text-yellow-500" />
              {finalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-muted)]">Seu saldo</span>
            <span className={canAfford ? "text-green-400" : "text-red-400"}>
              {userCoins.toLocaleString()} moedas
            </span>
          </div>
        </div>

        {!canAfford && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Saldo insuficiente</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Você precisa de mais {(finalPrice - userCoins).toLocaleString()} moedas.
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <motion.button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] font-medium transition-all disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting || !canAfford || !formData.recipientUsername.trim()}
            className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
            whileHover={!isSubmitting && canAfford ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting && canAfford ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" />Enviando...</>
            ) : (
              <>
                <Send size={18} />
                Enviar Presente
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardStore = () => {
  const {
    items,
    isLoadingStore,
    storeError,
    refreshStore,
    purchaseItem,
    equipItem,
    unequipItem,
    toggleFavorite,
    sendGift,
    clearError,
  } = useStore();

  const { profileData, refreshProfile } = useProfile();
  const [giftError, setGiftError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // ✅ NOVO: Tab principal (loja, moedas ou personalização)
  const [mainTab, setMainTab] = useState<MainTab>("store");
  
  const [activeTab, setActiveTab] = useState<StoreItemType | "all">("all");
  const [filterOwned, setFilterOwned] = useState<"all" | "owned" | "not_owned">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  const userCoins = useMemo(() => profileData?.coins ?? 0, [profileData?.coins]);
  const currentSlug = useMemo(() => profileData?.slug ?? "", [profileData?.slug]);
  const error = storeError || localError;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab !== "all" && item.type !== activeTab) return false;
      if (filterOwned === "owned" && !item.isOwned) return false;
      if (filterOwned === "not_owned" && item.isOwned) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      }
      return true;
    });
  }, [items, activeTab, filterOwned, searchQuery]);

  const counts = useMemo(() => ({
    all: items.length,
    badge: items.filter((i) => i.type === "badge").length,
    frame: items.filter((i) => i.type === "frame").length,
    effect: items.filter((i) => i.type === "effect").length,
    bundle: items.filter((i) => i.type === "bundle").length,
  }), [items]);

  const handleGiftClick = (item: StoreItem) => {
    setSelectedItem(item);
    setGiftError(null);
    setIsGiftModalOpen(true);
  };

  const handleSendGift = async (formData: GiftFormData) => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    setGiftError(null);

    try {
      const giftRequest: SendGiftRequest = {
        toUserSlug: formData.recipientUsername,
        itemId: selectedItem.id,
        message: formData.message || "",
      };

      await sendGift(giftRequest);
      await refreshProfile();

      setSuccessMessage(`🎁 Presente enviado com sucesso para @${formData.recipientUsername}!`);
      setIsGiftModalOpen(false);
      setSelectedItem(null);
      setGiftError(null);
      setTimeout(() => setSuccessMessage(""), 5000);

    } catch (err: any) {
      console.error("Erro ao enviar presente:", err);
      setGiftError(err.message || "Erro ao enviar presente. Verifique o nome de usuário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchaseClick = (item: StoreItem) => {
    setSelectedItem(item);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;

    const finalPrice = calculateDiscount(selectedItem.price, selectedItem.discount);

    if (userCoins < finalPrice) {
      setLocalError(`Moedas insuficientes. Você tem ${userCoins} moedas, mas precisa de ${finalPrice}.`);
      setIsPurchaseModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await purchaseItem(selectedItem.id);
      await refreshProfile();

      setSuccessMessage(`${selectedItem.name} adquirido com sucesso!`);
      setIsPurchaseModalOpen(false);
      setSelectedItem(null);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      console.error("Erro ao comprar item:", err);
      setLocalError(err.response?.data?.message || "Erro ao comprar item. Tente novamente.");
      setIsPurchaseModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEquip = async (item: StoreItem) => {
    setIsSubmitting(true);
    setLocalError(null);

    try {
      if (item.isEquipped) {
        await unequipItem(item.id);
        setSuccessMessage(`${item.name} desequipado!`);
      } else {
        await equipItem(item.id);
        setSuccessMessage(`${item.name} equipado com sucesso!`);
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Erro ao equipar/desequipar item:", err);
      setLocalError(err.response?.data?.message || "Erro ao equipar item. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFavorite = (item: StoreItem) => {
    toggleFavorite(item.id);
  };

  const handleClearError = () => {
    setLocalError(null);
    clearError();
  };

  // Função para notificações (usada pelo CoinsPurchaseSection e CustomizeSection)
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 5000);
    } else if (type === "error") {
      setLocalError(message);
    } else {
      // Info - mostrar como success temporário
      setSuccessMessage(message);
    }
  };

  // Callback quando o slug é alterado com sucesso
  const handleSlugChanged = () => {
    refreshProfile();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-[var(--color-text)] font-medium">Loja</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Store className="w-8 h-8 text-[var(--color-primary)]" />
            </motion.div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
                Loja
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Personalize seu perfil com itens exclusivos
              </p>
            </div>
          </div>

          {/* Coins Display */}
          <motion.div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/15 to-orange-500/10 border border-yellow-500/30 shadow-lg shadow-yellow-500/10 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setMainTab("coins")}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Coins size={28} className="text-yellow-500" />
            </motion.div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
                Suas Moedas
              </p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {userCoins.toLocaleString()}
              </p>
            </div>
            <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Tabs (Loja / Comprar Moedas / Personalizar) */}
      <div className="flex flex-wrap gap-4 mb-6">
        <MainTabButton
          active={mainTab === "store"}
          onClick={() => setMainTab("store")}
          icon={Store}
          label="Loja de Itens"
        />
        <MainTabButton
          active={mainTab === "coins"}
          onClick={() => setMainTab("coins")}
          icon={Coins}
          label="Comprar Moedas"
        />
        <MainTabButton
          active={mainTab === "customize"}
          onClick={() => setMainTab("customize")}
          icon={Link2}
          label="Personalizar URL"
          badge={`${SLUG_CHANGE_COST}`}
        />
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <span className="text-sm text-red-400 flex-1">{error}</span>
            <motion.button
              onClick={handleClearError}
              className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-green-500/20">
              <Check size={20} className="text-green-400" />
            </div>
            <span className="text-sm text-green-400 flex-1">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTEÚDO CONDICIONAL */}
      <AnimatePresence mode="wait">
        {mainTab === "coins" ? (
          <motion.div
            key="coins"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CoinsPurchaseSection 
              userCoins={userCoins} 
              onNotification={showNotification}
            />
          </motion.div>
        ) : mainTab === "customize" ? (
          <motion.div
            key="customize"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CustomizeSection
              currentSlug={currentSlug}
              userCoins={userCoins}
              onNotification={showNotification}
              onSlugChanged={handleSlugChanged}
            />
          </motion.div>
        ) : (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters */}
            <StoreCard className="mb-6" gradient>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar itens por nome ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]/50 transition-all"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} icon={Store} label="Todos" count={counts.all} />
                  <TabButton active={activeTab === "badge"} onClick={() => setActiveTab("badge")} icon={Award} label="Insígnias" count={counts.badge} />
                  <TabButton active={activeTab === "frame"} onClick={() => setActiveTab("frame")} icon={Frame} label="Molduras" count={counts.frame} />
                  <TabButton active={activeTab === "effect"} onClick={() => setActiveTab("effect")} icon={Sparkles} label="Efeitos" count={counts.effect} />
                  <TabButton active={activeTab === "bundle"} onClick={() => setActiveTab("bundle")} icon={Package} label="Pacotes" count={counts.bundle} />
                </div>

                {/* Ownership Filter & Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <Filter size={14} />
                      <span className="font-medium">Filtrar por:</span>
                    </div>
                    <div className="flex gap-2">
                      {(["all", "owned", "not_owned"] as const).map((filter) => (
                        <motion.button
                          key={filter}
                          onClick={() => setFilterOwned(filter)}
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${filterOwned === filter
                              ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                              : "bg-[var(--color-background)]/50 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {filter === "all" ? "Todos" : filter === "owned" ? "Meus Itens" : "Disponíveis"}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      <strong className="text-[var(--color-text)]">{filteredItems.length}</strong> {filteredItems.length === 1 ? "item" : "itens"}
                    </span>
                    <motion.button
                      onClick={refreshStore}
                      disabled={isLoadingStore}
                      className="p-2.5 rounded-xl bg-[var(--color-background)]/50 hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all disabled:opacity-50"
                      title="Recarregar itens"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw size={16} className={isLoadingStore ? "animate-spin" : ""} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </StoreCard>

            {/* Items Grid */}
            <StoreCard>
              <div className="min-h-[400px]">
                {isLoadingStore ? (
                  <LoadingSkeleton />
                ) : filteredItems.length === 0 ? (
                  <EmptyState type={activeTab} searchQuery={searchQuery} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredItems.map((item, index) => (
                      <StoreItemCard
                        key={item.id}
                        item={item}
                        userCoins={userCoins}
                        userProfileImage={profileData?.pageSettings?.mediaUrls?.profileImageUrl}
                        onGift={() => handleGiftClick(item)}
                        onPurchase={() => handlePurchaseClick(item)}
                        onEquip={() => handleEquip(item)}
                        onFavorite={() => handleFavorite(item)}
                        disabled={isSubmitting}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </StoreCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Modal */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => {
          setIsGiftModalOpen(false);
          setSelectedItem(null);
          setGiftError(null);
        }}
        item={selectedItem}
        userCoins={userCoins}
        userProfileImage={profileData?.pageSettings?.mediaUrls?.profileImageUrl}
        onSendGift={handleSendGift}
        isSubmitting={isSubmitting}
        giftError={giftError}
      />

      {/* Purchase Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => { setIsPurchaseModalOpen(false); setSelectedItem(null); }}
        title="Confirmar Compra"
        subtitle="Revise os detalhes antes de confirmar"
        icon={ShoppingCart}
        size="md"
      >
        {selectedItem && (() => {
          const normalizedRarity = normalizeRarity(selectedItem.rarity);
          const rarityColor = getRarityColor(normalizedRarity);
          const finalPrice = calculateDiscount(selectedItem.price, selectedItem.discount);
          const canAfford = userCoins >= finalPrice;
          const balanceAfter = userCoins - finalPrice;

          return (
            <div className="space-y-6">
              {/* Item Preview */}
              <motion.div
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div
                  className="rounded-xl overflow-hidden flex-shrink-0 w-20 h-20 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${rarityColor}30, ${rarityColor}10)` }}
                >
                  <ItemMediaPreview
                    item={selectedItem}
                    size="small"
                    userProfileImage={profileData?.pageSettings?.mediaUrls?.profileImageUrl}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--color-text)] truncate">{selectedItem.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{selectedItem.description}</p>
                  <span
                    className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase"
                    style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
                  >
                    {getRarityLabel(normalizedRarity)}
                  </span>
                </div>
              </motion.div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)]/50">
                  <span className="text-sm text-[var(--color-text-muted)]">Preço original</span>
                  <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1">
                    <Coins size={14} className="text-yellow-500" />
                    {selectedItem.price.toLocaleString()}
                  </span>
                </div>

                {selectedItem.discount && selectedItem.discount > 0 && (
                  <motion.div
                    className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <span className="text-sm text-green-400 flex items-center gap-1">
                      <Tag size={14} />
                      Desconto ({selectedItem.discount}%)
                    </span>
                    <span className="text-sm font-medium text-green-400">
                      -{(selectedItem.price - finalPrice).toLocaleString()}
                    </span>
                  </motion.div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/15 to-[var(--color-primary)]/5 border-2 border-[var(--color-primary)]">
                  <span className="text-base font-bold text-[var(--color-text)]">Total a pagar</span>
                  <span className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                    <Coins size={20} className="text-yellow-500" />
                    {finalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--color-surface)]/50">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Saldo atual</p>
                    <p className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1">
                      <Coins size={14} className="text-yellow-500" />
                      {userCoins.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-surface)]/50">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Saldo após</p>
                    <p className={`text-sm font-bold flex items-center gap-1 ${balanceAfter < 0 ? "text-red-400" : "text-green-400"}`}>
                      <Coins size={14} className="text-yellow-500" />
                      {balanceAfter.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {!canAfford && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Moedas insuficientes</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Você precisa de mais {(finalPrice - userCoins).toLocaleString()} moedas.
                    </p>
                    <motion.button
                      onClick={() => {
                        setIsPurchaseModalOpen(false);
                        setSelectedItem(null);
                        setMainTab("coins");
                      }}
                      className="mt-2 text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
                      whileHover={{ x: 3 }}
                    >
                      Comprar mais moedas <ArrowRight size={12} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <motion.button
                  onClick={() => { setIsPurchaseModalOpen(false); setSelectedItem(null); }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] font-medium transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={handlePurchase}
                  disabled={isSubmitting || !canAfford}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:shadow-lg hover:shadow-[var(--color-primary)]/25 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={!isSubmitting && canAfford ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting && canAfford ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" />Processando...</>
                  ) : (
                    <><ShoppingCart size={18} />Confirmar Compra</>
                  )}
                </motion.button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default DashboardStore;