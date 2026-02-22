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
  CloudRain,
  DollarSign,
  CloudLightning,
  Cloud,
  Stars,
  AlignCenter,
  Upload,
  X,
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
  Info,
  Globe,
  Crown,
  PaintBucket,
} from "lucide-react";
import { customizationService } from "../../services/customizationService";
import { assetUploadService } from "../../services/assetUploadService";
import { useProfile } from "../../contexts/UserContext";
import type {
  CardSettings,
  ContentSettings,
  NameEffects,
  MediaUrls,
  PageEffects,
  UserPageFrontendRequest,
} from "../../types/customization.types";

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const DEFAULT_PROFILE_IMAGE = "https://vxo.lat/default-profile.png";

// ═══════════════════════════════════════════════════════════
// TIPOS LOCAIS
// ═══════════════════════════════════════════════════════════

type MediaType = "image" | "video" | "audio" | "unknown";
type BackgroundType = "media" | "color";

interface CustomizationSettings {
  // Card Settings
  cardOpacity: number;
  cardBlur: number;
  cardColor: string;
  cardPerspective: boolean;
  cardHoverGrow: boolean;
  rgbBorder: boolean;
  // Content Settings
  biography: string;
  contentCenter: boolean;
  biographyColor: string;
  // Name Effects
  name: string;
  neonName: boolean;
  shinyName: boolean;
  rgbName: boolean;
  // Media URLs
  backgroundUrl: string;
  profileImageUrl: string;
  musicUrl: string;
  cursorUrl: string;
  faviconUrl: string;
  // Background Type
  backgroundType: BackgroundType;
  staticBackgroundColor: string;
  // Page Effects
  snowEffect: boolean;
  rainEffect: boolean;
  cashEffect: boolean;
  thunderEffect: boolean;
  smokeEffect: boolean;
  starsEffect: boolean;
}

interface FileUploads {
  avatar: File | null;
  background: File | null;
  music: File | null;
  cursor: File | null;
  favicon: File | null;
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
  previewType?: "image" | "audio" | "cursor" | "media" | "favicon";
  minHeight?: string;
  disabled?: boolean;
  isPremiumFeature?: boolean;
  userIsPremium?: boolean;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTES PARA CLS 0
// ═══════════════════════════════════════════════════════════

const CARD_MIN_HEIGHTS = {
  cardAppearance: "540px",
  profileInfo: "680px",
  media: "880px",
  effects: "520px",
} as const;

const FILE_UPLOAD_HEIGHTS = {
  image: "160px",
  audio: "140px",
  cursor: "120px",
  media: "160px",
  favicon: "140px",
  empty: "120px",
} as const;

const STORAGE_KEY = "customization_backup";

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const getFileType = (file: File | string): MediaType => {
  if (typeof file === "string") {
    const ext = file.split('.').pop()?.toLowerCase().split('?')[0] || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'ico'].includes(ext)) return "image";
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return "video";
    if (['mp3', 'wav', 'ogg', 'oga'].includes(ext)) return "audio";
    return "unknown";
  } else {
    const type = file.type;
    if (type.startsWith('image/') || type === 'image/x-icon') return "image";
    if (type.startsWith('video/')) return "video";
    if (type.startsWith('audio/')) return "audio";
    return "unknown";
  }
};

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};



const getFromLocalStorage = (): Partial<CustomizationSettings> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.lastUpdated && Date.now() - parsed.lastUpdated < 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
    return null;
  } catch (e) {
    console.warn("Erro ao ler do localStorage:", e);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// TRANSFORMAÇÃO DE DADOS
// ═══════════════════════════════════════════════════════════

const profileDataToSettings = (
  profileData: NonNullable<ReturnType<typeof useProfile>['profileData']>
): CustomizationSettings => {
  const pageSettings = profileData?.pageSettings;
  const cardSettings = pageSettings?.cardSettings as CardSettings | undefined;
  const contentSettings = pageSettings?.contentSettings as ContentSettings | undefined;
  const nameEffects = pageSettings?.nameEffects as NameEffects | undefined;
  const mediaUrls = pageSettings?.mediaUrls as MediaUrls | undefined;
  const pageEffects = pageSettings?.pageEffects as PageEffects | undefined;

  // ✅ CORRIGIDO - Ler "staticBackgroundColor" (nome correto do backend)
  const staticColor = (pageSettings as { staticBackgroundColor?: string })?.staticBackgroundColor || "";
  const backgroundUrl = mediaUrls?.backgroundUrl || "";

  // ✅ CORRIGIDO - Detectar tipo de background
  // Se tem cor estática definida, prioriza cor sólida
  let backgroundType: BackgroundType = "media";

  if (staticColor && staticColor.trim() !== "") {
    backgroundType = "color";
  } else if (backgroundUrl && backgroundUrl.trim() !== "") {
    backgroundType = "media";
  }

  return {
    // Card Settings
    cardOpacity: cardSettings?.opacity ?? 80,
    cardBlur: cardSettings?.blur ?? 10,
    cardColor: cardSettings?.color ?? "#1a1a2e",
    cardPerspective: cardSettings?.perspective ?? false,
    cardHoverGrow: cardSettings?.hoverGrow ?? true,
    rgbBorder: cardSettings?.rgbBorder ?? false,
    // Content Settings
    biography: contentSettings?.biography ?? "",
    contentCenter: contentSettings?.centerAlign ?? true,
    biographyColor: contentSettings?.biographyColor ?? "#ffffff",
    // Name Effects
    name: nameEffects?.name ?? "",
    neonName: nameEffects?.neon ?? false,
    shinyName: nameEffects?.shiny ?? false,
    rgbName: nameEffects?.rgb ?? false,
    // Media URLs
    backgroundUrl: backgroundUrl,
    profileImageUrl: mediaUrls?.profileImageUrl || DEFAULT_PROFILE_IMAGE,
    musicUrl: mediaUrls?.musicUrl || "",
    cursorUrl: "",
    faviconUrl: mediaUrls?.faviconUrl || "",
    // ✅ Background Type
    backgroundType: backgroundType,
    staticBackgroundColor: staticColor || "#0a0a0f",
    // Page Effects
    snowEffect: pageEffects?.snow ?? false,
    rainEffect: pageEffects?.rain ?? false,
    cashEffect: pageEffects?.cash ?? false,
    thunderEffect: pageEffects?.thunder ?? false,
    smokeEffect: pageEffects?.smoke ?? false,
    starsEffect: pageEffects?.stars ?? false,
  };
};

const settingsToRequest = (settings: CustomizationSettings): UserPageFrontendRequest => {
  return {
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
      backgroundUrl: settings.backgroundType === "media" ? settings.backgroundUrl : "",
      // ✅ Envia a URL do settings, se estiver vazia manda a default
      profileImageUrl: settings.profileImageUrl || DEFAULT_PROFILE_IMAGE,
      musicUrl: settings.musicUrl,
      faviconUrl: settings.faviconUrl,
    },
    pageEffects: {
      snow: settings.snowEffect,
      rain: settings.rainEffect,
      cash: settings.cashEffect,
      thunder: settings.thunderEffect,
      smoke: settings.smokeEffect,
      stars: settings.starsEffect,
    },
    staticBackgroundColor: settings.backgroundType === "color" ? settings.staticBackgroundColor : "",
  };
};

// ═══════════════════════════════════════════════════════════
// SKELETON LOADER COMPONENT
// ═══════════════════════════════════════════════════════════

const SkeletonLoader = ({ className = "", height = "h-10" }: { className?: string; height?: string }) => (
  <div
    className={`${height} ${className} rounded-[var(--border-radius-md)] bg-[var(--color-surface)] animate-pulse`}
    style={{ minHeight: height }}
  />
);

const CardSkeleton = ({ minHeight }: { minHeight: string }) => (
  <div
    className="bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-6"
    style={{ minHeight }}
  >
    <div className="flex items-start gap-3 mb-6">
      <SkeletonLoader height="h-10" className="w-10" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader height="h-5" className="w-1/3" />
        <SkeletonLoader height="h-4" className="w-2/3" />
      </div>
    </div>
    <div className="space-y-4">
      <SkeletonLoader height="h-12" className="w-full" />
      <SkeletonLoader height="h-12" className="w-full" />
      <SkeletonLoader height="h-12" className="w-full" />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// AUDIO PLAYER COMPONENT
// ═══════════════════════════════════════════════════════════

const AudioPlayer = ({ src, fileName }: { src: string; fileName?: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlers = {
      loadedmetadata: () => { setDuration(audio.duration); setIsLoading(false); },
      timeupdate: () => setCurrentTime(audio.currentTime),
      ended: () => { setIsPlaying(false); setCurrentTime(0); },
      canplay: () => setIsLoading(false),
    };

    Object.entries(handlers).forEach(([event, handler]) =>
      audio.addEventListener(event, handler)
    );

    return () => {
      Object.entries(handlers).forEach(([event, handler]) =>
        audio.removeEventListener(event, handler)
      );
    };
  }, [src]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(true);
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.pause() : audio.play();
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
    <div className="w-full" style={{ minHeight: "64px" }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-background)]/50">
        <motion.button
          onClick={togglePlay}
          disabled={isLoading}
          className="p-2.5 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ minWidth: "40px", minHeight: "40px" }}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </motion.button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)] font-mono w-10 flex-shrink-0">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)] [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${progress}%, var(--color-border) ${progress}%, var(--color-border) 100%)`
              }}
            />
            <span className="text-xs text-[var(--color-text-muted)] font-mono w-10 text-right flex-shrink-0">
              {formatTime(duration)}
            </span>
          </div>
          {fileName && (
            <p className="text-xs text-[var(--color-text-muted)] truncate">{fileName}</p>
          )}
        </div>

        <motion.button
          onClick={toggleMute}
          className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors flex-shrink-0"
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
// CURSOR TEST COMPONENT
// ═══════════════════════════════════════════════════════════

const CursorTestArea = ({
  cursorUrl,
  fileName
}: {
  cursorUrl: string | null;
  fileName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorLoaded, setCursorLoaded] = useState(false);
  const [cursorError, setCursorError] = useState(false);

  useEffect(() => {
    if (!cursorUrl) {
      setCursorLoaded(false);
      setCursorError(false);
      return;
    }

    setCursorLoaded(false);
    setCursorError(false);

    const img = new window.Image();

    img.onload = () => {
      setCursorLoaded(true);
    };

    img.onerror = () => {
      setCursorError(true);
    };

    img.src = cursorUrl;
  }, [cursorUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cursorUrl || !cursorLoaded) return;

    const ext = fileName?.split('.').pop()?.toLowerCase() ||
      cursorUrl.split('.').pop()?.toLowerCase()?.split('?')[0] || '';

    let cursorCSS: string;

    if (ext === 'cur' || ext === 'ani') {
      cursorCSS = `url("${cursorUrl}"), auto`;
    } else {
      cursorCSS = `url("${cursorUrl}") 0 0, auto`;
    }

    container.style.cursor = cursorCSS;

    return () => {
      container.style.cursor = 'auto';
    };
  }, [cursorUrl, cursorLoaded, fileName]);

  if (!cursorUrl) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden mt-2"
    >
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          p-8 rounded-[var(--border-radius-md)] 
          bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] 
          border-2 border-dashed transition-all duration-300
          flex flex-col items-center justify-center text-center select-none
          ${cursorLoaded && !cursorError
            ? 'border-[var(--color-primary)]/50 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
            : cursorError
              ? 'border-red-500/30'
              : 'border-[var(--color-border)]'
          }
        `}
        style={{ minHeight: "140px" }}
      >
        {cursorError ? (
          <>
            <AlertCircle size={32} className="text-red-400 mb-3" />
            <p className="text-sm font-medium text-red-400 mb-1">
              Erro ao carregar cursor
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Verifique se o arquivo é válido
            </p>
          </>
        ) : !cursorLoaded ? (
          <>
            <Loader2 size={32} className="text-[var(--color-primary)] mb-3 animate-spin" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Carregando cursor...
            </p>
          </>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <MousePointer2 size={32} className="text-[var(--color-primary)] mb-3" />
            </motion.div>

            <p className="text-sm font-medium text-[var(--color-text)] mb-1">
              🎯 Área de Teste do Cursor
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              Mova o mouse aqui para testar seu cursor
            </p>

            <AnimatePresence>
              {isHovering && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30"
                >
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    Cursor ativo!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// BACKGROUND TYPE SELECTOR COMPONENT (sem gradiente)
// ═══════════════════════════════════════════════════════════

const BackgroundTypeSelector = ({
  value,
  onChange,
}: {
  value: BackgroundType;
  onChange: (type: BackgroundType) => void;
}) => {
  return (
    <div className="space-y-2" style={{ minHeight: "80px" }}>
      <div className="flex items-center gap-2 h-6">
        <Image size={16} className="text-[var(--color-primary)]" />
        <label className="text-sm font-medium text-[var(--color-text)]">
          Tipo de Fundo
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Mídia */}
        <motion.button
          onClick={() => onChange("media")}
          className={`
            flex flex-col items-center justify-center gap-1.5 p-3 rounded-[var(--border-radius-md)]
            border-2 transition-all duration-300
            ${value === "media"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`p-2 rounded-full ${value === "media" ? "bg-[var(--color-primary)]/20" : "bg-[var(--color-border)]"}`}>
            <Image size={16} className={value === "media" ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"} />
          </div>
          <p className={`text-xs font-medium ${value === "media" ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>
            Mídia
          </p>
        </motion.button>

        {/* Cor Sólida */}
        <motion.button
          onClick={() => onChange("color")}
          className={`
            flex flex-col items-center justify-center gap-1.5 p-3 rounded-[var(--border-radius-md)]
            border-2 transition-all duration-300
            ${value === "color"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`p-2 rounded-full ${value === "color" ? "bg-[var(--color-primary)]/20" : "bg-[var(--color-border)]"}`}>
            <PaintBucket size={16} className={value === "color" ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"} />
          </div>
          <p className={`text-xs font-medium ${value === "color" ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>
            Cor Sólida
          </p>
        </motion.button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FILE UPLOAD COMPONENT
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
  minHeight,
  disabled = false,
  isPremiumFeature = false,
  userIsPremium = false,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("unknown");
  const [imageError, setImageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLocked = isPremiumFeature && !userIsPremium;
  const finalDisabled = disabled || isLocked;

  const computedMinHeight = minHeight || (
    previewType === "audio" ? FILE_UPLOAD_HEIGHTS.audio :
      previewType === "cursor" ? FILE_UPLOAD_HEIGHTS.cursor :
        previewType === "media" ? FILE_UPLOAD_HEIGHTS.media :
          previewType === "favicon" ? FILE_UPLOAD_HEIGHTS.favicon :
            previewType === "image" ? FILE_UPLOAD_HEIGHTS.image :
              FILE_UPLOAD_HEIGHTS.empty
  );

  useEffect(() => {
    setImageError(false);

    if (file) {
      const fileType = getFileType(file);
      setMediaType(fileType);
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (currentUrl && currentUrl !== DEFAULT_PROFILE_IMAGE) {
      const urlType = getFileType(currentUrl);
      setMediaType(urlType);
      setPreview(currentUrl);
    } else {
      setPreview(null);
      setMediaType("unknown");
    }
  }, [file, currentUrl]);

  const validateFile = (file: File): boolean => {
    setError(null);
    const acceptedTypes = accept.split(",").map(t => t.trim());
    const fileType = file.type;
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;

    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith(".")) return fileExt === type.toLowerCase();
      if (type.endsWith("/*")) return fileType.startsWith(type.replace("/*", "/"));
      return fileType === type;
    });

    if (!isValidType) {
      setError(`Tipo de arquivo não permitido. Use: ${accept}`);
      return false;
    }

    if (previewType === "cursor") {
      const validCursorExts = [".cur", ".ani", ".png", ".gif"];
      if (!validCursorExts.includes(fileExt)) {
        setError("Use arquivos .cur, .ani, .png ou .gif para cursor");
        return false;
      }
      const maxSize = 512 * 1024;
      if (file.size > maxSize) {
        setError("Arquivo de cursor muito grande. Máximo: 512KB");
        return false;
      }
    }

    if (previewType === "favicon") {
      const validFaviconExts = [".ico", ".png", ".svg"];
      if (!validFaviconExts.includes(fileExt)) {
        setError("Use arquivos .ico, .png ou .svg para favicon");
        return false;
      }
      const maxSize = 256 * 1024;
      if (file.size > maxSize) {
        setError("Arquivo de favicon muito grande. Máximo: 256KB");
        return false;
      }
    }

    return true;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0 || finalDisabled) return;
    const selectedFile = files[0];
    if (validateFile(selectedFile)) {
      setImageError(false);
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!finalDisabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!finalDisabled) handleFileChange(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!finalDisabled) inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (finalDisabled) return;
    setImageError(false);
    onRemove();
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getFileIcon = () => {
    if (previewType === "audio" || mediaType === "audio") return FileAudio;
    if (previewType === "cursor") return MousePointer2;
    if (previewType === "favicon") return Globe;
    if (previewType === "image" || mediaType === "image") return FileImage;
    return File;
  };

  const FileIcon = getFileIcon();
  const hasFile = file || (currentUrl && currentUrl !== DEFAULT_PROFILE_IMAGE);
  const currentMediaType = file ? getFileType(file) : currentUrl ? getFileType(currentUrl) : "unknown";
  const audioSrc = previewType === "audio" ? preview : null;
  const isCursorFile = previewType === "cursor";
  const isFaviconFile = previewType === "favicon";

  const shouldShowImagePreview = (
    !isCursorFile &&
    !isFaviconFile &&
    (previewType === "image" ||
      (previewType === "media" && currentMediaType === "image")) &&
    preview &&
    !imageError
  );

  const shouldShowVideoPreview = (
    previewType === "media" &&
    currentMediaType === "video" &&
    preview
  );

  const cursorAccept = ".cur,.ani,.png,.gif,image/png,image/gif";
  const faviconAccept = ".ico,.png,.svg,image/x-icon,image/png,image/svg+xml";

  return (
    <div className="space-y-2" style={{ minHeight: `calc(${computedMinHeight} + 40px)` }}>
      {/* HEADER */}
      <div className="flex items-center justify-between h-6">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className={finalDisabled ? "text-[var(--color-text-muted)]" : "text-[var(--color-primary)]"} />}
          <label className={`text-sm font-medium ${finalDisabled ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"}`}>
            {label}
          </label>
          {isPremiumFeature && !userIsPremium && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center gap-1">
              <Crown size={10} />
              PREMIUM
            </span>
          )}
          {disabled && !isPremiumFeature && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              Em Breve
            </span>
          )}
        </div>
        {file && !finalDisabled && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>

      {/* INPUT HIDDEN */}
      <input
        ref={inputRef}
        type="file"
        accept={previewType === "cursor" ? cursorAccept : previewType === "favicon" ? faviconAccept : accept}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
        disabled={finalDisabled}
      />

      {/* UPLOAD AREA */}
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-[var(--border-radius-md)] border-2 border-dashed transition-all duration-300 overflow-hidden ${finalDisabled
          ? "border-[var(--color-border)] bg-[var(--color-surface)]/50 cursor-not-allowed opacity-60"
          : isDragging
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : hasFile
              ? "border-[var(--color-border)] bg-[var(--color-surface)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-surface)]"
          } ${finalDisabled ? "" : "cursor-pointer"}`}
        style={{ minHeight: computedMinHeight }}
        whileHover={finalDisabled ? {} : { scale: 1.005 }}
        whileTap={finalDisabled ? {} : { scale: 0.995 }}
      >
        {hasFile && !finalDisabled ? (
          <div className="relative h-full">
            {/* PREVIEW DE FAVICON */}
            {isFaviconFile && (
              <div
                className="relative w-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] p-6"
                style={{ minHeight: computedMinHeight }}
              >
                <div className="relative">
                  {preview && !imageError ? (
                    <div className="p-4 rounded-2xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 mb-4">
                      <img
                        src={preview}
                        alt="Favicon Preview"
                        className="w-16 h-16 object-contain"
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 mb-4">
                      <Globe size={48} className="text-[var(--color-primary)]" />
                    </div>
                  )}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <CheckCircle size={10} />
                      OK
                    </span>
                  </motion.div>
                </div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                  Favicon Personalizado
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[90%]">
                  {file?.name || "Favicon configurado"}
                </p>
                <motion.button
                  onClick={handleRemove}
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={14} />
                </motion.button>
                {file && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/90 text-white">
                      Novo
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PREVIEW DE CURSOR */}
            {isCursorFile && (
              <div
                className="relative w-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] p-6"
                style={{ minHeight: computedMinHeight }}
              >
                <div className="relative">
                  <div className="p-6 rounded-2xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 mb-4">
                    <MousePointer2 size={48} className="text-[var(--color-primary)]" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <CheckCircle size={10} />
                      OK
                    </span>
                  </motion.div>
                </div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-1">
                  Cursor Personalizado
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[90%]">
                  {file?.name || "Cursor configurado"}
                </p>
                <motion.button
                  onClick={handleRemove}
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={14} />
                </motion.button>
                {file && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/90 text-white">
                      Novo
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PREVIEW DE IMAGEM */}
            {shouldShowImagePreview && (
              <div className="relative w-full" style={{ minHeight: "128px" }}>
                <img
                  src={preview!}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  style={{ minHeight: "128px", maxHeight: "160px" }}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            )}

            {/* FALLBACK QUANDO IMAGEM FALHA */}
            {!isCursorFile && !isFaviconFile && (previewType === "image" ||
              (previewType === "media" && currentMediaType === "image")) &&
              preview && imageError && (
                <div
                  className="relative w-full flex flex-col items-center justify-center bg-[var(--color-surface)]"
                  style={{ minHeight: "128px" }}
                >
                  <FileImage size={32} className="text-[var(--color-text-muted)] mb-2" />
                  <p className="text-xs text-[var(--color-text-muted)]">Erro ao carregar imagem</p>
                </div>
              )}

            {/* PREVIEW DE VÍDEO */}
            {shouldShowVideoPreview && (
              <div className="relative w-full" style={{ minHeight: "128px" }}>
                <video
                  ref={videoRef}
                  src={preview!}
                  className="w-full h-32 object-cover"
                  loop
                  muted
                  autoPlay
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            )}

            {/* AUDIO PLAYER */}
            {previewType === "audio" && (
              <div className="p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-[var(--color-primary)]/20 flex-shrink-0">
                    <Music size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {file?.name || "Música atual"}
                    </p>
                  </div>
                  <motion.button
                    onClick={handleRemove}
                    className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
                {audioSrc && <AudioPlayer src={audioSrc} fileName={file?.name} />}
              </div>
            )}

            {/* INFO BAR */}
            {previewType !== "audio" && !isCursorFile && !isFaviconFile && (
              <div className={`${(shouldShowImagePreview || shouldShowVideoPreview) && !imageError
                ? "absolute bottom-0 left-0 right-0 p-3"
                : "px-4 py-3"
                } flex items-center justify-between`}>
                <div className="flex items-center gap-2 text-white min-w-0">
                  <FileIcon size={14} className="flex-shrink-0" />
                  <span className="text-xs truncate max-w-[150px]">
                    {file?.name || "Arquivo atual"}
                  </span>
                </div>
                <motion.button
                  onClick={handleRemove}
                  className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            )}

            {/* BADGE DE NOVO ARQUIVO */}
            {file && previewType !== "audio" && !isCursorFile && !isFaviconFile && (
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/90 text-white">
                  Novo
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            className="p-6 flex flex-col items-center justify-center text-center"
            style={{ minHeight: computedMinHeight }}
          >
            <div className={`p-3 rounded-full mb-3 transition-colors ${finalDisabled
              ? "bg-[var(--color-surface-elevated)]"
              : isDragging
                ? "bg-[var(--color-primary)]/20"
                : "bg-[var(--color-surface-elevated)]"
              }`}>
              <Upload
                size={24}
                className={finalDisabled ? "text-[var(--color-text-muted)]" : isDragging ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
              />
            </div>
            <p className="text-sm text-[var(--color-text)]">
              {isLocked ? "Recurso exclusivo Premium" : disabled ? "Funcionalidade em breve" : isDragging ? "Solte o arquivo aqui" : "Clique ou arraste um arquivo"}
            </p>
            {previewType === "cursor" && !finalDisabled && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                PNG, GIF, .cur ou .ani (recomendado: 32x32px)
              </p>
            )}
            {previewType === "favicon" && !finalDisabled && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                ICO (recomendado: 32x32px ou 16x16px)
              </p>
            )}
            {isLocked && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <Crown size={12} />
                Faça upgrade para desbloquear
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* ÁREA DE TESTE DO CURSOR */}
      <AnimatePresence>
        {isCursorFile && preview && !finalDisabled && (
          <CursorTestArea cursorUrl={preview} fileName={file?.name} />
        )}
      </AnimatePresence>

      {/* HELPER TEXT */}
      {helperText && !error && (
        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 h-4">
          <Info size={12} className="flex-shrink-0" />
          {helperText}
        </p>
      )}

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-400 flex items-center gap-1 h-4"
          >
            <AlertCircle size={12} className="flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
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
  disabled = false,
  isPremiumFeature = false,
  userIsPremium = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
  disabled?: boolean;
  isPremiumFeature?: boolean;
  userIsPremium?: boolean;
}) => {
  const isLocked = isPremiumFeature && !userIsPremium;
  const finalDisabled = disabled || isLocked;

  return (
    <motion.div
      className={`flex items-center justify-between p-3 sm:p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-300 ${finalDisabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:border-[var(--color-primary)]/30'
        }`}
      style={{ minHeight: "64px" }}
      whileHover={finalDisabled ? {} : { scale: 1.005 }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className={`p-2 rounded-[var(--border-radius-sm)] flex-shrink-0 ${finalDisabled
            ? 'bg-[var(--color-text-muted)]/10'
            : 'bg-[var(--color-primary)]/10'
            }`}>
            <Icon
              size={18}
              className={finalDisabled ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-primary)]'}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium block truncate ${finalDisabled ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
              }`}>
              {label}
            </span>
            {isPremiumFeature && !userIsPremium && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex-shrink-0 flex items-center gap-1">
                <Crown size={10} />
                PREMIUM
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
      <motion.button
        onClick={() => !finalDisabled && onChange(!checked)}
        disabled={finalDisabled}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ml-3 ${finalDisabled
          ? 'cursor-not-allowed bg-[var(--color-border)]/50'
          : checked
            ? 'bg-[var(--color-primary)] cursor-pointer'
            : 'bg-[var(--color-border)] cursor-pointer'
          }`}
        whileTap={finalDisabled ? {} : { scale: 0.95 }}
        aria-label={`Toggle ${label}`}
      >
        <motion.div
          className={`absolute top-1 w-4 h-4 rounded-full shadow-md ${finalDisabled ? 'bg-gray-400' : 'bg-white'
            }`}
          animate={{ left: checked ? '28px' : '4px' }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </motion.div>
  );
};

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
  <div className="space-y-3" style={{ minHeight: "56px" }}>
    <div className="flex items-center justify-between h-6">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-[var(--color-primary)]" />}
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      </div>
      <span className="text-sm font-medium text-[var(--color-primary)] tabular-nums w-12 text-right">
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
      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--color-border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:shadow-lg"
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
  const safeValue = value || "#ffffff";

  return (
    <div className="space-y-3" style={{ minHeight: "100px" }}>
      <div className="flex items-center gap-2 h-6">
        {Icon && <Icon size={16} className="text-[var(--color-primary)]" />}
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-[var(--border-radius-md)] cursor-pointer border-2 border-[var(--color-border)] overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none flex-shrink-0"
        />
        <input
          type="text"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="flex-1 px-3 py-2 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all duration-300 min-w-0"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <motion.button
            key={color}
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-full border-2 transition-all flex-shrink-0 ${safeValue.toLowerCase() === color.toLowerCase()
              ? 'border-[var(--color-primary)] scale-110'
              : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              }`}
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Select color ${color}`}
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
  const safeValue = value ?? "";

  return (
    <div className="space-y-2" style={{ minHeight: "80px" }}>
      <div className="flex items-center justify-between h-6">
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        {maxLength && (
          <span className={`text-xs tabular-nums ${safeValue.length >= maxLength ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
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
          className={`w-full px-4 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border transition-all duration-300 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 ${Icon ? "pl-10" : ""} ${error ? "border-red-500/50 focus:border-red-500" : "border-[var(--color-border)] focus:border-[var(--color-primary)]"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ minHeight: "48px" }}
        />
      </div>
      {helperText && !error && (
        <p className="text-xs text-[var(--color-text-muted)] h-4">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 h-4">
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
  const safeValue = value ?? "";

  return (
    <div className="space-y-2" style={{ minHeight: `${rows * 24 + 60}px` }}>
      <div className="flex items-center justify-between h-6">
        <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        {maxLength && (
          <span className={`text-xs tabular-nums ${safeValue.length >= maxLength ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
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
        className="w-full px-4 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all duration-300 resize-none"
        style={{ minHeight: `${rows * 24 + 24}px` }}
      />
      {helperText && (
        <p className="text-xs text-[var(--color-text-muted)] h-4">{helperText}</p>
      )}
    </div>
  );
};

const CustomizationCard = ({
  children,
  className = "",
  minHeight,
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-6 ${className}`}
    style={{ minHeight }}
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
  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6" style={{ minHeight: "56px" }}>
    <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
      <Icon size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)]" />
    </div>
    <div className="min-w-0 flex-1">
      <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1">{description}</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const DashboardCustomization = () => {
  type EffectKey =
    | "snowEffect"
    | "rainEffect"
    | "cashEffect"
    | "thunderEffect"
    | "smokeEffect"
    | "starsEffect";

  const handleEffectToggle = (effectKey: EffectKey, value: boolean) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        snowEffect: false,
        rainEffect: false,
        cashEffect: false,
        thunderEffect: false,
        smokeEffect: false,
        starsEffect: false,
      };
      if (value) {
        newSettings[effectKey] = true;
      }
      return newSettings;
    });
  };

  const { profileData, isLoadingProfile, refreshProfile } = useProfile();

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
    profileImageUrl: DEFAULT_PROFILE_IMAGE,
    musicUrl: "",
    cursorUrl: "",
    faviconUrl: "",
    backgroundType: "media",
    staticBackgroundColor: "#0a0a0f",
    snowEffect: false,
    rainEffect: false,
    cashEffect: false,
    thunderEffect: false,
    smokeEffect: false,
    starsEffect: false,
  };

  const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<CustomizationSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUploads>({
    avatar: null,
    background: null,
    music: null,
    cursor: null,
    favicon: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const userIsPremium = profileData?.isPremium ?? false;

  // Carrega settings do profileData
  useEffect(() => {
    if (profileData && profileData.pageSettings) {
      const loadedSettings = profileDataToSettings(profileData);

      const backup = getFromLocalStorage();

      const finalSettings: CustomizationSettings = {
        ...loadedSettings,
        profileImageUrl: loadedSettings.profileImageUrl || backup?.profileImageUrl || DEFAULT_PROFILE_IMAGE,
        backgroundUrl: loadedSettings.backgroundUrl || backup?.backgroundUrl || "",
        musicUrl: loadedSettings.musicUrl || backup?.musicUrl || "",
        cursorUrl: loadedSettings.cursorUrl || backup?.cursorUrl || "",
        faviconUrl: loadedSettings.faviconUrl || backup?.faviconUrl || "",
        staticBackgroundColor: loadedSettings.staticBackgroundColor || backup?.staticBackgroundColor || "#0a0a0f",
        backgroundType: loadedSettings.backgroundType || backup?.backgroundType || "media",
      };

      setSettings(finalSettings);
      setOriginalSettings(finalSettings);
      setIsInitialized(true);

      if (finalSettings.profileImageUrl || finalSettings.backgroundUrl || finalSettings.faviconUrl) {
        
      }
    }
  }, [profileData]);

  // Detecta mudanças
  useEffect(() => {
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    const filesChanged = Object.values(fileUploads).some(file => file !== null);
    setHasChanges(settingsChanged || filesChanged);
  }, [settings, originalSettings, fileUploads]);

  // Salva no localStorage
  useEffect(() => {
    if (isInitialized && (settings.profileImageUrl || settings.backgroundUrl || settings.faviconUrl || settings.staticBackgroundColor)) {
      
    }
  }, [
    isInitialized,
    settings.profileImageUrl,
    settings.backgroundUrl,
    settings.musicUrl,
    settings.cursorUrl,
    settings.faviconUrl,
    settings.staticBackgroundColor,
    settings.backgroundType,
  ]);

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

  // ✅ Remove file - avatar usa URL padrão
  const removeFile = (key: keyof FileUploads) => {
    setFileUploads(prev => ({ ...prev, [key]: null }));

    const urlKeyMap: Record<keyof FileUploads, keyof CustomizationSettings> = {
      avatar: 'profileImageUrl',
      background: 'backgroundUrl',
      music: 'musicUrl',
      cursor: 'cursorUrl',
      favicon: 'faviconUrl',
    };

    const urlKey = urlKeyMap[key];

    if (urlKey) {
      if (key === 'avatar') {
        // ✅ Ao remover avatar, substituir pela URL padrão da plataforma
        updateSetting('profileImageUrl', DEFAULT_PROFILE_IMAGE);
      } else {
        updateSetting(urlKey, "" as never);
      }
    }
  };
  const handleSave = async () => {
  setIsSubmitting(true);
  setError(null);
  setUploadProgress("");

  try {
    let updatedSettings = { ...settings };

    const hasFilesToUpload = Object.values(fileUploads).some(file => file !== null);

    if (hasFilesToUpload) {
      setUploadProgress("Fazendo upload dos arquivos...");

      const uploadResponse = await assetUploadService.uploadAssets({
        avatar: fileUploads.avatar,
        background: fileUploads.background,
        music: fileUploads.music,
        cursor: fileUploads.cursor,
        favicon: fileUploads.favicon,
      });

      console.log("📦 Upload response:", uploadResponse);

      // ✅ Atualiza as URLs com as retornadas do backend
      if (uploadResponse.success && uploadResponse.urls) {
        if (uploadResponse.urls.avatarUrl) {
          console.log("✅ Nova avatarUrl:", uploadResponse.urls.avatarUrl);
          updatedSettings.profileImageUrl = uploadResponse.urls.avatarUrl;
        }
        if (uploadResponse.urls.backgroundUrl) {
          console.log("✅ Nova backgroundUrl:", uploadResponse.urls.backgroundUrl);
          updatedSettings.backgroundUrl = uploadResponse.urls.backgroundUrl;
        }
        if (uploadResponse.urls.musicUrl) {
          console.log("✅ Nova musicUrl:", uploadResponse.urls.musicUrl);
          updatedSettings.musicUrl = uploadResponse.urls.musicUrl;
        }
        if (uploadResponse.urls.cursorUrl) {
          console.log("✅ Nova cursorUrl:", uploadResponse.urls.cursorUrl);
          updatedSettings.cursorUrl = uploadResponse.urls.cursorUrl;
        }
        if (uploadResponse.urls.faviconUrl) {
          console.log("✅ Nova faviconUrl:", uploadResponse.urls.faviconUrl);
          updatedSettings.faviconUrl = uploadResponse.urls.faviconUrl;
        }
      } else if (!uploadResponse.success) {
        // Se o upload falhou, mostra erro mas continua tentando salvar as outras configs
        console.warn("⚠️ Upload falhou:", uploadResponse.message);
      }
    }

    setUploadProgress("Salvando configurações...");

    // ✅ Agora updatedSettings tem as URLs corretas!
    const requestData = settingsToRequest(updatedSettings);
    console.log("📤 Enviando para updatePageSettings:", requestData);

    await customizationService.updatePageSettings(requestData);

    // ✅ Atualiza o estado local com as novas configurações
    setSettings(updatedSettings);
    setOriginalSettings(updatedSettings);

    

    // ✅ Atualiza o contexto do perfil
    await refreshProfile();

    // ✅ Limpa os arquivos selecionados
    setFileUploads({ 
      avatar: null, 
      background: null, 
      music: null, 
      cursor: null, 
      favicon: null 
    });

    // ✅ Mostra mensagem de sucesso
    setSuccessMessage("Configurações salvas com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000);

  } catch (err: unknown) {
    console.error("❌ Erro ao salvar:", err);
    
    const axiosError = err as { 
      response?: { 
        status?: number; 
        data?: { message?: string } 
      };
      message?: string;
    };

    if (axiosError.response?.status === 403) {
      setError(axiosError.response.data?.message || "Você não tem permissão para usar este recurso.");
    } else if (axiosError.response?.status === 401) {
      setError("Sessão expirada. Faça login novamente.");
    } else if (axiosError.response?.status === 413) {
      setError("Arquivo muito grande. Reduza o tamanho e tente novamente.");
    } else if (axiosError.response?.status === 400) {
      setError(axiosError.response.data?.message || "Dados inválidos. Verifique os campos e tente novamente.");
    } else {
      setError(
        axiosError.response?.data?.message || 
        axiosError.message || 
        "Erro ao salvar configurações. Tente novamente."
      );
    }
  } finally {
    setIsSubmitting(false);
    setUploadProgress("");
  }
};

  const handleReset = () => {
    setSettings(originalSettings);
    setFileUploads({ avatar: null, background: null, music: null, cursor: null, favicon: null });
    setError(null);
  };

  // Loading State
  if (isLoadingProfile && !profileData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] pb-8">
        <div className="mb-6 sm:mb-8" style={{ minHeight: "100px" }}>
          <SkeletonLoader height="h-5" className="w-32 mb-4" />
          <SkeletonLoader height="h-10" className="w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <CardSkeleton minHeight={CARD_MIN_HEIGHTS.cardAppearance} />
          <CardSkeleton minHeight={CARD_MIN_HEIGHTS.profileInfo} />
          <CardSkeleton minHeight={CARD_MIN_HEIGHTS.media} />
          <CardSkeleton minHeight={CARD_MIN_HEIGHTS.effects} />
        </div>
      </div>
    );
  }

  // Error State
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
            className="flex items-center gap-2 px-4 py-2.5 mx-auto rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium text-sm transition-all duration-300"
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
    <div className="min-h-screen bg-[var(--color-background)] pb-24">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8" style={{ minHeight: "100px" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--color-text-muted)] mb-3 sm:mb-4 h-5"
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
              <Palette className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
                Personalize seu perfil
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 hidden sm:block">
                Ajuste cores, efeitos e mídias do seu perfil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              onClick={() => {
                const slug = profileData?.slug;
                if (slug) {
                  window.open(`https://vxo.lat/${slug}`, '_blank');
                }
              }}
              disabled={!profileData?.slug}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:border-[var(--color-primary)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ minHeight: "40px" }}
              title={profileData?.slug ? `Abrir vxo.lat/${profileData.slug}` : "Slug não disponível"}
            >
              <Eye size={18} />
              <span className="hidden sm:inline">Ver Perfil</span>
            </motion.button>

            <motion.button
              onClick={handleRefresh}
              disabled={isLoadingProfile}
              className="p-2 sm:p-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Recarregar"
              style={{ minWidth: "40px", minHeight: "40px" }}
            >
              <RefreshCw size={18} className={isLoadingProfile ? "animate-spin" : ""} />
            </motion.button>

            <AnimatePresence>
              {hasChanges && (
                <motion.button
                  onClick={handleReset}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm font-medium hover:text-[var(--color-text)] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ minHeight: "40px" }}
                >
                  <RotateCcw size={18} />
                  <span className="hidden sm:inline">Resetar</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Messages */}
      <div style={{ minHeight: "0px" }}>
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
              <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-500/20 text-red-400 flex-shrink-0">
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
              <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
              <span className="text-sm text-green-400">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD APPEARANCE */}
        <CustomizationCard minHeight={CARD_MIN_HEIGHTS.cardAppearance}>
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
              max={20}
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
                description="Efeito de profundidade (Premium)"
                checked={settings.cardPerspective}
                onChange={(value) => updateSetting("cardPerspective", value)}
                icon={Move}
              />
              <ToggleSwitch
                label="Crescer ao Hover"
                description="Card aumenta no hover (Premium)"
                checked={settings.cardHoverGrow}
                onChange={(value) => updateSetting("cardHoverGrow", value)}
                icon={Zap}
              />
              <ToggleSwitch
                label="Borda RGB"
                description="Borda animada colorida (Premium)"
                checked={settings.rgbBorder}
                onChange={(value) => updateSetting("rgbBorder", value)}
                icon={Sparkles}
              />
            </div>
          </div>
        </CustomizationCard>

        {/* PROFILE INFO */}
        <CustomizationCard minHeight={CARD_MIN_HEIGHTS.profileInfo}>
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
                isPremiumFeature={true}
                userIsPremium={userIsPremium}
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
                isPremiumFeature={true}
                userIsPremium={userIsPremium}
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

        {/* MEDIA UPLOADS */}
        <CustomizationCard minHeight={CARD_MIN_HEIGHTS.media}>
          <SectionHeader
            icon={Image}
            title="Mídia"
            description="Faça upload de imagens, vídeos, música e cursor"
          />
          <div className="space-y-6">
            {/* SELETOR DE TIPO DE FUNDO (sem gradiente) */}
            <BackgroundTypeSelector
              value={settings.backgroundType}
              onChange={(type) => {
                updateSetting("backgroundType", type);
                if (type === "color") {
                  setFileUploads(prev => ({ ...prev, background: null }));
                  updateSetting("backgroundUrl", "");
                }
              }}
            />

            {/* CONDICIONAL - Mostra FileUpload ou ColorPicker */}
            <AnimatePresence mode="wait">
              {settings.backgroundType === "media" && (
                <motion.div
                  key="media-upload"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FileUpload
                    label="Imagem/Vídeo de Fundo"
                    accept="image/jpeg,image/png,image/gif,image/mp4,video/webm,video/ogg"
                    file={fileUploads.background}
                    currentUrl={settings.backgroundUrl}
                    onFileSelect={(file) => updateFileUpload("background", file)}
                    onRemove={() => removeFile("background")}
                    icon={Image}
                    helperText="Imagens (JPG, PNG, GIF) ou Vídeos (MP4, WebM, OGG)"
                    previewType="media"
                  />
                </motion.div>
              )}

              {settings.backgroundType === "color" && (
                <motion.div
                  key="color-picker"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ColorPicker
                    label="Cor de Fundo"
                    value={settings.staticBackgroundColor}
                    onChange={(value) => updateSetting("staticBackgroundColor", value)}
                    icon={PaintBucket}
                    presetColors={[
                      "#0a0a0f", "#1a1a2e", "#16213e", "#0f3460",
                      "#1e1e1e", "#2d2d2d", "#1a1a1a", "#0d0d0d",
                      "#1b1b2f", "#162447", "#1f4068", "#1b262c",
                      "#222831", "#393e46", "#30475e", "#2c3e50"
                    ]}
                  />

                  {/* Preview da cor */}
                  <div className="mt-4 p-4 rounded-[var(--border-radius-md)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">Preview do fundo:</p>
                    <div
                      className="w-full h-24 rounded-[var(--border-radius-sm)] border border-[var(--color-border)]"
                      style={{ backgroundColor: settings.staticBackgroundColor }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <FileUpload
              label="Foto de Perfil"
              accept="image/jpeg,image/png,image/gif"
              file={fileUploads.avatar}
              currentUrl={settings.profileImageUrl !== DEFAULT_PROFILE_IMAGE ? settings.profileImageUrl : undefined}
              onFileSelect={(file) => updateFileUpload("avatar", file)}
              onRemove={() => removeFile("avatar")}
              icon={Upload}
              helperText="JPG, PNG, GIF"
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
              accept=".cur,.ani,.png,.gif,image/png,image/gif"
              file={fileUploads.cursor}
              currentUrl={settings.cursorUrl}
              onFileSelect={(file) => updateFileUpload("cursor", file)}
              onRemove={() => removeFile("cursor")}
              icon={MousePointer2}
              helperText="PNG, GIF, .cur ou .ani (recomendado: 32x32px)"
              previewType="cursor"
              disabled={true}
            />

            <FileUpload
              label="Favicon da Página"
              accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
              file={fileUploads.favicon}
              currentUrl={settings.faviconUrl}
              onFileSelect={(file) => updateFileUpload("favicon", file)}
              onRemove={() => removeFile("favicon")}
              icon={Globe}
              helperText="ICO (recomendado: 32x32px ou 16x16px)"
              previewType="favicon"
              isPremiumFeature={true}
              userIsPremium={userIsPremium}
            />
          </div>
        </CustomizationCard>

        {/* PAGE EFFECTS */}
        <CustomizationCard minHeight={CARD_MIN_HEIGHTS.effects}>
          <SectionHeader
            icon={Sparkles}
            title="Efeitos da Página"
            description="Escolha UM efeito visual especial para sua página"
          />
          <div className="space-y-4">
            <ToggleSwitch
              label="Efeito Neve"
              description="Flocos de neve caindo"
              checked={settings.snowEffect}
              onChange={(value) => handleEffectToggle("snowEffect", value)}
              icon={Snowflake}
              disabled={!settings.snowEffect && (
                settings.rainEffect ||
                settings.cashEffect ||
                settings.thunderEffect ||
                settings.smokeEffect ||
                settings.starsEffect
              )}
              isPremiumFeature={false}
              userIsPremium={userIsPremium}
            />

            <ToggleSwitch
              label="Efeito Chuva"
              description="Gotas de chuva caindo"
              checked={settings.rainEffect}
              onChange={(value) => handleEffectToggle("rainEffect", value)}
              icon={CloudRain}
              disabled={!settings.rainEffect && (
                settings.snowEffect ||
                settings.cashEffect ||
                settings.thunderEffect ||
                settings.smokeEffect ||
                settings.starsEffect
              )}
              isPremiumFeature={false}
              userIsPremium={userIsPremium}
            />

            <ToggleSwitch
              label="Efeito Dinheiro"
              description="Notas de dinheiro caindo"
              checked={settings.cashEffect}
              onChange={(value) => handleEffectToggle("cashEffect", value)}
              icon={DollarSign}
              disabled={!settings.cashEffect && (
                settings.snowEffect ||
                settings.rainEffect ||
                settings.thunderEffect ||
                settings.smokeEffect ||
                settings.starsEffect
              )}
              isPremiumFeature={true}
              userIsPremium={userIsPremium}
            />

            <ToggleSwitch
              label="Efeito Trovão"
              description="Relâmpagos na tela"
              checked={settings.thunderEffect}
              onChange={(value) => handleEffectToggle("thunderEffect", value)}
              icon={CloudLightning}
              disabled={!settings.thunderEffect && (
                settings.snowEffect ||
                settings.rainEffect ||
                settings.cashEffect ||
                settings.smokeEffect ||
                settings.starsEffect
              )}
              isPremiumFeature={true}
              userIsPremium={userIsPremium}
            />

            <ToggleSwitch
              label="Efeito Fumaça"
              description="Fumaça ambiente"
              checked={settings.smokeEffect}
              onChange={(value) => handleEffectToggle("smokeEffect", value)}
              icon={Cloud}
              disabled={!settings.smokeEffect && (
                settings.snowEffect ||
                settings.rainEffect ||
                settings.cashEffect ||
                settings.thunderEffect ||
                settings.starsEffect
              )}
              isPremiumFeature={true}
              userIsPremium={userIsPremium}
            />

            <ToggleSwitch
              label="Efeito Estrelas"
              description="Estrelas brilhantes"
              checked={settings.starsEffect}
              onChange={(value) => handleEffectToggle("starsEffect", value)}
              icon={Stars}
              disabled={!settings.starsEffect && (
                settings.snowEffect ||
                settings.rainEffect ||
                settings.cashEffect ||
                settings.thunderEffect ||
                settings.smokeEffect
              )}
              isPremiumFeature={true}
              userIsPremium={userIsPremium}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-start gap-2 p-3 rounded-[var(--border-radius-sm)] bg-blue-500/10 border border-blue-500/30"
            style={{ minHeight: "48px" }}
          >
            <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-400/80">
              {userIsPremium
                ? "Apenas 1 efeito pode estar ativo por vez. Selecione outro para substituir o atual."
                : "Apenas 1 efeito pode estar ativo. Efeitos marcados como PREMIUM requerem assinatura Premium."
              }
            </p>
          </motion.div>
        </CustomizationCard>
      </div>

      {/* SAVE BUTTON */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-[var(--color-background)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-[var(--border-radius-xl)] shadow-2xl"
            style={{ minHeight: "64px" }}
          >
            <div className="hidden sm:block min-w-0">
              <p className="text-sm text-[var(--color-text)] truncate">
                {uploadProgress || "Você tem alterações não salvas"}
              </p>
            </div>

            <motion.button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-center break-words"
              whileHover={isSubmitting ? {} : { scale: 1.02 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
              style={{ minHeight: "44px" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin shrink-0" />
                  <span className="truncate">
                    {uploadProgress ? "Enviando..." : "Salvando..."}
                  </span>
                </>
              ) : (
                <>
                  <Save size={18} className="shrink-0" />
                  <span className="truncate">
                    Salvar Alterações
                  </span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardCustomization;