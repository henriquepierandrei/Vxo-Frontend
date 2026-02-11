import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  ChevronRight,
  Gift,
  Crown,
  Zap,
  Clock,
  Sparkles,
  Star,
  Lock,
  Play,
  CheckCircle,
  X,
  Timer,
  Trophy,
  Gem,
  Package,
  Palette,
  Image,
  Frame,
  Wand2,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface RouletteItem {
  id: string;
  name: string;
  image: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  type: "frame" | "badge" | "effect" | "background" | "icon";
}

interface SpinResult {
  winnerId: string;
}

interface UserRouletteStatus {
  freeRouletteAvailable: boolean;
  lastFreeRoulette: Date | null;
  nextFreeRoulette: Date | null;
  vcoins: number;
  premiumRouletteCost: number;
}

type RouletteState = "idle" | "loading" | "spinning" | "completed";

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE RARIDADE
// ═══════════════════════════════════════════════════════════

const RARITY_CONFIG = {
  common: {
    label: "Comum",
    color: "#9CA3AF",
    bgColor: "rgba(156, 163, 175, 0.15)",
    borderColor: "rgba(156, 163, 175, 0.3)",
    glow: "rgba(156, 163, 175, 0.3)",
  },
  uncommon: {
    label: "Incomum",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  rare: {
    label: "Raro",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    glow: "rgba(59, 130, 246, 0.3)",
  },
  epic: {
    label: "Épico",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    glow: "rgba(139, 92, 246, 0.3)",
  },
  legendary: {
    label: "Lendário",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    glow: "rgba(245, 158, 11, 0.4)",
  },
};

const TYPE_ICONS = {
  frame: Frame,
  badge: Shield,
  effect: Sparkles,
  background: Image,
  icon: Palette,
};

// ═══════════════════════════════════════════════════════════
// DADOS MOCK - SIMULA API
// ═══════════════════════════════════════════════════════════

const FREE_ROULETTE_ITEMS: RouletteItem[] = [
  {
    id: "f1",
    name: "Moldura Básica",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=frame1&backgroundColor=1a1a2e",
    rarity: "common",
    type: "frame",
  },
  {
    id: "f2",
    name: "Badge Iniciante",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=badge1&backgroundColor=1a1a2e",
    rarity: "common",
    type: "badge",
  },
  {
    id: "f3",
    name: "Efeito Brilho",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=effect1&backgroundColor=1a1a2e",
    rarity: "uncommon",
    type: "effect",
  },
  {
    id: "f4",
    name: "Fundo Noturno",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=bg1&backgroundColor=1a1a2e",
    rarity: "common",
    type: "background",
  },
  {
    id: "f5",
    name: "Ícone Estrela",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=icon1&backgroundColor=1a1a2e",
    rarity: "uncommon",
    type: "icon",
  },
  {
    id: "f6",
    name: "Moldura Neon",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=frame2&backgroundColor=1a1a2e",
    rarity: "rare",
    type: "frame",
  },
  {
    id: "f7",
    name: "Badge Explorer",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=badge2&backgroundColor=1a1a2e",
    rarity: "uncommon",
    type: "badge",
  },
  {
    id: "f8",
    name: "Efeito Partículas",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=effect2&backgroundColor=1a1a2e",
    rarity: "rare",
    type: "effect",
  },
];

const PREMIUM_ROULETTE_ITEMS: RouletteItem[] = [
  {
    id: "p1",
    name: "Moldura Diamante",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=pframe1&backgroundColor=2d1b4e",
    rarity: "epic",
    type: "frame",
  },
  {
    id: "p2",
    name: "Badge VIP",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=pbadge1&backgroundColor=2d1b4e",
    rarity: "legendary",
    type: "badge",
  },
  {
    id: "p3",
    name: "Efeito Aurora",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=peffect1&backgroundColor=2d1b4e",
    rarity: "epic",
    type: "effect",
  },
  {
    id: "p4",
    name: "Fundo Galaxy",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=pbg1&backgroundColor=2d1b4e",
    rarity: "rare",
    type: "background",
  },
  {
    id: "p5",
    name: "Ícone Coroa",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=picon1&backgroundColor=2d1b4e",
    rarity: "legendary",
    type: "icon",
  },
  {
    id: "p6",
    name: "Moldura Holográfica",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=pframe2&backgroundColor=2d1b4e",
    rarity: "legendary",
    type: "frame",
  },
  {
    id: "p7",
    name: "Badge Elite",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=pbadge2&backgroundColor=2d1b4e",
    rarity: "epic",
    type: "badge",
  },
  {
    id: "p8",
    name: "Efeito Nebulosa",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=peffect2&backgroundColor=2d1b4e",
    rarity: "epic",
    type: "effect",
  },
];

// Simula chamada à API
const mockApiCall = async (type: "free" | "premium"): Promise<SpinResult> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const items = type === "free" ? FREE_ROULETTE_ITEMS : PREMIUM_ROULETTE_ITEMS;
  const randomIndex = Math.floor(Math.random() * items.length);
  return { winnerId: items[randomIndex].id };
};

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

const DashboardCard = ({
  children,
  className = "",
  minHeight,
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}) => (
  <div
    className={`bg-[var(--card-background-glass,rgba(255,255,255,0.05))] backdrop-blur-xl border border-[var(--color-border,rgba(255,255,255,0.1))] rounded-2xl p-4 sm:p-5 lg:p-6 ${className}`}
    style={{ minHeight }}
  >
    {children}
  </div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-[var(--color-primary,#8B5CF6)]/10 shrink-0">
        <Icon size={20} className="text-[var(--color-primary,#8B5CF6)]" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text,#fff)] truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--color-text-muted,#9CA3AF)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {badge}
  </div>
);

// ═══════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {[
        { value: timeLeft.hours, label: "h" },
        { value: timeLeft.minutes, label: "m" },
        { value: timeLeft.seconds, label: "s" },
      ].map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg bg-[var(--color-surface,rgba(255,255,255,0.1))] text-[var(--color-text,#fff)] font-mono font-bold text-sm sm:text-base">
            {formatNumber(item.value)}
          </div>
          <span className="text-[var(--color-text-muted,#9CA3AF)] text-[10px] sm:text-xs ml-0.5">
            {item.label}
          </span>
          {index < 2 && (
            <span className="text-[var(--color-text-muted,#9CA3AF)] mx-1 text-sm">:</span>
          )}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ROULETTE ITEM COMPONENT
// ═══════════════════════════════════════════════════════════

const RouletteItemCard = ({
  item,
  isHighlighted = false,
  size = "normal",
}: {
  item: RouletteItem;
  isHighlighted?: boolean;
  size?: "small" | "normal";
}) => {
  const rarity = RARITY_CONFIG[item.rarity];
  const TypeIcon = TYPE_ICONS[item.type];
  const isSmall = size === "small";

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-500 ${
        isSmall ? "p-1.5 sm:p-2" : "p-2 sm:p-3"
      } ${isHighlighted ? "scale-105 z-10" : ""}`}
      style={{
        backgroundColor: rarity.bgColor,
        borderColor: isHighlighted ? rarity.color : rarity.borderColor,
        boxShadow: isHighlighted
          ? `0 0 30px ${rarity.glow}, 0 0 60px ${rarity.glow}`
          : `0 0 10px ${rarity.glow}`,
      }}
    >
      <div
        className={`relative aspect-square rounded-lg overflow-hidden bg-[var(--color-background,#0f0f0f)] ${
          isSmall ? "mb-1" : "mb-2"
        }`}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div
          className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 rounded-md"
          style={{ backgroundColor: rarity.bgColor }}
        >
          <TypeIcon size={isSmall ? 8 : 10} style={{ color: rarity.color }} />
        </div>
      </div>

      <p
        className={`font-medium text-[var(--color-text,#fff)] text-center truncate leading-tight ${
          isSmall ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[11px]"
        }`}
      >
        {item.name}
      </p>

      <div
        className={`mt-0.5 sm:mt-1 rounded-full text-center ${
          isSmall ? "px-1 py-0.5" : "px-1.5 py-0.5"
        }`}
        style={{ backgroundColor: `${rarity.color}20` }}
      >
        <span
          className={`font-semibold ${isSmall ? "text-[6px] sm:text-[7px]" : "text-[7px] sm:text-[9px]"}`}
          style={{ color: rarity.color }}
        >
          {rarity.label}
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ROULETTE WHEEL COMPONENT - CORRIGIDO
// ═══════════════════════════════════════════════════════════

const RouletteWheel = ({
  items,
  state,
  winnerId,
  onSpinComplete,
}: {
  items: RouletteItem[];
  state: RouletteState;
  winnerId: string | null;
  onSpinComplete: () => void;
}) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const hasInitialized = useRef(false);
  const currentPosition = useRef(0);

  // Configurações responsivas
  const ITEM_WIDTH_MOBILE = 80;
  const ITEM_WIDTH_DESKTOP = 100;
  const GAP = 8;

  const getItemWidth = useCallback(() => {
    if (typeof window === "undefined") return ITEM_WIDTH_DESKTOP;
    return window.innerWidth < 640 ? ITEM_WIDTH_MOBILE : ITEM_WIDTH_DESKTOP;
  }, []);

  const [itemWidth, setItemWidth] = useState(ITEM_WIDTH_DESKTOP);

  // Cria lista estendida de itens
  const extendedItems = useMemo(() => {
    const repetitions = 10;
    const extended: RouletteItem[] = [];
    for (let i = 0; i < repetitions; i++) {
      extended.push(...items);
    }
    return extended;
  }, [items]);

  // Posição inicial centralizada
  const getInitialPosition = useCallback(() => {
    const totalItemWidth = itemWidth + GAP;
    const startIndex = items.length * 3; // Começa no meio da lista estendida
    return -(startIndex * totalItemWidth) + containerWidth / 2 - itemWidth / 2;
  }, [containerWidth, itemWidth, items.length]);

  // Atualiza tamanhos
  useEffect(() => {
    const updateSizes = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      setItemWidth(getItemWidth());
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [getItemWidth]);

  // Define posição inicial SEM animação
  useEffect(() => {
    if (!hasInitialized.current && containerWidth > 0) {
      const initialPos = getInitialPosition();
      currentPosition.current = initialPos;
      controls.set({ x: initialPos });
      hasInitialized.current = true;
    }
  }, [containerWidth, controls, getInitialPosition]);

  // Calcula posição final para o vencedor
  const calculateFinalPosition = useCallback(
    (targetId: string) => {
      const totalItemWidth = itemWidth + GAP;
      const winnerIndex = items.findIndex((item) => item.id === targetId);
      if (winnerIndex === -1) return currentPosition.current;

      // Posição atual + várias voltas + offset até o vencedor
      const fullRotations = 5;
      const rotationDistance = items.length * fullRotations * totalItemWidth;
      
      // Calcula onde o item vencedor deve parar (no centro)
      const targetIndex = items.length * 5 + winnerIndex; // Pega uma instância no meio
      const targetPosition = -(targetIndex * totalItemWidth) + containerWidth / 2 - itemWidth / 2;
      
      return targetPosition;
    },
    [containerWidth, itemWidth, items]
  );

  // Controla a animação do spin
  useEffect(() => {
    const runAnimation = async () => {
      if (state === "spinning" && winnerId && hasInitialized.current) {
        const startPos = currentPosition.current;
        const finalPos = calculateFinalPosition(winnerId);
        
        // Calcula distância total (sempre vai para a esquerda)
        const totalItemWidth = itemWidth + GAP;
        const minDistance = items.length * 5 * totalItemWidth; // Mínimo 5 voltas
        
        // Ajusta para garantir movimento suficiente
        let adjustedFinalPos = finalPos;
        while (startPos - adjustedFinalPos < minDistance) {
          adjustedFinalPos -= items.length * totalItemWidth;
        }

        await controls.start({
          x: adjustedFinalPos,
          transition: {
            duration: 5.5,
            ease: [0.1, 0.7, 0.2, 1],
          },
        });

        currentPosition.current = adjustedFinalPos;
        onSpinComplete();
      }
    };

    runAnimation();
  }, [state, winnerId, controls, calculateFinalPosition, onSpinComplete, items.length, itemWidth]);

  // Reset para posição inicial quando volta ao idle após completed
  useEffect(() => {
    if (state === "idle" && hasInitialized.current) {
      const initialPos = getInitialPosition();
      controls.set({ x: initialPos });
      currentPosition.current = initialPos;
    }
  }, [state, controls, getInitialPosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--color-surface,rgba(255,255,255,0.03))] to-[var(--color-background,#0f0f0f)] border border-[var(--color-border,rgba(255,255,255,0.1))]"
      style={{ height: "160px" }}
    >
      {/* Gradientes laterais */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[var(--color-background,#0f0f0f)] via-[var(--color-background,#0f0f0f)]/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[var(--color-background,#0f0f0f)] via-[var(--color-background,#0f0f0f)]/90 to-transparent z-10 pointer-events-none" />

      {/* Indicador central */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[3px] z-20 transform -translate-x-1/2">
        <div className="absolute inset-0 bg-[var(--color-primary,#8B5CF6)] shadow-lg shadow-[var(--color-primary,#8B5CF6)]/50" />
        <div className="absolute -top-0 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-[var(--color-primary,#8B5CF6)]" />
        </div>
        <div className="absolute -bottom-0 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-[var(--color-primary,#8B5CF6)]" />
        </div>
      </div>

      {/* Glow quando girando */}
      {state === "spinning" && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[var(--color-primary,#8B5CF6)]/20 blur-3xl z-0 pointer-events-none animate-pulse" />
      )}

      {/* Container dos itens */}
      <div className="absolute inset-0 flex items-center">
        <motion.div
          animate={controls}
          className="flex items-center"
          style={{ gap: `${GAP}px` }}
        >
          {extendedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex-shrink-0"
              style={{ width: itemWidth }}
            >
              <RouletteItemCard item={item} size="small" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Loading overlay */}
      {state === "loading" && (
        <div className="absolute inset-0 bg-[var(--color-background,#0f0f0f)]/60 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl">
          <div className="flex items-center gap-2 text-[var(--color-text,#fff)]">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm font-medium">Preparando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// REWARD MODAL - CORRIGIDO
// ═══════════════════════════════════════════════════════════

const RewardModal = ({
  isOpen,
  item,
  onClose,
}: {
  isOpen: boolean;
  item: RouletteItem | null;
  onClose: () => void;
}) => {
  if (!item) return null;

  const rarity = RARITY_CONFIG[item.rarity];
  const TypeIcon = TYPE_ICONS[item.type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm my-auto rounded-3xl bg-[var(--card-background-glass,rgba(20,20,30,0.98))] backdrop-blur-xl border border-[var(--color-border,rgba(255,255,255,0.15))]"
            style={{
              boxShadow: `0 0 60px ${rarity.glow}, 0 0 120px ${rarity.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content wrapper com padding */}
            <div className="p-6 sm:p-8">
              {/* Sparkles decorativos */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      y: [0, -100],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    }}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${10 + (i * 7)}%`,
                      bottom: "20%",
                      backgroundColor: rarity.color,
                      boxShadow: `0 0 6px ${rarity.color}`,
                    }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.1))] hover:bg-[var(--color-surface-hover,rgba(255,255,255,0.2))] transition-colors z-10"
              >
                <X size={18} className="text-[var(--color-text-muted,#9CA3AF)]" />
              </button>

              {/* Content */}
              <div className="relative text-center">
                {/* Header */}
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-2 mb-3"
                >
                  <motion.div
                    animate={{ rotate: [-10, 10, -10] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Trophy size={22} style={{ color: rarity.color }} />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text,#fff)]">
                    Parabéns!
                  </h3>
                  <motion.div
                    animate={{ rotate: [10, -10, 10] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Trophy size={22} style={{ color: rarity.color }} />
                  </motion.div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-[var(--color-text-muted,#9CA3AF)] mb-5"
                >
                  Você ganhou um item{" "}
                  <span style={{ color: rarity.color }} className="font-semibold">
                    {rarity.label.toLowerCase()}
                  </span>
                  !
                </motion.p>

                {/* Item Display */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                  className="relative inline-block p-4 rounded-2xl border-2 mb-5"
                  style={{
                    backgroundColor: rarity.bgColor,
                    borderColor: rarity.color,
                    boxShadow: `0 0 40px ${rarity.glow}`,
                  }}
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[var(--color-background,#0f0f0f)]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at center, ${rarity.glow}, transparent 70%)`,
                      }}
                    />
                  </div>

                  <div
                    className="absolute top-2 right-2 p-1.5 rounded-lg"
                    style={{ backgroundColor: rarity.bgColor }}
                  >
                    <TypeIcon size={14} style={{ color: rarity.color }} />
                  </div>
                </motion.div>

                {/* Item name */}
                <motion.h4
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg sm:text-xl font-bold mb-2"
                  style={{ color: rarity.color }}
                >
                  {item.name}
                </motion.h4>

                {/* Rarity badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                  style={{ backgroundColor: `${rarity.color}20` }}
                >
                  <Star size={14} style={{ color: rarity.color }} />
                  <span className="text-sm font-semibold" style={{ color: rarity.color }}>
                    {rarity.label}
                  </span>
                </motion.div>

                {/* Collect button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary,#8B5CF6)] hover:bg-[var(--color-primary-dark,#7C3AED)] text-white font-semibold transition-colors shadow-lg shadow-[var(--color-primary,#8B5CF6)]/25"
                >
                  <CheckCircle size={18} />
                  Ver no inventário
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════
// FREE ROULETTE CARD
// ═══════════════════════════════════════════════════════════

const FreeRouletteCard = ({
  status,
  onSpin,
}: {
  status: UserRouletteStatus;
  onSpin: () => Promise<SpinResult>;
}) => {
  const [state, setState] = useState<RouletteState>("idle");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [wonItem, setWonItem] = useState<RouletteItem | null>(null);

  const handleSpin = async () => {
    if (!status.freeRouletteAvailable || state !== "idle") return;

    setState("loading");
    const result = await onSpin();
    setWinnerId(result.winnerId);
    setState("spinning");
  };

  const handleSpinComplete = useCallback(() => {
    setState("completed");
    const winner = FREE_ROULETTE_ITEMS.find((item) => item.id === winnerId);
    if (winner) {
      setWonItem(winner);
      setTimeout(() => setShowReward(true), 600);
    }
  }, [winnerId]);

  const handleCloseReward = () => {
    setShowReward(false);
    setTimeout(() => {
      setState("idle");
      setWinnerId(null);
      setWonItem(null);
    }, 300);
  };

  const isInteractive = status.freeRouletteAvailable && state === "idle";

  return (
    <DashboardCard minHeight="320px">
      <SectionHeader
        icon={Gift}
        title="Roleta Diária Grátis"
        subtitle="Gire uma vez a cada 24 horas"
        badge={
          status.freeRouletteAvailable ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Disponível</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface,rgba(255,255,255,0.05))] border border-[var(--color-border,rgba(255,255,255,0.1))]">
              <Clock size={12} className="text-[var(--color-text-muted,#9CA3AF)]" />
              <span className="text-xs font-medium text-[var(--color-text-muted,#9CA3AF)]">
                Em espera
              </span>
            </div>
          )
        }
      />

      <div className="mb-5">
        <RouletteWheel
          items={FREE_ROULETTE_ITEMS}
          state={state}
          winnerId={winnerId}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {status.freeRouletteAvailable ? (
          <motion.button
            whileHover={isInteractive ? { scale: 1.02 } : {}}
            whileTap={isInteractive ? { scale: 0.98 } : {}}
            onClick={handleSpin}
            disabled={!isInteractive}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
              isInteractive
                ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 cursor-pointer"
                : "bg-[var(--color-surface,rgba(255,255,255,0.1))] text-[var(--color-text-muted,#9CA3AF)] cursor-not-allowed"
            }`}
          >
            {state === "loading" ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Preparando...
              </>
            ) : state === "spinning" ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Girando...
              </>
            ) : state === "completed" ? (
              <>
                <CheckCircle size={18} />
                Concluído!
              </>
            ) : (
              <>
                <Play size={18} />
                Girar Grátis
              </>
            )}
          </motion.button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-[var(--color-text-muted,#9CA3AF)]">
              <Timer size={16} />
              <span className="text-sm">Próxima:</span>
            </div>
            {status.nextFreeRoulette && <CountdownTimer targetDate={status.nextFreeRoulette} />}
          </div>
        )}

        <div className="flex items-center justify-center sm:justify-end gap-2">
          <span className="text-xs text-[var(--color-text-muted,#9CA3AF)] hidden sm:inline">
            Itens:
          </span>
          <div className="flex -space-x-1.5">
            {FREE_ROULETTE_ITEMS.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border-2 border-[var(--color-background,#0f0f0f)]"
                style={{ backgroundColor: RARITY_CONFIG[item.rarity].bgColor }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-[var(--color-background,#0f0f0f)] bg-[var(--color-surface,rgba(255,255,255,0.1))] flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-medium text-[var(--color-text-muted,#9CA3AF)]">
                +{FREE_ROULETTE_ITEMS.length - 5}
              </span>
            </div>
          </div>
        </div>
      </div>

      <RewardModal isOpen={showReward} item={wonItem} onClose={handleCloseReward} />
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// PREMIUM ROULETTE CARD
// ═══════════════════════════════════════════════════════════

const PremiumRouletteCard = ({
  status,
  onSpin,
}: {
  status: UserRouletteStatus;
  onSpin: () => Promise<SpinResult>;
}) => {
  const [state, setState] = useState<RouletteState>("idle");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [wonItem, setWonItem] = useState<RouletteItem | null>(null);

  const canAfford = status.vcoins >= status.premiumRouletteCost;
  const isInteractive = canAfford && state === "idle";

  const handleSpin = async () => {
    if (!isInteractive) return;

    setState("loading");
    const result = await onSpin();
    setWinnerId(result.winnerId);
    setState("spinning");
  };

  const handleSpinComplete = useCallback(() => {
    setState("completed");
    const winner = PREMIUM_ROULETTE_ITEMS.find((item) => item.id === winnerId);
    if (winner) {
      setWonItem(winner);
      setTimeout(() => setShowReward(true), 600);
    }
  }, [winnerId]);

  const handleCloseReward = () => {
    setShowReward(false);
    setTimeout(() => {
      setState("idle");
      setWinnerId(null);
      setWonItem(null);
    }, 300);
  };

  return (
    <DashboardCard className="relative overflow-hidden" minHeight="400px">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />

      <div className="relative">
        <SectionHeader
          icon={Crown}
          title="Roleta Premium"
          subtitle="Itens raros e lendários"
          badge={
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30">
              <Gem size={12} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Premium</span>
            </div>
          }
        />

        <div className="relative mb-5">
          <RouletteWheel
            items={PREMIUM_ROULETTE_ITEMS}
            state={state}
            winnerId={winnerId}
            onSpinComplete={handleSpinComplete}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <motion.button
            whileHover={isInteractive ? { scale: 1.02 } : {}}
            whileTap={isInteractive ? { scale: 0.98 } : {}}
            onClick={handleSpin}
            disabled={!isInteractive}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
              isInteractive
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 cursor-pointer"
                : canAfford
                ? "bg-[var(--color-surface,rgba(255,255,255,0.1))] text-[var(--color-text-muted,#9CA3AF)] cursor-not-allowed"
                : "bg-[var(--color-surface,rgba(255,255,255,0.05))] text-[var(--color-text-muted,#6B7280)] cursor-not-allowed border border-[var(--color-border,rgba(255,255,255,0.1))]"
            }`}
          >
            {state === "loading" ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Preparando...
              </>
            ) : state === "spinning" ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Girando...
              </>
            ) : state === "completed" ? (
              <>
                <CheckCircle size={18} />
                Concluído!
              </>
            ) : canAfford ? (
              <>
                <Sparkles size={18} />
                <span>Girar por {status.premiumRouletteCost}</span>
                <Zap size={14} className="text-yellow-300" />
              </>
            ) : (
              <>
                <Lock size={18} />
                Vcoins Insuficientes
              </>
            )}
          </motion.button>

          <div className="flex items-center justify-center sm:justify-end gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.05))] border border-[var(--color-border,rgba(255,255,255,0.1))]">
              <Zap size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-[var(--color-text,#fff)]">
                {status.vcoins}
              </span>
            </div>

            <div className="hidden sm:flex -space-x-1.5">
              {PREMIUM_ROULETTE_ITEMS.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="relative w-9 h-9 rounded-lg overflow-hidden border-2 border-[var(--color-background,#0f0f0f)]"
                  style={{
                    backgroundColor: RARITY_CONFIG[item.rarity].bgColor,
                    boxShadow: `0 0 10px ${RARITY_CONFIG[item.rarity].glow}`,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--color-border,rgba(255,255,255,0.1))]">
          <p className="text-xs text-[var(--color-text-muted,#9CA3AF)] mb-3">
            Chances de raridade:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { rarity: "rare" as const, chance: "40%" },
              { rarity: "epic" as const, chance: "35%" },
              { rarity: "legendary" as const, chance: "25%" },
            ].map((item) => {
              const config = RARITY_CONFIG[item.rarity];
              return (
                <div
                  key={item.rarity}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs font-medium" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted,#9CA3AF)]">
                    {item.chance}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <RewardModal isOpen={showReward} item={wonItem} onClose={handleCloseReward} />
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// INVENTORY PREVIEW
// ═══════════════════════════════════════════════════════════

const InventoryPreview = () => {
  const recentItems = useMemo(
    () => [
      { ...FREE_ROULETTE_ITEMS[2], wonAt: "Hoje" },
      { ...FREE_ROULETTE_ITEMS[5], wonAt: "Ontem" },
      { ...PREMIUM_ROULETTE_ITEMS[1], wonAt: "3 dias atrás" },
    ],
    []
  );

  return (
    <DashboardCard minHeight="280px">
      <SectionHeader icon={Package} title="Itens Recentes" subtitle="Seus últimos itens ganhos" />

      <div className="space-y-3">
        {recentItems.map((item, index) => {
          const rarity = RARITY_CONFIG[item.rarity];
          const TypeIcon = TYPE_ICONS[item.type];

          return (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.05))] border border-[var(--color-border,rgba(255,255,255,0.1))] hover:bg-[var(--color-surface-hover,rgba(255,255,255,0.08))] transition-colors"
            >
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0"
                style={{
                  backgroundColor: rarity.bgColor,
                  boxShadow: `0 0 15px ${rarity.glow}`,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text,#fff)] truncate">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: rarity.bgColor }}
                  >
                    <TypeIcon size={10} style={{ color: rarity.color }} />
                    <span className="text-[10px] font-medium" style={{ color: rarity.color }}>
                      {rarity.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-[var(--color-text-muted,#9CA3AF)]">{item.wonAt}</p>
              </div>
            </div>
          );
        })}
      </div>

      <a
        href="/dashboard/inventory"
        className="flex items-center justify-center gap-2 mt-4 py-2 text-sm text-[var(--color-primary,#8B5CF6)] font-medium hover:text-[var(--color-primary-dark,#7C3AED)] transition-colors"
      >
        Ver todos os itens
        <ChevronRight size={16} />
      </a>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// ROULETTE STATS
// ═══════════════════════════════════════════════════════════

const RouletteStats = () => {
  const stats = useMemo(
    () => [
      { label: "Giros Totais", value: 12, icon: RefreshCw, color: "#8B5CF6" },
      { label: "Itens Ganhos", value: 12, icon: Package, color: "#3B82F6" },
      { label: "Lendários", value: 1, icon: Crown, color: "#F59E0B" },
      { label: "Épicos", value: 3, icon: Gem, color: "#8B5CF6" },
    ],
    []
  );

  return (
    <DashboardCard minHeight="200px">
      <SectionHeader icon={Trophy} title="Suas Estatísticas" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-3 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.05))] border border-[var(--color-border,rgba(255,255,255,0.1))]"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <Icon size={16} style={{ color: stat.color }} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-[var(--color-text,#fff)]">
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-xs text-[var(--color-text-muted,#9CA3AF)] truncate">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const DashboardRoulette = () => {
  const [userStatus] = useState<UserRouletteStatus>({
    freeRouletteAvailable: true,
    lastFreeRoulette: new Date(Date.now() - 1000 * 60 * 60 * 25),
    nextFreeRoulette: new Date(Date.now() + 1000 * 60 * 60 * 12),
    vcoins: 150,
    premiumRouletteCost: 50,
  });

  const handleFreeRoulette = useCallback(async () => {
    return await mockApiCall("free");
  }, []);

  const handlePremiumRoulette = useCallback(async () => {
    return await mockApiCall("premium");
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background,#0f0f0f)] pb-8 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 pt-6" style={{ minHeight: "100px" }}>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-text-muted,#9CA3AF)] mb-4">
          <span>Dashboard</span>
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-[var(--color-text,#fff)]">Roleta</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text,#fff)] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--color-primary,#8B5CF6)]/10 shrink-0">
                <Gift className="text-[var(--color-primary,#8B5CF6)] w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              Roleta de Itens
            </h1>
            <p className="text-sm text-[var(--color-text-muted,#9CA3AF)] mt-2 max-w-xl">
              Gire a roleta e ganhe itens exclusivos para personalizar seu perfil!
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.05))] border border-[var(--color-border,rgba(255,255,255,0.1))] shrink-0">
            <Zap size={18} className="text-amber-400" />
            <span className="text-lg font-bold text-[var(--color-text,#fff)]">
              {userStatus.vcoins}
            </span>
            <span className="text-sm text-[var(--color-text-muted,#9CA3AF)]">Vcoins</span>
          </div>
        </div>
      </div>

      {/* Roulettes */}
      <div className="space-y-6">
        <FreeRouletteCard status={userStatus} onSpin={handleFreeRoulette} />
        <PremiumRouletteCard status={userStatus} onSpin={handlePremiumRoulette} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RouletteStats />
          <InventoryPreview />
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-6 p-4 sm:p-5 rounded-2xl bg-[var(--card-background-glass,rgba(255,255,255,0.05))] backdrop-blur-xl border border-[var(--color-border,rgba(255,255,255,0.1))]"
        style={{ minHeight: "72px" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wand2 size={18} className="text-[var(--color-primary,#8B5CF6)] shrink-0" />
            <span className="text-sm text-[var(--color-text-muted,#9CA3AF)]">
              Os itens ganhos são automaticamente adicionados ao seu inventário
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[var(--color-text-muted,#9CA3AF)]">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span>Drops garantidos</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Itens exclusivos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRoulette;