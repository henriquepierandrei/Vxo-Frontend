// pages/Links/Links.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon,
  Plus,
  ChevronRight,
  ExternalLink,
  Trash2,
  Edit3,
  GripVertical,
  Globe,
  AlertCircle,
  CheckCircle,
  X,
  Copy,
  Check,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface UserLink {
  id: string;
  name: string;
  url: string;
  clicks: number;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

// Input Component
const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  maxLength,
  helperText,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  error?: string;
  maxLength?: number;
  helperText?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      {maxLength && (
        <span className={`text-xs ${value.length >= maxLength ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
          {value.length}/{maxLength}
        </span>
      )}
    </div>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-[var(--border-radius-md)]
          bg-[var(--color-surface)] border transition-all duration-300
          text-[var(--color-text)] placeholder-[var(--color-text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
          ${Icon ? "pl-10" : ""}
          ${error 
            ? "border-red-500/50 focus:border-red-500" 
            : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
          }
        `}
      />
    </div>
    {helperText && !error && (
      <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
    )}
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
);

// Card Component
const LinksCard = ({
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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
    <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
      <Icon size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)]" />
    </div>
    <div className="min-w-0">
      <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1">{description}</p>
    </div>
  </div>
);

// Modal Component
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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="
            w-full max-w-md
            bg-[var(--color-background)] backdrop-blur-[var(--blur-amount)]
            border border-[var(--color-border)] rounded-[var(--border-radius-xl)]
            shadow-2xl overflow-hidden
          ">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">{title}</h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Link Item Component
const LinkItem = ({
  link,
  onEdit,
  onDelete,
  onCopy,
}: {
  link: UserLink;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extrair domínio da URL
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="
        group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 
        p-3 sm:p-4 rounded-[var(--border-radius-md)]
        bg-[var(--color-surface)] border border-[var(--color-border)]
        hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30
        transition-all duration-300
      "
    >
      {/* Drag Handle & Info */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <motion.div 
          className="hidden sm:flex p-1.5 rounded cursor-grab text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
          whileHover={{ scale: 1.1 }}
        >
          <GripVertical size={18} />
        </motion.div>

        <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)]/10 flex-shrink-0">
          <Globe size={18} className="text-[var(--color-primary)]" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[var(--color-text)] truncate">
            {link.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {getDomain(link.url)}
            </p>
            <span className="text-xs text-[var(--color-text-muted)]">•</span>
            <span className="text-xs text-[var(--color-primary)]">
              {link.clicks} cliques
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 justify-end">
        {/* Copy Button */}
        <motion.button
          onClick={handleCopy}
          className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Copiar link"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </motion.button>

        {/* Visit Link */}
        <motion.a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Visitar link"
        >
          <ExternalLink size={16} />
        </motion.a>

        {/* Edit Button */}
        <motion.button
          onClick={onEdit}
          className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Editar link"
        >
          <Edit3 size={16} />
        </motion.button>

        {/* Delete Button */}
        <motion.button
          onClick={onDelete}
          className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Excluir link"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 sm:py-16"
  >
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
      <LinkIcon size={28} className="sm:w-8 sm:h-8 text-[var(--color-text-muted)]" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)] mb-2">
      Nenhum link adicionado
    </h3>
    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] text-center max-w-xs">
      Você não possui links atualmente, adicione seu primeiro!
    </p>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardLinks = () => {
  // Estados
  const [links, setLinks] = useState<UserLink[]>([
    // Exemplo de links (remova para estado vazio inicial)
    // {
    //   id: "1",
    //   name: "Meu Portfólio",
    //   url: "https://meuportfolio.com",
    //   clicks: 142,
    //   createdAt: "2024-01-15",
    // },
  ]);

  const [linkForm, setLinkForm] = useState({
    name: "",
    url: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Estados do Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<UserLink | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    url: "",
  });

  // Estados do Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<UserLink | null>(null);

  // Validação de URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handler para adicionar link
  const handleSubmit = async () => {
    setFormErrors({});

    const errors: Record<string, string> = {};

    if (!linkForm.name.trim()) {
      errors.name = "Digite o nome do link";
    }

    if (!linkForm.url.trim()) {
      errors.url = "Digite a URL do link";
    } else if (!isValidUrl(linkForm.url)) {
      errors.url = "URL inválida. Exemplo: https://exemplo.com";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newLink: UserLink = {
      id: Date.now().toString(),
      name: linkForm.name.trim(),
      url: linkForm.url.trim(),
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    setLinks((prev) => [...prev, newLink]);
    setLinkForm({ name: "", url: "" });
    setIsSubmitting(false);
    setSuccessMessage("Link adicionado com sucesso!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Handler para editar link
  const handleEdit = (link: UserLink) => {
    setEditingLink(link);
    setEditForm({ name: link.name, url: link.url });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingLink) return;

    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!editForm.name.trim()) {
      errors.editName = "Digite o nome do link";
    }

    if (!editForm.url.trim()) {
      errors.editUrl = "Digite a URL do link";
    } else if (!isValidUrl(editForm.url)) {
      errors.editUrl = "URL inválida";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLinks((prev) =>
      prev.map((link) =>
        link.id === editingLink.id
          ? { ...link, name: editForm.name.trim(), url: editForm.url.trim() }
          : link
      )
    );

    setIsSubmitting(false);
    setIsEditModalOpen(false);
    setEditingLink(null);
    setEditForm({ name: "", url: "" });
  };

  // Handler para excluir link
  const handleDelete = (link: UserLink) => {
    setDeletingLink(link);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingLink) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setLinks((prev) => prev.filter((link) => link.id !== deletingLink.id));

    setIsSubmitting(false);
    setIsDeleteModalOpen(false);
    setDeletingLink(null);
  };

  // Handler para copiar link
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
          <span>Widgets</span>
          <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
          <span className="text-[var(--color-text)]">Links</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <LinkIcon className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            Divulgue os links mais importantes em seu perfil.
          </h1>
        </motion.div>
      </div>

      {/* Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* Adicionar Link */}
        <motion.div variants={itemVariants}>
          <LinksCard>
            <SectionHeader
              icon={Plus}
              title="Links"
              description="Adicione seus principais links ao seu perfil. Portfólios, Redes e outros..."
            />

            <div className="space-y-4">
              <Input
                label="Nome do Link"
                placeholder="Ex: Portfólio"
                value={linkForm.name}
                onChange={(value) => setLinkForm({ ...linkForm, name: value })}
                icon={Edit3}
                error={formErrors.name}
                maxLength={50}
                helperText="Nome exibido no link em seu perfil"
              />

              <Input
                label="URL do seu Link"
                type="url"
                placeholder="https://youtube.com"
                value={linkForm.url}
                onChange={(value) => setLinkForm({ ...linkForm, url: value })}
                icon={Globe}
                error={formErrors.url}
                helperText="Link do site que deseja divulgar em seu perfil"
              />

              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 rounded-[var(--border-radius-sm)] bg-green-500/10 border border-green-500/30"
                  >
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm text-green-400">{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="
                  w-full px-4 py-3 rounded-[var(--border-radius-md)]
                  bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
                  text-white font-medium text-sm sm:text-base
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                "
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Enviar
                  </>
                )}
              </motion.button>
            </div>
          </LinksCard>
        </motion.div>

        {/* Seus Links */}
        <motion.div variants={itemVariants}>
          <LinksCard>
            <SectionHeader
              icon={LinkIcon}
              title="Seus Links"
              description="Aqui você poderá gerenciar seus links."
            />

            {links.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {links.map((link) => (
                    <LinkItem
                      key={link.id}
                      link={link}
                      onEdit={() => handleEdit(link)}
                      onDelete={() => handleDelete(link)}
                      onCopy={() => handleCopy(link.url)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Links Count */}
            {links.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between"
              >
                <span className="text-xs text-[var(--color-text-muted)]">
                  {links.length} {links.length === 1 ? "link" : "links"} adicionado{links.length !== 1 && "s"}
                </span>
                <span className="text-xs text-[var(--color-primary)]">
                  {links.reduce((acc, link) => acc + link.clicks, 0)} cliques totais
                </span>
              </motion.div>
            )}
          </LinksCard>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODAL: Editar Link */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLink(null);
          setEditForm({ name: "", url: "" });
          setFormErrors({});
        }}
        title="Editar Link"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Link"
            placeholder="Ex: Portfólio"
            value={editForm.name}
            onChange={(value) => setEditForm({ ...editForm, name: value })}
            icon={Edit3}
            error={formErrors.editName}
            maxLength={50}
          />

          <Input
            label="URL do seu Link"
            type="url"
            placeholder="https://youtube.com"
            value={editForm.url}
            onChange={(value) => setEditForm({ ...editForm, url: value })}
            icon={Globe}
            error={formErrors.editUrl}
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <motion.button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingLink(null);
                setEditForm({ name: "", url: "" });
                setFormErrors({});
              }}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleEditSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={isSubmitting ? {} : { scale: 1.02 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODAL: Confirmar Exclusão */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLink(null);
        }}
        title="Excluir Link"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-[var(--border-radius-md)] bg-red-500/10 border border-red-500/30">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--color-text)]">
                Tem certeza que deseja excluir este link?
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          {deletingLink && (
            <div className="p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)]">
              <p className="text-sm font-medium text-[var(--color-text)]">{deletingLink.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{deletingLink.url}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <motion.button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingLink(null);
              }}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-red-500 hover:bg-red-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={isSubmitting ? {} : { scale: 1.02 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Excluir Link
                </>
              )}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardLinks;