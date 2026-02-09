import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  ChevronRight,
  Sliders,
  Type,
  Image,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  AlertCircle,
  CheckCircle,
  Square,
  Layers,
  Move,
  Zap,
  Music,
  MousePointer2,
  Snowflake,
  PartyPopper,
  Binary,
  Atom,
  AlignCenter,
  Upload,
  X,
  Monitor,
  Loader2,
  RefreshCw,
  Trash2,
  FileImage,
  FileAudio,
  File,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { customizationService } from "../../services/customizationService";
import { assetUploadService } from "../../services/assetUploadService";
import { useProfile } from "../../contexts/UserContext";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

// Tipo para o tipo de mídia detectado
type MediaType = "image" | "video" | "audio" | "unknown";

interface CustomizationSettings {
  // Card
  cardOpacity: number;
  cardBlur: number;
  cardColor: string;
  cardPerspective: boolean;
  cardHoverGrow: boolean;
  rgbBorder: boolean;

  // Profile
  biography: string;
  contentCenter: boolean;
  biographyColor: string;
  name: string;
  neonName: boolean;
  shinyName: boolean;
  rgbName: boolean;

  // Media URLs (do servidor)
  backgroundUrl: string;
  profileImageUrl: string;
  musicUrl: string;
  cursorUrl: string;

  // Effects
  snowEffect: boolean;
  confettiEffect: boolean;
  matrixRainEffect: boolean;
  particlesEffect: boolean;
  particlesColor: string;
}

interface FileUploads {
  avatar: File | null;
  background: File | null;
  music: File | null;
  cursor: File | null;
}

interface FilePreview {
  avatar: string | null;
  background: string | null;
  music: string | null;
  cursor: string | null;
}

interface FileUploadProps {
  label: string;
  accept: string;
  file: File | null;
  currentUrl?: string;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  icon?: React.ElementType;
  helperText?: string;
  previewType?: "image" | "audio" | "cursor" | "media";
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const getFileType = (file: File | string): MediaType => {
  let type: string;

  if (typeof file === "string") {
    // Detectar por extensão da URL
    const ext = file.split('.').pop()?.toLowerCase().split('?')[0] || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return "image";
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return "video";
    if (['mp3', 'wav', 'ogg', 'oga'].includes(ext)) return "audio";
    return "unknown";
  } else {
    type = file.type;
    if (type.startsWith('image/')) return "image";
    if (type.startsWith('video/')) return "video";
    if (type.startsWith('audio/')) return "audio";
    return "unknown";
  }
};

// Formatar tempo em mm:ss
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ═══════════════════════════════════════════════════════════
// TRANSFORMAÇÃO DE DADOS
// ═══════════════════════════════════════════════════════════

const profileDataToSettings = (
  profileData: NonNullable<ReturnType<typeof useProfile>['profileData']>
): CustomizationSettings => {
  return {
    // Card
    cardOpacity: profileData.pageSettings.cardSettings.opacity,
    cardBlur: profileData.pageSettings.cardSettings.blur,
    cardColor: profileData.pageSettings.cardSettings.color,
    cardPerspective: profileData.pageSettings.cardSettings.perspective,
    cardHoverGrow: profileData.pageSettings.cardSettings.hoverGrow,
    rgbBorder: profileData.pageSettings.cardSettings.rgbBorder,

    // Profile
    biography: profileData.pageSettings.contentSettings.biography,
    contentCenter: profileData.pageSettings.contentSettings.centerAlign,
    biographyColor: profileData.pageSettings.contentSettings.biographyColor,
    name: profileData.pageSettings.nameEffects.name,
    neonName: profileData.pageSettings.nameEffects.neon,
    shinyName: profileData.pageSettings.nameEffects.shiny,
    rgbName: profileData.pageSettings.nameEffects.rgb,

    // Media URLs
    backgroundUrl: profileData.pageSettings.mediaUrls.backgroundUrl,
    profileImageUrl: profileData.pageSettings.mediaUrls.profileImageUrl,
    musicUrl: profileData.pageSettings.mediaUrls.musicUrl,
    cursorUrl: profileData.pageSettings.mediaUrls.cursorUrl,

    // Effects
    snowEffect: profileData.pageSettings.pageEffects.snow,
    confettiEffect: profileData.pageSettings.pageEffects.confetti,
    matrixRainEffect: profileData.pageSettings.pageEffects.matrixRain,
    particlesEffect: profileData.pageSettings.pageEffects.particles.enabled,
    particlesColor: profileData.pageSettings.pageEffects.particles.color,
  };
};

const settingsToRequest = (settings: CustomizationSettings) => ({
  cardSettings: {
    opacity: settings.cardOpacity,
    blur: settings.cardBlur,
    color: settings.cardColor,
    perspective: settings.cardPerspective,
    hoverGrow: settings.cardHoverGrow,
    rgbBorder: settings.rgbBorder,
  },
  contentSettings: {
    biography: settings.biography,
    biographyColor: settings.biographyColor,
    centerAlign: settings.contentCenter,
  },
  nameEffects: {
    name: settings.name,
    neon: settings.neonName,
    shiny: settings.shinyName,
    rgb: settings.rgbName,
  },
  mediaUrls: {
    backgroundUrl: settings.backgroundUrl,
    profileImageUrl: settings.profileImageUrl,
    musicUrl: settings.musicUrl,
    cursorUrl: settings.cursorUrl,
  },
  pageEffects: {
    snow: settings.snowEffect,
    confetti: settings.confettiEffect,
    matrixRain: settings.matrixRainEffect,
    particles: {
      enabled: settings.particlesEffect,
      color: settings.particlesColor,
    },
  },
});

// ═══════════════════════════════════════════════════════════
// COMPONENTE AUDIO PLAYER
// ═══════════════════════════════════════════════════════════

const AudioPlayer = ({
  src,
  fileName
}: {
  src: string;
  fileName?: string;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [src]);

  // Reset quando a src muda
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(true);
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Player Controls */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-background)]/50">
        {/* Play/Pause Button */}
        <motion.button
          onClick={togglePlay}
          disabled={isLoading}
          className="
            p-2.5 rounded-full bg-[var(--color-primary)] text-white
            hover:bg-[var(--color-primary-dark)] transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </motion.button>

        {/* Progress Bar & Time */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)] font-mono w-10">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
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
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${progress}%, var(--color-border) ${progress}%, var(--color-border) 100%)`
              }}
            />
            <span className="text-xs text-[var(--color-text-muted)] font-mono w-10 text-right">
              {formatTime(duration)}
            </span>
          </div>
          {fileName && (
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {fileName}
            </p>
          )}
        </div>

        {/* Mute Button */}
        <motion.button
          onClick={toggleMute}
          className="
            p-2 rounded-full text-[var(--color-text-muted)]
            hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]
            transition-colors
          "
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </motion.button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE FILE UPLOAD
// ═══════════════════════════════════════════════════════════

const FileUpload = ({
  label,
  accept,
  file,
  currentUrl,
  onFileSelect,
  onRemove,
  icon: Icon,
  helperText,
  previewType = "image",
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("unknown");
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Gerar preview quando arquivo muda
  useEffect(() => {
    if (file) {
      const fileType = getFileType(file);
      setMediaType(fileType);

      if (previewType === "media" || previewType === "image" || previewType === "cursor" || previewType === "audio") {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPreview(null);
      }
    } else if (currentUrl) {
      const urlType = getFileType(currentUrl);
      setMediaType(urlType);
      setPreview(null);
    } else {
      setPreview(null);
      setMediaType("unknown");
    }
  }, [file, currentUrl, previewType]);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Validar tipo
    const acceptedTypes = accept.split(",").map(t => t.trim());
    const fileType = file.type;
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;

    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith(".")) {
        return fileExt === type.toLowerCase();
      }
      if (type.endsWith("/*")) {
        return fileType.startsWith(type.replace("/*", "/"));
      }
      return fileType === type;
    });

    if (!isValidType) {
      setError(`Tipo de arquivo não permitido`);
      return false;
    }

    return true;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    if (validateFile(selectedFile)) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (previewType === "audio" || mediaType === "audio") return FileAudio;
    if (previewType === "image" || previewType === "cursor" || mediaType === "image") return FileImage;
    if (previewType === "media") {
      if (mediaType === "video") return FileImage;
    }
    return File;
  };

  const FileIcon = getFileIcon();
  const displayPreview = preview || currentUrl;
  const hasFile = file || currentUrl;
  const currentMediaType = file ? getFileType(file) : currentUrl ? getFileType(currentUrl) : "unknown";
  const audioSrc = previewType === "audio" ? (preview || currentUrl) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-[var(--color-primary)]" />}
          <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        </div>
        {file && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />

      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-[var(--border-radius-md)] border-2 border-dashed
          transition-all duration-300 overflow-hidden cursor-pointer
          ${isDragging
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : hasFile
              ? "border-[var(--color-border)] bg-[var(--color-surface)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-surface)]"
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Preview Area */}
        {hasFile ? (
          <div className="relative">
            {/* Image/Cursor Preview */}
            {(previewType === "image" || previewType === "cursor" ||
              (previewType === "media" && currentMediaType === "image")) && displayPreview && (
                <div className="relative h-32 w-full">
                  <img
                    src={displayPreview}
                    alt="Preview"
                    className={`
                    w-full h-full object-cover
                    ${previewType === "cursor" ? "object-contain bg-[var(--color-background)]" : ""}
                  `}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

            {/* Video Preview */}
            {previewType === "media" && currentMediaType === "video" && displayPreview && (
              <div className="relative h-32 w-full">
                <video
                  ref={videoRef}
                  src={displayPreview}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  autoPlay
                  playsInline
                  onError={(e) => {
                    (e.target as HTMLVideoElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                  Vídeo
                </div>
              </div>
            )}

            {/* Audio Preview with Player */}
            {previewType === "audio" && (
              <div className="p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-[var(--color-primary)]/20">
                    <Music size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {file?.name || "Música atual"}
                    </p>
                    {file && (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <motion.button
                    onClick={handleRemove}
                    className="
                      p-1.5 rounded-full bg-red-500/80 hover:bg-red-500
                      text-white transition-colors flex-shrink-0
                    "
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>

                {/* Audio Player */}
                {audioSrc && (
                  <AudioPlayer
                    src={audioSrc}
                    fileName={file?.name}
                  />
                )}

                {/* Badge: Novo arquivo */}
                {file && (
                  <div className="mt-2">
                    <span className="
                      px-2 py-1 text-xs font-medium rounded-full
                      bg-green-500/20 text-green-400
                    ">
                      Novo arquivo selecionado
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* File Info Overlay - Only for non-audio */}
            {previewType !== "audio" && (
              <div className={`
                ${((previewType === "image" || previewType === "cursor" || previewType === "media") && displayPreview)
                  ? "absolute bottom-0 left-0 right-0 p-3"
                  : "px-4 pb-3"
                }
                flex items-center justify-between
              `}>
                <div className="flex items-center gap-2 text-white">
                  <FileIcon size={14} />
                  <span className="text-xs truncate max-w-[150px]">
                    {file?.name || "Arquivo atual"}
                  </span>
                </div>

                <motion.button
                  onClick={handleRemove}
                  className="
                    p-1.5 rounded-full bg-red-500/80 hover:bg-red-500
                    text-white transition-colors
                  "
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            )}

            {/* Badge: Novo arquivo - Only for non-audio */}
            {file && previewType !== "audio" && (
              <div className="absolute top-2 left-2">
                <span className="
                  px-2 py-1 text-xs font-medium rounded-full
                  bg-green-500/90 text-white
                ">
                  Novo
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Upload Placeholder */
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className={`
              p-3 rounded-full mb-3 transition-colors
              ${isDragging
                ? "bg-[var(--color-primary)]/20"
                : "bg-[var(--color-surface-elevated)]"
              }
            `}>
              <Upload
                size={24}
                className={isDragging ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
              />
            </div>
            <p className="text-sm text-[var(--color-text)]">
              {isDragging ? "Solte o arquivo aqui" : "Clique ou arraste um arquivo"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
      )}

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {error}
        </motion.p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

const ToggleSwitch = ({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
}) => (
  <motion.div
    className="flex items-center justify-between p-3 sm:p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300"
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)]/10">
          <Icon size={18} className="text-[var(--color-primary)]" />
        </div>
      )}
      <div>
        <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <motion.button
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer
        ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}
      `}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
        animate={{ left: checked ? '28px' : '4px' }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  </motion.div>
);

const Slider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  icon: Icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icon?: React.ElementType;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-[var(--color-primary)]" />}
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      </div>
      <span className="text-sm font-medium text-[var(--color-primary)]">
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="
        w-full h-2 rounded-full appearance-none cursor-pointer
        bg-[var(--color-border)]
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-5
        [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-[var(--color-primary)]
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:transition-transform
        [&::-webkit-slider-thumb]:hover:scale-110
        [&::-webkit-slider-thumb]:shadow-lg
      "
      style={{
        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-border) ${((value - min) / (max - min)) * 100}%, var(--color-border) 100%)`
      }}
    />
  </div>
);

const ColorPicker = ({
  label,
  value,
  onChange,
  icon: Icon,
  presetColors = [],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  presetColors?: string[];
}) => {
  const defaultPresets = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#FFFFFF", "#000000"
  ];
  const colors = presetColors.length > 0 ? presetColors : defaultPresets;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-[var(--color-primary)]" />}
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-12 h-12 rounded-[var(--border-radius-md)] cursor-pointer
            border-2 border-[var(--color-border)] overflow-hidden
            [&::-webkit-color-swatch-wrapper]:p-0
            [&::-webkit-color-swatch]:border-none
          "
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="
            flex-1 px-3 py-2 rounded-[var(--border-radius-sm)]
            bg-[var(--color-surface)] border border-[var(--color-border)]
            text-[var(--color-text)] text-sm font-mono
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
            focus:border-[var(--color-primary)] transition-all duration-300
          "
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <motion.button
            key={color}
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-full border-2 transition-all ${value === color ? 'border-[var(--color-primary)] scale-110' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>
    </div>
  );
};

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
}) => {
  // ✅ GARANTE QUE VALUE NUNCA É NULL
  const safeValue = value ?? "";
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        {maxLength && (
          <span className={`text-xs ${safeValue.length >= maxLength ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
            {safeValue.length}/{maxLength}
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
          value={safeValue}
          onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-[var(--border-radius-md)]
            bg-[var(--color-surface)] border transition-all duration-300
            text-[var(--color-text)] placeholder-[var(--color-text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
            ${Icon ? "pl-10" : ""}
            ${error ? "border-red-500/50 focus:border-red-500" : "border-[var(--color-border)] focus:border-[var(--color-primary)]"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
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
};


const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  rows = 4,
  helperText,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
  helperText?: string;
}) => {
  // ✅ GARANTE QUE VALUE NUNCA É NULL
  const safeValue = value ?? "";
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        {maxLength && (
          <span className={`text-xs ${safeValue.length >= maxLength ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
            {safeValue.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        placeholder={placeholder}
        value={safeValue}
        onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
        maxLength={maxLength}
        rows={rows}
        className="
          w-full px-4 py-3 rounded-[var(--border-radius-md)]
          bg-[var(--color-surface)] border border-[var(--color-border)]
          text-[var(--color-text)] placeholder-[var(--color-text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
          focus:border-[var(--color-primary)] transition-all duration-300
          resize-none
        "
      />
      {helperText && (
        <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
      )}
    </div>
  );
};

const CustomizationCard = ({
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

// ═══════════════════════════════════════════════════════════
// COMPONENTE LIVE PREVIEW
// ═══════════════════════════════════════════════════════════

const LivePreview = ({
  settings,
  fileUploads,
  isOpen,
  onClose,
}: {
  settings: CustomizationSettings;
  fileUploads: FileUploads;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [previews, setPreviews] = useState<FilePreview>({
    avatar: null,
    background: null,
    music: null,
    cursor: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const newPreviews: FilePreview = {
      avatar: fileUploads.avatar ? URL.createObjectURL(fileUploads.avatar) : null,
      background: fileUploads.background ? URL.createObjectURL(fileUploads.background) : null,
      music: fileUploads.music ? URL.createObjectURL(fileUploads.music) : null,
      cursor: fileUploads.cursor ? URL.createObjectURL(fileUploads.cursor) : null,
    };
    setPreviews(newPreviews);

    return () => {
      Object.values(newPreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [fileUploads]);

  const backgroundMedia = previews.background || settings.backgroundUrl;
  const profileImage = previews.avatar || settings.profileImageUrl;

  // Detectar se o background é vídeo ou imagem
  const backgroundType = fileUploads.background
    ? getFileType(fileUploads.background)
    : settings.backgroundUrl
      ? getFileType(settings.backgroundUrl)
      : "unknown";

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 sm:inset-8 z-50 rounded-[var(--border-radius-xl)] overflow-hidden border border-[var(--color-border)]"
          >
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Monitor size={18} />
                <span className="text-sm font-medium">Preview ao Vivo</span>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="relative w-full h-full pt-14 overflow-auto">
              {/* Background: Vídeo ou Imagem */}
              {backgroundType === "video" && backgroundMedia ? (
                <video
                  ref={videoRef}
                  src={backgroundMedia}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : backgroundType === "image" && backgroundMedia ? (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${backgroundMedia})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{ backgroundColor: 'var(--color-background)' }}
                />
              )}

              {/* Conteúdo sobre o background */}
              <div className="relative flex items-center justify-center min-h-full p-8">
                <motion.div
                  className={`
                    relative max-w-md w-full p-6 rounded-2xl
                    ${settings.contentCenter ? 'text-center' : 'text-left'}
                  `}
                  style={{
                    backgroundColor: settings.cardColor
                      ? `${settings.cardColor}${Math.round(settings.cardOpacity * 2.55).toString(16).padStart(2, '0')}`
                      : `rgba(0, 0, 0, ${settings.cardOpacity / 100})`,
                    backdropFilter: `blur(${settings.cardBlur}px)`,
                    border: settings.rgbBorder ? '2px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                    transform: settings.cardPerspective ? 'perspective(1000px) rotateY(-5deg)' : undefined,
                  }}
                  whileHover={settings.cardHoverGrow ? { scale: 1.05 } : {}}
                >
                  <div className={`${settings.contentCenter ? 'flex justify-center' : ''} mb-4`}>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      )}
                    </div>
                  </div>

                  <h2
                    className={`
                      text-2xl font-bold mb-2
                      ${settings.neonName ? 'text-white drop-shadow-[0_0_10px_currentColor]' : ''}
                      ${settings.shinyName ? 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200' : ''}
                      ${settings.rgbName ? 'animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-green-500 to-blue-500' : ''}
                    `}
                    style={{
                      color: !settings.shinyName && !settings.rgbName ? 'white' : undefined,
                    }}
                  >
                    {settings.name || "Seu Nome"}
                  </h2>

                  <p
                    className="text-sm opacity-80"
                    style={{ color: settings.biographyColor || 'rgba(255,255,255,0.7)' }}
                  >
                    {settings.biography || "Sua biografia aparecerá aqui..."}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL COM INTEGRAÇÃO DO CONTEXT
// ═══════════════════════════════════════════════════════════

const DashboardCustomization = () => {
  // ═══════════════════════════════════════════════════════════
  // CONTEXTO DO PERFIL
  // ═══════════════════════════════════════════════════════════
  const {
    profileData,
    isLoadingProfile,
    refreshProfile
  } = useProfile();

  // ═══════════════════════════════════════════════════════════
  // CONFIGURAÇÕES PADRÃO
  // ═══════════════════════════════════════════════════════════
  const defaultSettings: CustomizationSettings = {
    cardOpacity: 80,
    cardBlur: 10,
    cardColor: "#1a1a2e",
    cardPerspective: false,
    cardHoverGrow: true,
    rgbBorder: false,
    biography: "",
    contentCenter: true,
    biographyColor: "#ffffff",
    name: "",
    neonName: false,
    shinyName: false,
    rgbName: false,
    backgroundUrl: "",
    profileImageUrl: "",
    musicUrl: "",
    cursorUrl: "",
    snowEffect: false,
    confettiEffect: false,
    matrixRainEffect: false,
    particlesEffect: false,
    particlesColor: "#ffffff",
  };

  // ═══════════════════════════════════════════════════════════
  // ESTADOS LOCAIS
  // ═══════════════════════════════════════════════════════════
  const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<CustomizationSettings>(defaultSettings);

  // Estado para arquivos de upload
  const [fileUploads, setFileUploads] = useState<FileUploads>({
    avatar: null,
    background: null,
    music: null,
    cursor: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // SINCRONIZAR COM DADOS DO CONTEXTO
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (profileData) {
      const loadedSettings = profileDataToSettings(profileData);
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    }
  }, [profileData]);

  // Detectar mudanças
  useEffect(() => {
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    const filesChanged = Object.values(fileUploads).some(file => file !== null);
    setHasChanges(settingsChanged || filesChanged);
  }, [settings, originalSettings, fileUploads]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleRefresh = useCallback(async () => {
    setError(null);
    try {
      await refreshProfile();
    } catch (err) {
      console.error("Erro ao recarregar configurações:", err);
      setError("Erro ao recarregar configurações.");
    }
  }, [refreshProfile]);

  const updateSetting = <K extends keyof CustomizationSettings>(
    key: K,
    value: CustomizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateFileUpload = (key: keyof FileUploads, file: File | null) => {
    setFileUploads(prev => ({ ...prev, [key]: file }));
  };

  const removeFile = (key: keyof FileUploads) => {
    setFileUploads(prev => ({ ...prev, [key]: null }));
    // Também limpar a URL correspondente se quiser "remover" o arquivo atual
    const urlKey = key === 'avatar' ? 'profileImageUrl' : `${key}Url` as keyof CustomizationSettings;
    if (urlKey in settings) {
      updateSetting(urlKey as keyof CustomizationSettings, "" as never);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress("");

    try {
      // Verificar se há arquivos para upload
      const hasFilesToUpload = Object.values(fileUploads).some(file => file !== null);

      if (hasFilesToUpload) {
        setUploadProgress("Fazendo upload dos arquivos...");

        const uploadResponse = await assetUploadService.uploadAssets({
          avatar: fileUploads.avatar,
          background: fileUploads.background,
          music: fileUploads.music,
          cursor: fileUploads.cursor,
        });

        // Atualizar as URLs com as retornadas pelo servidor
        if (uploadResponse.urls) {
          if (uploadResponse.urls.avatarUrl) {
            settings.profileImageUrl = uploadResponse.urls.avatarUrl;
          }
          if (uploadResponse.urls.backgroundUrl) {
            settings.backgroundUrl = uploadResponse.urls.backgroundUrl;
          }
          if (uploadResponse.urls.musicUrl) {
            settings.musicUrl = uploadResponse.urls.musicUrl;
          }
          if (uploadResponse.urls.cursorUrl) {
            settings.cursorUrl = uploadResponse.urls.cursorUrl;
          }
        }
      }

      setUploadProgress("Salvando configurações...");

      // Salvar as configurações
      const requestData = settingsToRequest(settings);
      await customizationService.updatePageSettings(requestData);

      // Atualizar o contexto global após salvar
      await refreshProfile();

      // Limpar arquivos de upload após sucesso
      setFileUploads({
        avatar: null,
        background: null,
        music: null,
        cursor: null,
      });

      setSuccessMessage("Configurações salvas com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err: unknown) {
      console.error("Erro ao salvar:", err);

      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };

      if (axiosError.response?.status === 403) {
        setError(axiosError.response.data?.message || "Você não tem permissão para usar este recurso.");
      } else if (axiosError.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (axiosError.response?.status === 413) {
        setError("Arquivo muito grande. Reduza o tamanho e tente novamente.");
      } else {
        setError(axiosError.response?.data?.message || "Erro ao salvar configurações. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setFileUploads({
      avatar: null,
      background: null,
      music: null,
      cursor: null,
    });
    setError(null);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

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

  // Loading State - usa o estado do contexto
  if (isLoadingProfile && !profileData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-[var(--color-primary)]" />
          <p className="text-[var(--color-text-muted)]">Carregando configurações...</p>
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
            Não foi possível carregar as configurações do seu perfil.
          </p>
          <motion.button
            onClick={handleRefresh}
            disabled={isLoadingProfile}
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
            {isLoadingProfile ? (
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
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--color-text-muted)] mb-3 sm:mb-4"
        >
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-[var(--color-text)]">Customização</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
              <Palette className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              Personalize seu perfil
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowPreview(true)}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-[var(--border-radius-md)]
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[var(--color-text)] text-sm font-medium
                hover:border-[var(--color-primary)]/50 transition-all duration-300
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye size={18} />
              <span className="hidden sm:inline">Preview</span>
            </motion.button>

            <motion.button
              onClick={handleRefresh}
              disabled={isLoadingProfile}
              className="
                p-2.5 rounded-[var(--border-radius-md)]
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                transition-all duration-300
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Recarregar"
            >
              <RefreshCw size={18} className={isLoadingProfile ? "animate-spin" : ""} />
            </motion.button>

            {hasChanges && (
              <motion.button
                onClick={handleReset}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-[var(--border-radius-md)]
                  bg-[var(--color-surface)] border border-[var(--color-border)]
                  text-[var(--color-text-muted)] text-sm font-medium
                  hover:text-[var(--color-text)] transition-all duration-300
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={18} />
                <span className="hidden sm:inline">Resetar</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Messages */}
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
            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-500/20 text-red-400">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 flex items-center gap-2 p-4 rounded-[var(--border-radius-md)] bg-green-500/10 border border-green-500/30"
          >
            <CheckCircle size={20} className="text-green-400" />
            <span className="text-sm text-green-400">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* CARD APPEARANCE */}
        <motion.div variants={itemVariants}>
          <CustomizationCard>
            <SectionHeader
              icon={Square}
              title="Aparência do Card"
              description="Personalize o visual do card do seu perfil"
            />
            <div className="space-y-6">
              <Slider
                label="Opacidade do Card"
                value={settings.cardOpacity}
                onChange={(value) => updateSetting("cardOpacity", value)}
                min={0}
                max={100}
                unit="%"
                icon={Layers}
              />
              <Slider
                label="Blur do Card"
                value={settings.cardBlur}
                onChange={(value) => updateSetting("cardBlur", value)}
                min={0}
                max={50}
                unit="px"
                icon={Sliders}
              />
              <ColorPicker
                label="Cor do Card"
                value={settings.cardColor}
                onChange={(value) => updateSetting("cardColor", value)}
                icon={Palette}
              />
              <div className="space-y-3 pt-2">
                <ToggleSwitch
                  label="Perspectiva 3D"
                  description="Efeito de profundidade"
                  checked={settings.cardPerspective}
                  onChange={(value) => updateSetting("cardPerspective", value)}
                  icon={Move}
                />
                <ToggleSwitch
                  label="Crescer ao Hover"
                  description="Card aumenta no hover"
                  checked={settings.cardHoverGrow}
                  onChange={(value) => updateSetting("cardHoverGrow", value)}
                  icon={Zap}
                />
                <ToggleSwitch
                  label="Borda RGB"
                  description="Borda animada colorida"
                  checked={settings.rgbBorder}
                  onChange={(value) => updateSetting("rgbBorder", value)}
                  icon={Sparkles}
                />
              </div>
            </div>
          </CustomizationCard>
        </motion.div>

        {/* PROFILE INFO */}
        <motion.div variants={itemVariants}>
          <CustomizationCard>
            <SectionHeader
              icon={Type}
              title="Informações do Perfil"
              description="Configure seu nome, biografia e estilos"
            />
            <div className="space-y-6">
              <Input
                label="Nome de Exibição"
                placeholder="Seu nome ou apelido"
                value={settings.name}
                onChange={(value) => updateSetting("name", value)}
                icon={Type}
                maxLength={30}
                helperText="Nome exibido em seu perfil"
                disabled={true}
              />
              <div className="space-y-3">
                <ToggleSwitch
                  label="Efeito Neon"
                  description="Brilho neon no nome"
                  checked={settings.neonName}
                  onChange={(value) => {
                    updateSetting("neonName", value);
                    if (value) {
                      updateSetting("shinyName", false);
                      updateSetting("rgbName", false);
                    }
                  }}
                  icon={Zap}
                />
                <ToggleSwitch
                  label="Efeito Brilhante"
                  description="Gradiente dourado"
                  checked={settings.shinyName}
                  onChange={(value) => {
                    updateSetting("shinyName", value);
                    if (value) {
                      updateSetting("neonName", false);
                      updateSetting("rgbName", false);
                    }
                  }}
                  icon={Sparkles}
                />
                <ToggleSwitch
                  label="Nome RGB"
                  description="Cores animadas"
                  checked={settings.rgbName}
                  onChange={(value) => {
                    updateSetting("rgbName", value);
                    if (value) {
                      updateSetting("neonName", false);
                      updateSetting("shinyName", false);
                    }
                  }}
                  icon={Palette}
                />
              </div>
              <Textarea
                label="Biografia"
                placeholder="Conte um pouco sobre você..."
                value={settings.biography}
                onChange={(value) => updateSetting("biography", value)}
                maxLength={200}
                rows={3}
              />
              <ColorPicker
                label="Cor da Biografia"
                value={settings.biographyColor}
                onChange={(value) => updateSetting("biographyColor", value)}
                icon={Type}
              />
              <ToggleSwitch
                label="Centralizar Conteúdo"
                description="Alinha conteúdo ao centro"
                checked={settings.contentCenter}
                onChange={(value) => updateSetting("contentCenter", value)}
                icon={AlignCenter}
              />
            </div>
          </CustomizationCard>
        </motion.div>

        {/* MEDIA UPLOADS */}
        <motion.div variants={itemVariants}>
          <CustomizationCard>
            <SectionHeader
              icon={Image}
              title="Mídia"
              description="Faça upload de imagens, vídeos, música e cursor"
            />
            <div className="space-y-6">
              <FileUpload
                label="Imagem/Vídeo de Fundo"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                file={fileUploads.background}
                currentUrl={settings.backgroundUrl}
                onFileSelect={(file) => updateFileUpload("background", file)}
                onRemove={() => removeFile("background")}
                icon={Image}
                helperText="Imagens (JPG, PNG, GIF, WebP) ou Vídeos (MP4, WebM, OGG)"
                previewType="media"
              />

              <FileUpload
                label="Foto de Perfil"
                accept="image/jpeg,image/png,image/gif,image/webp"
                file={fileUploads.avatar}
                currentUrl={settings.profileImageUrl}
                onFileSelect={(file) => updateFileUpload("avatar", file)}
                onRemove={() => removeFile("avatar")}
                icon={Upload}
                helperText="JPG, PNG, GIF ou WebP"
                previewType="image"
              />

              <FileUpload
                label="Música de Fundo"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                file={fileUploads.music}
                currentUrl={settings.musicUrl}
                onFileSelect={(file) => updateFileUpload("music", file)}
                onRemove={() => removeFile("music")}
                icon={Music}
                helperText="MP3, WAV ou OGG"
                previewType="audio"
              />

              <FileUpload
                label="Cursor Personalizado"
                accept="image/png,image/gif,image/x-icon,.cur"
                file={fileUploads.cursor}
                currentUrl={settings.cursorUrl}
                onFileSelect={(file) => updateFileUpload("cursor", file)}
                onRemove={() => removeFile("cursor")}
                icon={MousePointer2}
                helperText="PNG, GIF ou CUR"
                previewType="cursor"
              />
            </div>
          </CustomizationCard>
        </motion.div>

        {/* PAGE EFFECTS */}
        <motion.div variants={itemVariants}>
          <CustomizationCard>
            <SectionHeader
              icon={Sparkles}
              title="Efeitos da Página"
              description="Adicione efeitos visuais especiais"
            />
            <div className="space-y-4">
              <ToggleSwitch
                label="Efeito Neve"
                description="Flocos de neve caindo"
                checked={settings.snowEffect}
                onChange={(value) => updateSetting("snowEffect", value)}
                icon={Snowflake}
              />
              <ToggleSwitch
                label="Efeito Confete"
                description="Confetes coloridos"
                checked={settings.confettiEffect}
                onChange={(value) => updateSetting("confettiEffect", value)}
                icon={PartyPopper}
              />
              <ToggleSwitch
                label="Matrix Rain"
                description="Chuva estilo Matrix"
                checked={settings.matrixRainEffect}
                onChange={(value) => updateSetting("matrixRainEffect", value)}
                icon={Binary}
              />
              <ToggleSwitch
                label="Partículas"
                description="Partículas flutuantes"
                checked={settings.particlesEffect}
                onChange={(value) => updateSetting("particlesEffect", value)}
                icon={Atom}
              />
              <AnimatePresence>
                {settings.particlesEffect && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-4 border-l-2 border-[var(--color-primary)]/30">
                      <ColorPicker
                        label="Cor das Partículas"
                        value={settings.particlesColor}
                        onChange={(value) => updateSetting("particlesColor", value)}
                        icon={Palette}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-start gap-2 p-3 rounded-[var(--border-radius-sm)] bg-yellow-500/10 border border-yellow-500/30"
            >
              <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400/80">
                Muitos efeitos podem impactar a performance.
              </p>
            </motion.div>
          </CustomizationCard>
        </motion.div>
      </motion.div>

      {/* SAVE BUTTON */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="
              fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40
              flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4
              bg-[var(--color-background)]/90 backdrop-blur-xl
              border border-[var(--color-border)]
              rounded-[var(--border-radius-xl)] shadow-2xl
            "
          >
            <div className="hidden sm:block">
              <p className="text-sm text-[var(--color-text)]">
                {uploadProgress || "Você tem alterações não salvas"}
              </p>
            </div>

            <motion.button
              onClick={handleSave}
              disabled={isSubmitting}
              className="
                flex items-center gap-2 px-5 py-2.5
                rounded-[var(--border-radius-md)]
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
                text-white font-medium text-sm
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              whileHover={isSubmitting ? {} : { scale: 1.02 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploadProgress ? "Enviando..." : "Salvando..."}
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Alterações
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Preview Modal */}
      <LivePreview
        settings={settings}
        fileUploads={fileUploads}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default DashboardCustomization;