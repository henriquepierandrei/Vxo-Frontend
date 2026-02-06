import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectSocialNetwork, getSocialNetworkName } from "../../utils/socialUtils";

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
  Loader2,
  RefreshCw,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { linkService } from "../../services/linkService";
import {
  extractDomainInfo,
  isValidUrl,
  normalizeUrl,
  getKnownDomainInfo,
} from "../../utils/linkUtils";
import type { UserLinkResponse } from "../../types/links.types";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface UserLink {
  id: string;
  url: string;
  domain: string;
  displayName: string;
  favicon: string;
  hasLinkTyped: boolean;
  linkTypeId: number | null;
}

// ═══════════════════════════════════════════════════════════
// DOMÍNIOS DE REDES SOCIAIS BLOQUEADOS
// (Se o usuário tentar adicionar, é redirecionado para Redes Sociais)
// ═══════════════════════════════════════════════════════════

const SOCIAL_NETWORK_DOMAINS: Record<string, string> = {
  // Instagram
  "instagram.com": "Instagram",
  "www.instagram.com": "Instagram",
  // Snapchat
  "snapchat.com": "Snapchat",
  "www.snapchat.com": "Snapchat",
  // YouTube
  "youtube.com": "YouTube",
  "www.youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "m.youtube.com": "YouTube",
  // Discord
  "discord.com": "Discord",
  "discord.gg": "Discord",
  "discordapp.com": "Discord",
  // Facebook
  "facebook.com": "Facebook",
  "www.facebook.com": "Facebook",
  "fb.com": "Facebook",
  "m.facebook.com": "Facebook",
  // Twitter / X
  "twitter.com": "Twitter",
  "www.twitter.com": "Twitter",
  "x.com": "Twitter",
  "www.x.com": "Twitter",
  // TikTok
  "tiktok.com": "TikTok",
  "www.tiktok.com": "TikTok",
  "vm.tiktok.com": "TikTok",
  // Last.fm
  "last.fm": "Last.fm",
  "www.last.fm": "Last.fm",
  "lastfm.com": "Last.fm",
  // Steam
  "steamcommunity.com": "Steam",
  "store.steampowered.com": "Steam",
  "steampowered.com": "Steam",
  // GitHub
  "github.com": "GitHub",
  "www.github.com": "GitHub",
  // Spotify
  "spotify.com": "Spotify",
  "open.spotify.com": "Spotify",
  // Twitch
  "twitch.tv": "Twitch",
  "www.twitch.tv": "Twitch",
  // Soundcloud
  "soundcloud.com": "Soundcloud",
  "www.soundcloud.com": "Soundcloud",
  // WhatsApp
  "whatsapp.com": "WhatsApp",
  "wa.me": "WhatsApp",
  "api.whatsapp.com": "WhatsApp",
  // Telegram
  "telegram.org": "Telegram",
  "t.me": "Telegram",
  "telegram.me": "Telegram",
  // Battle.net
  "battle.net": "BattleNet",
  "blizzard.com": "BattleNet",
  // LinkedIn
  "linkedin.com": "LinkedIn",
  "www.linkedin.com": "LinkedIn",
  // PayPal
  "paypal.com": "PayPal",
  "paypal.me": "PayPal",
  "www.paypal.com": "PayPal",
  // Xbox
  "xbox.com": "Xbox",
  "www.xbox.com": "Xbox",
  // Pinterest
  "pinterest.com": "Pinterest",
  "www.pinterest.com": "Pinterest",
  "br.pinterest.com": "Pinterest",
  // Letterboxd
  "letterboxd.com": "Letterboxd",
  "www.letterboxd.com": "Letterboxd",
  // Tumblr
  "tumblr.com": "Tumblr",
  "www.tumblr.com": "Tumblr",
  // VSCO
  "vsco.co": "VSCO",
  "www.vsco.co": "VSCO",
  // OnlyFans
  "onlyfans.com": "OnlyFans",
  "www.onlyfans.com": "OnlyFans",
  // Bluesky
  "bsky.app": "Bluesky",
  "bsky.social": "Bluesky",
  // Threads
  "threads.net": "Threads",
  "www.threads.net": "Threads",
  // Roblox
  "roblox.com": "Roblox",
  "www.roblox.com": "Roblox",
  "web.roblox.com": "Roblox",
  // Patreon
  "patreon.com": "Patreon",
  "www.patreon.com": "Patreon",
  // Privacy
  "privacy.com.br": "Privacy",
  "www.privacy.com.br": "Privacy",
  // FiveM
  "cfx.re": "FiveM",
  "fivem.net": "FiveM",
  // iFood
  "ifood.com.br": "iFood",
  "www.ifood.com.br": "iFood",
  // Gmail
  "gmail.com": "Gmail",
  "mail.google.com": "Gmail",
  // NameMC
  "namemc.com": "NameMC",
  "www.namemc.com": "NameMC",
};

