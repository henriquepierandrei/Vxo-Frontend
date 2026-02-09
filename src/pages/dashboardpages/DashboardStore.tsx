// pages/dashboard/DashboardStore.tsx
import { useState, useEffect, useRef } from "react";
import { useProfile } from "../../contexts/UserContext";
import { useStore, type  StoreItem, type StoreItemType, type ItemRarity } from "../../contexts/StoreContext";
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
  Eye,
  Filter,
  Search,
  Coins,
  AlertCircle,
  X,
  Lock,
  Crown,
  Zap,
  Gift,
  Tag,
  Video,
  FileCode,
  User,
} from "lucide-react";
import React from "react";

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO - URL da foto de perfil para preview
// ═══════════════════════════════════════════════════════════

const PREVIEW_PROFILE_IMAGE = "https://i.pravatar.cc/300?u=preview";

// ═══════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════

const getRarityColor = (rarity: ItemRarity): string => {
  const colors = {
    common: "#9CA3AF",
    rare: "#3B82F6",
    epic: "#A855F7",
    legendary: "#F59E0B",
  };
  return colors[rarity];
};

const getRarityGlow = (rarity: ItemRarity): string => {
  const glows = {
    common:
      "0 0 20px rgba(156, 163, 175, 0.5), 0 0 40px rgba(156, 163, 175, 0.3)",
    rare: "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)",
    epic: "0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)",
    legendary:
      "0 0 25px rgba(245, 158, 11, 0.7), 0 0 50px rgba(245, 158, 11, 0.5), 0 0 75px rgba(245, 158, 11, 0.3)",
  };
  return glows[rarity];
};

const getRarityLabel = (rarity: ItemRarity): string => {
  const labels = {
    common: "Comum",
    rare: "Raro",
    epic: "Épico",
    legendary: "Lendário",
  };
  return labels[rarity];
};

const getTypeIcon = (type: StoreItemType) => {
  const icons = {
    badge: Award,
    frame: Frame,
    effect: Sparkles,
    bundle: Package,
  };
  return icons[type];
};

const getTypeLabel = (type: StoreItemType): string => {
  const labels = {
    badge: "Insígnia",
    frame: "Moldura",
    effect: "Efeito",
    bundle: "Pacote",
  };
  return labels[type];
};

