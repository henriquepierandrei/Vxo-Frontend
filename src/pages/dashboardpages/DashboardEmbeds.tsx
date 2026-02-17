  // src/pages/DashboardEmbeds.tsx

  import { useState, useEffect } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import {
    ChevronRight,
    Music,
    Youtube,
    Crown,
    Save,
    Trash2,
    AlertCircle,
    CheckCircle,
    Copy,
    ExternalLink,
    Sparkles,
    Play,
    Loader2,
  } from "lucide-react";
  import { embedService } from "../../services/embedService";
  import type { EmbedConfig, EmbedPlatform } from "../../types/embed.types";

  // ═══════════════════════════════════════════════════════════
  // CONFIGURAÇÕES DAS PLATAFORMAS
  // ═══════════════════════════════════════════════════════════

  const EMBED_PLATFORMS: EmbedConfig[] = [
    {
      platform: "youtube",
      name: "YouTube",
      icon: "youtube",
      color: "#FF0000",
      placeholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Cole o link de um vídeo do YouTube",
      exampleUrl: "youtube.com/watch?v=ID ou youtu.be/ID",
    },
    {
      platform: "spotify",
      name: "Spotify",
      icon: "spotify",
      color: "#1DB954",
      placeholder: "https://open.spotify.com/track/...",
      description: "Cole o link de uma música, playlist ou álbum",
      exampleUrl: "open.spotify.com/track/ID ou open.spotify.com/playlist/ID",
    },
    {
      platform: "soundcloud",
      name: "SoundCloud",
      icon: "soundcloud",
      color: "#FF5500",
      placeholder: "https://soundcloud.com/artist/track",
      description: "Cole o link de uma música do SoundCloud",
      exampleUrl: "soundcloud.com/artist/track",
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // COMPONENTES BASE
  // ═══════════════════════════════════════════════════════════

  const DashboardCard = ({
    children,
    className = "",
    delay = 0,
  }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════
  // COMPONENTE PRINCIPAL
  // ═══════════════════════════════════════════════════════════

  const DashboardEmbeds = () => {
    const [embedUrl, setEmbedUrl] = useState("");
    const [currentEmbed, setCurrentEmbed] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<EmbedPlatform>("youtube");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [notification, setNotification] = useState<{
      type: "success" | "error" | "info";
      message: string;
    } | null>(null);

    // ═══════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
      loadCurrentEmbed();
    }, []);

    useEffect(() => {
      if (notification) {
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
      }
    }, [notification]);

    // ═══════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════

    const loadCurrentEmbed = async () => {
      try {
        setIsFetching(true);
        const response = await embedService.getUserEmbed();
        setCurrentEmbed(response.url);
        
        if (response.url) {
          setEmbedUrl(response.url);
        }
      } catch (error: any) {
        console.error("Erro ao carregar embed:", error);
        // Não precisa tratar erro de premium aqui, o Guard já fez isso
      } finally {
        setIsFetching(false);
      }
    };

    const handleSaveEmbed = async () => {
      if (!embedUrl.trim()) {
        showNotification("error", "Digite uma URL válida");
        return;
      }

      try {
        setIsLoading(true);

        const validation = embedService.validateAndConvertUrl(embedUrl);
        if (!validation.isValid) {
          showNotification("error", validation.error || "URL inválida");
          return;
        }

        const response = await embedService.upsertUserEmbed(embedUrl);
        setCurrentEmbed(response.url);
        setEmbedUrl(response.url || "");
        
        showNotification("success", "Embed salvo com sucesso! ✨");
      } catch (error: any) {
        console.error("Erro ao salvar embed:", error);
        showNotification(
          "error",
          error.response?.data?.message || "Erro ao salvar embed. Tente novamente."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const handleDeleteEmbed = async () => {
      if (!currentEmbed) {
        showNotification("info", "Não há embed para remover");
        return;
      }

      try {
        setIsLoading(true);
        await embedService.deleteUserEmbed();
        setCurrentEmbed(null);
        setEmbedUrl("");
        showNotification("success", "Embed removido com sucesso!");
      } catch (error: any) {
        console.error("Erro ao remover embed:", error);
        showNotification(
          "error",
          error.response?.data?.message || "Erro ao remover embed. Tente novamente."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const showNotification = (
      type: "success" | "error" | "info",
      message: string
    ) => {
      setNotification({ type, message });
    };

    const handleCopyUrl = () => {
      if (currentEmbed) {
        navigator.clipboard.writeText(currentEmbed);
        showNotification("success", "URL copiada para a área de transferência!");
      }
    };

    const getPlatformIcon = (platform: EmbedPlatform) => {
      switch (platform) {
        case "youtube":
          return Youtube;
        case "spotify":
        case "soundcloud":
          return Music;
      }
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    if (isFetching) {
      return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-[var(--color-primary)] animate-spin" />
            <p className="text-[var(--color-text-muted)]">Carregando...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[var(--color-background)] pb-8">
        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 20, x: "-50%" }}
              exit={{ opacity: 0, y: -50, x: "-50%" }}
              className="fixed top-0 left-1/2 z-50 w-full max-w-md px-4"
            >
              <div
                className={`p-4 rounded-[var(--border-radius-md)] shadow-lg backdrop-blur-md border ${
                  notification.type === "success"
                    ? "bg-green-500/10 border-green-500/50 text-green-400"
                    : notification.type === "error"
                    ? "bg-red-500/10 border-red-500/50 text-red-400"
                    : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  {notification.type === "success" && <CheckCircle size={20} />}
                  {notification.type === "error" && <AlertCircle size={20} />}
                  {notification.type === "info" && <AlertCircle size={20} />}
                  <p className="text-sm font-medium flex-1">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-4"
          >
            <span>Dashboard</span>
            <ChevronRight size={14} />
            <span className="text-[var(--color-text)]">Gerenciar Embeds</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] flex items-center gap-3 mb-2 flex-wrap">
              <Music className="text-[var(--color-primary)]" />
              Gerenciar Embeds
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium">
                <Crown size={12} />
                PREMIUM
              </span>
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Adicione músicas ou vídeos ao seu perfil com embeds do YouTube, Spotify e SoundCloud.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Platform Selection */}
            <DashboardCard>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  Escolha a Plataforma
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Selecione de onde você quer adicionar conteúdo
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EMBED_PLATFORMS.map((platform, index) => {
                  const Icon = getPlatformIcon(platform.platform);
                  const isSelected = selectedPlatform === platform.platform;

                  return (
                    <motion.button
                      key={platform.platform}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlatform(platform.platform)}
                      className={`relative p-4 rounded-[var(--border-radius-md)] border-2 transition-all ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selected-platform"
                          className="absolute inset-0 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/5"
                        />
                      )}

                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          <Icon size={24} style={{ color: platform.color }} />
                        </div>
                        <h4 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                          {platform.name}
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {platform.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </DashboardCard>

            {/* URL Input */}
            <DashboardCard delay={0.1}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  Cole a URL
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {EMBED_PLATFORMS.find((p) => p.platform === selectedPlatform)?.description}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    URL do {EMBED_PLATFORMS.find((p) => p.platform === selectedPlatform)?.name}
                  </label>
                  <input
                    type="text"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    placeholder={
                      EMBED_PLATFORMS.find((p) => p.platform === selectedPlatform)?.placeholder
                    }
                    className="w-full px-4 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    disabled={isLoading}
                  />
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    Exemplo: {EMBED_PLATFORMS.find((p) => p.platform === selectedPlatform)?.exampleUrl}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveEmbed}
                    disabled={isLoading || !embedUrl.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Salvar Embed
                      </>
                    )}
                  </motion.button>

                  {currentEmbed && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteEmbed}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--border-radius-md)] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                      Remover
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Info Alert */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex items-start gap-3 p-4 rounded-[var(--border-radius-md)] bg-blue-500/10 border border-blue-500/20"
              >
                <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">Como funciona?</p>
                  <p className="text-blue-300/80">
                    Cole a URL normal do {EMBED_PLATFORMS.find((p) => p.platform === selectedPlatform)?.name}.
                    Nós convertemos automaticamente para o formato embed correto.
                  </p>
                </div>
              </motion.div>
            </DashboardCard>
          </div>

          {/* Right Column - Preview */}
          <div className="xl:col-span-1">
            <DashboardCard delay={0.2}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  Pré-visualização
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {currentEmbed ? "Seu embed atual" : "Salve para ver a prévia"}
                </p>
              </div>

              {currentEmbed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* Embed Preview */}
                  <div className="relative aspect-video rounded-[var(--border-radius-md)] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <iframe
                      src={currentEmbed}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* URL Info */}
                  <div className="p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-[var(--color-text)]">
                        URL do Embed
                      </span>
                      <button
                        onClick={handleCopyUrl}
                        className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                        title="Copiar URL"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] break-all font-mono">
                      {currentEmbed}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.a
                      href={currentEmbed}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-sm font-medium transition-all"
                    >
                      <ExternalLink size={16} />
                      Abrir
                    </motion.a>
                  </div>

                  {/* Success Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-[var(--border-radius-md)] bg-green-500/10 border border-green-500/20"
                  >
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm text-green-200">
                      Embed ativo no seu perfil
                    </span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
                    <Play size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                    Nenhum embed configurado
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Cole uma URL e salve para ver a pré-visualização
                  </p>
                </motion.div>
              )}
            </DashboardCard>

            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-text)]">
                    Você é Premium!
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Aproveite todos os recursos exclusivos
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  export default DashboardEmbeds;