/**
 * Verifica se a URL pertence a uma rede social predefinida.
 * Retorna o nome da rede social ou null.
 */
const getSocialNetworkFromUrl = (url: string): string | null => {
  const networkId = detectSocialNetwork(url);
  if (!networkId) return null;
  
  return getSocialNetworkName(url);
};

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

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
  disabled = false,
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
  disabled?: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      {maxLength && (
        <span
          className={`text-xs ${
            value.length >= maxLength ? "text-red-400" : "text-[var(--color-text-muted)]"
          }`}
        >
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
        onChange={(e) =>
          onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)
        }
        maxLength={maxLength}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-[var(--border-radius-md)]
          bg-[var(--color-surface)] border transition-all duration-300
          text-[var(--color-text)] placeholder-[var(--color-text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${Icon ? "pl-10" : ""}
          ${
            error
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
    className={`bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-6 ${className}`}
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
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
        <Icon size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)]" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1">
          {description}
        </p>
      </div>
    </div>
    {action}
  </div>
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
          <div
            className="
              w-full max-w-md
              bg-[var(--color-background)] backdrop-blur-[var(--blur-amount)]
              border border-[var(--color-border)] rounded-[var(--border-radius-xl)]
              shadow-2xl overflow-hidden
            "
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-border)]">
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