const calculateDiscount = (price: number, discount?: number): number => {
  if (!discount) return price;
  return Math.floor(price * (1 - discount / 100));
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Preview de Moldura com Foto de Perfil
// ═══════════════════════════════════════════════════════════

const FramePreview = ({
  frameUrl,
  size = "medium",
  profileImageUrl = PREVIEW_PROFILE_IMAGE,
  rarity
}: {
  frameUrl: string;
  size?: "small" | "medium" | "large";
  profileImageUrl?: string;
  rarity: ItemRarity;
  isAnimated?: boolean;
}) => {
  const [frameError, setFrameError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeConfig = {
    small: {
      container: "w-16 h-16",
      profile: "w-10 h-10",
      frame: "w-16 h-16",
    },
    medium: {
      container: "w-32 h-32",
      profile: "w-28 h-28",
      frame: "w-32 h-32",
    },
    large: {
      container: "w-48 h-48",
      profile: "w-32 h-32",
      frame: "w-48 h-48",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`${config.container} relative flex items-center justify-center`}
      style={{
        filter: `drop-shadow(${getRarityGlow(rarity)})`,
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      )}

      <div
        className={`${config.profile} rounded-full overflow-hidden absolute z-10`}
      >
        {!profileError ? (
          <img
            src={profileImageUrl}
            alt="Preview do perfil"
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setProfileError(true);
              setIsLoading(false);
            }}
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
          className={`${config.frame} absolute z-20 object-contain pointer-events-none`}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onError={() => setFrameError(true)}
        />
      )}

      {rarity === "legendary" && (
        <motion.div
          className="absolute inset-0 rounded-full z-5 pointer-events-none"
          style={{
            background: `radial-gradient(circle, transparent 40%, ${getRarityColor(
              rarity
            )}20 100%)`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Preview de Mídia por Tipo com Brilho
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

  const sizeConfig = {
    small: {
      container: "w-16 h-16",
      svg: "w-10 h-10",
      icon: "w-8 h-8",
    },
    medium: {
      container: "w-full h-40",
      svg: "w-20 h-20",
      icon: "w-16 h-16",
    },
    large: {
      container: "w-full h-64",
      svg: "w-32 h-32",
      icon: "w-24 h-24",
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (item.type === "effect" && videoRef.current && !videoError) {
      videoRef.current.play().catch(() => {});
    }
  }, [item.type, videoError]);

  // Badge (SVG)
  if (item.type === "badge") {
    if (item.svgUrl) {
      return (
        <div
          className={`${config.container} flex items-center justify-center p-4 relative`}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ filter: "blur(20px)", opacity: 0.6 }}
          >
            <div
              className={`${config.svg} rounded-full`}
              style={{ backgroundColor: getRarityColor(item.rarity) }}
            />
          </div>

          <img
            src={item.svgUrl}
            alt={item.name}
            className={`${config.svg} object-contain relative z-10`}
            style={{
              filter: `drop-shadow(${getRarityGlow(item.rarity)})`,
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <div
        className={`${config.container} flex items-center justify-center relative`}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ filter: "blur(20px)", opacity: 0.5 }}
        >
          <div
            className={`${config.svg} rounded-full`}
            style={{ backgroundColor: getRarityColor(item.rarity) }}
          />
        </div>
        <FileCode
          className={`${config.icon} relative z-10`}
          style={{
            color: "white",
            filter: `drop-shadow(${getRarityGlow(item.rarity)})`,
          }}
        />
      </div>
    );
  }

  // Frame
  if (item.type === "frame") {
    const isAnimated = item.imageUrl?.toLowerCase().endsWith(".gif");

    if (item.imageUrl && !imageError) {
      return (
        <div
          className={`${config.container} flex items-center justify-center relative`}
          style={{
            background: `radial-gradient(circle, ${getRarityColor(
              item.rarity
            )}10, transparent)`,
          }}
        >
          <FramePreview
            frameUrl={item.imageUrl}
            size={size}
            profileImageUrl={userProfileImage || PREVIEW_PROFILE_IMAGE}
            rarity={item.rarity}
            isAnimated={isAnimated}
          />
        </div>
      );
    }

    return (
      <div
        className={`${config.container} flex items-center justify-center bg-[var(--color-surface)] relative`}
      >
        <div className="relative">
          <div
            className={`${
              size === "small"
                ? "w-10 h-10"
                : size === "medium"
                ? "w-20 h-20"
                : "w-32 h-32"
            } rounded-full bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 flex items-center justify-center`}
          >
            <User
              className={`${
                size === "small"
                  ? "w-5 h-5"
                  : size === "medium"
                  ? "w-10 h-10"
                  : "w-16 h-16"
              } text-[var(--color-text-muted)]`}
            />
          </div>

          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `3px solid ${getRarityColor(item.rarity)}`,
              boxShadow: getRarityGlow(item.rarity),
            }}
          />
        </div>

        <div className="absolute bottom-2 right-2 p-1 rounded-full bg-[var(--color-background)]/80">
          <Frame size={14} style={{ color: getRarityColor(item.rarity) }} />
        </div>
      </div>
    );
  }

  // Effect (Vídeo)
  if (item.type === "effect") {
    if (item.videoUrl && !videoError) {
      return (
        <div
          className={`${config.container} relative overflow-hidden bg-black`}
        >
          <video
            ref={videoRef}
            src={item.videoUrl}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            poster={item.thumbnailUrl}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setVideoError(true);
              setIsLoading(false);
            }}
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}

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
      >
        <Video className={`${config.icon} text-white/50`} />
      </div>
    );
  }

  // Bundle
  if (item.type === "bundle") {
    if (item.imageUrl && !imageError) {
      return (
        <div className={`${config.container} relative overflow-hidden`}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-muted)]" />
            </div>
          )}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={`${config.container} flex items-center justify-center relative`}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ filter: "blur(20px)", opacity: 0.5 }}
        >
          <div
            className={`${config.svg} rounded-full`}
            style={{ backgroundColor: getRarityColor(item.rarity) }}
          />
        </div>
        <Package
          className={`${config.icon} relative z-10`}
          style={{
            color: "white",
            filter: `drop-shadow(${getRarityGlow(item.rarity)})`,
          }}
        />
      </div>
    );
  }

  return null;
};

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

