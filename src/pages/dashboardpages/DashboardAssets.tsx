// pages/Assets/Assets.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "../../contexts/UserContext";
import {
  FolderOpen,
  ChevronRight,
  Image,
  Music,
  MousePointer2,
  User,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Trash2,
  ExternalLink,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  FileVideo,
  Calendar,
  Maximize2,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Link as LinkIcon,
  Lock,
  Clock,
} from "lucide-react";
import { customizationService } from "../../services/customizationService";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface MediaAsset {
  type: "avatar" | "background" | "cursor" | "audio";
  url: string;
  isActive: boolean;
}

interface ActiveAssets {
  avatar: MediaAsset | null;
  background: MediaAsset | null;
  cursor: MediaAsset | null;
  audio: MediaAsset | null;
  audioVolume: number;
}

// ═══════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════

const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return decodeURIComponent(filename) || 'arquivo';
  } catch {
    return 'arquivo';
  }
};

const getMimeTypeFromUrl = (url: string): string => {
  const ext = url.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    cur: 'image/x-icon',
    svg: 'image/svg+xml',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

/**
 * Converte dados do ProfileContext para o formato de assets
 */
const profileDataToAssets = (
  profileData: NonNullable<ReturnType<typeof useProfile>['profileData']>
): Omit<ActiveAssets, 'audioVolume'> => {
  const mediaUrls = profileData.pageSettings.mediaUrls;

  return {
    avatar: mediaUrls.profileImageUrl
      ? { type: "avatar", url: mediaUrls.profileImageUrl, isActive: true }
      : null,
    background: mediaUrls.backgroundUrl
      ? { type: "background", url: mediaUrls.backgroundUrl, isActive: true }
      : null,
    cursor: mediaUrls.cursorUrl
      ? { type: "cursor", url: mediaUrls.cursorUrl, isActive: true }
      : null,
    audio: mediaUrls.musicUrl
      ? { type: "audio", url: mediaUrls.musicUrl, isActive: true }
      : null,
  };
};

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE (Reutilizados)
// ═══════════════════════════════════════════════════════════

const AssetsCard = ({
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
  <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
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

const StatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={`
      inline-flex items-center gap-1.5 px-2.5 py-1
      rounded-full text-xs font-medium
      ${active 
        ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
      }
    `}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-[var(--color-text-muted)]'}`} />
    {active ? 'Ativo' : 'Inativo'}
  </span>
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
    <Icon size={12} className="flex-shrink-0" />
    <span>{label}:</span>
    <span className="text-[var(--color-text)] truncate">{value}</span>
  </div>
);

const EmptyAssetState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-8 sm:py-12 text-center"
  >
    <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
      <Icon size={24} className="text-[var(--color-text-muted)]" />
    </div>
    <h3 className="text-sm font-medium text-[var(--color-text)] mb-1">{title}</h3>
    <p className="text-xs text-[var(--color-text-muted)] max-w-xs">{description}</p>
    <motion.button
      onClick={() => window.location.href = "/dashboard/customization"}
      className="
        mt-4 px-4 py-2 rounded-[var(--border-radius-md)]
        bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20
        text-[var(--color-primary)] text-sm font-medium
        transition-all duration-300
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Ir para Customização
    </motion.button>
  </motion.div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl" | "full";
}) => {
  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw] max-h-[90vh]",
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`
              w-full ${sizeClasses[size]}
              bg-[var(--color-background)] backdrop-blur-[var(--blur-amount)]
              border border-[var(--color-border)] rounded-[var(--border-radius-xl)]
              shadow-2xl overflow-hidden
            `}>
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
              <div className="p-4 sm:p-6 max-h-[70vh] overflow-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AudioPlayer = ({
  url,
  volume,
  onVolumeChange,
}: {
  url: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        loop
      />

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="
            w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-[var(--color-border)]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[var(--color-primary)]
            [&::-webkit-slider-thumb]:cursor-pointer
          "
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(currentTime / (duration || 1)) * 100}%, var(--color-border) ${(currentTime / (duration || 1)) * 100}%, var(--color-border) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          onClick={togglePlay}
          className="
            p-3 rounded-full
            bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
            text-white transition-all
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </motion.button>

        <div className="flex items-center gap-2 flex-1">
          <motion.button
            onClick={toggleMute}
            className="p-2 rounded-[var(--border-radius-sm)] hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </motion.button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="
              flex-1 h-1.5 rounded-full appearance-none cursor-pointer
              bg-[var(--color-border)]
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[var(--color-primary)]
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />
          <span className="text-xs text-[var(--color-text-muted)] w-10 text-right">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>
    </div>
  );
};