const FaviconImage = ({
  url,
  domain,
  size = 32,
}: {
  url: string;
  domain: string;
  size?: number;
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const knownInfo = getKnownDomainInfo(domain);

  return (
    <div
      className="relative flex items-center justify-center rounded-[var(--border-radius-sm)] overflow-hidden flex-shrink-0"
      style={{
        width: size + 8,
        height: size + 8,
        backgroundColor: knownInfo?.color ? `${knownInfo.color}20` : "var(--color-primary-10)",
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
          <Globe
            size={size * 0.6}
            className="text-[var(--color-text-muted)] animate-pulse"
          />
        </div>
      )}

      {!hasError ? (
        <img
          src={url}
          alt={`${domain} favicon`}
          width={size}
          height={size}
          className={`object-contain transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <Globe
          size={size * 0.6}
          className="text-[var(--color-text-muted)]"
          style={{ color: knownInfo?.color || "var(--color-primary)" }}
        />
      )}
    </div>
  );
};

const LinkItem = ({
  link,
  onEdit,
  onDelete,
  onCopy,
  disabled,
}: {
  link: UserLink;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  disabled: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const knownInfo = getKnownDomainInfo(link.domain);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        group flex flex-col sm:flex-row sm:items-center justify-between
        gap-3 sm:gap-4 p-3 sm:p-4 rounded-[var(--border-radius-md)]
        bg-[var(--color-surface)] border border-[var(--color-border)]
        hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30
        transition-all duration-300
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <motion.div
          className="hidden sm:flex p-1.5 rounded cursor-grab text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
          whileHover={{ scale: 1.1 }}
        >
          <GripVertical size={18} />
        </motion.div>

        <FaviconImage url={link.favicon} domain={link.domain} size={24} />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[var(--color-text)] truncate">
            {knownInfo?.name || link.displayName}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
            {link.domain}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 justify-end">
        <motion.button
          onClick={handleCopy}
          disabled={disabled}
          className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Copiar link"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </motion.button>

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

        <motion.button
          onClick={onEdit}
          disabled={disabled}
          className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Editar link"
        >
          <Edit3 size={16} />
        </motion.button>

        <motion.button
          onClick={onDelete}
          disabled={disabled}
          className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-background)] hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-all disabled:opacity-50"
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

const LoadingSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-16 bg-[var(--color-surface)] rounded-[var(--border-radius-md)] border border-[var(--color-border)]"
      />
    ))}
  </div>
);

const LinkPreview = ({ url }: { url: string }) => {
  if (!url || !isValidUrl(url)) return null;

  const info = extractDomainInfo(url);
  const knownInfo = getKnownDomainInfo(info.domain);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]"
    >
      <FaviconImage url={info.favicon} domain={info.domain} size={20} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">
          {knownInfo?.name || info.displayName}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{info.domain}</p>
      </div>
      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE: Alerta de Rede Social Detectada
// ═══════════════════════════════════════════════════════════

const SocialNetworkAlert = ({
  networkName
}: {
  networkName: string;
  onGoToSocials: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex flex-col gap-3 p-4 rounded-[var(--border-radius-md)] bg-amber-500/10 border border-amber-500/30"
  >
    <div className="flex items-start gap-3">
      <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--color-text)]">
          Link de rede social detectado
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          O link que você está tentando adicionar pertence ao{" "}
          <span className="font-semibold text-amber-400">{networkName}</span>. Links de redes
          sociais predefinidas devem ser adicionados na seção de{" "}
          <span className="font-semibold text-amber-400">Redes Sociais</span>.
        </p>
      </div>
    </div>
    <motion.button
      onClick={() => window.location.href = "/dashboard/socialmedia"}
      className="
        w-full px-4 py-2.5 rounded-[var(--border-radius-md)]
        bg-amber-500/20 hover:bg-amber-500/30
        text-amber-400 font-medium text-sm
        transition-all duration-300
        flex items-center justify-center gap-2
        border border-amber-500/30
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Share2 size={16} />
      Ir para Redes Sociais
    </motion.button>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardLinks = () => {
  const navigate = useNavigate();

  // Estados
  const [links, setLinks] = useState<UserLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [linkForm, setLinkForm] = useState({ url: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estado para rede social detectada
  const [detectedSocialNetwork, setDetectedSocialNetwork] = useState<string | null>(null);

  // Estados do Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<UserLink | null>(null);
  const [editForm, setEditForm] = useState({ url: "" });
  const [editDetectedSocial, setEditDetectedSocial] = useState<string | null>(null);

  // Estados do Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<UserLink | null>(null);

  // Transformar response do backend em UserLink
  const transformLink = (linkResponse: UserLinkResponse): UserLink => {
    const info = extractDomainInfo(linkResponse.url);
    return {
      id: linkResponse.linkId,
      url: linkResponse.url,
      domain: info.domain,
      displayName: info.displayName,
      favicon: info.favicon,
      hasLinkTyped: linkResponse.hasLinkTyped,
      linkTypeId: linkResponse.linkTypeId,
    };
  };

  // Carregar links do usuário
  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await linkService.getUserLinks();
      const transformedLinks = response.links.map(transformLink);
      setLinks(transformedLinks);
    } catch (err: any) {
      console.error("Erro ao carregar links:", err);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError("Erro ao carregar seus links. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // ✅ Detectar rede social enquanto o usuário digita no formulário principal
  const handleUrlChange = (value: string) => {
    setLinkForm({ url: value });
    setFormErrors({});

    if (value.trim() && isValidUrl(value)) {
      const socialName = getSocialNetworkFromUrl(value);
      setDetectedSocialNetwork(socialName);
    } else {
      setDetectedSocialNetwork(null);
    }
  };

  // ✅ Detectar rede social enquanto edita
  const handleEditUrlChange = (value: string) => {
    setEditForm({ url: value });
    setFormErrors({});

    if (value.trim() && isValidUrl(value)) {
      const socialName = getSocialNetworkFromUrl(value);
      setEditDetectedSocial(socialName);
    } else {
      setEditDetectedSocial(null);
    }
  };

  // Navegar para seção de redes sociais
  const goToSocialNetworks = () => {
    navigate("/dashboard/social"); // Ajuste a rota conforme seu projeto
  };

  // Handler para adicionar link
  const handleSubmit = async () => {
    setFormErrors({});
    setError(null);

    const errors: Record<string, string> = {};

    if (!linkForm.url.trim()) {
      errors.url = "Digite a URL do link";
    } else if (!isValidUrl(linkForm.url)) {
      errors.url = "URL inválida. Exemplo: https://exemplo.com ou exemplo.com";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // ✅ Verificar se é uma rede social predefinida
    const socialNetwork = getSocialNetworkFromUrl(linkForm.url);
    if (socialNetwork) {
      setDetectedSocialNetwork(socialNetwork);
      setFormErrors({
        url: `Este link pertence ao "${socialNetwork}". Use a seção de Redes Sociais.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedUrl = normalizeUrl(linkForm.url.trim());
      await linkService.addLink(normalizedUrl);

      setLinkForm({ url: "" });
      setDetectedSocialNetwork(null);
      setSuccessMessage("Link adicionado com sucesso!");

      await loadLinks();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      console.error("Erro ao adicionar link:", err);

      if (err.response?.status === 400) {
        setFormErrors({ url: err.response.data?.message || "URL inválida" });
      } else if (err.response?.status === 409) {
        setFormErrors({ url: "Este link já foi adicionado" });
      } else {
        setError(err.response?.data?.message || "Erro ao adicionar link. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para editar link
  const handleEdit = (link: UserLink) => {
    setEditingLink(link);
    setEditForm({ url: link.url });
    setFormErrors({});
    setEditDetectedSocial(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingLink) return;

    setFormErrors({});

    const errors: Record<string, string> = {};

    if (!editForm.url.trim()) {
      errors.editUrl = "Digite a URL do link";
    } else if (!isValidUrl(editForm.url)) {
      errors.editUrl = "URL inválida";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // ✅ Verificar se é uma rede social predefinida
    const socialNetwork = getSocialNetworkFromUrl(editForm.url);
    if (socialNetwork) {
      setEditDetectedSocial(socialNetwork);
      setFormErrors({
        editUrl: `Este link pertence ao "${socialNetwork}". Use a seção de Redes Sociais.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedUrl = normalizeUrl(editForm.url.trim());
      await linkService.updateLink(editingLink.id, normalizedUrl);

      setLinks((prev) =>
        prev.map((link) => {
          if (link.id === editingLink.id) {
            const info = extractDomainInfo(normalizedUrl);
            return {
              ...link,
              url: normalizedUrl,
              domain: info.domain,
              displayName: info.displayName,
              favicon: info.favicon,
            };
          }
          return link;
        })
      );

      setIsEditModalOpen(false);
      setEditingLink(null);
      setEditForm({ url: "" });
      setEditDetectedSocial(null);
    } catch (err: any) {
      console.error("Erro ao atualizar link:", err);
      setFormErrors({ editUrl: err.response?.data?.message || "Erro ao atualizar link" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para excluir link
  const handleDelete = (link: UserLink) => {
    setDeletingLink(link);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingLink) return;

    setIsSubmitting(true);

    try {
      await linkService.deleteLink(deletingLink.id);

      setLinks((prev) => prev.filter((link) => link.id !== deletingLink.id));
      setIsDeleteModalOpen(false);
      setDeletingLink(null);
    } catch (err: any) {
      console.error("Erro ao deletar link:", err);
      setError(err.response?.data?.message || "Erro ao excluir link. Tente novamente.");
      setIsDeleteModalOpen(false);
      setDeletingLink(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
  };

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

      {/* Error Message Global */}
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
        className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* Adicionar Link */}
        <motion.div variants={itemVariants}>
          <LinksCard>
            <SectionHeader
              icon={Plus}
              title="Adicionar Link"
              description="Adicione seus principais links ao seu perfil. Portfólios, Redes e outros..."
            />

            <div className="space-y-4">
              <Input
                label="URL do seu Link"
                type="url"
                placeholder="Ex: youtube.com/seu-canal ou https://exemplo.com"
                value={linkForm.url}
                onChange={handleUrlChange}
                icon={Globe}
                error={formErrors.url}
                helperText="Cole a URL completa ou apenas o domínio"
                disabled={isSubmitting}
              />

              {/* ✅ Alerta de Rede Social Detectada */}
              <AnimatePresence>
                {detectedSocialNetwork && (
                  <SocialNetworkAlert
                    networkName={detectedSocialNetwork}
                    onGoToSocials={goToSocialNetworks}
                  />
                )}
              </AnimatePresence>

              {/* Preview do Link (só mostra se NÃO for rede social) */}
              <AnimatePresence>
                {linkForm.url &&
                  isValidUrl(linkForm.url) &&
                  !detectedSocialNetwork && (
                    <LinkPreview url={linkForm.url} />
                  )}
              </AnimatePresence>

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
                disabled={isSubmitting || !linkForm.url.trim() || !!detectedSocialNetwork}
                className="
                  w-full px-4 py-3 rounded-[var(--border-radius-md)]
                  bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
                  text-white font-medium text-sm sm:text-base
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                "
                whileHover={isSubmitting || !!detectedSocialNetwork ? {} : { scale: 1.02 }}
                whileTap={isSubmitting || !!detectedSocialNetwork ? {} : { scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Adicionar Link
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
              action={
                <motion.button
                  onClick={loadLinks}
                  disabled={isLoading}
                  className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Recarregar links"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </motion.button>
              }
            />

            {isLoading ? (
              <LoadingSkeleton />
            ) : links.length === 0 ? (
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
                      disabled={isSubmitting}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && links.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between"
              >
                <span className="text-xs text-[var(--color-text-muted)]">
                  {links.length} {links.length === 1 ? "link" : "links"} adicionado
                  {links.length !== 1 && "s"}
                </span>
              </motion.div>
            )}
          </LinksCard>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODAL: Editar Link                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLink(null);
          setEditForm({ url: "" });
          setFormErrors({});
          setEditDetectedSocial(null);
        }}
        title="Editar Link"
      >
        <div className="space-y-4">
          {/* Preview atual */}
          {editingLink && (
            <div className="flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]">
              <FaviconImage url={editingLink.favicon} domain={editingLink.domain} size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--color-text-muted)]">Link atual</p>
                <p className="text-sm text-[var(--color-text)] truncate">{editingLink.domain}</p>
              </div>
            </div>
          )}

          <Input
            label="Nova URL"
            type="url"
            placeholder="https://exemplo.com"
            value={editForm.url}
            onChange={handleEditUrlChange}
            icon={Globe}
            error={formErrors.editUrl}
            disabled={isSubmitting}
          />

          {/* ✅ Alerta de Rede Social no modal de edição */}
          <AnimatePresence>
            {editDetectedSocial && (
              <SocialNetworkAlert
                networkName={editDetectedSocial}
                onGoToSocials={() => {
                  setIsEditModalOpen(false);
                  setEditingLink(null);
                  setEditDetectedSocial(null);
                  goToSocialNetworks();
                }}
              />
            )}
          </AnimatePresence>

          {/* Preview do novo link (só se NÃO for rede social) */}
          <AnimatePresence>
            {editForm.url &&
              isValidUrl(editForm.url) &&
              editForm.url !== editingLink?.url &&
              !editDetectedSocial && <LinkPreview url={editForm.url} />}
          </AnimatePresence>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <motion.button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingLink(null);
                setEditForm({ url: "" });
                setFormErrors({});
                setEditDetectedSocial(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleEditSubmit}
              disabled={isSubmitting || !editForm.url.trim() || !!editDetectedSocial}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={isSubmitting || !!editDetectedSocial ? {} : { scale: 1.02 }}
              whileTap={isSubmitting || !!editDetectedSocial ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
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
      {/* MODAL: Confirmar Exclusão                                 */}
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
            <div className="flex items-center gap-3 p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)]">
              <FaviconImage
                url={deletingLink.favicon}
                domain={deletingLink.domain}
                size={20}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {getKnownDomainInfo(deletingLink.domain)?.name || deletingLink.displayName}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {deletingLink.url}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <motion.button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingLink(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all disabled:opacity-50"
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
                  <Loader2 size={16} className="animate-spin" />
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