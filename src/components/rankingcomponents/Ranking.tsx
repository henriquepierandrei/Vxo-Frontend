// src/pages/Ranking.tsx

import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Coins,
  Clock,
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Star,
  X,
} from 'lucide-react';
import { useRanking } from '../../hooks/useRanking';
import type {
  RankingType,
  UserViewsRanking,
  UserCoinsRanking,
  UserVeteranRanking,
} from '../../types/ranking.types';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const PAGE_SIZE = 20;
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

const FILTERS: { id: RankingType; label: string; icon: React.ReactNode }[] = [
  { id: 'views', label: 'Views', icon: <Eye className="w-4 h-4" /> },
  { id: 'coins', label: 'Moedas', icon: <Coins className="w-4 h-4" /> },
  { id: 'veterans', label: 'Veteranos', icon: <Clock className="w-4 h-4" /> },
];

const PODIUM = {
  1: { gradient: 'from-amber-300 to-orange-500', rgb: '251, 191, 36', Icon: Crown },
  2: { gradient: 'from-slate-300 to-slate-500', rgb: '148, 163, 184', Icon: Medal },
  3: { gradient: 'from-amber-600 to-amber-800', rgb: '217, 119, 6', Icon: Award },
} as const;

type PodiumPos = keyof typeof PODIUM;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const fmt = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString('pt-BR');
};

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: 'short' }).format(new Date(d));

type AnyUser = UserViewsRanking | UserCoinsRanking | UserVeteranRanking;

const statValue = (u: AnyUser, t: RankingType) => {
  if (t === 'views' && 'views' in u) return fmt(u.views);
  if (t === 'coins' && 'coins' in u) return fmt(u.coins);
  if (t === 'veterans' && 'createdAt' in u) return fmtDate(u.createdAt);
  return '-';
};

const statLabel = (t: RankingType) =>
  t === 'views' ? 'views' : t === 'coins' ? 'vcoins' : 'desde';

const badgeStyle = (pos: number): React.CSSProperties => {
  if (pos === 1)
    return {
      color: 'rgb(251,191,36)',
      backgroundColor: 'rgba(251,191,36,0.12)',
      borderColor: 'rgba(251,191,36,0.35)',
    };
  if (pos === 2)
    return {
      color: 'rgb(148,163,184)',
      backgroundColor: 'rgba(148,163,184,0.12)',
      borderColor: 'rgba(148,163,184,0.35)',
    };
  if (pos === 3)
    return {
      color: 'rgb(217,119,6)',
      backgroundColor: 'rgba(217,119,6,0.12)',
      borderColor: 'rgba(217,119,6,0.35)',
    };
  return {
    color: 'var(--color-text-muted)',
    backgroundColor: 'transparent',
    borderColor: 'var(--color-border)',
  };
};

// ═══════════════════════════════════════════════════════════
// SKELETONS
// ═══════════════════════════════════════════════════════════

const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded ${className}`} style={{ backgroundColor: 'var(--color-border)' }} />
);

const SkeletonPodium = () => (
  <div className="flex justify-center items-end gap-3 sm:gap-6 py-8 mb-4">
    {[
      { mt: 'mt-8', sz: 'w-14 h-14 sm:w-16 sm:h-16', bar: 48 },
      { mt: 'mt-0', sz: 'w-16 h-16 sm:w-20 sm:h-20', bar: 72 },
      { mt: 'mt-10', sz: 'w-14 h-14 sm:w-16 sm:h-16', bar: 36 },
    ].map((it, i) => (
      <div key={i} className={`flex flex-col items-center gap-2.5 w-24 sm:w-28 ${it.mt}`}>
        <Shimmer className="w-14 h-6 !rounded-full" />
        <Shimmer className={`${it.sz} !rounded-full`} />
        <Shimmer className="w-16 h-3.5" />
        <Shimmer className="w-12 h-3" />
        <Shimmer className="w-full !rounded-t-lg mt-1" />
      </div>
    ))}
  </div>
);

const SkeletonRow = ({ i }: { i: number }) => (
  <div
    className="flex items-center gap-3 p-3 rounded-xl border"
    style={{
      borderColor: 'var(--color-border)',
      backgroundColor: 'var(--color-surface)',
      animationDelay: `${i * 40}ms`,
    }}
  >
    <Shimmer className="w-8 h-8 !rounded-lg flex-shrink-0" />
    <Shimmer className="w-10 h-10 !rounded-full flex-shrink-0" />
    <Shimmer className="h-4 flex-1 max-w-[10rem]" />
    <Shimmer className="h-4 w-16 ml-auto flex-shrink-0" />
  </div>
);

const SkeletonList = ({ count, podium }: { count: number; podium: boolean }) => (
  <div className="space-y-2">
    {podium && <SkeletonPodium />}
    {Array.from({ length: count }, (_, i) => (
      <SkeletonRow key={i} i={i} />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════
// FILTER TABS
// ═══════════════════════════════════════════════════════════

const FilterTabs = ({
  active,
  onChange,
}: {
  active: RankingType;
  onChange: (t: RankingType) => void;
}) => (
  <div
    className="inline-flex p-1 rounded-2xl"
    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
  >
    {FILTERS.map((f) => {
      const on = active === f.id;
      return (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`
            relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
            transition-colors duration-200 select-none
            ${on ? 'text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}
          `}
        >
          {on && (
            <motion.div
              layoutId="rankTab"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
              style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {f.icon}
            <span className="hidden sm:inline">{f.label}</span>
          </span>
        </button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════
// PODIUM
// ═══════════════════════════════════════════════════════════

const PODIUM_ORDER: { idx: number; pos: PodiumPos }[] = [
  { idx: 1, pos: 2 },
  { idx: 0, pos: 1 },
  { idx: 2, pos: 3 },
];

const PodiumSection = ({ users, type }: { users: AnyUser[]; type: RankingType }) => {
  if (users.length < 3) return null;

  return (
    <div className="relative py-8 mb-6">
      {/* glow */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div
          className="w-72 h-36 rounded-full blur-[100px]"
          style={{ backgroundColor: 'var(--color-primary)', opacity: 0.08 }}
        />
      </div>

      <div className="relative flex justify-center items-end gap-2 sm:gap-4">
        {PODIUM_ORDER.map(({ idx, pos }) => {
          const user = users[idx];
          const cfg = PODIUM[pos];
          const isFirst = pos === 1;
          const avatarCls = isFirst
            ? 'w-[72px] h-[72px] sm:w-[88px] sm:h-[88px]'
            : 'w-[56px] h-[56px] sm:w-[64px] sm:h-[64px]';
          const offset = pos === 1 ? 'mt-0' : pos === 2 ? 'mt-6 sm:mt-8' : 'mt-8 sm:mt-10';
          const pedestalH = pos === 1 ? 72 : pos === 2 ? 48 : 36;

          return (
            <motion.a
              key={pos}
              href={`/${user.slug}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: pos === 1 ? 0.15 : pos === 2 ? 0.05 : 0.25,
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
              className={`flex flex-col items-center ${offset} w-24 sm:w-28 no-underline cursor-pointer group`}
            >
              {/* badge */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full mb-3 text-xs font-bold text-white bg-gradient-to-r ${cfg.gradient}`}
                style={{ boxShadow: `0 4px 12px rgba(${cfg.rgb}, 0.35)` }}
              >
                <cfg.Icon className="w-3 h-3" />
                <span>#{pos}</span>
              </div>

              {/* avatar */}
              <div
                className={`relative ${avatarCls} rounded-full p-[3px] bg-gradient-to-br ${cfg.gradient} transition-transform duration-300 group-hover:scale-105`}
                style={{ boxShadow: `0 8px 24px rgba(${cfg.rgb}, 0.3)` }}
              >
                <img
                  src={user.profileImageUrl || DEFAULT_AVATAR}
                  alt={user.slug}
                  className="w-full h-full rounded-full object-cover"
                  style={{ backgroundColor: 'var(--color-background)' }}
                  loading="lazy"
                />
                {isFirst && (
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center"
                    style={{ boxShadow: '0 2px 8px rgba(251,191,36,0.5)' }}
                  >
                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* name */}
              <p className="mt-2.5 text-sm font-semibold text-[var(--color-text)] truncate max-w-full text-center group-hover:text-[var(--color-primary)] transition-colors">
                {user.slug}
              </p>

              {/* stat */}
              <p className={`text-xs font-semibold bg-clip-text text-transparent bg-gradient-to-r ${cfg.gradient} mt-0.5`}>
                {statValue(user, type)} {statLabel(type)}
              </p>

              {/* pedestal */}
              <div
                className="w-full rounded-t-xl mt-3"
                style={{
                  height: pedestalH,
                  background: `linear-gradient(to top, rgba(${cfg.rgb},0.04), rgba(${cfg.rgb},0.15))`,
                  borderTop: `2px solid rgba(${cfg.rgb},0.3)`,
                  borderLeft: `1px solid rgba(${cfg.rgb},0.1)`,
                  borderRight: `1px solid rgba(${cfg.rgb},0.1)`,
                }}
              />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// RANKING ROW
// ═══════════════════════════════════════════════════════════

const RankingRow = React.memo(
  ({
    user,
    position,
    type,
    index,
  }: {
    user: AnyUser;
    position: number;
    type: RankingType;
    index: number;
  }) => {
    const isTop3 = position <= 3;
    const isTop10 = position <= 10;
    const Icon = isTop3 ? (PODIUM[position as PodiumPos]?.Icon ?? null) : null;

    return (
      <motion.a
        href={`/${user.slug}`}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.3 }}
        className={`
          group flex items-center gap-3 p-3 rounded-xl no-underline
          border transition-all duration-200 cursor-pointer
          border-[var(--color-border)] bg-[var(--color-surface)]
          hover:border-[var(--color-primary)] hover:translate-x-1
        `}
        style={{
          boxShadow: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 16px rgba(99,102,241,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* position */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border flex-shrink-0"
          style={badgeStyle(position)}
        >
          {Icon ? <Icon className="w-3.5 h-3.5" /> : position}
        </div>

        {/* avatar */}
        <img
          src={user.profileImageUrl || DEFAULT_AVATAR}
          alt={user.slug}
          loading="lazy"
          className={`
            w-10 h-10 rounded-full object-cover flex-shrink-0
            ring-2 transition-all duration-200
            group-hover:ring-[var(--color-primary)]
            ${isTop10 ? 'ring-[var(--color-primary)]' : 'ring-[var(--color-border)]'}
          `}
        />

        {/* name */}
        <span className="flex-1 min-w-0 font-medium text-sm text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors duration-200">
          {user.slug}
        </span>

        {/* stat */}
        <div className="flex items-baseline gap-1.5 flex-shrink-0">
          <span
            className="font-bold text-sm tabular-nums"
            style={{ color: isTop10 ? 'var(--color-primary)' : 'var(--color-text)' }}
          >
            {statValue(user, type)}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:inline">
            {statLabel(type)}
          </span>
        </div>

        {/* arrow */}
        <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </motion.a>
    );
  }
);
RankingRow.displayName = 'RankingRow';

// ═══════════════════════════════════════════════════════════
// ERROR & EMPTY
// ═══════════════════════════════════════════════════════════

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
      }}
    >
      <AlertCircle className="w-8 h-8" style={{ color: 'rgb(248,113,113)' }} />
    </div>
    <p className="text-[var(--color-text)] font-semibold text-lg mb-1">Erro ao carregar ranking</p>
    <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-sm">{error}</p>
    <button
      onClick={onRetry}
      className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 active:scale-[0.98] transition-all"
      style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}
    >
      Tentar novamente
    </button>
  </motion.div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center py-16">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <Search className="w-8 h-8 text-[var(--color-text-muted)]" />
    </div>
    <p className="text-[var(--color-text)] font-medium mb-1">Nenhum resultado</p>
    <p className="text-sm text-[var(--color-text-muted)]">Tente buscar por outro nome</p>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════

const Pagination = ({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) => {
  const pages = useMemo(() => {
    const r: (number | '...')[] = [];
    if (total <= 7) {
      for (let i = 0; i < total; i++) r.push(i);
    } else {
      r.push(0);
      if (current > 2) r.push('...');
      for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) r.push(i);
      if (current < total - 3) r.push('...');
      r.push(total - 1);
    }
    return r;
  }, [current, total]);

  if (total <= 1) return null;

  const btnBase =
    'p-2 rounded-xl border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="pt-8 space-y-3">
      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 0}
          className={`${btnBase} border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)]`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`d${i}`}
              className="w-8 h-8 flex items-center justify-center text-sm text-[var(--color-text-muted)]"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`
                min-w-[2rem] h-8 rounded-xl text-sm font-medium transition-all active:scale-95
                ${
                  p === current
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white'
                    : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]'
                }
              `}
              style={p === current ? { boxShadow: '0 4px 12px rgba(99,102,241,0.25)' } : {}}
            >
              {p + 1}
            </button>
          )
        )}

        <button
          onClick={() => onChange(current + 1)}
          disabled={current === total - 1}
          className={`${btnBase} border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)]`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Página {current + 1} de {total}
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

const Ranking: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<RankingType>('views');
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, currentPage, totalPages, totalElements, setPage, refresh } =
    useRanking(activeFilter, PAGE_SIZE);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((u) => u.slug.toLowerCase().includes(q));
  }, [data, searchQuery]);

  const showPodium = currentPage === 0 && !searchQuery.trim() && data.length >= 3;

  const handleFilterChange = (t: RankingType) => {
    setActiveFilter(t);
    setSearchQuery('');
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ── render content ──
  const renderContent = () => {
    if (isLoading) {
      return (
        <SkeletonList
          podium={currentPage === 0 && !searchQuery.trim()}
          count={currentPage === 0 ? PAGE_SIZE - 3 : PAGE_SIZE}
        />
      );
    }
    if (error) return <ErrorState error={error} onRetry={refresh} />;

    return (
      <motion.div
        key={`${activeFilter}-${currentPage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {showPodium && <PodiumSection users={data} type={activeFilter} />}

        {/* divider */}
        {showPodium && (
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex-1 h-px"
              style={{
                background:
                  'linear-gradient(to right, transparent, var(--color-border), transparent)',
              }}
            />
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-medium select-none">
              Classificação
            </span>
            <div
              className="flex-1 h-px"
              style={{
                background:
                  'linear-gradient(to right, transparent, var(--color-border), transparent)',
              }}
            />
          </div>
        )}

        {/* search results info */}
        {searchQuery.trim() && (
          <div className="flex items-center gap-2 mb-3 text-sm text-[var(--color-text-muted)]">
            <Search className="w-3.5 h-3.5" />
            <span>
              {filteredData.length} resultado{filteredData.length !== 1 && 's'} para "
              <strong className="text-[var(--color-text)]">{searchQuery}</strong>"
            </span>
          </div>
        )}

        {/* list */}
        <div className="space-y-1.5">
          {filteredData.map((user, index) => {
            const position = currentPage * PAGE_SIZE + index + 1;
            if (showPodium && position <= 3) return null;
            return (
              <RankingRow
                key={`${user.slug}-${position}`}
                user={user}
                position={position}
                type={activeFilter}
                index={showPodium ? index - 3 : index}
              />
            );
          })}
        </div>

        {filteredData.length === 0 && <EmptyState />}

        {totalPages > 1 && !searchQuery.trim() && (
          <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] my-5">
      {/* bg decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: 'var(--color-primary)', opacity: 0.07 }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.07 }}
        />
      </div>

      <div ref={contentRef} className="relative z-10 max-w-2xl mx-auto px-4 py-8 pt-20">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{
              backgroundColor: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--color-primary)',
            }}
          >
            <Trophy className="w-3 h-3" />
            <span>Leaderboard</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              Ranking
            </span>
          </h1>

          {totalElements > 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">
              {totalElements.toLocaleString('pt-BR')} usuários competindo
            </p>
          )}
        </motion.div>

        {/* controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6"
        >
          <FilterTabs active={activeFilter} onChange={handleFilterChange} />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuário..."
                className="
                  w-full sm:w-48 pl-9 pr-8 py-2.5 rounded-xl
                  bg-[var(--color-surface)] border border-[var(--color-border)]
                  text-sm text-[var(--color-text)]
                  placeholder-[var(--color-text-muted)]
                  outline-none transition-all duration-200
                  focus:border-[var(--color-primary)]
                "
                style={{ boxShadow: 'none' }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-[var(--color-border)] transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                </button>
              )}
            </div>

            {/* refresh */}
            <button
              onClick={refresh}
              disabled={isLoading}
              className="
                p-2.5 rounded-xl border border-[var(--color-border)]
                bg-[var(--color-surface)] text-[var(--color-text-muted)]
                hover:border-[var(--color-primary)] hover:text-[var(--color-text)]
                active:scale-95 transition-all disabled:opacity-40
              "
              title="Atualizar ranking"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* content */}
        {renderContent()}

        {/* footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]"
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: 'rgb(16,185,129)',
              boxShadow: '0 0 6px rgba(16,185,129,0.5)',
            }}
          />
          <span>Atualizado em tempo real</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Ranking;