const StoreCard = ({
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
          <div className="w-full max-w-lg bg-[var(--color-background)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-xl)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-background)] z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">
                {title}
              </h2>
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
    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
      active
        ? "bg-[var(--color-primary)] text-white shadow-lg"
        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon size={16} />
    <span>{label}</span>
    {count !== undefined && (
      <span
        className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
          active ? "bg-white/20" : "bg-[var(--color-background)]"
        }`}
      >
        {count}
      </span>
    )}
  </motion.button>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div
        key={i}
        className="h-64 bg-[var(--color-surface)] rounded-[var(--border-radius-lg)] border border-[var(--color-border)]"
      />
    ))}
  </div>
);

const EmptyState = ({ type }: { type: StoreItemType | "all" }) => {
  const messages = {
    all: {
      title: "Nenhum item disponível",
      description: "Não há itens disponíveis na loja no momento.",
    },
    badge: {
      title: "Nenhuma insígnia encontrada",
      description: "Não há insígnias disponíveis no momento.",
    },
    frame: {
      title: "Nenhuma moldura encontrada",
      description: "Não há molduras disponíveis no momento.",
    },
    effect: {
      title: "Nenhum efeito encontrado",
      description: "Não há efeitos disponíveis no momento.",
    },
    bundle: {
      title: "Nenhum pacote encontrado",
      description: "Não há pacotes disponíveis no momento.",
    },
  };

  const message = messages[type];
  const Icon = type === "all" ? Store : getTypeIcon(type as StoreItemType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 sm:py-16"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
        <Icon
          size={28}
          className="sm:w-8 sm:h-8 text-[var(--color-text-muted)]"
        />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)] mb-2">
        {message.title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] text-center max-w-xs">
        {message.description}
      </p>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Item da Loja
// ═══════════════════════════════════════════════════════════

const StoreItemCard = ({
  item,
  userCoins,
  userProfileImage,
  onPreview,
  onPurchase,
  onEquip,
  onFavorite,
  disabled,
}: {
  item: StoreItem;
  userCoins: number;
  userProfileImage?: string;
  onPreview: () => void;
  onPurchase: () => void;
  onEquip: () => void;
  onFavorite: () => void;
  disabled: boolean;
}) => {
  const TypeIcon = getTypeIcon(item.type);
  const rarityColor = getRarityColor(item.rarity);
  const finalPrice = calculateDiscount(item.price, item.discount);
  const canAfford = userCoins >= finalPrice;
  const isLocked = !!(item.quantityAvailable !== undefined && item.quantityAvailable !== null && item.quantityAvailable <= 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        group relative overflow-hidden
        bg-[var(--color-surface)] border-2 rounded-[var(--border-radius-lg)]
        hover:shadow-xl transition-all duration-300
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
      style={{
        borderColor: item.isEquipped ? rarityColor : "var(--color-border)",
      }}
      whileHover={{ y: -4 }}
    >
      {/* Badges superiores */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 z-10">
        <div className="flex flex-wrap gap-1">
          {item.isLimited && (
            <span className="px-2 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
              <Zap size={10} />
              LIMITADO
            </span>
          )}
          {item.discount && (
            <span className="px-2 py-1 rounded-full bg-green-500/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
              <Tag size={10} />
              -{item.discount}%
            </span>
          )}
          {item.isOwned && (
            <span className="px-2 py-1 rounded-full bg-blue-500/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
              <Check size={10} />
              POSSUI
            </span>
          )}
          {item.type === "frame" &&
            item.imageUrl?.toLowerCase().endsWith(".gif") && (
              <span className="px-2 py-1 rounded-full bg-purple-500/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                <Sparkles size={10} />
                ANIMADA
              </span>
            )}
          {item.isPremium && (
            <span className="px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
              <Crown size={10} />
              PREMIUM
            </span>
          )}
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${
            item.isFavorite
              ? "bg-yellow-500/90 text-white"
              : "bg-black/30 text-white/70 hover:text-white"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Star size={12} fill={item.isFavorite ? "currentColor" : "none"} />
        </motion.button>
      </div>

      {/* Preview do Item */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${rarityColor}20, ${rarityColor}05)`,
        }}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <Lock size={32} className="text-white/70 mx-auto mb-2" />
              <p className="text-white text-xs font-semibold">
                Esgotado
              </p>
            </div>
          </div>
        )}

        <ItemMediaPreview
          item={item}
          size="medium"
          showPlayButton={item.type === "effect"}
          userProfileImage={userProfileImage}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Informações */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-[var(--color-text)] line-clamp-1 flex-1">
              {item.name}
            </h3>
            <TypeIcon
              size={16}
              className="text-[var(--color-text-muted)] flex-shrink-0"
            />
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: rarityColor }}
          >
            {getRarityLabel(item.rarity)}
          </p>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 min-h-[2.5rem]">
          {item.description}
        </p>

        {/* Quantidade disponível */}
        {item.quantityAvailable !== null && item.quantityAvailable !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <Package size={10} />
            <span>{item.quantityAvailable.toLocaleString()} disponíveis</span>
          </div>
        )}

        {/* Preço e Ações */}
        <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
          {!item.isOwned ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={16} className="text-yellow-500" />
                  <div className="flex items-baseline gap-1">
                    {item.discount ? (
                      <>
                        <span className="text-xs text-[var(--color-text-muted)] line-through">
                          {item.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-[var(--color-text)]">
                          {finalPrice.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-[var(--color-text)]">
                        {item.price === 0 ? "Grátis" : finalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {!canAfford && item.price > 0 && (
                  <span className="text-[10px] text-red-400 font-medium">
                    Moedas insuficientes
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={onPreview}
                  disabled={disabled}
                  className="flex-1 px-3 py-2 rounded-[var(--border-radius-md)] bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye size={14} />
                  Ver
                </motion.button>

                <motion.button
                  onClick={onPurchase}
                  disabled={disabled || !canAfford || isLocked}
                  className={`
                    flex-1 px-3 py-2 rounded-[var(--border-radius-md)] text-xs font-medium
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-1
                    ${
                      canAfford && !isLocked
                        ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                  <Check size={14} />
                  Você possui este item
                </span>
                {item.isEquipped && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-semibold">
                    EQUIPADO
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  onClick={onPreview}
                  disabled={disabled}
                  className="flex-1 px-3 py-2 rounded-[var(--border-radius-md)] bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye size={14} />
                  Preview
                </motion.button>

                <motion.button
                  onClick={onEquip}
                  disabled={disabled}
                  className={`
                    flex-1 px-3 py-2 rounded-[var(--border-radius-md)] text-xs font-medium
                    transition-all disabled:opacity-50 flex items-center justify-center gap-1
                    ${
                      item.isEquipped
                        ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.isEquipped ? (
                    <>
                      <X size={14} />
                      Desequipar
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Equipar
                    </>
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
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardStore = () => {
  // ✅ Usando o contexto da Store
  const {
    items,
    userCoins,
    isLoadingStore,
    storeError,
    refreshStore,
    purchaseItem,
    equipItem,
    unequipItem,
    toggleFavorite,
    clearError,
  } = useStore();

  const { profileData } = useProfile();

  // Estados locais (apenas UI)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<StoreItemType | "all">("all");
  const [filterOwned, setFilterOwned] = useState<"all" | "owned" | "not_owned">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados do Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  // Combinar erros
  const error = storeError || localError;

  // Filtrar itens
  const filteredItems = items.filter((item) => {
    if (activeTab !== "all" && item.type !== activeTab) return false;
    if (filterOwned === "owned" && !item.isOwned) return false;
    if (filterOwned === "not_owned" && item.isOwned) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Contadores para os tabs
  const getCounts = () => {
    return {
      all: items.length,
      badge: items.filter((i) => i.type === "badge").length,
      frame: items.filter((i) => i.type === "frame").length,
      effect: items.filter((i) => i.type === "effect").length,
      bundle: items.filter((i) => i.type === "bundle").length,
    };
  };

  const counts = getCounts();

  // Handlers
  const handlePreview = (item: StoreItem) => {
    setSelectedItem(item);
    setIsPreviewModalOpen(true);
  };

  const handlePurchaseClick = (item: StoreItem) => {
    setSelectedItem(item);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await purchaseItem(selectedItem.id);

      setSuccessMessage(`${selectedItem.name} adquirido com sucesso!`);
      setIsPurchaseModalOpen(false);
      setSelectedItem(null);

      setTimeout(() => setSuccessMessage(""), 3000);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

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
          <span className="text-[var(--color-text)]">Loja</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <Store className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            Personalize seu perfil com itens exclusivos
          </h1>

          {/* Saldo de Moedas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--border-radius-lg)] bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30"
          >
            <Coins size={20} className="text-yellow-500" />
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                Suas Moedas
              </p>
              <p className="text-lg font-bold text-[var(--color-text)]">
                {userCoins.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Error & Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-[var(--border-radius-md)] bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400 flex-1">{error}</span>
            <button
              onClick={handleClearError}
              className="p-1 rounded-full hover:bg-red-500/20 text-red-400"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-[var(--border-radius-md)] bg-green-500/10 border border-green-500/30 flex items-center gap-3"
          >
            <Check size={20} className="text-green-400 flex-shrink-0" />
            <span className="text-sm text-green-400 flex-1">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Tabs */}
      <StoreCard className="mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              icon={Store}
              label="Todos"
              count={counts.all}
            />
            <TabButton
              active={activeTab === "badge"}
              onClick={() => setActiveTab("badge")}
              icon={Award}
              label="Insígnias"
              count={counts.badge}
            />
            <TabButton
              active={activeTab === "frame"}
              onClick={() => setActiveTab("frame")}
              icon={Frame}
              label="Molduras"
              count={counts.frame}
            />
            <TabButton
              active={activeTab === "effect"}
              onClick={() => setActiveTab("effect")}
              icon={Sparkles}
              label="Efeitos"
              count={counts.effect}
            />
            <TabButton
              active={activeTab === "bundle"}
              onClick={() => setActiveTab("bundle")}
              icon={Package}
              label="Pacotes"
              count={counts.bundle}
            />
          </div>

          {/* Ownership Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <Filter size={14} />
              <span>Filtrar:</span>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setFilterOwned("all")}
                className={`px-3 py-1.5 rounded-[var(--border-radius-sm)] text-xs font-medium transition-all ${
                  filterOwned === "all"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Todos
              </motion.button>
              <motion.button
                onClick={() => setFilterOwned("owned")}
                className={`px-3 py-1.5 rounded-[var(--border-radius-sm)] text-xs font-medium transition-all ${
                  filterOwned === "owned"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Meus Itens
              </motion.button>
              <motion.button
                onClick={() => setFilterOwned("not_owned")}
                className={`px-3 py-1.5 rounded-[var(--border-radius-sm)] text-xs font-medium transition-all ${
                  filterOwned === "not_owned"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Disponíveis
              </motion.button>
            </div>
          </div>

          {/* Results Count */}
          {!isLoadingStore && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <span className="text-xs text-[var(--color-text-muted)]">
                {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "item encontrado" : "itens encontrados"}
              </span>
              <motion.button
                onClick={refreshStore}
                disabled={isLoadingStore}
                className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Recarregar itens"
              >
                <RefreshCw size={14} className={isLoadingStore ? "animate-spin" : ""} />
              </motion.button>
            </div>
          )}
        </div>
      </StoreCard>

      {/* Items Grid */}
      <StoreCard>
        {isLoadingStore ? (
          <LoadingSkeleton />
        ) : filteredItems.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  userCoins={userCoins}
                  userProfileImage={profileData?.pageSettings?.mediaUrls?.profileImageUrl}
                  onPreview={() => handlePreview(item)}
                  onPurchase={() => handlePurchaseClick(item)}
                  onEquip={() => handleEquip(item)}
                  onFavorite={() => handleFavorite(item)}
                  disabled={isSubmitting}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </StoreCard>

      {/* Modal: Preview do Item */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedItem(null);
        }}
        title="Preview do Item"
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Preview grande */}
            <div
              className="relative rounded-[var(--border-radius-lg)] overflow-hidden flex items-center justify-center py-8"
              style={{
                background: `linear-gradient(135deg, ${getRarityColor(selectedItem.rarity)}30, ${getRarityColor(selectedItem.rarity)}10)`,
              }}
            >
              <ItemMediaPreview
                item={selectedItem}
                size="large"
                showPlayButton={selectedItem.type === "effect"}
                userProfileImage={profileData?.pageSettings?.mediaUrls?.profileImageUrl}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                {selectedItem.isLimited && (
                  <span className="px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                    <Zap size={12} />
                    EDIÇÃO LIMITADA
                  </span>
                )}
                {selectedItem.isOwned && (
                  <span className="px-3 py-1.5 rounded-full bg-blue-500/90 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                    <Check size={12} />
                    VOCÊ POSSUI
                  </span>
                )}
                {selectedItem.isEquipped && (
                  <span className="px-3 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                    <Crown size={12} />
                    EQUIPADO
                  </span>
                )}
                {selectedItem.isPremium && (
                  <span className="px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                    <Crown size={12} />
                    PREMIUM
                  </span>
                )}
              </div>
            </div>

            {/* Informações */}
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-[var(--color-text)]">
                    {selectedItem.name}
                  </h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      backgroundColor: `${getRarityColor(selectedItem.rarity)}20`,
                      color: getRarityColor(selectedItem.rarity),
                    }}
                  >
                    {getRarityLabel(selectedItem.rarity)}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {selectedItem.description}
                </p>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Tipo</p>
                  <p className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1">
                    {React.createElement(getTypeIcon(selectedItem.type), { size: 14 })}
                    {getTypeLabel(selectedItem.type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Preço</p>
                  <p className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1">
                    <Coins size={14} className="text-yellow-500" />
                    {selectedItem.price === 0 ? (
                      "Grátis"
                    ) : selectedItem.discount ? (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-[var(--color-text-muted)]">
                          {selectedItem.price.toLocaleString()}
                        </span>
                        <span className="text-green-400 font-bold">
                          {calculateDiscount(selectedItem.price, selectedItem.discount).toLocaleString()}
                        </span>
                      </span>
                    ) : (
                      selectedItem.price.toLocaleString()
                    )}
                  </p>
                </div>
                {selectedItem.quantityAvailable !== null && selectedItem.quantityAvailable !== undefined && (
                  <div className="col-span-2">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Disponibilidade</p>
                    <p className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1">
                      <Package size={14} />
                      {selectedItem.quantityAvailable.toLocaleString()} unidades disponíveis
                    </p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4">
                {!selectedItem.isOwned ? (
                  <motion.button
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      handlePurchaseClick(selectedItem);
                    }}
                    disabled={userCoins < calculateDiscount(selectedItem.price, selectedItem.discount)}
                    className="flex-1 px-4 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShoppingCart size={18} />
                    Comprar Agora
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => {
                      handleEquip(selectedItem);
                      setIsPreviewModalOpen(false);
                    }}
                    className={`flex-1 px-4 py-3 rounded-[var(--border-radius-md)] font-medium transition-all flex items-center justify-center gap-2 ${
                      selectedItem.isEquipped
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedItem.isEquipped ? (
                      <>
                        <X size={18} />
                        Desequipar
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Equipar
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Confirmar Compra */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setSelectedItem(null);
        }}
        title="Confirmar Compra"
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Item preview pequeno */}
            <div className="flex items-center gap-4 p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
              <div
                className="rounded-[var(--border-radius-md)] overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${getRarityColor(selectedItem.rarity)}30, ${getRarityColor(selectedItem.rarity)}10)`,
                }}
              >
                <ItemMediaPreview
                  item={selectedItem}
                  size="small"
                  userProfileImage={profileData?.pageSettings?.mediaUrls?.profileImageUrl}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-text)] truncate">
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {selectedItem.description}
                </p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: `${getRarityColor(selectedItem.rarity)}20`,
                    color: getRarityColor(selectedItem.rarity),
                  }}
                >
                  {getRarityLabel(selectedItem.rarity)}
                </span>
              </div>
            </div>

            {/* Resumo da compra */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
                <span className="text-sm text-[var(--color-text-muted)]">Preço original</span>
                <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1">
                  <Coins size={14} className="text-yellow-500" />
                  {selectedItem.price.toLocaleString()}
                </span>
              </div>

              {selectedItem.discount && (
                <div className="flex items-center justify-between p-3 rounded-[var(--border-radius-sm)] bg-green-500/10">
                  <span className="text-sm text-green-400 flex items-center gap-1">
                    <Tag size={14} />
                    Desconto ({selectedItem.discount}%)
                  </span>
                  <span className="text-sm font-medium text-green-400">
                    -{(selectedItem.price - calculateDiscount(selectedItem.price, selectedItem.discount)).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30">
                <span className="text-base font-semibold text-[var(--color-text)]">Total a pagar</span>
                <span className="text-lg font-bold text-[var(--color-primary)] flex items-center gap-1">
                  <Coins size={18} className="text-yellow-500" />
                  {calculateDiscount(selectedItem.price, selectedItem.discount).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
                <span className="text-sm text-[var(--color-text-muted)]">Saldo atual</span>
                <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1">
                  <Coins size={14} className="text-yellow-500" />
                  {userCoins.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
                <span className="text-sm text-[var(--color-text-muted)]">Saldo após compra</span>
                <span
                  className={`text-sm font-bold flex items-center gap-1 ${
                    userCoins - calculateDiscount(selectedItem.price, selectedItem.discount) < 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  <Coins size={14} className="text-yellow-500" />
                  {(userCoins - calculateDiscount(selectedItem.price, selectedItem.discount)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Aviso se não tiver moedas suficientes */}
            {userCoins < calculateDiscount(selectedItem.price, selectedItem.discount) && (
              <div className="flex items-start gap-3 p-4 rounded-[var(--border-radius-md)] bg-red-500/10 border border-red-500/30">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">Moedas insuficientes</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Você precisa de mais{" "}
                    {(calculateDiscount(selectedItem.price, selectedItem.discount) - userCoins).toLocaleString()}{" "}
                    moedas para comprar este item.
                  </p>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <motion.button
                onClick={() => {
                  setIsPurchaseModalOpen(false);
                  setSelectedItem(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={handlePurchase}
                disabled={
                  isSubmitting ||
                  userCoins < calculateDiscount(selectedItem.price, selectedItem.discount)
                }
                className="flex-1 px-4 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={
                  isSubmitting ||
                  userCoins < calculateDiscount(selectedItem.price, selectedItem.discount)
                    ? {}
                    : { scale: 1.02 }
                }
                whileTap={
                  isSubmitting ||
                  userCoins < calculateDiscount(selectedItem.price, selectedItem.discount)
                    ? {}
                    : { scale: 0.98 }
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Confirmar Compra
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardStore;