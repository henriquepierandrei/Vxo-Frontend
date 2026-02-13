// Ranking.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useInView } from 'framer-motion';
import {
  Eye,
  Coins,
  Clock,
  Trophy,
  Medal,
  Award,
  Sparkles,
  Crown,
  Search,
  ChevronDown,
  Star,
  ArrowUp,
  Users,
  Calendar,
  Hash,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface User {
  id: string;
  username: string;
  avatar: string;
  views: number;
  coins: number;
  joinedDate: Date;
  badge?: 'verified' | 'premium' | 'og';
  isOnline?: boolean;
}

type FilterType = 'views' | 'coins' | 'oldest';

interface FilterOption {
  id: FilterType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ═══════════════════════════════════════════════════════════
// ANIMATED COUNTER COMPONENT
// ═══════════════════════════════════════════════════════════

const AnimatedCounter = ({
  value,
  duration = 1.5,
  className = ""
}: {
  value: number;
  duration?: number;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);

  return <span ref={ref} className={className}>{displayValue.toLocaleString()}</span>;
};

// ═══════════════════════════════════════════════════════════
// SKELETON LOADER
// ═══════════════════════════════════════════════════════════

const SkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="relative p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-border)] animate-pulse" />
      <div className="w-14 h-14 rounded-full bg-[var(--color-border)] animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 rounded-lg bg-[var(--color-border)] animate-pulse" />
        <div className="h-4 w-24 rounded-lg bg-[var(--color-border)] animate-pulse" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-6 w-20 rounded-lg bg-[var(--color-border)] animate-pulse ml-auto" />
        <div className="h-4 w-16 rounded-lg bg-[var(--color-border)] animate-pulse ml-auto" />
      </div>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════
// FILTER PILL COMPONENT
// ═══════════════════════════════════════════════════════════

const FilterPill = ({
  filter,
  isActive,
  onClick
}: {
  filter: FilterOption;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="relative group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`
          relative flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl
          font-semibold text-sm sm:text-base transition-all duration-300
          ${isActive
            ? 'text-white'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }
        `}
        style={{
          backgroundColor: isActive ? 'transparent' : 'var(--color-surface)',
          border: `2px solid ${isActive ? 'transparent' : 'var(--color-border)'}`,
        }}
      >
        {/* Active Background Gradient */}
        {isActive && (
          <motion.div
            layoutId="activeFilterBg"
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Glow Effect */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        )}

        {/* Content */}
        <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          {filter.icon}
        </span>
        <span className="relative z-10 whitespace-nowrap">{filter.label}</span>
      </motion.div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
        <div className="px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl">
          <p className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
            {filter.description}
          </p>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-[var(--color-background)] border-r border-b border-[var(--color-border)]" />
      </div>
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════
// PODIUM CARD COMPONENT - CORRIGIDO
// ═══════════════════════════════════════════════════════════

const PodiumCard = ({
  user,
  position,
  filter,
  formatNumber,
  formatDate
}: {
  user: User;
  position: 1 | 2 | 3;
  filter: FilterType;
  formatNumber: (n: number) => string;
  formatDate: (d: Date) => string;
}) => {
  const colors = {
    1: {
      gradient: 'from-amber-400 via-yellow-500 to-orange-500',
      glow: 'rgba(251, 191, 36, 0.4)',
      bg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10',
      text: 'text-amber-400',
      icon: <Crown className="w-5 h-5" />,
    },
    2: {
      gradient: 'from-slate-300 via-gray-400 to-slate-500',
      glow: 'rgba(148, 163, 184, 0.4)',
      bg: 'bg-gradient-to-br from-slate-400/20 to-gray-500/10',
      text: 'text-slate-300',
      icon: <Medal className="w-5 h-5" />,
    },
    3: {
      gradient: 'from-amber-600 via-orange-700 to-amber-800',
      glow: 'rgba(180, 83, 9, 0.4)',
      bg: 'bg-gradient-to-br from-amber-600/20 to-orange-700/10',
      text: 'text-amber-600',
      icon: <Award className="w-5 h-5" />,
    },
  };

  const style = colors[position];

  // Margin top para criar efeito de pódio (2º e 3º lugar mais baixos)
  const marginTop = { 1: 'mt-0', 2: 'mt-12', 3: 'mt-16' };

  const getStatValue = () => {
    switch (filter) {
      case 'views': return formatNumber(user.views);
      case 'coins': return formatNumber(user.coins);
      case 'oldest': return formatDate(user.joinedDate);
    }
  };

  const getStatLabel = () => {
    switch (filter) {
      case 'views': return 'views';
      case 'coins': return 'vcoins';
      case 'oldest': return 'membro desde';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: position === 1 ? 0.2 : position === 2 ? 0 : 0.4,
        type: "spring",
        stiffness: 100
      }}
      className={`relative ${marginTop[position]} ${position === 1 ? 'z-20' : 'z-10'}`}
    >
      <motion.div
        className={`
          relative rounded-3xl p-6
          border border-[var(--color-border)]
          ${style.bg}
          transition-all duration-500 cursor-pointer group
        `}
        whileHover={{
          scale: 1.03,
          y: -8,
          boxShadow: `0 20px 60px ${style.glow}`
        }}
        style={{
          boxShadow: `0 10px 40px ${style.glow}`,
        }}
      >
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 rounded-3xl p-[1px] overflow-hidden pointer-events-none">
          <motion.div
            className={`absolute inset-[-200%] bg-gradient-to-r ${style.gradient}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ opacity: 0.5 }}
          />
          <div className="absolute inset-[1px] rounded-3xl bg-[var(--color-background)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Position Badge - Agora dentro do card, não absoluto */}
          <motion.div
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full mb-4
              bg-gradient-to-r ${style.gradient}
              shadow-lg
            `}
            animate={{
              y: [0, -4, 0],
              boxShadow: [
                `0 4px 20px ${style.glow}`,
                `0 8px 30px ${style.glow}`,
                `0 4px 20px ${style.glow}`,
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {style.icon}
            <span className="font-bold text-white text-sm">#{position}</span>
          </motion.div>

          {/* Avatar */}
          <motion.div
            className="relative mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {/* Avatar Glow */}
            <div
              className={`absolute inset-0 rounded-full blur-xl opacity-60 bg-gradient-to-r ${style.gradient}`}
              style={{ transform: 'scale(1.3)' }}
            />

            {/* Avatar Ring */}
            <div className={`
              relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1
              bg-gradient-to-r ${style.gradient}
            `}>
              <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-background)]">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Online Indicator */}
            {user.isOnline && (
              <motion.div
                className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[var(--color-background)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Badge */}
            {user.badge && (
              <motion.div
                className="absolute -top-1 -right-1"
                whileHover={{ scale: 1.2 }}
              >
                {user.badge === 'premium' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                {user.badge === 'verified' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <Star className="w-3.5 h-3.5 text-white fill-current" />
                  </div>
                )}
                {user.badge === 'og' && (
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Username */}
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] text-center truncate max-w-full mb-3">
            {user.username}
          </h3>

          {/* Stats */}
          <motion.div
            className={`
              flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl w-full
              ${style.bg} border border-[var(--color-border)]
            `}
            whileHover={{ scale: 1.05 }}
          >
            <span className={`text-xl sm:text-2xl font-bold ${style.text}`}>
              {getStatValue()}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {getStatLabel()}
            </span>
          </motion.div>
        </div>

        {/* Shine Effect on Hover */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden"
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, transparent 50%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// RANKING CARD COMPONENT
// ═══════════════════════════════════════════════════════════

const RankingCard = ({
  user,
  position,
  filter,
  formatNumber,
  formatDate,
  index
}: {
  user: User;
  position: number;
  filter: FilterType;
  formatNumber: (n: number) => string;
  formatDate: (d: Date) => string;
  index: number;
}) => {
  const isTopTen = position <= 10;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const getStatValue = () => {
    switch (filter) {
      case 'views': return formatNumber(user.views);
      case 'coins': return formatNumber(user.coins);
      case 'oldest': return formatDate(user.joinedDate);
    }
  };

  const getStatIcon = () => {
    switch (filter) {
      case 'views': return <Eye className="w-4 h-4" />;
      case 'coins': return <Coins className="w-4 h-4" />;
      case 'oldest': return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatLabel = () => {
    switch (filter) {
      case 'views': return 'visualizações';
      case 'coins': return 'vcoins';
      case 'oldest': return 'membro desde';
    }
  };

  const getPositionColor = () => {
    if (position <= 3) return 'var(--color-primary)';
    if (position <= 10) return 'var(--color-secondary)';
    return 'var(--color-text-muted)';
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.3) }}
      className="group"
    >
      <motion.div
        className={`
          relative p-4 sm:p-5 rounded-2xl border
          transition-all duration-300 cursor-pointer
          ${isTopTen
            ? 'border-[var(--color-primary)]/30 bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }
        `}
        whileHover={{
          scale: 1.01,
          y: -4,
          boxShadow: '0 10px 40px rgba(143, 124, 255, 0.15)',
          borderColor: 'var(--color-primary)',
        }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Hover Gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(143,124,255,0.05), rgba(255,107,157,0.05))',
          }}
        />

        {/* Progress Bar for Top 10 */} {isTopTen && (<motion.div className="absolute bottom-0 left-2 h-0.5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" initial={{ width: 0 }} animate={isInView ? { width: `${98 - (position - 1) * 10}%` } : {}} transition={{ duration: 1, delay: 0.5 }} />)}

        <div className="relative flex items-center gap-3 sm:gap-5">
          {/* Position */}
          <motion.div
            className={`
              relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 
              flex items-center justify-center
              rounded-xl font-bold text-lg
              border-2 transition-all duration-300
            `}
            style={{
              borderColor: getPositionColor(),
              color: getPositionColor(),
              backgroundColor: `${getPositionColor()}15`,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {position <= 3 ? (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {position === 1 && <Trophy className="w-6 h-6" />}
                {position === 2 && <Medal className="w-6 h-6" />}
                {position === 3 && <Award className="w-6 h-6" />}
              </motion.div>
            ) : (
              <span className="flex items-center">
                <Hash className="w-3 h-3 opacity-50" />
                {position}
              </span>
            )}

            {/* Glow for top positions */}
            {position <= 3 && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  boxShadow: `0 0 20px ${getPositionColor()}66`,
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Avatar */}
          <motion.div
            className="relative flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            <div className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden
              ring-2 transition-all duration-300
              ${isTopTen ? 'ring-[var(--color-primary)]/50' : 'ring-[var(--color-border)]'}
            `}>
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            {/* Online Indicator */}
            {user.isOnline && (
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--color-background)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Badge */}
            {user.badge && (
              <div className="absolute -top-1 -right-1">
                {user.badge === 'premium' && (
                  <motion.div
                    className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Crown className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                {user.badge === 'verified' && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
                {user.badge === 'og' && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-text)] truncate">
                {user.username}
              </h3>
              {isTopTen && (
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                </motion.div>
              )}
            </div>

            {/* Secondary Stats */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-text-muted)]">
              {filter !== 'coins' && (
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {formatNumber(user.coins)}
                </span>
              )}
              {filter !== 'views' && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatNumber(user.views)}
                </span>
              )}
              {filter !== 'oldest' && (
                <span className="hidden sm:flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(user.joinedDate)}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex-shrink-0 text-right">
            <motion.div
              className={`
                flex items-center justify-end gap-2 mb-1 
                text-lg sm:text-xl font-bold
              `}
              style={{ color: isTopTen ? 'var(--color-primary)' : 'var(--color-text)' }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="hidden sm:block opacity-50">
                {getStatIcon()}
              </span>
              <span>{getStatValue()}</span>
            </motion.div>

            <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-end gap-1">
              {getStatLabel()}

              {position > 1 && (
                <motion.span
                  className="text-green-500 flex items-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ArrowUp className="w-3 h-3" />
                </motion.span>
              )}
            </p>
          </div>

          {/* Actions */}
          <motion.div
            className="hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={{ x: 10 }}
            whileHover={{ x: 0 }}
          >
            <motion.button
              className="p-2 rounded-lg bg-[var(--color-surface-elevated)] hover:bg-[var(--color-primary)] text-[var(--color-text-muted)] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// SEARCH BAR COMPONENT
// ═══════════════════════════════════════════════════════════

const SearchBar = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-2xl
        border transition-all duration-300
        ${isFocused
          ? 'border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20'
          : 'border-[var(--color-border)]'
        }
        bg-[var(--color-surface)]
      `}
      animate={{
        scale: isFocused ? 1.01 : 1,
      }}
    >
      <Search className={`
        w-5 h-5 transition-colors duration-300
        ${isFocused ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
      `} />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Buscar usuário..."
        className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none"
      />

      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => onChange('')}
            className="p-1 rounded-full hover:bg-[var(--color-border)] transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] rotate-45" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// PAGINATION COMPONENT
// ═══════════════════════════════════════════════════════════

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pages = useMemo(() => {
    const result: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) result.push(i);

      if (currentPage < totalPages - 2) result.push('...');
      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2">
      <motion.button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          p-2 rounded-xl border transition-all duration-300
          ${currentPage === 1
            ? 'opacity-50 cursor-not-allowed border-[var(--color-border)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
          }
        `}
        whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
        whileTap={currentPage !== 1 ? { scale: 0.9 } : {}}
      >
        <ChevronLeft className="w-5 h-5 text-[var(--color-text)]" />
      </motion.button>

      <div className="flex items-center gap-1">
        {pages.map((page, idx) => (
          <motion.button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`
              min-w-10 h-10 rounded-xl font-medium text-sm transition-all duration-300
              ${page === currentPage
                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                : page === '...'
                  ? 'cursor-default text-[var(--color-text-muted)]'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
              }
            `}
            whileHover={page !== currentPage && page !== '...' ? { scale: 1.1 } : {}}
            whileTap={page !== currentPage && page !== '...' ? { scale: 0.9 } : {}}
          >
            {page}
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          p-2 rounded-xl border transition-all duration-300
          ${currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed border-[var(--color-border)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
          }
        `}
        whileHover={currentPage !== totalPages ? { scale: 1.1 } : {}}
        whileTap={currentPage !== totalPages ? { scale: 0.9 } : {}}
      >
        <ChevronRight className="w-5 h-5 text-[var(--color-text)]" />
      </motion.button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════

const generateMockUsers = (): User[] => {
  const users: User[] = [];
  const names = [
    'ShadowGamer', 'NeonKnight', 'CyberMage', 'PixelHunter', 'DarkPhoenix',
    'StormBreaker', 'MysticWarrior', 'CrystalDragon', 'VoidWalker', 'StarChaser',
    'ThunderBolt', 'FrostByte', 'BlazeFury', 'EchoNinja', 'LunarEclipse',
    'SolarFlare', 'CosmicRider', 'QuantumLeap', 'NeonSamurai', 'VaporWave',
    'IcePhantom', 'FireStorm', 'NightHawk', 'GhostRider', 'SilverArrow'
  ];
  const badges: (User['badge'] | undefined)[] = ['verified', 'premium', 'og', undefined, undefined, undefined];

  for (let i = 0; i < 100; i++) {
    users.push({
      id: `user-${i}`,
      username: `${names[i % names.length]}${i > 24 ? i : ''}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      views: Math.floor(Math.random() * 1000000) + 1000,
      coins: Math.floor(Math.random() * 50000) + 100,
      joinedDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      badge: badges[Math.floor(Math.random() * badges.length)],
      isOnline: Math.random() > 0.7,
    });
  }
  return users;
};

// ═══════════════════════════════════════════════════════════
// MAIN RANKING COMPONENT
// ═══════════════════════════════════════════════════════════

const Ranking: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('views');
  const [users] = useState<User[]>(generateMockUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 20;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const filters: FilterOption[] = [
    { id: 'views', label: 'Mais Views', icon: <Eye className="w-4 h-4" />, description: 'Ordenar por visualizações' },
    { id: 'coins', label: 'Mais Moedas', icon: <Coins className="w-4 h-4" />, description: 'Ordenar por vcoins' },
    { id: 'oldest', label: 'Veteranos', icon: <Clock className="w-4 h-4" />, description: 'Membros mais antigos' },
  ];

  const sortedAndFilteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (searchQuery) {
      result = result.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (activeFilter) {
      case 'views':
        return result.sort((a, b) => b.views - a.views);
      case 'coins':
        return result.sort((a, b) => b.coins - a.coins);
      case 'oldest':
        return result.sort((a, b) => a.joinedDate.getTime() - b.joinedDate.getTime());
      default:
        return result;
    }
  }, [users, activeFilter, searchQuery]);

  const totalPages = Math.ceil(sortedAndFilteredUsers.length / itemsPerPage);
  const paginatedUsers = sortedAndFilteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const topThree = sortedAndFilteredUsers.slice(0, 3);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[128px]"
          style={{ backgroundColor: 'var(--color-primary)' }}
          animate={{
            opacity: [0.1, 0.15, 0.1],
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[128px]"
          style={{ backgroundColor: 'var(--color-secondary)' }}
          animate={{
            opacity: [0.1, 0.15, 0.1],
            scale: [1.1, 1, 1.1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ backgroundColor: 'var(--color-primary-dark)' }}
          animate={{
            opacity: [0.05, 0.08, 0.05],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              </motion.div>
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                Ranking Global
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary-dark)] bg-[length:200%_auto] animate-gradient">
                Top 100 Usuários
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[var(--color-text-muted)] text-base sm:text-lg max-w-2xl mx-auto"
            >
              Confira os melhores jogadores da plataforma e conquiste seu lugar no topo
            </motion.p>

            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8"
            >
              {[
                { icon: <Users className="w-5 h-5" />, label: 'Usuários', value: users.length },
                { icon: <Eye className="w-5 h-5" />, label: 'Total Views', value: users.reduce((acc, u) => acc + u.views, 0) },
                { icon: <Coins className="w-5 h-5" />, label: 'Total Coins', value: users.reduce((acc, u) => acc + u.coins, 0) },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]"
                >
                  <div className="text-[var(--color-primary)]">{stat.icon}</div>
                  <div className="text-left">
                    <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                    <p className="text-base sm:text-lg font-bold text-[var(--color-text)]">
                      <AnimatedCounter value={stat.value} />
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 space-y-4"
          >
            {/* Search */}
            <div className="max-w-md mx-auto">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Filters */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-3 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
                {filters.map((filter) => (
                  <FilterPill
                    key={filter.id}
                    filter={filter}
                    isActive={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Podium - Desktop - CORRIGIDO */}
                {currentPage === 1 && !searchQuery && topThree.length === 3 && (
                  <div className="mb-12 hidden lg:flex justify-center items-start gap-6 max-w-4xl mx-auto pt-4">
                    {/* 2nd Place */}
                    <div className="flex-1 max-w-[280px]">
                      <PodiumCard
                        user={topThree[1]}
                        position={2}
                        filter={activeFilter}
                        formatNumber={formatNumber}
                        formatDate={formatDate}
                      />
                    </div>
                    {/* 1st Place */}
                    <div className="flex-1 max-w-[280px]">
                      <PodiumCard
                        user={topThree[0]}
                        position={1}
                        filter={activeFilter}
                        formatNumber={formatNumber}
                        formatDate={formatDate}
                      />
                    </div>
                    {/* 3rd Place */}
                    <div className="flex-1 max-w-[280px]">
                      <PodiumCard
                        user={topThree[2]}
                        position={3}
                        filter={activeFilter}
                        formatNumber={formatNumber}
                        formatDate={formatDate}
                      />
                    </div>
                  </div>
                )}

                {/* Ranking List */}
                <div className="space-y-3">
                  {paginatedUsers.map((user, index) => {
                    const globalPosition = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <RankingCard
                        key={user.id}
                        user={user}
                        position={globalPosition}
                        filter={activeFilter}
                        formatNumber={formatNumber}
                        formatDate={formatDate}
                        index={index}
                      />
                    );
                  })}
                </div>

                {/* Empty State */}
                {paginatedUsers.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                      <Search className="w-8 h-8 text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                      Nenhum usuário encontrado
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                      Tente buscar por outro nome
                    </p>
                  </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10"
                  >
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-sm text-[var(--color-text-muted)]">
                Atualizado em tempo real •
                <span className="text-[var(--color-text)] font-semibold ml-1">
                  {sortedAndFilteredUsers.length}
                </span> usuários
              </p>
              <motion.button
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="w-4 h-4 text-[var(--color-text-muted)]" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Ranking;