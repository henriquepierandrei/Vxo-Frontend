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
  Globe,
  Info,
} from "lucide-react";
import { customizationService } from "../../services/customizationService";
import { assetUploadService } from "../../services/assetUploadService";
import { useProfile } from "../../contexts/UserContext";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

type MediaType = "image" | "video" | "audio" | "unknown";

interface CustomizationSettings {
  cardOpacity: number;
  cardBlur: number;
  cardColor: string;
  cardPerspective: boolean;
  cardHoverGrow: boolean;
  rgbBorder: boolean;
  biography: string;
  contentCenter: boolean;
  biographyColor: string;
  name: string;
  neonName: boolean;
  shinyName: boolean;
  rgbName: boolean;
  backgroundUrl: string;
  profileImageUrl: string;
  musicUrl: string;
  cursorUrl: string;
  faviconUrl: string;
  snowEffect: boolean;
  confettiEffect: boolean;
  matrixRainEffect: boolean;
  particlesEffect: boolean;
  particlesColor: string;
  hasEmbed: boolean;
  embedUrl: string;
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
}

// ═══════════════════════════════════════════════════════════
// CONSTANTES PARA CLS 0
// ═══════════════════════════════════════════════════════════

const CARD_MIN_HEIGHTS = {
  cardAppearance: "540px",
  profileInfo: "680px",
  media: "720px",
  effects: "420px",
} as const;

const FILE_UPLOAD_HEIGHTS = {
  image: "160px",
  audio: "140px",
  cursor: "120px",
  favicon: "100px",
  media: "160px",
  empty: "120px",
} as const;

const STORAGE_KEY = "customization_backup";

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const getFileType = (file: File | string): MediaType => {
  if (typeof file === "string") {
    const ext = file.split('.').pop()?.toLowerCase().split('?')[0] || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(ext)) return "image";
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

// Funções para backup local
const saveToLocalStorage = (settings: Partial<CustomizationSettings>) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : {};
    const updated = { ...parsed, ...settings, lastUpdated: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Erro ao salvar no localStorage:", e);
  }
};

const getFromLocalStorage = (): Partial<CustomizationSettings> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Verifica se não está muito antigo (24 horas)
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
// TRANSFORMAÇÃO DE DADOS - COM OPTIONAL CHAINING E FALLBACKS
// ═══════════════════════════════════════════════════════════

const profileDataToSettings = (
  profileData: NonNullable<ReturnType<typeof useProfile>['profileData']>
): CustomizationSettings => {
  const pageSettings = profileData?.pageSettings;
  const cardSettings = pageSettings?.cardSettings;
  const contentSettings = pageSettings?.contentSettings;
  const nameEffects = pageSettings?.nameEffects;
  const mediaUrls = pageSettings?.mediaUrls;
  const pageEffects = pageSettings?.pageEffects;

  return {
    cardOpacity: cardSettings?.opacity ?? 80,
    cardBlur: cardSettings?.blur ?? 10,
    cardColor: cardSettings?.color ?? "#1a1a2e",
    cardPerspective: cardSettings?.perspective ?? false,
    cardHoverGrow: cardSettings?.hoverGrow ?? true,
    rgbBorder: cardSettings?.rgbBorder ?? false,
    biography: contentSettings?.biography ?? "",
    contentCenter: contentSettings?.centerAlign ?? true,
    biographyColor: contentSettings?.biographyColor ?? "#ffffff",
    name: nameEffects?.name ?? "",
    neonName: nameEffects?.neon ?? false,
    shinyName: nameEffects?.shiny ?? false,
    rgbName: nameEffects?.rgb ?? false,
    backgroundUrl: mediaUrls?.backgroundUrl || "",
    profileImageUrl: mediaUrls?.profileImageUrl || "",
    musicUrl: mediaUrls?.musicUrl || "",
    cursorUrl: mediaUrls?.cursorUrl || "",
    faviconUrl: mediaUrls?.faviconUrl || "",
    snowEffect: pageEffects?.snow ?? false,
    confettiEffect: pageEffects?.confetti ?? false,
    matrixRainEffect: pageEffects?.matrixRain ?? false,
    particlesEffect: pageEffects?.particles?.enabled ?? false,
    particlesColor: pageEffects?.particles?.color ?? "#ffffff",
    hasEmbed: pageSettings?.hasEmbed ?? false,
    embedUrl: pageSettings?.embedUrl ?? ""
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
    faviconUrl: settings.faviconUrl,
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
// CURSOR TEST COMPONENT - NOVO COMPONENTE ISOLADO
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

    // Pré-carrega a imagem do cursor
    const img = new window.Image();

    img.onload = () => {
      console.log("✅ Cursor carregado com sucesso:", cursorUrl);
      console.log("📐 Dimensões:", img.width, "x", img.height);

      // Verifica se o tamanho é válido para cursor (max 128x128 na maioria dos browsers)
      if (img.width <= 128 && img.height <= 128) {
        setCursorLoaded(true);
      } else {
        console.warn("⚠️ Cursor muito grande. Máximo recomendado: 128x128");
        setCursorLoaded(true); // Ainda tenta usar
      }
    };

    img.onerror = () => {
      console.error("❌ Erro ao carregar cursor:", cursorUrl);
      setCursorError(true);
    };

    img.src = cursorUrl;
  }, [cursorUrl]);

  // Aplica o cursor via ref para garantir que funcione
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cursorUrl || !cursorLoaded) return;

    // Detecta extensão para determinar hotspot
    const ext = fileName?.split('.').pop()?.toLowerCase() ||
      cursorUrl.split('.').pop()?.toLowerCase()?.split('?')[0] || '';

    let cursorCSS: string;

    if (ext === 'cur' || ext === 'ani') {
      // Formatos nativos de cursor - não precisam de hotspot
      cursorCSS = `url("${cursorUrl}"), auto`;
    } else {
      // PNG/GIF - precisa de hotspot (centro por padrão)
      // Hotspot 0 0 = canto superior esquerdo (como cursor de seta)
      // Hotspot 16 16 = centro para cursor 32x32
      cursorCSS = `url("${cursorUrl}") 0 0, auto`;
    }

    console.log("🎯 Aplicando cursor CSS:", cursorCSS);
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
// FILE UPLOAD COMPONENT - VERSÃO CORRIGIDA
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
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("unknown");
  const [imageError, setImageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const computedMinHeight = minHeight || (
    previewType === "audio" ? FILE_UPLOAD_HEIGHTS.audio :
      previewType === "favicon" ? FILE_UPLOAD_HEIGHTS.favicon :
        previewType === "cursor" ? FILE_UPLOAD_HEIGHTS.cursor :
          previewType === "media" ? FILE_UPLOAD_HEIGHTS.media :
            previewType === "image" ? FILE_UPLOAD_HEIGHTS.image :
              FILE_UPLOAD_HEIGHTS.empty
  );

  // Atualiza preview quando file ou currentUrl mudam
  useEffect(() => {
    setImageError(false);

    if (file) {
      const fileType = getFileType(file);
      setMediaType(fileType);
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (currentUrl) {
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

    if (previewType === "favicon" && fileExt !== ".ico") {
      setError("Apenas arquivos .ico são permitidos para favicon");
      return false;
    }

    if (previewType === "cursor") {
      const validCursorExts = [".cur", ".ani", ".png", ".gif"];
      if (!validCursorExts.includes(fileExt)) {
        setError("Use arquivos .cur, .ani, .png ou .gif para cursor");
        return false;
      }

      // Limite de tamanho para cursores
      const maxSize = 512 * 1024; // 512KB
      if (file.size > maxSize) {
        setError("Arquivo de cursor muito grande. Máximo: 512KB");
        return false;
      }
    }

    return true;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    if (validateFile(selectedFile)) {
      setImageError(false);
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

  const handleClick = () => inputRef.current?.click();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    onRemove();
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleImageError = () => {
    console.warn("Erro ao carregar imagem:", preview);
    setImageError(true);
  };

  const getFileIcon = () => {
    if (previewType === "audio" || mediaType === "audio") return FileAudio;
    if (previewType === "favicon") return Globe;
    if (previewType === "cursor") return MousePointer2;
    if (previewType === "image" || mediaType === "image") return FileImage;
    return File;
  };

  const FileIcon = getFileIcon();
  const hasFile = file || currentUrl;
  const currentMediaType = file ? getFileType(file) : currentUrl ? getFileType(currentUrl) : "unknown";
  const audioSrc = previewType === "audio" ? preview : null;
  const isCursorFile = previewType === "cursor";

  const shouldShowImagePreview = (
    !isCursorFile &&
    (previewType === "image" || previewType === "favicon" ||
      (previewType === "media" && currentMediaType === "image")) &&
    preview &&
    !imageError
  );

  const shouldShowVideoPreview = (
    previewType === "media" &&
    currentMediaType === "video" &&
    preview
  );

  // Determina o accept correto para cursor
  const cursorAccept = ".cur,.ani,.png,.gif,image/png,image/gif";

  return (
    <div className="space-y-2" style={{ minHeight: `calc(${computedMinHeight} + 40px)` }}>
      {/* HEADER */}
      <div className="flex items-center justify-between h-6">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-[var(--color-primary)]" />}
          <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>
        </div>
        {file && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>

      {/* INPUT HIDDEN */}
      <input
        ref={inputRef}
        type="file"
        accept={previewType === "cursor" ? cursorAccept : accept}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />

      {/* UPLOAD AREA */}
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-[var(--border-radius-md)] border-2 border-dashed transition-all duration-300 overflow-hidden ${isDragging
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            : hasFile
              ? "border-[var(--color-border)] bg-[var(--color-surface)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-surface)]"
          } cursor-pointer`}
        style={{ minHeight: computedMinHeight }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        {hasFile ? (
          <div className="relative h-full">
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

            {/* PREVIEW DE IMAGEM (não-cursor) */}
            {shouldShowImagePreview && (
              <div
                className="relative w-full"
                style={{ minHeight: previewType === "favicon" ? "80px" : "128px" }}
              >
                <img
                  src={preview!}
                  alt="Preview"
                  className={`w-full object-cover ${previewType === "favicon"
                      ? "object-contain bg-[var(--color-background)] p-4 h-full"
                      : "h-32"
                    }`}
                  style={{
                    minHeight: previewType === "favicon" ? "80px" : "128px",
                    maxHeight: previewType === "favicon" ? "80px" : "160px"
                  }}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            )}

            {/* FALLBACK QUANDO IMAGEM FALHA */}
            {!isCursorFile && (previewType === "image" || previewType === "favicon" ||
              (previewType === "media" && currentMediaType === "image")) &&
              preview && imageError && (
                <div
                  className="relative w-full flex flex-col items-center justify-center bg-[var(--color-surface)]"
                  style={{ minHeight: previewType === "favicon" ? "80px" : "128px" }}
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

            {/* INFO BAR PARA NÃO-AUDIO E NÃO-CURSOR */}
            {previewType !== "audio" && !isCursorFile && (
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
            {file && previewType !== "audio" && !isCursorFile && (
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/90 text-white">
                  Novo
                </span>
              </div>
            )}
          </div>
        ) : (
          // ESTADO VAZIO
          <div
            className="p-6 flex flex-col items-center justify-center text-center"
            style={{ minHeight: computedMinHeight }}
          >
            <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? "bg-[var(--color-primary)]/20" : "bg-[var(--color-surface-elevated)]"
              }`}>
              <Upload
                size={24}
                className={isDragging ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}
              />
            </div>
            <p className="text-sm text-[var(--color-text)]">
              {isDragging ? "Solte o arquivo aqui" : "Clique ou arraste um arquivo"}
            </p>
            {previewType === "favicon" && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Apenas arquivos .ico
              </p>
            )}
            {previewType === "cursor" && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                PNG, GIF, .cur ou .ani (recomendado: 32x32px)
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* ÁREA DE TESTE DO CURSOR - COMPONENTE SEPARADO */}
      <AnimatePresence>
        {isCursorFile && preview && (
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
// COMPONENTES BASE - OTIMIZADOS PARA CLS 0
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
    style={{ minHeight: "64px" }}
    whileHover={{ scale: 1.005 }}
  >
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className="p-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)]/10 flex-shrink-0">
          <Icon size={18} className="text-[var(--color-primary)]" />
        </div>
      )}
      <div className="min-w-0">
        <span className="text-sm font-medium text-[var(--color-text)] block truncate">{label}</span>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{description}</p>
        )}
      </div>
    </div>
    <motion.button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 ml-3 ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
        }`}
      whileTap={{ scale: 0.95 }}
      aria-label={`Toggle ${label}`}
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
// LIVE PREVIEW COMPONENT
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
  const [previews, setPreviews] = useState({
    avatar: null as string | null,
    background: null as string | null,
    music: null as string | null,
    cursor: null as string | null,
    favicon: null as string | null,
  });

  useEffect(() => {
    const newPreviews = {
      avatar: fileUploads.avatar ? URL.createObjectURL(fileUploads.avatar) : null,
      background: fileUploads.background ? URL.createObjectURL(fileUploads.background) : null,
      music: fileUploads.music ? URL.createObjectURL(fileUploads.music) : null,
      cursor: fileUploads.cursor ? URL.createObjectURL(fileUploads.cursor) : null,
      favicon: fileUploads.favicon ? URL.createObjectURL(fileUploads.favicon) : null,
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
              {backgroundType === "video" && backgroundMedia ? (
                <video
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

              <div className="relative flex items-center justify-center min-h-full p-8">
                <motion.div
                  className={`relative max-w-md w-full p-6 rounded-2xl ${settings.contentCenter ? 'text-center' : 'text-left'}`}
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
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      )}
                    </div>
                  </div>

                  <h2
                    className={`text-2xl font-bold mb-2 ${settings.neonName ? 'text-white drop-shadow-[0_0_10px_currentColor]' : ''
                      } ${settings.shinyName ? 'bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200' : ''
                      } ${settings.rgbName ? 'animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-green-500 to-blue-500' : ''
                      }`}
                    style={{ color: !settings.shinyName && !settings.rgbName ? 'white' : undefined }}
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
// MAIN COMPONENT - CORRIGIDO
// ═══════════════════════════════════════════════════════════

const DashboardCustomization = () => {
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
    profileImageUrl: "",
    musicUrl: "",
    cursorUrl: "",
    faviconUrl: "",
    snowEffect: false,
    confettiEffect: false,
    matrixRainEffect: false,
    particlesEffect: false,
    particlesColor: "#ffffff",
    hasEmbed: false,
    embedUrl: ""
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
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carrega settings do profileData com fallback para localStorage
  useEffect(() => {
    if (profileData && profileData.pageSettings) {
      const loadedSettings = profileDataToSettings(profileData);

      // Fallback: Se URLs de mídia estiverem vazias, tenta recuperar do localStorage
      const backup = getFromLocalStorage();

      const finalSettings: CustomizationSettings = {
        ...loadedSettings,
        // Usa o valor carregado, ou o backup, ou mantém vazio
        profileImageUrl: loadedSettings.profileImageUrl || backup?.profileImageUrl || "",
        backgroundUrl: loadedSettings.backgroundUrl || backup?.backgroundUrl || "",
        musicUrl: loadedSettings.musicUrl || backup?.musicUrl || "",
        cursorUrl: loadedSettings.cursorUrl || backup?.cursorUrl || "",
        faviconUrl: loadedSettings.faviconUrl || backup?.faviconUrl || "",
      };

      setSettings(finalSettings);
      setOriginalSettings(finalSettings);
      setIsInitialized(true);

      // Salva backup se temos dados válidos
      if (finalSettings.profileImageUrl || finalSettings.backgroundUrl) {
        saveToLocalStorage({
          profileImageUrl: finalSettings.profileImageUrl,
          backgroundUrl: finalSettings.backgroundUrl,
          musicUrl: finalSettings.musicUrl,
          cursorUrl: finalSettings.cursorUrl,
          faviconUrl: finalSettings.faviconUrl,
        });
      }
    }
  }, [profileData]);

  // Detecta mudanças
  useEffect(() => {
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    const filesChanged = Object.values(fileUploads).some(file => file !== null);
    setHasChanges(settingsChanged || filesChanged);
  }, [settings, originalSettings, fileUploads]);

  // Salva no localStorage quando URLs de mídia mudam
  useEffect(() => {
    if (isInitialized && (settings.profileImageUrl || settings.backgroundUrl)) {
      saveToLocalStorage({
        profileImageUrl: settings.profileImageUrl,
        backgroundUrl: settings.backgroundUrl,
        musicUrl: settings.musicUrl,
        cursorUrl: settings.cursorUrl,
        faviconUrl: settings.faviconUrl,
      });
    }
  }, [
    isInitialized,
    settings.profileImageUrl,
    settings.backgroundUrl,
    settings.musicUrl,
    settings.cursorUrl,
    settings.faviconUrl,
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
      updateSetting(urlKey, "" as never);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress("");

    try {
      // Cria uma cópia para não mutar o estado diretamente
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

        if (uploadResponse.urls) {
          if (uploadResponse.urls.avatarUrl) {
            updatedSettings.profileImageUrl = uploadResponse.urls.avatarUrl;
          }
          if (uploadResponse.urls.backgroundUrl) {
            updatedSettings.backgroundUrl = uploadResponse.urls.backgroundUrl;
          }
          if (uploadResponse.urls.musicUrl) {
            updatedSettings.musicUrl = uploadResponse.urls.musicUrl;
          }
          if (uploadResponse.urls.cursorUrl) {
            updatedSettings.cursorUrl = uploadResponse.urls.cursorUrl;
          }
          if (uploadResponse.urls.faviconUrl) {
            updatedSettings.faviconUrl = uploadResponse.urls.faviconUrl;
          }
        }
      }

      setUploadProgress("Salvando configurações...");
      const requestData = settingsToRequest(updatedSettings);
      await customizationService.updatePageSettings(requestData);

      // Atualiza o estado com os novos valores
      setSettings(updatedSettings);
      setOriginalSettings(updatedSettings);

      // Salva backup no localStorage
      saveToLocalStorage({
        profileImageUrl: updatedSettings.profileImageUrl,
        backgroundUrl: updatedSettings.backgroundUrl,
        musicUrl: updatedSettings.musicUrl,
        cursorUrl: updatedSettings.cursorUrl,
        faviconUrl: updatedSettings.faviconUrl,
      });

      // Refresh para garantir sincronização
      await refreshProfile();

      setFileUploads({ avatar: null, background: null, music: null, cursor: null, favicon: null });
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
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:border-[var(--color-primary)]/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ minHeight: "40px" }}
            >
              <Eye size={18} />
              <span className="hidden sm:inline">Preview</span>
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

        {/* MEDIA UPLOADS */}
        {/* MEDIA UPLOADS */}
        <CustomizationCard minHeight={CARD_MIN_HEIGHTS.media}>
          <SectionHeader
            icon={Image}
            title="Mídia"
            description="Faça upload de imagens, vídeos, música, cursor e favicon"
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

            {/* ════════════════════════════════════════════════════════════
        CURSOR - DESABILITADO (EM BREVE)
    ════════════════════════════════════════════════════════════ */}
            <div className="space-y-2" style={{ minHeight: "160px" }}>
              <div className="flex items-center justify-between h-6">
                <div className="flex items-center gap-2">
                  <MousePointer2 size={16} className="text-[var(--color-text-muted)]" />
                  <label className="text-sm font-medium text-[var(--color-text-muted)]">
                    Cursor Personalizado
                  </label>
                </div>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Em Breve
                </span>
              </div>

              <div
                className="relative rounded-[var(--border-radius-md)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 cursor-not-allowed opacity-60"
                style={{ minHeight: "120px" }}
              >
                <div className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <div className="p-3 rounded-full mb-3 bg-[var(--color-surface-elevated)]">
                    <MousePointer2 size={24} className="text-[var(--color-text-muted)]" />
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] font-medium">
                    Cursor Personalizado
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Esta funcionalidade estará disponível em breve
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 h-4">
                <Info size={12} className="flex-shrink-0" />
                Arquivos .cur ou .ani serão suportados
              </p>
            </div>

            <FileUpload
              label="Favicon"
              accept=".ico,image/x-icon"
              file={fileUploads.favicon}
              currentUrl={settings.faviconUrl}
              onFileSelect={(file) => updateFileUpload("favicon", file)}
              onRemove={() => removeFile("favicon")}
              icon={Globe}
              helperText="Apenas arquivos .ico (ícone da aba do navegador)"
              previewType="favicon"
            />
          </div>
        </CustomizationCard>

        {/* PAGE EFFECTS */}
        <CustomizationCard minHeight={CARD_MIN_HEIGHTS.effects}>
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
            style={{ minHeight: "48px" }}
          >
            <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400/80">
              Muitos efeitos simultâneos podem impactar a performance em dispositivos mais antigos.
            </p>
          </motion.div>
        </CustomizationCard>
      </div>

      {/* SAVE BUTTON - Fixed at bottom */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              whileHover={isSubmitting ? {} : { scale: 1.02 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
              style={{ minHeight: "44px", minWidth: "160px" }}
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