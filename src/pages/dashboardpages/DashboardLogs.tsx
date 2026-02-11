// src/pages/dashboardpages/DashboardLogs.tsx

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  History,
  Filter,
  Search,
  CalendarDays,
  TrendingUp,
  Gift,
  Receipt,
  ShieldCheck,
  Package,
  Coins,
  Send,
  Layers,
  ChevronLeft,
  Info,
  MessageCircle,
  ChevronDown,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Clock,
} from "lucide-react";
import { userLogsService } from "../../services/userLogsService";
import type {
  UserLogResponse,
  UserLogType,
  LogCategory,
  PagedUserLogsResponse,
} from "../../types/userLogs.types";

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÕES E MAPEAMENTOS
// ═══════════════════════════════════════════════════════════

const LOG_TYPE_CONFIG: Record<UserLogType, {
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  GIFT_SENT: {
    label: "Presente Enviado",
    shortLabel: "Enviado",
    icon: Send,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  GIFT_RECEIVED: {
    label: "Presente Recebido",
    shortLabel: "Recebido",
    icon: Gift,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  COINS_SENT: {
    label: "Moedas Enviadas",
    shortLabel: "Enviadas",
    icon: Send,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  COINS_RECEIVED: {
    label: "Moedas Recebidas",
    shortLabel: "Recebidas",
    icon: Coins,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  COINS_PURCHASED: {
    label: "Moedas Compradas",
    shortLabel: "Compradas",
    icon: CreditCard,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  COINS_REFUNDED: {
    label: "Moedas Reembolsadas",
    shortLabel: "Reembolsadas",
    icon: RefreshCw,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  ITEM_PURCHASED: {
    label: "Item Comprado",
    shortLabel: "Comprado",
    icon: Package,
    color: "text-[var(--color-primary)]",
    bgColor: "bg-blue-400/10",
    borderColor: "border-[var(--color-primary)]",
  },
  ITEM_REFUNDED: {
    label: "Item Reembolsado",
    shortLabel: "Reembolsado",
    icon: RefreshCw,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  ITEM_REMOVED_FROM_STORE: {
    label: "Item Removido da Loja",
    shortLabel: "Removido",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  }
};

const CATEGORY_CONFIG: Record<LogCategory, {
  label: string;
  icon: React.ElementType;
  types: UserLogType[];
  color: string;
}> = {
  all: {
    label: "Todos",
    icon: Layers,
    types: [],
    color: "var(--color-primary)",
  },
  gifts: {
    label: "Presentes",
    icon: Gift,
    types: ['GIFT_SENT', 'GIFT_RECEIVED'],
    color: "#f97316",
  },
  coins: {
    label: "Moedas",
    icon: Coins,
    types: ['COINS_SENT', 'COINS_RECEIVED', 'COINS_PURCHASED', 'COINS_REFUNDED'],
    color: "#eab308",
  },
  items: {
    label: "Itens",
    icon: Package,
    types: ['ITEM_PURCHASED', 'ITEM_REFUNDED', 'ITEM_REMOVED_FROM_STORE'],
    color: "#a855f7",
  },
};

type SortDirection = 'DESC' | 'ASC';

// ═══════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════

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
    className={`bg-[var(--color-background-secondary)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6 ${className}`}
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
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-lg bg-blue-400/10 border border-[var(--color-primary)]">
        <Icon size={18} className="text-[var(--color-primary)]" />
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// Skeleton para Cards
const StatCardSkeleton = () => (
  <div className="p-4 rounded-xl bg-[var(--color-background-secondary)] border border-[var(--color-border)] h-[100px]">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] animate-pulse" />
    </div>
    <div className="h-7 w-20 bg-[var(--color-surface)] rounded animate-pulse mb-2" />
    <div className="h-4 w-28 bg-[var(--color-surface)] rounded animate-pulse" />
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  iconColor = "text-[var(--color-primary)]",
  iconBg = "bg-blue-400/10",
  isLoading = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
}) => {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-[var(--color-text-muted)]",
  };

  if (isLoading) {
    return <StatCardSkeleton />;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-xl bg-[var(--color-background-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && trendLabel && (
          <span className={`text-xs font-medium ${trendColors[trend]} flex items-center gap-1`}>
            {trend === "up" && <TrendingUp size={12} />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{label}</p>
    </motion.div>
  );
};

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
    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
      isActive
        ? "text-white shadow-lg"
        : "bg-[var(--color-background-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] border border-[var(--color-border)]"
    }`}
    style={isActive ? {
      backgroundColor: color,
      boxShadow: `0 4px 20px ${color}40`
    } : {}}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon size={16} />
    <span>{label}</span>
    {count > 0 && (
      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center ${
        isActive 
          ? "bg-white/20 text-white" 
          : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
      }`}>
        {count > 99 ? '99+' : count}
      </span>
    )}
  </motion.button>
);

const TypeBadge = ({ type }: { type: UserLogType }) => {
  const config = LOG_TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor}`}
    >
      <Icon size={12} />
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.shortLabel}</span>
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE DE FILTRO - CORRIGIDO
// ═══════════════════════════════════════════════════════════

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: UserLogType | null;
  onSelectType: (type: UserLogType | null) => void;
  activeCategory: LogCategory;
  sortDirection: SortDirection;
  onSortChange: (direction: SortDirection) => void;
  onClearFilters: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const FilterDropdown = ({
  isOpen,
  onClose,
  selectedType,
  onSelectType,
  activeCategory,
  sortDirection,
  onSortChange,
  onClearFilters,
  triggerRef,
}: FilterDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calcular posição do dropdown (apenas desktop)
  useEffect(() => {
    if (!isOpen || !triggerRef.current || isMobile) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Posicionar abaixo do botão, alinhado à direita
      setDropdownPosition({
        top: triggerRect.bottom + 8,
        right: viewportWidth - triggerRect.right,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, triggerRef, isMobile]);

  // Fechar com ESC e click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        triggerRef.current && 
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile, onClose, triggerRef]);

  const availableTypes = activeCategory === 'all'
    ? Object.keys(LOG_TYPE_CONFIG) as UserLogType[]
    : CATEGORY_CONFIG[activeCategory].types;

  const hasFilters = selectedType !== null || sortDirection !== 'DESC';

  if (!isOpen) return null;

  const dropdownContent = (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={`fixed inset-0 ${isMobile ? 'bg-black/60' : ''}`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Dropdown */}
      <motion.div
        ref={dropdownRef}
        initial={isMobile 
          ? { opacity: 0, y: "100%" }
          : { opacity: 0, scale: 0.95, y: -8 }
        }
        animate={isMobile 
          ? { opacity: 1, y: 0 }
          : { opacity: 1, scale: 1, y: 0 }
        }
        exit={isMobile 
          ? { opacity: 0, y: "100%" }
          : { opacity: 0, scale: 0.95, y: -8 }
        }
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        className="fixed overflow-hidden"
        style={isMobile ? {
          zIndex: 9999,
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '80vh',
          backgroundColor: 'var(--color-background)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
        } : {
          zIndex: 9999,
          position: 'fixed',
          top: dropdownPosition.top,
          right: dropdownPosition.right,
          width: 340,
          maxHeight: 'calc(100vh - 100px)',
          backgroundColor: 'var(--color-background)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Handle Mobile */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
          </div>
        )}

        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-400/10">
                <Filter size={16} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Filtros</h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {hasFilters ? `${(selectedType ? 1 : 0) + (sortDirection !== 'DESC' ? 1 : 0)} filtro(s) ativo(s)` : 'Nenhum filtro aplicado'}
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} className="text-[var(--color-text-muted)]" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto" style={{ maxHeight: isMobile ? '50vh' : '400px' }}>
          {/* Ordenação */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              <Clock size={12} />
              Ordenação
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'DESC' as SortDirection, label: 'Mais recente', icon: ArrowDown },
                { value: 'ASC' as SortDirection, label: 'Mais antigo', icon: ArrowUp },
              ].map(({ value, label, icon: SortIcon }) => (
                <motion.button
                  key={value}
                  onClick={() => onSortChange(value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    sortDirection === value
                      ? 'bg-blue-400 text-white shadow-lg'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
                  }`}
                  style={sortDirection === value ? {
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                  } : {}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SortIcon size={14} />
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div className="h-px bg-[var(--color-border)]" />

          {/* Tipo de Log */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              <Layers size={12} />
              Tipo de Registro
            </label>
            <div className="space-y-1.5">
              {/* Opção Todos */}
              <motion.button
                onClick={() => onSelectType(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  selectedType === null
                    ? 'bg-blue-400/10 border-[var(--color-primary)]'
                    : 'hover:bg-[var(--color-surface)]'
                } border border-transparent`}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-2 rounded-lg ${
                  selectedType === null 
                    ? 'bg-blue-400/10' 
                    : 'bg-[var(--color-surface)]'
                }`}>
                  <Layers size={14} className={selectedType === null ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                </div>
                <span className={`text-sm flex-1 font-medium ${
                  selectedType === null ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                }`}>
                  Todos os tipos
                </span>
                {selectedType === null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-blue-400/10 flex items-center justify-center"
                  >
                    <CheckCircle size={12} className="text-white" />
                  </motion.div>
                )}
              </motion.button>

              {/* Tipos disponíveis */}
              {availableTypes.map((type) => {
                const config = LOG_TYPE_CONFIG[type];
                const Icon = config.icon;
                const isSelected = selectedType === type;

                return (
                  <motion.button
                    key={type}
                    onClick={() => onSelectType(type)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? `${config.bgColor} ${config.borderColor}`
                        : 'border-transparent hover:bg-[var(--color-surface)]'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon size={14} className={config.color} />
                    </div>
                    <span className={`text-sm flex-1 font-medium ${
                      isSelected ? config.color : 'text-[var(--color-text)]'
                    }`}>
                      {config.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-blue-400/10 flex items-center justify-center"
                      >
                        <CheckCircle size={12} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <motion.button
            onClick={() => {
              onClearFilters();
              onClose();
            }}
            disabled={!hasFilters}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              hasFilters
                ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] cursor-not-allowed opacity-50'
            }`}
            whileHover={hasFilters ? { scale: 1.01 } : {}}
            whileTap={hasFilters ? { scale: 0.99 } : {}}
          >
            <RefreshCw size={14} />
            {hasFilters ? 'Limpar filtros' : 'Nenhum filtro para limpar'}
          </motion.button>
        </div>

        {/* Safe area mobile */}
        {isMobile && <div className="h-6" />}
      </motion.div>
    </>
  );

  return createPortal(dropdownContent, document.body);
};

// ═══════════════════════════════════════════════════════════
// CHIPS DE FILTROS ATIVOS
// ═══════════════════════════════════════════════════════════

const ActiveFiltersBar = ({
  selectedType,
  sortDirection,
  searchTerm,
  onClearType,
  onClearSort,
  onClearSearch,
  onClearAll,
}: {
  selectedType: UserLogType | null;
  sortDirection: SortDirection;
  searchTerm: string;
  onClearType: () => void;
  onClearSort: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}) => {
  const chips = [];
  
  if (selectedType) {
    const config = LOG_TYPE_CONFIG[selectedType];
    chips.push({
      id: 'type',
      icon: config.icon,
      label: config.label,
      color: config.color,
      bgColor: config.bgColor,
      borderColor: config.borderColor,
      onClear: onClearType,
    });
  }
  
  if (sortDirection === 'ASC') {
    chips.push({
      id: 'sort',
      icon: ArrowUp,
      label: 'Mais antigo primeiro',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      onClear: onClearSort,
    });
  }
  
  if (searchTerm) {
    chips.push({
      id: 'search',
      icon: Search,
      label: `"${searchTerm}"`,
      color: 'text-[var(--color-text)]',
      bgColor: 'bg-[var(--color-surface)]',
      borderColor: 'border-[var(--color-border)]',
      onClear: onClearSearch,
    });
  }

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 mr-1">
          <Filter size={12} />
          Filtros:
        </span>
        
        <AnimatePresence mode="popLayout">
          {chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <motion.span
                key={chip.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                layout
                className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-xs font-medium ${chip.bgColor} ${chip.color} border ${chip.borderColor}`}
              >
                <Icon size={12} />
                <span className="max-w-[120px] truncate">{chip.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    chip.onClear();
                  }}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <X size={12} />
                </button>
              </motion.span>
            );
          })}
        </AnimatePresence>

        {chips.length > 1 && (
          <motion.button
            onClick={onClearAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-500/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={10} />
            Limpar tudo
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// ESTADOS (Empty, Loading, Error)
// ═══════════════════════════════════════════════════════════

const EmptyState = ({ category, hasFilters }: { category: LogCategory; hasFilters: boolean }) => {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <motion.div
        className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mb-6 border border-[var(--color-border)]"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(139, 92, 246, 0)",
            "0 0 0 12px rgba(139, 92, 246, 0.1)",
            "0 0 0 0 rgba(139, 92, 246, 0)"
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <Icon size={32} className="text-[var(--color-text-muted)]" />
      </motion.div>

      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
        {hasFilters ? "Nenhum resultado" : "Nenhum registro"}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] text-center max-w-sm px-4">
        {hasFilters
          ? "Tente ajustar os filtros ou a busca para encontrar o que procura."
          : category === 'all'
            ? "Você ainda não possui registros de atividade."
            : `Nenhum registro de ${config.label.toLowerCase()} encontrado.`}
      </p>
    </motion.div>
  );
};

const TableSkeleton = () => (
  <div className="space-y-2 py-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
        <div className="h-5 w-28 bg-[var(--color-surface)] rounded" />
        <div className="h-7 w-32 bg-[var(--color-surface)] rounded-lg" />
        <div className="h-5 flex-1 bg-[var(--color-surface)] rounded hidden md:block" />
        <div className="h-5 w-20 bg-[var(--color-surface)] rounded" />
        <div className="h-5 w-36 bg-[var(--color-surface)] rounded hidden lg:block" />
      </div>
    ))}
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/30">
      <AlertCircle size={28} className="text-red-400" />
    </div>
    <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">Erro ao carregar</h3>
    <p className="text-sm text-[var(--color-text-muted)] mb-5 text-center max-w-xs">
      Não foi possível carregar o histórico.
    </p>
    <motion.button
      onClick={onRetry}
      className="px-5 py-2.5 rounded-xl bg-blue-400/10 text-white text-sm font-medium flex items-center gap-2 shadow-lg"
      style={{ boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <RefreshCw size={14} />
      Tentar novamente
    </motion.button>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════
// INFO CARDS
// ═══════════════════════════════════════════════════════════

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
  const variants = {
    default: {
      border: "border-[var(--color-border)]",
      iconBg: "bg-[var(--color-surface)]",
      iconColor: "text-[var(--color-text-muted)]",
    },
    primary: {
      border: "border-[var(--color-primary)]",
      iconBg: "bg-blue-400/10",
      iconColor: "text-[var(--color-primary)]",
    },
    warning: {
      border: "border-yellow-500/30",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
    },
  };

  const v = variants[variant];

  return (
    <div className={`p-4 rounded-xl bg-[var(--color-surface)] border ${v.border} transition-all hover:bg-[var(--color-surface)]`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${v.iconBg}`}>
          <Icon size={16} className={v.iconColor} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-text)]">{title}</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

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
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
    <div className={`p-1.5 rounded-lg ${color}`}>
      <Icon size={14} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
      <p className="text-xs text-[var(--color-text-muted)] truncate">{description}</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// LOG ROW
// ═══════════════════════════════════════════════════════════

const LogRow = ({ log, index }: { log: UserLogResponse; index: number }) => {
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

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group hover:bg-[var(--color-surface)] transition-colors"
    >
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-[var(--color-text)] bg-[var(--color-surface)] px-2 py-1 rounded-md">
          {log.logId.slice(0, 8)}...
        </code>
      </td>
      <td className="px-4 py-3">
        <TypeBadge type={log.type} />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-[var(--color-text)] line-clamp-1">
          {log.description}
        </span>
      </td>
      <td className="px-4 py-3">
        {log.coinsAmount > 0 ? (
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-yellow-400" />
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {log.coinsAmount.toLocaleString()}
            </span>
          </div>
        ) : (
          <span className="text-sm text-[var(--color-text-muted)]">—</span>
        )}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
          <CalendarDays size={12} />
          {formatDate(log.createdAt)}
        </div>
      </td>
    </motion.tr>
  );
};

// ═══════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════

const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('ellipsis');
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push('ellipsis');
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-5 border-t border-[var(--color-border)]">
      <span className="text-sm text-[var(--color-text-muted)] order-2 sm:order-1">
        Página <span className="font-semibold text-[var(--color-text)]">{currentPage + 1}</span> de{' '}
        <span className="font-semibold text-[var(--color-text)]">{totalPages}</span>
        <span className="hidden sm:inline ml-2 text-[var(--color-text-muted)]">
          • {totalElements} registro{totalElements !== 1 ? 's' : ''}
        </span>
      </span>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-40 disabled:cursor-not-allowed hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-all"
          whileHover={{ scale: currentPage === 0 || isLoading ? 1 : 1.05 }}
          whileTap={{ scale: currentPage === 0 || isLoading ? 1 : 0.95 }}
        >
          <ChevronLeft size={16} />
        </motion.button>

        <div className="hidden sm:flex items-center gap-1">
          {getVisiblePages().map((page, idx) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-[var(--color-text-muted)]">•••</span>
            ) : (
              <motion.button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`min-w-[38px] h-[38px] rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? 'bg-blue-400 text-white shadow-lg'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
                }`}
                style={currentPage === page ? { boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' } : {}}
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
              >
                {page + 1}
              </motion.button>
            )
          )}
        </div>

        <span className="sm:hidden text-sm text-[var(--color-text)] px-4 py-2 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] font-medium">
          {currentPage + 1} / {totalPages}
        </span>

        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-40 disabled:cursor-not-allowed hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-all"
          whileHover={{ scale: currentPage >= totalPages - 1 || isLoading ? 1 : 1.05 }}
          whileTap={{ scale: currentPage >= totalPages - 1 || isLoading ? 1 : 0.95 }}
        >
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardLogs = () => {
  // Estados principais
  const [activeCategory, setActiveCategory] = useState<LogCategory>("all");
  const [logs, setLogs] = useState<UserLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<UserLogType | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');

  // Paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // Refs
  const requestIdRef = useRef(0);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Debounce do search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch logs
  const fetchLogs = useCallback(async (
    page: number,
    type: UserLogType | null,
    direction: SortDirection,
    showLoading = true
  ) => {
    const currentRequestId = ++requestIdRef.current;

    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      let response: PagedUserLogsResponse;

      if (type !== null) {
        response = await userLogsService.getUserLogsByType(type, {
          page,
          size: pageSize,
          direction,
        });
      } else {
        response = await userLogsService.getUserLogs({
          page,
          size: pageSize,
          direction,
        });
      }

      if (currentRequestId !== requestIdRef.current) return;

      setLogs(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setIsInitialLoad(false);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.error("Erro ao buscar logs:", err);
      setError("Não foi possível carregar o histórico.");
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Efeito para buscar logs
  useEffect(() => {
    fetchLogs(currentPage, selectedType, sortDirection, true);
  }, [currentPage, selectedType, sortDirection, fetchLogs]);

  // Filtrar logs localmente
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filtro por categoria (local)
    if (activeCategory !== "all" && selectedType === null) {
      const categoryTypes = CATEGORY_CONFIG[activeCategory].types;
      filtered = filtered.filter(log => categoryTypes.includes(log.type));
    }

    // Filtro por busca (local)
    if (debouncedSearchTerm) {
      const search = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.logId.toLowerCase().includes(search) ||
        log.description.toLowerCase().includes(search) ||
        LOG_TYPE_CONFIG[log.type].label.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [logs, activeCategory, selectedType, debouncedSearchTerm]);

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<LogCategory, number> = { all: logs.length, gifts: 0, coins: 0, items: 0 };
    logs.forEach((log) => {
      if (CATEGORY_CONFIG.gifts.types.includes(log.type)) counts.gifts++;
      if (CATEGORY_CONFIG.coins.types.includes(log.type)) counts.coins++;
      if (CATEGORY_CONFIG.items.types.includes(log.type)) counts.items++;
    });
    return counts;
  }, [logs]);

  // Estatísticas
  const stats = useMemo(() => {
    const categoryLogs = activeCategory === 'all'
      ? logs
      : logs.filter(log => CATEGORY_CONFIG[activeCategory].types.includes(log.type));
    return {
      total: categoryLogs.length,
      totalCoins: categoryLogs.reduce((acc, log) => acc + log.coinsAmount, 0),
    };
  }, [logs, activeCategory]);

  // Verificar filtros ativos
  const hasApiFilters = selectedType !== null || sortDirection !== 'DESC';
  const hasActiveFilters = hasApiFilters || searchTerm !== '';

  // Handlers
  const handleCategoryChange = useCallback((category: LogCategory) => {
    setActiveCategory(category);
  }, []);

  const handleTypeChange = useCallback((type: UserLogType | null) => {
  setSelectedType(type);
  setCurrentPage(0);
  if (type !== null) {
    for (const [catKey, catConfig] of Object.entries(CATEGORY_CONFIG)) {
      if (catConfig.types.includes(type)) {
        setActiveCategory(catKey as LogCategory);
        break;
      }
    }
  } else {
    // Quando o tipo é limpo, resetar a categoria para 'all'
    setActiveCategory('all');
  }
}, []);

  const handleSortChange = useCallback((direction: SortDirection) => {
    if (direction !== sortDirection) {
      setSortDirection(direction);
      setCurrentPage(0);
    }
  }, [sortDirection]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearFilters = useCallback(() => {
  setSelectedType(null);
  setSortDirection('DESC');
  setActiveCategory('all');
  setCurrentPage(0);
}, []);

  const handleClearAllFilters = useCallback(() => {
    setSelectedType(null);
    setSortDirection('DESC');
    setSearchTerm('');
    setActiveCategory('all');
    setCurrentPage(0);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchLogs(currentPage, selectedType, sortDirection, true);
  }, [currentPage, selectedType, sortDirection, fetchLogs]);

  const showTableLoading = isLoading && isInitialLoad;
  const showRefreshing = isLoading && !isInitialLoad;

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-4"
        >
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span>Configurações</span>
          <ChevronRight size={14} />
          <span className="text-[var(--color-text)]">Histórico</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-3">
            <History className="text-[var(--color-primary)]" size={28} />
            Histórico de Atividades
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Acompanhe todas as suas transações e atividades na plataforma.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Category Tabs */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            {Object.entries(CATEGORY_CONFIG).map(([id, config]) => (
              <CategoryTab
                key={id}
                icon={config.icon}
                label={config.label}
                count={categoryCounts[id as LogCategory]}
                isActive={activeCategory === id}
                onClick={() => handleCategoryChange(id as LogCategory)}
                color={config.color}
              />
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Receipt}
            label="Total de Registros"
            value={totalElements.toString()}
            isLoading={showTableLoading}
          />
          <StatCard
            icon={CheckCircle}
            label="Exibindo"
            value={filteredLogs.length.toString()}
            iconColor="text-green-400"
            iconBg="bg-green-500/10"
            isLoading={showTableLoading}
          />
          <StatCard
            icon={Coins}
            label="Moedas Movimentadas"
            value={stats.totalCoins.toLocaleString()}
            iconColor="text-yellow-400"
            iconBg="bg-yellow-500/10"
            isLoading={showTableLoading}
          />
          <StatCard
            icon={CalendarDays}
            label="Página Atual"
            value={`${currentPage + 1} / ${Math.max(1, totalPages)}`}
            iconColor="text-blue-400"
            iconBg="bg-blue-500/10"
            isLoading={showTableLoading}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Transaction History Table */}
          <div className="xl:col-span-2">
            <SettingsCard>
              <SectionHeader
                icon={CATEGORY_CONFIG[activeCategory].icon}
                title={`Registros de ${CATEGORY_CONFIG[activeCategory].label}`}
                description="Histórico completo de atividades"
                action={
                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-8 py-2.5 text-sm rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors w-40 lg:w-52"
                      />
                      <AnimatePresence>
                        {searchTerm && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5"
                          >
                            <X size={12} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Filter Button */}
                    <motion.button
                      ref={filterButtonRef}
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className={`relative p-2.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                        hasApiFilters 
                          ? 'bg-blue-400/10 border-[var(--color-primary)] text-[var(--color-primary)]' 
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Filter size={16} />
                      <ChevronDown 
                        size={12} 
                        className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} 
                      />
                      <AnimatePresence>
                        {hasApiFilters && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-400/10 rounded-full text-[10px] text-white flex items-center justify-center font-bold"
                          >
                            {(selectedType !== null ? 1 : 0) + (sortDirection !== 'DESC' ? 1 : 0)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Refresh Button */}
                    <motion.button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className={`p-2.5 rounded-lg border transition-all ${
                        showRefreshing 
                          ? 'bg-blue-400/10 border-[var(--color-primary)]' 
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]'
                      }`}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      <RefreshCw 
                        size={16} 
                        className={showRefreshing ? "animate-spin text-[var(--color-primary)]" : ""} 
                      />
                    </motion.button>
                  </div>
                }
              />

              {/* Active Filters */}
              <AnimatePresence>
                <ActiveFiltersBar
                  selectedType={selectedType}
                  sortDirection={sortDirection}
                  searchTerm={searchTerm}
                  onClearType={() => handleTypeChange(null)}
                  onClearSort={() => handleSortChange('DESC')}
                  onClearSearch={() => setSearchTerm('')}
                  onClearAll={handleClearAllFilters}
                />
              </AnimatePresence>

              {/* Table */}
              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {showTableLoading ? (
                    <TableSkeleton key="loading" />
                  ) : error ? (
                    <ErrorState key="error" onRetry={handleRefresh} />
                  ) : filteredLogs.length > 0 ? (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: showRefreshing ? 0.5 : 1 }}
                      exit={{ opacity: 0 }}
                      className="-mx-4 sm:-mx-6"
                      style={{ pointerEvents: showRefreshing ? 'none' : 'auto' }}
                    >
                      <div className="min-w-full overflow-x-auto px-4 sm:px-6">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-[var(--color-border)]">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Tipo
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                                Descrição
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Moedas
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                                <button
                                  onClick={() => handleSortChange(sortDirection === 'DESC' ? 'ASC' : 'DESC')}
                                  className="flex items-center gap-1 hover:text-[var(--color-text)] transition-colors group"
                                >
                                  Data
                                  <ArrowUpDown size={12} className="group-hover:text-[var(--color-primary)]" />
                                </button>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border)]">
                            {filteredLogs.map((log, index) => (
                              <LogRow key={log.logId} log={log} index={index} />
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="px-4 sm:px-6">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalElements={totalElements}
                          onPageChange={handlePageChange}
                          isLoading={isLoading}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <EmptyState key="empty" category={activeCategory} hasFilters={hasActiveFilters} />
                  )}
                </AnimatePresence>
              </div>
            </SettingsCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SettingsCard>
              <SectionHeader
                icon={Info}
                title="Informações"
                description="Sobre o histórico"
              />

              <div className="space-y-3">
                <InfoCard
                  icon={History}
                  title="Histórico Completo"
                  description="Todas as atividades são registradas automaticamente."
                  variant="primary"
                />

                <InfoCard
                  icon={ShieldCheck}
                  title="Dados Seguros"
                  description="Registros armazenados de forma segura e criptografada."
                />

                <InfoCard
                  icon={MessageCircle}
                  title="Precisa de Ajuda?"
                  description="Entre em contato pelo Discord para suporte."
                  variant="warning"
                />
              </div>
            </SettingsCard>

            <SettingsCard>
              <SectionHeader
                icon={Sparkles}
                title="Tipos de Registro"
                description="Legenda dos tipos"
              />

              <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
                <StatusLegendItem
                  icon={Gift}
                  label="Presente Recebido"
                  description="Item recebido de outro usuário"
                  color="bg-green-500/10 text-green-400"
                />
                <StatusLegendItem
                  icon={Send}
                  label="Presente Enviado"
                  description="Item enviado para outro usuário"
                  color="bg-orange-500/10 text-orange-400"
                />
                <StatusLegendItem
                  icon={Package}
                  label="Item Comprado"
                  description="Item adquirido na loja"
                  color="bg-blue-300/10 text-[var(--color-primary)]"
                />
                <StatusLegendItem
                  icon={Coins}
                  label="Transação de Moedas"
                  description="Compra, envio ou recebimento"
                  color="bg-yellow-500/10 text-yellow-400"
                />
                <StatusLegendItem
                  icon={RefreshCw}
                  label="Reembolso"
                  description="Itens ou moedas reembolsados"
                  color="bg-purple-500/10 text-purple-400"
                />
              </div>
            </SettingsCard>
          </div>
        </div>
      </motion.div>

      {/* Filter Dropdown Portal */}
      <AnimatePresence>
        {isFilterOpen && (
          <FilterDropdown
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            selectedType={selectedType}
            onSelectType={handleTypeChange}
            activeCategory={activeCategory}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
            triggerRef={filterButtonRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLogs;