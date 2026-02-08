// pages/Tags/Tags.tsx

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  ChevronRight,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  Briefcase,
  Gamepad2,
  Film,
  Smile,
  Globe,
  Dumbbell,
  AlertCircle,
  CheckCircle,
  Eye,
  RotateCcw,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { tagService } from "../../services/tagService";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface TagItem {
  id: number; // ✅ ID do banco (Long -> number)
  name: string;
  emoji: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

// ═══════════════════════════════════════════════════════════
// DADOS - Tags mapeadas com IDs do banco de dados
// ═══════════════════════════════════════════════════════════

const categories: Category[] = [
  { id: "personality", name: "Personalidade", icon: Smile, color: "#FF6B6B" },
  { id: "profession", name: "Profissão", icon: Briefcase, color: "#4ECDC4" },
  { id: "hobbies", name: "Hobbies & Esportes", icon: Dumbbell, color: "#45B7D1" },
  { id: "entertainment", name: "Entretenimento", icon: Film, color: "#96CEB4" },
  { id: "status", name: "Status & Lifestyle", icon: Heart, color: "#FF8ED4" },
  { id: "games", name: "Jogos", icon: Gamepad2, color: "#9B59B6" },
  { id: "other", name: "Outros", icon: Globe, color: "#F39C12" },
];

// ✅ Tags com IDs do banco de dados (conforme o DB fornecido)
const allTags: TagItem[] = [
  // Personalidade
  { id: 1, name: "Paz", emoji: "☮️", category: "personality" },
  { id: 20, name: "Bonito(a)", emoji: "✨", category: "personality" },
  { id: 21, name: "Picante", emoji: "🌶️", category: "personality" },
  { id: 23, name: "Adorável", emoji: "🥰", category: "personality" },
  { id: 28, name: "Perigoso(a)", emoji: "⚠️", category: "personality" },
  { id: 30, name: "Provocante", emoji: "😏", category: "personality" },
  { id: 32, name: "Frio", emoji: "🥶", category: "personality" },
  { id: 40, name: "Pensativo(a)", emoji: "🤔", category: "personality" },
  { id: 41, name: "Comunicativo(a)", emoji: "🗣️", category: "personality" },
  { id: 43, name: "Apaixonado(a)", emoji: "😍", category: "personality" },
  { id: 46, name: "Tímido(a)", emoji: "😊", category: "personality" },
  { id: 47, name: "Triste", emoji: "😢", category: "personality" },
  { id: 48, name: "Bravo(a)", emoji: "😤", category: "personality" },
  { id: 49, name: "Amigável", emoji: "🤗", category: "personality" },
  { id: 39, name: "Tóxico(a)", emoji: "☠️", category: "personality" },
  { id: 27, name: "Anjo(a)", emoji: "😇", category: "personality" },
  { id: 33, name: "Palhaço(a)", emoji: "🤡", category: "personality" },

  // Profissão
  { id: 2, name: "Programador", emoji: "💻", category: "profession" },
  { id: 3, name: "Artista", emoji: "🎨", category: "profession" },
  { id: 4, name: "Designer", emoji: "🖌️", category: "profession" },
  { id: 5, name: "Escritor", emoji: "✍️", category: "profession" },
  { id: 6, name: "Investidor", emoji: "📈", category: "profession" },
  { id: 7, name: "Músico", emoji: "🎵", category: "profession" },
  { id: 8, name: "Fotógrafo", emoji: "📸", category: "profession" },
  { id: 24, name: "Produtor(a)", emoji: "🎬", category: "profession" },
  { id: 50, name: "Construtor(a)", emoji: "🔧", category: "profession" },
  { id: 60, name: "Cybersecurity", emoji: "🔐", category: "profession" },
  { id: 15, name: "Negócios", emoji: "💼", category: "profession" },
  { id: 19, name: "Ciência", emoji: "🔬", category: "profession" },

  // Hobbies & Esportes
  { id: 9, name: "Ar Livre", emoji: "🏕️", category: "hobbies" },
  { id: 16, name: "Academia", emoji: "💪", category: "hobbies" },
  { id: 17, name: "Leitor", emoji: "📚", category: "hobbies" },
  { id: 18, name: "Atleta", emoji: "🏃", category: "hobbies" },
  { id: 25, name: "Viagem", emoji: "✈️", category: "hobbies" },
  { id: 29, name: "Skatista", emoji: "🛹", category: "hobbies" },
  { id: 31, name: "Basquete", emoji: "🏀", category: "hobbies" },
  { id: 36, name: "Boliche", emoji: "🎳", category: "hobbies" },
  { id: 37, name: "Surfista", emoji: "🏄", category: "hobbies" },
  { id: 45, name: "Futebol", emoji: "⚽", category: "hobbies" },

  // Entretenimento
  { id: 10, name: "Bebida", emoji: "🍻", category: "entertainment" },
  { id: 11, name: "Comida", emoji: "🍕", category: "entertainment" },
  { id: 12, name: "Filmes", emoji: "🎬", category: "entertainment" },
  { id: 13, name: "Seriados", emoji: "📺", category: "entertainment" },
  { id: 14, name: "Fumante", emoji: "🚬", category: "entertainment" },
  { id: 22, name: "Animais", emoji: "🐾", category: "entertainment" },

  // Status & Lifestyle
  { id: 51, name: "Namorando", emoji: "💑", category: "status" },
  { id: 52, name: "Solteiro(a)", emoji: "💔", category: "status" },
  { id: 42, name: "Insônia", emoji: "🌙", category: "status" },
  { id: 44, name: "Lgbt", emoji: "🏳️‍🌈", category: "status" },
  { id: 38, name: "Verão", emoji: "☀️", category: "status" },

  // Jogos
  { id: 26, name: "Gamer", emoji: "🎮", category: "games" },
  { id: 53, name: "League Of Legends", emoji: "⚔️", category: "games" },
  { id: 54, name: "Valorant", emoji: "🔫", category: "games" },
  { id: 55, name: "Counter-Strike 2", emoji: "💣", category: "games" },
  { id: 56, name: "Paladins", emoji: "🛡️", category: "games" },
  { id: 57, name: "Dota 2", emoji: "🗡️", category: "games" },
  { id: 58, name: "Fortnite", emoji: "🏗️", category: "games" },
  { id: 59, name: "Grand Theft Auto V", emoji: "🚗", category: "games" },
  { id: 35, name: "Habbo", emoji: "🏨", category: "games" },

  // Outros
  { id: 34, name: "Brasil", emoji: "🇧🇷", category: "other" },
];

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

// Card Component
const TagsCard = ({
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
    {action}
  </div>
);

// Tag Chip Component - Simplificado (sem premium/lock)
const TagChip = ({
  tag,
  isSelected,
  onClick,
  size = "normal",
  disabled = false,
}: {
  tag: TagItem;
  isSelected: boolean;
  onClick: () => void;
  size?: "small" | "normal";
  disabled?: boolean;
}) => {
  const sizeClasses = size === "small"
    ? "px-2 py-1 text-xs gap-1"
    : "px-3 py-2 text-sm gap-2";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center ${sizeClasses} rounded-full font-medium
        transition-all duration-300 group
        ${disabled
          ? "opacity-50 cursor-not-allowed"
          : isSelected
            ? "bg-[var(--color-primary)] border border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25"
            : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-hover)]"
        }
      `}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      layout
    >
      {/* Emoji */}
      <span className={size === "small" ? "text-sm" : "text-base"}>{tag.emoji}</span>

      {/* Name */}
      <span className="truncate max-w-[120px]">{tag.name}</span>

      {/* Selected Icon */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Check size={size === "small" ? 8 : 10} />
        </motion.div>
      )}

      {/* Glow effect when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-20 blur-md -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1.1 }}
        />
      )}
    </motion.button>
  );
};

// Category Section Component
const CategorySection = ({
  category,
  tags,
  selectedTags,
  onTagClick,
  isExpanded,
  onToggle,
  disabled,
}: {
  category: Category;
  tags: TagItem[];
  selectedTags: number[];
  onTagClick: (tagId: number) => void;
  isExpanded: boolean;
  onToggle: () => void;
  disabled: boolean;
}) => {
  const Icon = category.icon;
  const selectedInCategory = tags.filter((t) => selectedTags.includes(t.id)).length;

  return (
    <motion.div
      layout
      className="box-border border border-transparent border-[var(--color-border)] rounded-[var(--border-radius-md)]
      overflow-hidden
"
    >
      {/* Category Header */}
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-[var(--border-radius-sm)]"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon size={18} style={{ color: category.color }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{category.name}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {tags.length} tags disponíveis
              {selectedInCategory > 0 && (
                <span className="text-[var(--color-primary)]"> • {selectedInCategory} selecionada{selectedInCategory !== 1 && "s"}</span>
              )}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-[var(--color-text-muted)]" />
        </motion.div>
      </motion.button>

      {/* Tags Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4 pt-0 sm:pt-0 bg-[var(--color-background)]">
              <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t border-[var(--color-border)]">
                {tags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTags.includes(tag.id)}
                    onClick={() => onTagClick(tag.id)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Empty Selection Component
const EmptySelection = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-3">
      <Tag size={20} className="text-[var(--color-text-muted)]" />
    </div>
    <p className="text-sm text-[var(--color-text-muted)]">
      Nenhuma tag selecionada
    </p>
    <p className="text-xs text-[var(--color-text-muted)] mt-1">
      Selecione tags para aparecerem no seu perfil
    </p>
  </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-16 bg-[var(--color-surface)] rounded-[var(--border-radius-md)]" />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardTags = () => {
  // Estados
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [initialTags, setInitialTags] = useState<number[]>([]); // Para comparar mudanças
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["personality"]);

  // ✅ Estados de loading e erro
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const MAX_TAGS = 10; // Limite único para todos

  // ✅ Carregar tags do usuário ao montar o componente
  const loadUserTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tagService.getUserTags();
      const userTagIds = response.tags.map(tag => tag.tagId);
      setSelectedTags(userTagIds);
      setInitialTags(userTagIds);
    } catch (err: any) {
      console.error('Erro ao carregar tags:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError('Erro ao carregar suas tags. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserTags();
  }, [loadUserTags]);

  // Verificar se houve mudanças
  const hasChanges = useMemo(() => {
    if (selectedTags.length !== initialTags.length) return true;
    return !selectedTags.every(id => initialTags.includes(id));
  }, [selectedTags, initialTags]);

  // Filtrar tags baseado na busca
  const filteredTags = useMemo(() => {
    return allTags.filter((tag) => {
      return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  // Agrupar tags por categoria
  const tagsByCategory = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      tags: filteredTags.filter((tag) => tag.category === category.id),
    }));
  }, [filteredTags]);

  // Handler para selecionar/deselecionar tag
  const handleTagClick = (tagId: number) => {
    if (isSaving) return;

    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }

      // Verificar limite
      if (prev.length >= MAX_TAGS) {
        return prev;
      }

      return [...prev, tagId];
    });
  };

  // Toggle categoria expandida
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Expandir todas as categorias
  const expandAll = () => {
    setExpandedCategories(categories.map((c) => c.id));
  };

  // Colapsar todas as categorias
  const collapseAll = () => {
    setExpandedCategories([]);
  };

  // Limpar seleção
  const clearSelection = () => {
    setSelectedTags([]);
  };

  // Reverter para tags originais
  const revertChanges = () => {
    setSelectedTags(initialTags);
  };

  // ✅ Salvar alterações no backend
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await tagService.updateUserTags(selectedTags);
      const updatedTagIds = response.tags.map(tag => tag.tagId);

      setSelectedTags(updatedTagIds);
      setInitialTags(updatedTagIds);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar tags:', err);

      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (err.response?.status === 404) {
        setError('Uma ou mais tags não foram encontradas.');
      } else {
        setError(err.response?.data?.message || 'Erro ao salvar tags. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Obter tags selecionadas como objetos
  const selectedTagObjects = selectedTags
    .map((id) => allTags.find((t) => t.id === id))
    .filter((t): t is TagItem => t !== undefined);

  // Animações
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
          <span>Configurações</span>
          <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
          <span className="text-[var(--color-text)]">Tags</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <Tag className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            Escolha as tags que mais se identifica.
          </h1>
        </motion.div>
      </div>

      {/* ✅ Error Message Global */}
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
              onClick={() => setError(null)}
              className="p-1 rounded-full hover:bg-red-500/20 text-red-400"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6"
      >
        {/* Tags Selection - 2 colunas no XL */}
        <motion.div variants={itemVariants} className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Search and Filters Card */}
          <TagsCard>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="text"
                  placeholder="Buscar tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                  className="
                    w-full pl-10 pr-4 py-2.5 rounded-[var(--border-radius-md)]
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
                    focus:border-[var(--color-primary)] transition-all
                    disabled:opacity-50
                  "
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </div>

              {/* ✅ Reload Button */}
              <motion.button
                onClick={loadUserTags}
                disabled={isLoading}
                className="px-3 py-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                <span className="text-sm hidden sm:inline">Recarregar</span>
              </motion.button>
            </div>

            {/* Expand/Collapse All */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
              <motion.button
                onClick={expandAll}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronDown size={14} />
                Expandir Todas
              </motion.button>
              <motion.button
                onClick={collapseAll}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronUp size={14} />
                Colapsar Todas
              </motion.button>
            </div>
          </TagsCard>

          {/* Main Tags Card */}
          <TagsCard>
            <SectionHeader
              icon={Tag}
              title="Tags"
              description="Escolha as tags nas quais você mais se identifica para exibir em seu perfil."
            />

            {/* ✅ Loading State */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Categories */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {tagsByCategory
                      .filter((cat) => cat.tags.length > 0)
                      .map((category) => (
                        <CategorySection
                          key={category.id}
                          category={category}
                          tags={category.tags}
                          selectedTags={selectedTags}
                          onTagClick={handleTagClick}
                          isExpanded={expandedCategories.includes(category.id)}
                          onToggle={() => toggleCategory(category.id)}
                          disabled={isSaving}
                        />
                      ))}
                  </AnimatePresence>
                </div>

                {/* No results message */}
                {filteredTags.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <Search size={40} className="text-[var(--color-text-muted)] mb-4" />
                    <p className="text-[var(--color-text-muted)]">
                      Nenhuma tag encontrada para "{searchQuery}"
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </TagsCard>
        </motion.div>

        {/* Preview Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
          {/* Selected Tags Preview */}
          <TagsCard className="sticky top-4">
            <SectionHeader
              icon={Eye}
              title="Preview"
              description={`${selectedTags.length}/${MAX_TAGS} tags selecionadas`}
              action={
                <div className="flex gap-2">
                  {hasChanges && (
                    <motion.button
                      onClick={revertChanges}
                      disabled={isSaving}
                      className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-yellow-500/10 text-[var(--color-text-muted)] hover:text-yellow-400 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Reverter alterações"
                    >
                      <RotateCcw size={16} />
                    </motion.button>
                  )}
                  {selectedTags.length > 0 && (
                    <motion.button
                      onClick={clearSelection}
                      disabled={isSaving}
                      className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Limpar seleção"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                </div>
              }
            />

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${selectedTags.length >= MAX_TAGS
                      ? "bg-yellow-500"
                      : "bg-[var(--color-primary)]"
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(selectedTags.length / MAX_TAGS) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
              {selectedTags.length >= MAX_TAGS && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-yellow-400 mt-2 flex items-center gap-1"
                >
                  <AlertCircle size={12} />
                  Limite de tags atingido
                </motion.p>
              )}
            </div>

            {/* Selected Tags Display */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
              </div>
            ) : selectedTags.length === 0 ? (
              <EmptySelection />
            ) : (
              <div className="space-y-4">
                {/* Tags Grid */}
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {selectedTagObjects.map((tag) => (
                      <TagChip
                        key={tag.id}
                        tag={tag}
                        isSelected={true}
                        onClick={() => handleTagClick(tag.id)}
                        size="small"
                        disabled={isSaving}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[var(--color-border)]">
                  <div className="p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Selecionadas</p>
                    <p className="text-lg font-bold text-[var(--color-text)]">{selectedTags.length}</p>
                  </div>
                  <div className="p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Disponíveis</p>
                    <p className="text-lg font-bold text-[var(--color-text)]">{MAX_TAGS - selectedTags.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Unsaved Changes Indicator */}
            <AnimatePresence>
              {hasChanges && !showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 p-3 rounded-[var(--border-radius-sm)] bg-yellow-500/10 border border-yellow-500/30"
                >
                  <AlertCircle size={16} className="text-yellow-400" />
                  <span className="text-sm text-yellow-400">Você tem alterações não salvas</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 p-3 rounded-[var(--border-radius-sm)] bg-green-500/10 border border-green-500/30"
                >
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-green-400">Tags salvas com sucesso!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button */}
            <motion.button
              onClick={handleSave}
              disabled={isSaving || isLoading || !hasChanges}
              className="
                w-full mt-4 px-4 py-3 rounded-[var(--border-radius-md)]
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
                text-white font-medium transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
              whileHover={isSaving || !hasChanges ? {} : { scale: 1.02 }}
              whileTap={isSaving || !hasChanges ? {} : { scale: 0.98 }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {hasChanges ? "Salvar Tags" : "Nenhuma alteração"}
                </>
              )}
            </motion.button>
          </TagsCard>

          {/* Quick Stats */}
          <TagsCard>
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">Tags disponíveis</span>
                <span className="text-sm font-medium text-[var(--color-text)]">{allTags.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">Suas tags</span>
                <span className="text-sm font-medium text-[var(--color-text)]">{selectedTags.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">Limite máximo</span>
                <span className="text-sm font-medium text-[var(--color-text)]">{MAX_TAGS}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">Categorias</span>
                <span className="text-sm font-medium text-[var(--color-text)]">{categories.length}</span>
              </div>
            </div>
          </TagsCard>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardTags;