// pages/Assets/Assets.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  HardDrive,
  Calendar,
  Maximize2,
  Copy,
  Check,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface MediaAsset {
  id: string;
  type: "avatar" | "background" | "cursor" | "audio";
  url: string;
  filename: string;
  size: string;
  uploadedAt: string;
  mimeType: string;
}

interface ActiveAssets {
  avatar: MediaAsset | null;
  background: MediaAsset | null;
  cursor: MediaAsset | null;
  audio: MediaAsset | null;
  audioVolume: number;
}

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

// Card Component
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

// Status Badge
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

// Info Item
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

// Empty State
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
  </motion.div>
);

// Modal Component
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

// Audio Player Component
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

      {/* Progress Bar */}
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

      {/* Controls */}
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

        {/* Volume Control */}
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

// Asset Preview Card Component
const AssetPreviewCard = ({
  asset,
  icon: Icon,
  title,
  onRemove,
  onView,
  children,
}: {
  asset: MediaAsset | null;
  type: string;
  icon: React.ElementType;
  title: string;
  onRemove: () => void;
  onView: () => void;
  children?: React.ReactNode;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)]/10">
            <Icon size={18} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)]">{title}</h3>
            {asset && (
              <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[150px]">
                {asset.filename}
              </p>
            )}
          </div>
        </div>
        <StatusBadge active={!!asset} />
      </div>

      {asset ? (
        <>
          {/* Preview Content */}
          {children}

          {/* Asset Info */}
          <div className="mt-4 space-y-2 p-3 rounded-[var(--border-radius-sm)] bg-[var(--color-background)]">
            <InfoItem icon={HardDrive} label="Tamanho" value={asset.size} />
            <InfoItem icon={Calendar} label="Enviado em" value={asset.uploadedAt} />
            <InfoItem icon={FileVideo} label="Tipo" value={asset.mimeType} />
          </div>

          {/* Actions */}
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
              className="
                p-2 rounded-[var(--border-radius-sm)]
                bg-[var(--color-background)] hover:bg-[var(--color-surface-hover)]
                text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                transition-all duration-300
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
              className="
                p-2 rounded-[var(--border-radius-sm)]
                bg-[var(--color-background)] hover:bg-red-500/10
                text-[var(--color-text-muted)] hover:text-red-400
                transition-all duration-300
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
          description={`Você ainda não enviou um ${title.toLowerCase()} para seu perfil.`}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardAssets = () => {
  // Mock data - substituir por dados da API
  const [assets, setAssets] = useState<ActiveAssets>({
    avatar: {
      id: "1",
      type: "avatar",
      url: "https://i.pravatar.cc/300",
      filename: "meu-avatar.png",
      size: "245 KB",
      uploadedAt: "15/01/2024",
      mimeType: "image/png",
    },
    background: {
      id: "2",
      type: "background",
      url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920",
      filename: "background-gradient.jpg",
      size: "1.2 MB",
      uploadedAt: "14/01/2024",
      mimeType: "image/jpeg",
    },
    cursor: null,
    audio: {
      id: "4",
      type: "audio",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      filename: "musica-de-fundo.mp3",
      size: "3.5 MB",
      uploadedAt: "10/01/2024",
      mimeType: "audio/mpeg",
    },
    audioVolume: 50,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Modals
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    type: "avatar" | "background" | "cursor" | "audio" | null;
  }>({ isOpen: false, type: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "avatar" | "background" | "cursor" | "audio" | null;
  }>({ isOpen: false, type: null });

  // Handlers
  const handleRemove = async (type: "avatar" | "background" | "cursor" | "audio") => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setAssets(prev => ({ ...prev, [type]: null }));
    setDeleteModal({ isOpen: false, type: null });
    setIsSubmitting(false);
    setSuccessMessage(`${getAssetTitle(type)} removido com sucesso!`);
    
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleVolumeChange = (volume: number) => {
    setAssets(prev => ({ ...prev, audioVolume: volume }));
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
        </motion.div>
      </div>

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
          { icon: User, label: "Avatar", active: !!assets.avatar },
          { icon: Image, label: "Background", active: !!assets.background },
          { icon: MousePointer2, label: "Cursor", active: !!assets.cursor },
          { icon: Music, label: "Áudio", active: !!assets.audio },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-[var(--border-radius-md)]
              border transition-all duration-300
              ${item.active 
                ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]' 
                : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <item.icon 
                size={20} 
                className={item.active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} 
              />
              <span className={`
                w-2 h-2 rounded-full
                ${item.active ? 'bg-green-400' : 'bg-[var(--color-text-muted)]'}
              `} />
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] mt-2">{item.label}</p>
            <p className={`text-xs ${item.active ? 'text-green-400' : 'text-[var(--color-text-muted)]'}`}>
              {item.active ? 'Ativo' : 'Não configurado'}
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
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* AVATAR */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={User}
              title="Avatar"
              description="Sua foto de perfil exibida no seu perfil"
            />

            <AssetPreviewCard
              asset={assets.avatar}
              type="avatar"
              icon={User}
              title="Avatar"
              onRemove={() => setDeleteModal({ isOpen: true, type: "avatar" })}
              onView={() => setViewModal({ isOpen: true, type: "avatar" })}
            >
              {/* Avatar Preview */}
              <div className="flex justify-center">
                <motion.div
                  className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary)]/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={assets.avatar?.url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </motion.div>
              </div>
            </AssetPreviewCard>
          </AssetsCard>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* BACKGROUND */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={Image}
              title="Background"
              description="Imagem ou vídeo de fundo do seu perfil"
            />

            <AssetPreviewCard
              asset={assets.background}
              type="background"
              icon={Image}
              title="Background"
              onRemove={() => setDeleteModal({ isOpen: true, type: "background" })}
              onView={() => setViewModal({ isOpen: true, type: "background" })}
            >
              {/* Background Preview */}
              <motion.div
                className="relative w-full h-40 rounded-[var(--border-radius-md)] overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={assets.background?.url}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
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
            </AssetPreviewCard>
          </AssetsCard>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CURSOR */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={MousePointer2}
              title="Cursor"
              description="Cursor personalizado para seu perfil"
            />

            <AssetPreviewCard
              asset={assets.cursor}
              type="cursor"
              icon={MousePointer2}
              title="Cursor"
              onRemove={() => setDeleteModal({ isOpen: true, type: "cursor" })}
              onView={() => setViewModal({ isOpen: true, type: "cursor" })}
            >
              {/* Cursor Preview */}
              <div className="flex justify-center items-center py-4">
                <motion.div
                  className="
                    w-24 h-24 rounded-[var(--border-radius-md)]
                    bg-[var(--color-background)] border border-dashed border-[var(--color-border)]
                    flex items-center justify-center
                  "
                  style={{
                    cursor: assets.cursor ? `url(${assets.cursor.url}), auto` : 'default'
                  }}
                  whileHover={{ borderColor: 'var(--color-primary)' }}
                >
                  {assets.cursor ? (
                    <img
                      src={assets.cursor.url}
                      alt="Cursor"
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <MousePointer2 size={32} className="text-[var(--color-text-muted)]" />
                  )}
                </motion.div>
              </div>
            </AssetPreviewCard>
          </AssetsCard>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* AUDIO */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <AssetsCard>
            <SectionHeader
              icon={Music}
              title="Áudio"
              description="Música de fundo do seu perfil"
            />

            <AssetPreviewCard
              asset={assets.audio}
              type="audio"
              icon={Music}
              title="Áudio"
              onRemove={() => setDeleteModal({ isOpen: true, type: "audio" })}
              onView={() => setViewModal({ isOpen: true, type: "audio" })}
            >
              {/* Audio Player */}
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* VIEW MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, type: null })}
        title={`Visualizar ${viewModal.type ? getAssetTitle(viewModal.type) : ''}`}
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
              <p className="text-sm text-[var(--color-text)]">{assets.avatar.filename}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{assets.avatar.size} • {assets.avatar.mimeType}</p>
            </div>
          </div>
        )}

        {viewModal.type === "background" && assets.background && (
          <div className="space-y-4">
            <img
              src={assets.background.url}
              alt="Background"
              className="w-full h-auto rounded-[var(--border-radius-md)]"
            />
            <div className="text-center">
              <p className="text-sm text-[var(--color-text)]">{assets.background.filename}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{assets.background.size} • {assets.background.mimeType}</p>
            </div>
          </div>
        )}

        {viewModal.type === "cursor" && assets.cursor && (
          <div className="flex flex-col items-center gap-4">
            <div 
              className="
                w-48 h-48 rounded-[var(--border-radius-lg)]
                bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)]
                border border-[var(--color-border)]
                flex items-center justify-center
              "
              style={{ cursor: `url(${assets.cursor.url}), auto` }}
            >
              <img
                src={assets.cursor.url}
                alt="Cursor"
                className="w-24 h-24 object-contain"
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Mova o mouse sobre a área acima para testar o cursor
            </p>
          </div>
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
              <p className="text-sm text-[var(--color-text)]">{assets.audio.filename}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{assets.audio.size} • {assets.audio.mimeType}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DELETE MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null })}
        title={`Remover ${deleteModal.type ? getAssetTitle(deleteModal.type) : ''}`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-[var(--border-radius-md)] bg-red-500/10 border border-red-500/30">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--color-text)]">
                Tem certeza que deseja remover este {deleteModal.type ? getAssetTitle(deleteModal.type).toLowerCase() : 'arquivo'}?
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                O arquivo será removido permanentemente do seu perfil.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <motion.button
              onClick={() => setDeleteModal({ isOpen: false, type: null })}
              className="flex-1 px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all"
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
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
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