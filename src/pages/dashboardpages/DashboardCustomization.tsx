// pages/Customization/Customization.tsx
import { useState, useEffect } from "react";
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
  EyeOff,
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
  Link as LinkIcon,
  X,
  Monitor,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

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
  
  // Media
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

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

// Toggle Switch Component
const ToggleSwitch = ({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
  disabled?: boolean;
}) => (
  <motion.div 
    className={`
      flex items-center justify-between p-3 sm:p-4 rounded-[var(--border-radius-md)]
      bg-[var(--color-surface)] border border-[var(--color-border)]
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-primary)]/30'}
      transition-all duration-300
    `}
    whileHover={disabled ? {} : { scale: 1.01 }}
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
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-all duration-300
        ${checked 
          ? 'bg-[var(--color-primary)]' 
          : 'bg-[var(--color-border)]'
        }
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
        animate={{ left: checked ? '28px' : '4px' }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  </motion.div>
);

// Slider Component
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
    <div className="relative">
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
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[var(--color-primary)]
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:border-0
        "
        style={{
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-border) ${((value - min) / (max - min)) * 100}%, var(--color-border) 100%)`
        }}
      />
    </div>
  </div>
);

// Color Picker Component
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
        <div className="relative">
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
        </div>
        
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#FFFFFF"
            className="
              w-full px-3 py-2 rounded-[var(--border-radius-sm)]
              bg-[var(--color-surface)] border border-[var(--color-border)]
              text-[var(--color-text)] text-sm font-mono
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
              focus:border-[var(--color-primary)]
              transition-all duration-300
            "
          />
        </div>
      </div>
      
      {/* Preset Colors */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <motion.button
            key={color}
            onClick={() => onChange(color)}
            className={`
              w-7 h-7 rounded-full border-2 transition-all
              ${value === color 
                ? 'border-[var(--color-primary)] scale-110' 
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              }
            `}
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>
    </div>
  );
};

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

// Textarea Component
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
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
      maxLength={maxLength}
      rows={rows}
      className="
        w-full px-4 py-3 rounded-[var(--border-radius-md)]
        bg-[var(--color-surface)] border border-[var(--color-border)]
        text-[var(--color-text)] placeholder-[var(--color-text-muted)]
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50
        focus:border-[var(--color-primary)]
        transition-all duration-300 resize-none
      "
    />
    {helperText && (
      <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
    )}
  </div>
);

// Card Component
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

// URL Input with Preview
const UrlInput = ({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  helperText,
  previewType = "image",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  placeholder?: string;
  helperText?: string;
  previewType?: "image" | "none";
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [value]);

  return (
    <div className="space-y-3">
      <Input
        label={label}
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        icon={Icon}
        helperText={helperText}
      />
      
      {value && previewType === "image" && (
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowPreview(!showPreview)}
            className="
              flex items-center gap-2 px-3 py-1.5
              rounded-[var(--border-radius-sm)]
              bg-[var(--color-surface)] border border-[var(--color-border)]
              text-xs text-[var(--color-text-muted)]
              hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/30
              transition-all duration-300
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? "Ocultar Preview" : "Ver Preview"}
          </motion.button>
        </div>
      )}
      
      <AnimatePresence>
        {showPreview && value && previewType === "image" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="
              relative w-full h-32 rounded-[var(--border-radius-md)]
              bg-[var(--color-surface)] border border-[var(--color-border)]
              overflow-hidden
            ">
              {!imageError ? (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                  <div className="text-center">
                    <AlertCircle size={24} className="mx-auto mb-2" />
                    <span className="text-xs">Imagem não encontrada</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Live Preview Component
const LivePreview = ({
  settings,
  isOpen,
  onClose,
}: {
  settings: CustomizationSettings;
  isOpen: boolean;
  onClose: () => void;
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-4 sm:inset-8 z-50 rounded-[var(--border-radius-xl)] overflow-hidden border border-[var(--color-border)]"
        >
          {/* Preview Header */}
          <div className="
            absolute top-0 left-0 right-0 z-10
            flex items-center justify-between
            px-4 py-3 bg-black/50 backdrop-blur-md
            border-b border-white/10
          ">
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
          
          {/* Preview Content */}
          <div
            className="w-full h-full pt-14 overflow-auto"
            style={{
              backgroundImage: settings.backgroundUrl ? `url(${settings.backgroundUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: settings.backgroundUrl ? undefined : 'var(--color-background)',
            }}
          >
            {/* Effects Overlay */}
            {settings.snowEffect && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Snow effect placeholder */}
                <div className="text-white/20 text-center pt-20">❄️ Efeito Neve Ativo</div>
              </div>
            )}
            
            {/* Profile Card Preview */}
            <div className="flex items-center justify-center min-h-full p-8">
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
                  backgroundImage: settings.rgbBorder 
                    ? 'linear-gradient(var(--color-background), var(--color-background)), linear-gradient(90deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff0080, #ff0000)'
                    : undefined,
                  backgroundOrigin: settings.rgbBorder ? 'padding-box, border-box' : undefined,
                  backgroundClip: settings.rgbBorder ? 'padding-box, border-box' : undefined,
                  transform: settings.cardPerspective ? 'perspective(1000px) rotateY(-5deg)' : undefined,
                }}
                whileHover={settings.cardHoverGrow ? { scale: 1.05 } : {}}
              >
                {/* Profile Image */}
                <div className={`${settings.contentCenter ? 'flex justify-center' : ''} mb-4`}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                    {settings.profileImageUrl ? (
                      <img
                        src={settings.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    )}
                  </div>
                </div>
                
                {/* Name */}
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
                
                {/* Biography */}
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

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardCustomization = () => {
  // Estado inicial
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

  const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<CustomizationSettings>(defaultSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Detectar mudanças
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  // Update handler genérico
  const updateSetting = <K extends keyof CustomizationSettings>(
    key: K,
    value: CustomizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handler para salvar
  const handleSave = async () => {
    setIsSubmitting(true);
    
    // Simular API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setOriginalSettings(settings);
    setIsSubmitting(false);
    setSuccessMessage("Configurações salvas com sucesso!");
    
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Handler para resetar
  const handleReset = () => {
    setSettings(originalSettings);
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
          <span className="text-[var(--color-text)]">Customização</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
            <Palette className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            Personalize seu perfil do seu jeito.
          </h1>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowPreview(true)}
              className="
                flex items-center gap-2 px-4 py-2.5
                rounded-[var(--border-radius-md)]
                bg-[var(--color-surface)] border border-[var(--color-border)]
                text-[var(--color-text)] text-sm font-medium
                hover:border-[var(--color-primary)]/50
                transition-all duration-300
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye size={18} />
              <span className="hidden sm:inline">Preview</span>
            </motion.button>
            
            {hasChanges && (
              <motion.button
                onClick={handleReset}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="
                  flex items-center gap-2 px-4 py-2.5
                  rounded-[var(--border-radius-md)]
                  bg-[var(--color-surface)] border border-[var(--color-border)]
                  text-[var(--color-text-muted)] text-sm font-medium
                  hover:text-[var(--color-text)] hover:border-[var(--color-border)]
                  transition-all duration-300
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

      {/* Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CARD APPEARANCE */}
        {/* ═══════════════════════════════════════════════════════════ */}
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
                  description="Adiciona efeito de profundidade ao card"
                  checked={settings.cardPerspective}
                  onChange={(value) => updateSetting("cardPerspective", value)}
                  icon={Move}
                />

                <ToggleSwitch
                  label="Crescer ao Hover"
                  description="Card aumenta quando passa o mouse"
                  checked={settings.cardHoverGrow}
                  onChange={(value) => updateSetting("cardHoverGrow", value)}
                  icon={Zap}
                />

                <ToggleSwitch
                  label="Borda RGB"
                  description="Borda animada com cores do arco-íris"
                  checked={settings.rgbBorder}
                  onChange={(value) => updateSetting("rgbBorder", value)}
                  icon={Sparkles}
                />
              </div>
            </div>
          </CustomizationCard>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PROFILE INFO */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <CustomizationCard>
            <SectionHeader
              icon={Type}
              title="Informações do Perfil"
              description="Configure seu nome, biografia e estilos de texto"
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
              />

              <div className="space-y-3">
                <ToggleSwitch
                  label="Efeito Neon"
                  description="Adiciona brilho neon ao nome"
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
                  description="Nome com gradiente dourado"
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
                  description="Animação de cores no nome"
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
                helperText="Uma breve descrição sobre você"
              />

              <ColorPicker
                label="Cor da Biografia"
                value={settings.biographyColor}
                onChange={(value) => updateSetting("biographyColor", value)}
                icon={Type}
              />

              <ToggleSwitch
                label="Centralizar Conteúdo"
                description="Alinha todo o conteúdo ao centro"
                checked={settings.contentCenter}
                onChange={(value) => updateSetting("contentCenter", value)}
                icon={AlignCenter}
              />
            </div>
          </CustomizationCard>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MEDIA */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <CustomizationCard>
            <SectionHeader
              icon={Image}
              title="Mídia"
              description="Adicione imagens, música e cursor personalizado"
            />

            <div className="space-y-6">
              <UrlInput
                label="Imagem de Fundo"
                value={settings.backgroundUrl}
                onChange={(value) => updateSetting("backgroundUrl", value)}
                icon={Image}
                placeholder="https://exemplo.com/background.jpg"
                helperText="URL da imagem de fundo do seu perfil"
                previewType="image"
              />

              <UrlInput
                label="Foto de Perfil"
                value={settings.profileImageUrl}
                onChange={(value) => updateSetting("profileImageUrl", value)}
                icon={Upload}
                placeholder="https://exemplo.com/avatar.jpg"
                helperText="URL da sua foto de perfil"
                previewType="image"
              />

              <Input
                label="Música de Fundo"
                type="url"
                placeholder="https://exemplo.com/musica.mp3"
                value={settings.musicUrl}
                onChange={(value) => updateSetting("musicUrl", value)}
                icon={Music}
                helperText="URL de um arquivo de áudio (MP3)"
              />

              <Input
                label="Cursor Personalizado"
                type="url"
                placeholder="https://exemplo.com/cursor.png"
                value={settings.cursorUrl}
                onChange={(value) => updateSetting("cursorUrl", value)}
                icon={MousePointer2}
                helperText="URL de uma imagem para usar como cursor"
              />
            </div>
          </CustomizationCard>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PAGE EFFECTS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <CustomizationCard>
            <SectionHeader
              icon={Sparkles}
              title="Efeitos da Página"
              description="Adicione efeitos visuais especiais ao seu perfil"
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
                description="Chuva de caracteres estilo Matrix"
                checked={settings.matrixRainEffect}
                onChange={(value) => updateSetting("matrixRainEffect", value)}
                icon={Binary}
              />

              <ToggleSwitch
                label="Partículas"
                description="Partículas flutuantes interativas"
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

            {/* Effects Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-start gap-2 p-3 rounded-[var(--border-radius-sm)] bg-yellow-500/10 border border-yellow-500/30"
            >
              <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400/80">
                Muitos efeitos ativos podem impactar a performance em dispositivos mais antigos.
              </p>
            </motion.div>
          </CustomizationCard>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SAVE BUTTON - STICKY */}
      {/* ═══════════════════════════════════════════════════════════ */}
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
              <p className="text-sm text-[var(--color-text)]">Você tem alterações não salvas</p>
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
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Salvando...
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
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default DashboardCustomization;