const AssetPreviewCard = ({
  asset,
  icon: Icon,
  title,
  onRemove,
  onView,
  children,
  disabled,
}: {
  asset: MediaAsset | null;
  icon: React.ElementType;
  title: string;
  onRemove: () => void;
  onView: () => void;
  children?: React.ReactNode;
  disabled: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (asset?.url) {
      navigator.clipboard.writeText(asset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="
      p-4 rounded-[var(--border-radius-md)]
      bg-[var(--color-surface)] border border-[var(--color-border)]
      hover:border-[var(--color-primary)]/30 transition-all duration-300
    ">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)]/10">
            <Icon size={18} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)]">{title}</h3>
            {asset && (
              <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[150px]">
                {getFileNameFromUrl(asset.url)}
              </p>
            )}
          </div>
        </div>
        <StatusBadge active={!!asset} />
      </div>

      {asset ? (
        <>
          {children}

          <div className="mt-4 space-y-2 p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-background)]">
            <InfoItem icon={LinkIcon} label="URL" value={asset.url.substring(0, 40) + '...'} />
            <InfoItem icon={FileVideo} label="Tipo" value={getMimeTypeFromUrl(asset.url)} />
            <InfoItem icon={Calendar} label="Configurado em" value={formatDate(new Date())} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <motion.button
              onClick={onView}
              className="
                flex-1 flex items-center justify-center gap-2 px-3 py-2
                rounded-[var(--border-radius-sm)]
                bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20
                text-[var(--color-primary)] text-xs font-medium
                transition-all duration-300
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye size={14} />
              Visualizar
            </motion.button>

            <motion.button
              onClick={handleCopy}
              disabled={disabled}
              className="
                p-2 rounded-[var(--border-radius-sm)]
                bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)]
                text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                transition-all duration-300 disabled:opacity-50
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Copiar URL"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </motion.button>

            <motion.a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                p-2 rounded-[var(--border-radius-sm)]
                bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)]
                text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                transition-all duration-300
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Abrir em nova aba"
            >
              <ExternalLink size={14} />
            </motion.a>

            <motion.button
              onClick={onRemove}
              disabled={disabled}
              className="
                p-2 rounded-[var(--border-radius-sm)]
                bg-[var(--color-background)] hover:bg-red-500/10
                text-[var(--color-text-muted)] hover:text-red-400
                transition-all duration-300 disabled:opacity-50
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Remover"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </>
      ) : (
        <EmptyAssetState
          icon={Icon}
          title={`Nenhum ${title.toLowerCase()} ativo`}
          description={`Configure um ${title.toLowerCase()} na página de Customização.`}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL COM INTEGRAÇÃO DO CONTEXT
// ═══════════════════════════════════════════════════════════

const DashboardAssets = () => {
  // ═══════════════════════════════════════════════════════════
  // CONTEXTO DO PERFIL
  // ═══════════════════════════════════════════════════════════
  const { 
    profileData, 
    isLoadingProfile, 
    refreshProfile 
  } = useProfile();

  // ═══════════════════════════════════════════════════════════
  // ESTADOS LOCAIS
  // ═══════════════════════════════════════════════════════════
  const [assets, setAssets] = useState<ActiveAssets>({
    avatar: null,
    background: null,
    cursor: null,
    audio: null,
    audioVolume: 50,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    type: "avatar" | "background" | "cursor" | "audio" | null;
  }>({ isOpen: false, type: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "avatar" | "background" | "cursor" | "audio" | null;
  }>({ isOpen: false, type: null });

  // ═══════════════════════════════════════════════════════════
  // SINCRONIZAR COM DADOS DO CONTEXTO
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (profileData) {
      const loadedAssets = profileDataToAssets(profileData);
      setAssets(prev => ({
        ...loadedAssets,
        audioVolume: prev.audioVolume, // Preservar volume do áudio
      }));
    }
  }, [profileData]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      await refreshProfile();
    } catch (err) {
      console.error("Erro ao recarregar assets:", err);
      setError("Erro ao recarregar assets.");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfile]);

  const handleRemove = async (type: "avatar" | "background" | "cursor" | "audio") => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Mapear tipo para campo da API
      const fieldMap = {
        avatar: "profileImageUrl",
        background: "backgroundUrl",
        cursor: "cursorUrl",
        audio: "musicUrl",
      };

      // Atualizar via PATCH, limpando apenas o campo específico
      await customizationService.patchPageSettings({
        mediaUrls: {
          [fieldMap[type]]: "",
          profileImageUrl: type !== "avatar" ? assets.avatar?.url || "" : "",
          backgroundUrl: type !== "background" ? assets.background?.url || "" : "",
          cursorUrl: type !== "cursor" ? assets.cursor?.url || "" : "",
          musicUrl: type !== "audio" ? assets.audio?.url || "" : "",
        },
      });

      // Atualizar o contexto global após a remoção
      await refreshProfile();

      setDeleteModal({ isOpen: false, type: null });
      setSuccessMessage(`${getAssetTitle(type)} removido com sucesso!`);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Erro ao remover asset:", err);

      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError(err.response?.data?.message || "Erro ao remover. Tente novamente.");
      }
      setDeleteModal({ isOpen: false, type: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolumeChange = (volume: number) => {
    setAssets((prev) => ({ ...prev, audioVolume: volume }));
  };

  const getAssetTitle = (type: string) => {
    const titles: Record<string, string> = {
      avatar: "Avatar",
      background: "Background",
      cursor: "Cursor",
      audio: "Áudio",
    };
    return titles[type] || type;
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

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

  // Loading State - usa o estado do contexto
  if (isLoadingProfile && !profileData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-[var(--color-primary)]" />
          <p className="text-[var(--color-text-muted)]">Carregando assets...</p>
        </div>
      </div>
    );
  }

  // Error state quando não há dados do perfil
  if (!profileData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Erro ao carregar perfil
          </h2>
          <p className="text-[var(--color-text-muted)] mb-4">
            Não foi possível carregar os assets do seu perfil.
          </p>
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="
              flex items-center gap-2 px-4 py-2.5 mx-auto
              rounded-[var(--border-radius-md)]
              bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
              text-white font-medium text-sm
              transition-all duration-300
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRefreshing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            Tentar Novamente
          </motion.button>
        </div>
      </div>
    );
  }

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
          <span className="text-[var(--color-text)]">Ativos</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <FolderOpen className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            Gerencie seus arquivos de mídia ativos.
          </h1>

          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingProfile}
            className="
              p-2.5 rounded-[var(--border-radius-md)]
              bg-[var(--color-surface)] border border-[var(--color-border)]
              text-[var(--color-text-muted)] hover:text-[var(--color-text)]
              transition-all duration-300
              disabled:opacity-50
            "
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Recarregar assets"
          >
            <RefreshCw size={18} className={(isRefreshing || isLoadingProfile) ? "animate-spin" : ""} />
          </motion.button>
        </motion.div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="
              mb-6 flex items-center gap-2 p-4
              rounded-[var(--border-radius-md)]
              bg-green-500/10 border border-green-500/30
            "
          >
            <CheckCircle size={20} className="text-green-400" />
            <span className="text-sm text-green-400">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
      >
        {[
          { icon: User, label: "Avatar", active: !!assets.avatar, locked: false },
          { icon: Image, label: "Background", active: !!assets.background, locked: false },
          { icon: MousePointer2, label: "Cursor", active: false, locked: true },
          { icon: Music, label: "Áudio", active: !!assets.audio, locked: false },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-[var(--border-radius-md)]
              border transition-all duration-300 relative
              ${
                item.locked
                  ? "bg-[var(--color-surface)]/50 border-[var(--color-border)] opacity-75"
                  : item.active
                  ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)]"
              }
            `}
          >
            {item.locked && (
              <div className="absolute top-2 right-2">
                <Lock size={14} className="text-[var(--color-text-muted)]" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <item.icon
                size={20}
                className={
                  item.locked 
                    ? "text-[var(--color-text-muted)]/50" 
                    : item.active 
                    ? "text-[var(--color-primary)]" 
                    : "text-[var(--color-text-muted)]"
                }
              />
              {!item.locked && (
                <span
                  className={`
                  w-2 h-2 rounded-full
                  ${item.active ? "bg-green-400" : "bg-[var(--color-text-muted)]"}
                `}
                />
              )}
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] mt-2">{item.label}</p>
            <p className={`text-xs ${
              item.locked 
                ? "text-[var(--color-text-muted)]/50" 
                : item.active 
                ? "text-green-400" 
                : "text-[var(--color-text-muted)]"
            }`}>
              {item.locked ? "Em breve" : item.active ? "Ativo" : "Não configurado"}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* AVATAR */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={User}
              title="Avatar"
              description="Sua foto de perfil exibida no seu perfil"
            />

            <AssetPreviewCard
              asset={assets.avatar}
              icon={User}
              title="Avatar"
              onRemove={() => setDeleteModal({ isOpen: true, type: "avatar" })}
              onView={() => setViewModal({ isOpen: true, type: "avatar" })}
              disabled={isSubmitting}
            >
              {assets.avatar && (
                <div className="flex justify-center">
                  <motion.div
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary)]/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={assets.avatar.url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </motion.div>
                </div>
              )}
            </AssetPreviewCard>
          </AssetsCard>
        </motion.div>

        {/* BACKGROUND */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={Image}
              title="Background"
              description="Imagem de fundo do seu perfil"
            />

            <AssetPreviewCard
              asset={assets.background}
              icon={Image}
              title="Background"
              onRemove={() => setDeleteModal({ isOpen: true, type: "background" })}
              onView={() => setViewModal({ isOpen: true, type: "background" })}
              disabled={isSubmitting}
            >
              {assets.background && (
                <motion.div
                  className="relative w-full h-40 rounded-[var(--border-radius-md)] overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  {assets.background.url.endsWith(".mp4") ? (
                    <video
                      src={assets.background.url}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img
                      src={assets.background.url}
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                  )}  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <motion.button
                    onClick={() => setViewModal({ isOpen: true, type: "background" })}
                    className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Maximize2 size={14} />
                  </motion.button>
                </motion.div>
              )}
            </AssetPreviewCard>
          </AssetsCard>
        </motion.div>

        {/* CURSOR - BLOQUEADO/EM BREVE */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={MousePointer2}
              title="Cursor"
              description="Cursor personalizado para seu perfil"
              action={
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <Clock size={14} className="text-[var(--color-text-muted)]" />
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">Em breve</span>
                </div>
              }
            />

            <div className="relative">
              {/* Overlay de bloqueio */}
              <div className="absolute inset-0 bg-[var(--color-background)]/60 backdrop-blur-sm z-10 rounded-[var(--border-radius-md)] flex items-center justify-center">
                <div className="text-center p-6">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4 mx-auto"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lock size={24} className="text-[var(--color-text-muted)]" />
                  </motion.div>
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                    Funcionalidade em desenvolvimento
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto">
                    A personalização de cursor estará disponível em breve. Fique atento às atualizações!
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
                    <Clock size={12} className="text-[var(--color-primary)]" />
                    <span className="text-xs font-medium text-[var(--color-primary)]">Em breve</span>
                  </div>
                </div>
              </div>

              {/* Card desabilitado por baixo */}
              <div className="opacity-40 pointer-events-none">
                <div className="
                  p-4 rounded-[var(--border-radius-md)]
                  bg-[var(--color-surface)] border border-[var(--color-border)]
                ">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)]/10">
                        <MousePointer2 size={18} className="text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[var(--color-text)]">Cursor</h3>
                      </div>
                    </div>
                    <StatusBadge active={false} />
                  </div>

                  <div className="flex justify-center items-center py-8">
                    <div className="
                      w-24 h-24 rounded-[var(--border-radius-md)]
                      bg-[var(--color-background)] border border-dashed border-[var(--color-border)]
                      flex items-center justify-center
                    ">
                      <MousePointer2 size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AssetsCard>
        </motion.div>

        {/* AUDIO */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={Music}
              title="Áudio"
              description="Música de fundo do seu perfil"
            />

            <AssetPreviewCard
              asset={assets.audio}
              icon={Music}
              title="Áudio"
              onRemove={() => setDeleteModal({ isOpen: true, type: "audio" })}
              onView={() => setViewModal({ isOpen: true, type: "audio" })}
              disabled={isSubmitting}
            >
              {assets.audio && (
                <div className="mt-2">
                  <AudioPlayer
                    url={assets.audio.url}
                    volume={assets.audioVolume}
                    onVolumeChange={handleVolumeChange}
                  />
                </div>
              )}
            </AssetPreviewCard>
          </AssetsCard>
        </motion.div>
      </motion.div>

      {/* VIEW MODAL */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, type: null })}
        title={`Visualizar ${viewModal.type ? getAssetTitle(viewModal.type) : ""}`}
        size={viewModal.type === "background" ? "xl" : "lg"}
      >
        {viewModal.type === "avatar" && assets.avatar && (
          <div className="flex flex-col items-center gap-4">
            <img
              src={assets.avatar.url}
              alt="Avatar"
              className="w-64 h-64 rounded-full object-cover border-4 border-[var(--color-primary)]/30"
            />
            <div className="text-center">
              <p className="text-sm text-[var(--color-text)]">{getFileNameFromUrl(assets.avatar.url)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{getMimeTypeFromUrl(assets.avatar.url)}</p>
            </div>
          </div>
        )}

        {viewModal.type === "background" && assets.background && (
          <>
            {assets.background.url.endsWith(".mp4") ? (
              <video
                src={assets.background.url}
                className="w-full h-full object-cover rounded-[var(--border-radius-md)]"
                autoPlay
                loop
                muted
                controls
              />
            ) : (
              <img
                src={assets.background.url}
                alt="Background"
                className="w-full h-full object-cover rounded-[var(--border-radius-md)]"
              />
            )}
          </>
        )}

        {viewModal.type === "audio" && assets.audio && (
          <div className="space-y-6">
            <div className="p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)]">
              <AudioPlayer
                url={assets.audio.url}
                volume={assets.audioVolume}
                onVolumeChange={handleVolumeChange}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--color-text)]">{getFileNameFromUrl(assets.audio.url)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{getMimeTypeFromUrl(assets.audio.url)}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null })}
        title={`Remover ${deleteModal.type ? getAssetTitle(deleteModal.type) : ""}`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-[var(--border-radius-md)] bg-red-500/10 border border-red-500/30">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--color-text)]">
                Tem certeza que deseja remover este {deleteModal.type ? getAssetTitle(deleteModal.type).toLowerCase() : "arquivo"}?
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Ele será removido da sua customização. Você pode configurá-lo novamente a qualquer momento.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <motion.button
              onClick={() => setDeleteModal({ isOpen: false, type: null })}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={() => deleteModal.type && handleRemove(deleteModal.type)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-red-500 hover:bg-red-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={isSubmitting ? {} : { scale: 1.02 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Remover
                </>
              )}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardAssets;