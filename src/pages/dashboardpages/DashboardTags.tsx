// pages/Tags/Tags.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  ChevronRight,
  Search,
  Crown,
  Lock,
  Check,
  Sparkles,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Heart,
  Briefcase,
  Gamepad2,
  Film,
  Users,
  Smile,
  Globe,
  Dumbbell,
  AlertCircle,
  CheckCircle,
  Eye,
  RotateCcw,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface TagItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  isPremium: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

// ═══════════════════════════════════════════════════════════
// DADOS
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

const allTags: TagItem[] = [
  // Personalidade
  { id: "1", name: "Paz", emoji: "☮️", category: "personality", isPremium: false },
  { id: "2", name: "Bonito(a)", emoji: "✨", category: "personality", isPremium: true },
  { id: "3", name: "Picante", emoji: "🌶️", category: "personality", isPremium: true },
  { id: "4", name: "Adorável", emoji: "🥰", category: "personality", isPremium: false },
  { id: "5", name: "Perigoso(a)", emoji: "⚠️", category: "personality", isPremium: true },
  { id: "6", name: "Provocante", emoji: "😏", category: "personality", isPremium: true },
  { id: "7", name: "Frio", emoji: "🥶", category: "personality", isPremium: false },
  { id: "8", name: "Pensativo(a)", emoji: "🤔", category: "personality", isPremium: false },
  { id: "9", name: "Comunicativo(a)", emoji: "🗣️", category: "personality", isPremium: false },
  { id: "10", name: "Apaixonado(a)", emoji: "😍", category: "personality", isPremium: true },
  { id: "11", name: "Tímido(a)", emoji: "😊", category: "personality", isPremium: false },
  { id: "12", name: "Triste", emoji: "😢", category: "personality", isPremium: false },
  { id: "13", name: "Bravo(a)", emoji: "😤", category: "personality", isPremium: false },
  { id: "14", name: "Amigável", emoji: "🤗", category: "personality", isPremium: false },
  { id: "15", name: "Tóxico(a)", emoji: "☠️", category: "personality", isPremium: true },
  { id: "16", name: "Anjo(a)", emoji: "😇", category: "personality", isPremium: true },
  { id: "17", name: "Palhaço(a)", emoji: "🤡", category: "personality", isPremium: false },

  // Profissão
  { id: "18", name: "Programador", emoji: "💻", category: "profession", isPremium: false },
  { id: "19", name: "Artista", emoji: "🎨", category: "profession", isPremium: false },
  { id: "20", name: "Designer", emoji: "🖌️", category: "profession", isPremium: false },
  { id: "21", name: "Escritor", emoji: "✍️", category: "profession", isPremium: false },
  { id: "22", name: "Investidor", emoji: "📈", category: "profession", isPremium: true },
  { id: "23", name: "Músico", emoji: "🎵", category: "profession", isPremium: false },
  { id: "24", name: "Fotógrafo", emoji: "📸", category: "profession", isPremium: false },
  { id: "25", name: "Produtor(a)", emoji: "🎬", category: "profession", isPremium: true },
  { id: "26", name: "Construtor(a)", emoji: "🔧", category: "profession", isPremium: false },
  { id: "27", name: "Cybersecurity", emoji: "🔐", category: "profession", isPremium: true },
  { id: "28", name: "Negócios", emoji: "💼", category: "profession", isPremium: true },
  { id: "29", name: "Ciência", emoji: "🔬", category: "profession", isPremium: false },

  // Hobbies & Esportes
  { id: "30", name: "Ar Livre", emoji: "🏕️", category: "hobbies", isPremium: false },
  { id: "31", name: "Academia", emoji: "💪", category: "hobbies", isPremium: false },
  { id: "32", name: "Leitor", emoji: "📚", category: "hobbies", isPremium: false },
  { id: "33", name: "Atleta", emoji: "🏃", category: "hobbies", isPremium: false },
  { id: "34", name: "Viagem", emoji: "✈️", category: "hobbies", isPremium: true },
  { id: "35", name: "Skatista", emoji: "🛹", category: "hobbies", isPremium: false },
  { id: "36", name: "Basquete", emoji: "🏀", category: "hobbies", isPremium: false },
  { id: "37", name: "Boliche", emoji: "🎳", category: "hobbies", isPremium: false },
  { id: "38", name: "Surfista", emoji: "🏄", category: "hobbies", isPremium: true },
  { id: "39", name: "Futebol", emoji: "⚽", category: "hobbies", isPremium: false },

  // Entretenimento
  { id: "40", name: "Bebida", emoji: "🍻", category: "entertainment", isPremium: false },
  { id: "41", name: "Comida", emoji: "🍕", category: "entertainment", isPremium: false },
  { id: "42", name: "Filmes", emoji: "🎬", category: "entertainment", isPremium: false },
  { id: "43", name: "Seriados", emoji: "📺", category: "entertainment", isPremium: false },
  { id: "44", name: "Fumante", emoji: "🚬", category: "entertainment", isPremium: false },
  { id: "45", name: "Animais", emoji: "🐾", category: "entertainment", isPremium: false },

  // Status & Lifestyle
  { id: "46", name: "Namorando", emoji: "💑", category: "status", isPremium: false },
  { id: "47", name: "Solteiro(a)", emoji: "💔", category: "status", isPremium: false },
  { id: "48", name: "Insônia", emoji: "🌙", category: "status", isPremium: false },
  { id: "49", name: "Lgbt", emoji: "🏳️‍🌈", category: "status", isPremium: false },
  { id: "50", name: "Verão", emoji: "☀️", category: "status", isPremium: false },

  // Jogos
  { id: "51", name: "Gamer", emoji: "🎮", category: "games", isPremium: false },
  { id: "52", name: "League Of Legends", emoji: "⚔️", category: "games", isPremium: true },
  { id: "53", name: "Valorant", emoji: "🔫", category: "games", isPremium: true },
  { id: "54", name: "Counter-Strike 2", emoji: "💣", category: "games", isPremium: true },
  { id: "55", name: "Paladins", emoji: "🛡️", category: "games", isPremium: false },
  { id: "56", name: "Dota 2", emoji: "🗡️", category: "games", isPremium: true },
  { id: "57", name: "Fortnite", emoji: "🏗️", category: "games", isPremium: false },
  { id: "58", name: "Grand Theft Auto V", emoji: "🚗", category: "games", isPremium: true },
  { id: "59", name: "Habbo", emoji: "🏨", category: "games", isPremium: false },

  // Outros
  { id: "60", name: "Brasil", emoji: "🇧🇷", category: "other", isPremium: false },
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

// Tag Chip Component
const TagChip = ({
  tag,
  isSelected,
  isPremium,
  isLocked,
  onClick,
  size = "normal",
}: {
  tag: TagItem;
  isSelected: boolean;
  isPremium: boolean;
  isLocked: boolean;
  onClick: () => void;
  size?: "small" | "normal";
}) => {
  const sizeClasses = size === "small" 
    ? "px-2 py-1 text-xs gap-1" 
    : "px-3 py-2 text-sm gap-2";

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative flex items-center ${sizeClasses} rounded-full font-medium
        transition-all duration-300 group
        ${isLocked
          ? "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-60"
          : isSelected
            ? "bg-[var(--color-primary)] border border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25"
            : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-hover)]"
        }
      `}
      whileHover={isLocked ? {} : { scale: 1.05 }}
      whileTap={isLocked ? {} : { scale: 0.95 }}
      layout
    >
      {/* Emoji */}
      <span className={size === "small" ? "text-sm" : "text-base"}>{tag.emoji}</span>
      
      {/* Name */}
      <span className="truncate max-w-[120px]">{tag.name}</span>

      {/* Premium/Selected Icon */}
      {isLocked ? (
        <Lock size={size === "small" ? 10 : 12} className="text-[var(--color-text-muted)]" />
      ) : isPremium && !isSelected ? (
        <Crown size={size === "small" ? 10 : 12} className="text-yellow-400" />
      ) : isSelected ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Check size={size === "small" ? 8 : 10} />
        </motion.div>
      ) : null}

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
  isPremiumUser,
  onTagClick,
  isExpanded,
  onToggle,
}: {
  category: Category;
  tags: TagItem[];
  selectedTags: string[];
  isPremiumUser: boolean;
  onTagClick: (tagId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const Icon = category.icon;
  const selectedInCategory = tags.filter((t) => selectedTags.includes(t.id)).length;

  return (
    <motion.div
      layout
      className="border border-[var(--color-border)] rounded-[var(--border-radius-md)] overflow-hidden"
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
                    isPremium={tag.isPremium}
                    isLocked={tag.isPremium && !isPremiumUser}
                    onClick={() => onTagClick(tag.id)}
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

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardTags = () => {
  // Estados
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["personality"]);
  const [isPremium] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "free" | "premium">("all");

  const MAX_TAGS = isPremium ? 10 : 5;

  // Filtrar tags baseado na busca e filtro ativo
  const filteredTags = useMemo(() => {
    return allTags.filter((tag) => {
      const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "free" && !tag.isPremium) ||
        (activeFilter === "premium" && tag.isPremium);
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  // Agrupar tags por categoria
  const tagsByCategory = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      tags: filteredTags.filter((tag) => tag.category === category.id),
    }));
  }, [filteredTags]);

  // Handler para selecionar/deselecionar tag
  const handleTagClick = (tagId: string) => {
    const tag = allTags.find((t) => t.id === tagId);
    if (!tag) return;

    // Verificar se é premium e usuário não é premium
    if (tag.isPremium && !isPremium) return;

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

  // Salvar alterações
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Obter tags selecionadas como objetos
  const selectedTagObjects = selectedTags.map((id) => allTags.find((t) => t.id === id)!).filter(Boolean);

  // Contar tags premium selecionadas
  const premiumTagsSelected = selectedTagObjects.filter((t) => t.isPremium).length;
  const freeTagsSelected = selectedTagObjects.filter((t) => !t.isPremium).length;

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
            Escolha as cores de seu perfil, e insira as tags que mais se identifica.
          </h1>
        </motion.div>
      </div>

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
                  className="
                    w-full pl-10 pr-4 py-2.5 rounded-[var(--border-radius-md)]
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
                    focus:border-[var(--color-primary)] transition-all
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

              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { key: "all", label: "Todas" },
                  { key: "free", label: "Grátis" },
                  { key: "premium", label: "Premium" },
                ].map((filter) => (
                  <motion.button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                    className={`
                      px-3 py-2 rounded-[var(--border-radius-sm)] text-xs sm:text-sm font-medium
                      transition-all duration-300 flex items-center gap-1.5
                      ${activeFilter === filter.key
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filter.key === "premium" && <Crown size={12} />}
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Expand/Collapse All */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
              <motion.button
                onClick={expandAll}
                className="px-3 py-1.5 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-xs font-medium transition-colors flex items-center gap-1.5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronDown size={14} />
                Expandir Todas
              </motion.button>
              <motion.button
                onClick={collapseAll}
                className="px-3 py-1.5 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] text-xs font-medium transition-colors flex items-center gap-1.5"
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
                      isPremiumUser={isPremium}
                      onTagClick={handleTagClick}
                      isExpanded={expandedCategories.includes(category.id)}
                      onToggle={() => toggleCategory(category.id)}
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
                selectedTags.length > 0 && (
                  <motion.button
                    onClick={clearSelection}
                    className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Limpar seleção"
                  >
                    <RotateCcw size={16} />
                  </motion.button>
                )
              }
            />

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    selectedTags.length >= MAX_TAGS
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
            {selectedTags.length === 0 ? (
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
                        isPremium={tag.isPremium}
                        isLocked={false}
                        onClick={() => handleTagClick(tag.id)}
                        size="small"
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[var(--color-border)]">
                  <div className="p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Tags Grátis</p>
                    <p className="text-lg font-bold text-[var(--color-text)]">{freeTagsSelected}</p>
                  </div>
                  <div className="p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)]">
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                      <Crown size={10} className="text-yellow-400" />
                      Premium
                    </p>
                    <p className="text-lg font-bold text-[var(--color-text)]">{premiumTagsSelected}</p>
                  </div>
                </div>
              </div>
            )}

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
              disabled={isSaving || selectedTags.length === 0}
              className="
                w-full mt-4 px-4 py-3 rounded-[var(--border-radius-md)]
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
                text-white font-medium transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
              whileHover={isSaving ? {} : { scale: 1.02 }}
              whileTap={isSaving ? {} : { scale: 0.98 }}
            >
              {isSaving ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Salvar Tags
                </>
              )}
            </motion.button>
          </TagsCard>

          {/* Premium Upgrade Card */}
          {!isPremium && (
            <TagsCard className="relative overflow-hidden border-[var(--color-primary)]/30">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-secondary)]/5 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-[var(--border-radius-sm)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
                    <Crown size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">
                      Desbloqueie mais tags!
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Usuários Premium podem selecionar até 10 tags
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <Sparkles size={12} className="text-[var(--color-primary)]" />
                    <span>Acesso a tags exclusivas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <Sparkles size={12} className="text-[var(--color-primary)]" />
                    <span>Limite de 10 tags no perfil</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <Sparkles size={12} className="text-[var(--color-primary)]" />
                    <span>Destaque visual especial</span>
                  </div>
                </div>

                <motion.button
                  className="w-full px-4 py-2.5 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/25"
                  whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(143, 124, 255, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Obter Premium
                </motion.button>
              </div>
            </TagsCard>
          )}

          {/* Quick Stats */}
          <TagsCard>
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">Tags disponíveis</span>
                <span className="text-sm font-medium text-[var(--color-text)]">{allTags.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">Tags grátis</span>
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {allTags.filter((t) => !t.isPremium).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <Crown size={10} className="text-yellow-400" />
                  Tags premium
                </span>
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {allTags.filter((t) => t.isPremium).length}
                </span>
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