// components/Sidebar/Sidebar.tsx
import { useState, useMemo, memo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ ADICIONAR
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/ThemeProvider";
import { useAuth } from "../../hooks/useAuth";
import { VxoLogo } from "../LogoProps";
import { VxoLogoSmall } from "../LogoPropsSmall";
import { useProfile } from "../../contexts/UserContext";

import {
  Home,
  ShoppingBag,
  Image,
  Palette,
  Tags,
  Link2,
  Share2,
  Code,
  Settings,
  Package,
  History,
  ChevronLeft,
  Menu,
  X,
  Sun,
  Moon,
  Lock,
  LogOut,
  ChevronDown,
  User,
  Loader2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  isBlock?: boolean;
  blockReason?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ═══════════════════════════════════════════════════════════
// ✅ COMPONENTES EXTRAÍDOS (fora do Sidebar principal)
// ═══════════════════════════════════════════════════════════

// Avatar do Usuário
const UserAvatar = memo(({ 
  size = "default",
  isLoading,
  imageUrl,
  displayName
}: { 
  size?: "default" | "small";
  isLoading: boolean;
  imageUrl: string;
  displayName: string;
}) => {
  const sizeClasses = size === "small" ? "w-8 h-8" : "w-9 h-9";
  const textSize = size === "small" ? "text-xs" : "text-sm";

  if (isLoading) {
    return (
      <div className="relative">
        <div className={`${sizeClasses} rounded-full bg-[var(--color-surface)] animate-pulse`} />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-[var(--color-background)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center overflow-hidden`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
            loading="eager"
          />
        ) : (
          <span className={`text-white font-semibold ${textSize}`}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-background)]" />
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

// ═══════════════════════════════════════════════════════════
// NavItem Component (extraído e memoizado)
// ═══════════════════════════════════════════════════════════

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate: (href: string, label: string) => void;
}

const NavItemComponent = memo(({ 
  item, 
  isActive, 
  isCollapsed,
  onNavigate 
}: NavItemComponentProps) => {
  const isBlocked = item.isBlock === true;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isBlocked) return;
    onNavigate(item.href, item.label);
  };

  return (
    <div className="relative group">
      <a
        href={isBlocked ? undefined : item.href}
        onClick={handleClick}
        className={`
          relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)]
          transition-all duration-200
          ${isBlocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:translate-x-1"}
          ${
            isActive && !isBlocked
              ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
              : isBlocked
              ? "text-[var(--color-text-muted)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          }
        `}
      >
        {/* Indicador ativo - SEM layoutId para evitar animações entre rotas */}
        {isActive && !isBlocked && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-primary)] rounded-r-full" />
        )}

        <span className={`flex-shrink-0 ${isActive && !isBlocked ? "text-[var(--color-primary)]" : ""}`}>
          {item.icon}
        </span>

        {!isCollapsed && (
          <span className={`text-sm font-medium whitespace-nowrap ${isBlocked ? "line-through" : ""}`}>
            {item.label}
          </span>
        )}

        {!isCollapsed && (
          <div className="ml-auto flex items-center gap-2">
            {item.badge && !isBlocked && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary)] text-white">
                {item.badge}
              </span>
            )}

            {isBlocked && (
              <div className="flex items-center gap-1">
                <Lock size={14} className="text-[var(--color-text-muted)]" />
                {item.blockReason && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                    {item.blockReason}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tooltip collapsed */}
        {isCollapsed && (
          <div className="
            absolute left-full ml-3 px-3 py-1.5 rounded-[var(--border-radius-sm)]
            bg-[var(--color-background)] border border-[var(--color-border)]
            text-[var(--color-text)] text-sm font-medium
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 whitespace-nowrap z-50
            shadow-lg flex items-center gap-2
          ">
            <span className={isBlocked ? "line-through opacity-60" : ""}>
              {item.label}
            </span>
            {item.badge && !isBlocked && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-primary)] text-white">
                {item.badge}
              </span>
            )}
            {isBlocked && (
              <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                <Lock size={12} />
                {item.blockReason && <span className="text-xs">{item.blockReason}</span>}
              </div>
            )}
          </div>
        )}
      </a>
    </div>
  );
});

NavItemComponent.displayName = 'NavItemComponent';

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isLoading } = useAuth();
  const { profileData, isLoadingProfile } = useProfile();
  
  // ✅ USAR REACT ROUTER PARA NAVEGAÇÃO
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Determinar item ativo baseado na URL atual
  const activeItem = useMemo(() => {
    const path = location.pathname;
    
    const pathToLabel: Record<string, string> = {
      '/dashboard': 'Início',
      '/dashboard/start': 'Início',
      '/dashboard/store': 'Loja',
      '/dashboard/assets': 'Ativos',
      '/dashboard/customization': 'Customização',
      '/dashboard/tags': 'Tags',
      '/dashboard/links': 'Links',
      '/dashboard/socialmedia': 'Redes Sociais',
      '/dashboard/settings': 'Configurações',
      '/dashboard/inventory': 'Inventário',
      '/dashboard/logs': 'Histórico',
    };
    
    return pathToLabel[path] || 'Início';
  }, [location.pathname]);

  // ✅ Dados derivados com fallback
  const displayName = profileData?.name || user?.name || "Usuário";
  const profileUrl = profileData?.url || user?.urlName || "usuario";
  const profileImageUrl = profileData?.pageSettings?.mediaUrls?.profileImageUrl || "";

  // ✅ navSections memoizado - NÃO recria a cada render
  const navSections: NavSection[] = useMemo(() => [
    {
      title: "Painel",
      items: [
        { icon: <Home size={20} />, label: "Início", href: "/dashboard/start" },
        {
          icon: <ShoppingBag size={20} />,
          label: "Loja",
          href: "/dashboard/store",
          badge: "Novo",
        },
      ],
    },
    {
      title: "Perfil",
      items: [
        { icon: <Image size={20} />, label: "Ativos", href: "/dashboard/assets" },
        { icon: <Palette size={20} />, label: "Customização", href: "/dashboard/customization" },
        { icon: <Tags size={20} />, label: "Tags", href: "/dashboard/tags" },
      ],
    },
    {
      title: "Widgets",
      items: [
        { icon: <Link2 size={20} />, label: "Links", href: "/dashboard/links" },
        { icon: <Share2 size={20} />, label: "Redes Sociais", href: "/dashboard/socialmedia" },
        {
          icon: <Code size={20} />,
          label: "Embeds",
          href: "/embeds",
          isBlock: true,
          blockReason: "Premium",
        },
      ],
    },
    {
      title: "Conta",
      items: [
        { icon: <Settings size={20} />, label: "Configurações", href: "/dashboard/settings" },
        { icon: <Package size={20} />, label: "Inventário", href: "/dashboard/inventory" },
        { icon: <History size={20} />, label: "Histórico", href: "/dashboard/logs" },
      ],
    },
  ], []);

  // ✅ Handler de navegação usando React Router
  const handleNavigate = (href: string, _label: string) => {
    navigate(href); // ✅ SEM page reload!
  };

  const handleMobileNavigate = (href: string, _label: string) => {
    setIsMobileOpen(false);
    navigate(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="
          lg:hidden fixed top-4 left-4 z-50 w-11 h-11
          flex items-center justify-center rounded-[var(--border-radius-sm)]
          bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
          border border-[var(--color-border)]
          text-[var(--color-text)] shadow-lg
          hover:scale-105 active:scale-95 transition-transform
        "
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="
              lg:hidden fixed left-0 top-0 h-full w-[280px] z-50
              bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
              border-r border-[var(--color-border)]
              flex flex-col shadow-2xl
            "
          >
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="
                absolute top-4 right-4 w-8 h-8
                flex items-center justify-center rounded-full
                bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
                text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                transition-all duration-200 z-10
              "
            >
              <X size={18} />
            </button>

            {/* Mobile Header */}
            <div className="flex items-center justify-center p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <VxoLogo />
                <div className="flex flex-col">
                  <span className="text-[var(--color-text-muted)] text-xs">Dashboard</span>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItemComponent
                        key={item.label}
                        item={item}
                        isActive={activeItem === item.label}
                        isCollapsed={false}
                        onNavigate={handleMobileNavigate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Footer */}
            <div className="p-3 border-t border-[var(--color-border)]">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-sm font-medium">
                  {isDark ? "Modo Claro" : "Modo Escuro"}
                </span>
              </button>

              {/* Mobile User Card */}
              <div className="relative mt-3">
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border border-[var(--color-border)] cursor-pointer"
                >
                  <UserAvatar
                    isLoading={isLoadingProfile}
                    imageUrl={profileImageUrl}
                    displayName={displayName}
                  />
                  <div className="flex-1 min-w-0">
                    {isLoadingProfile ? (
                      <>
                        <div className="h-4 w-24 bg-[var(--color-surface)] rounded animate-pulse" />
                        <div className="h-3 w-20 bg-[var(--color-surface)] rounded animate-pulse mt-1" />
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{displayName}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">vxo.lat/{profileUrl}</p>
                      </>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--color-text-muted)] transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Mobile Dropdown */}
                {showUserMenu && (
                  <div
                    className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-[var(--border-radius-md)] border shadow-lg z-50 bg-[var(--color-background)] border-[var(--color-border)]"
                  >
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsMobileOpen(false);
                        window.open(`https://vxo.lat/${profileUrl}`, "_blank");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all"
                    >
                      <User size={18} />
                      <span className="text-sm">Ver Perfil Público</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsMobileOpen(false);
                        navigate('/dashboard/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all"
                    >
                      <Settings size={18} />
                      <span className="text-sm">Configurações</span>
                    </button>

                    <div className="my-2 border-t border-[var(--color-border)]" />

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut || isLoading}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                      <span className="text-sm">{isLoggingOut ? "Saindo..." : "Sair da conta"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Desktop Sidebar - SEM animações de entrada */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <aside
        className={`
          hidden lg:flex fixed left-0 top-0 h-full z-40
          bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
          border-r border-[var(--color-border)]
          flex-col shadow-xl
          transition-[width] duration-300 ease-in-out
        `}
        style={{ width: isCollapsed ? 80 : 280 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
            {isCollapsed ? (
              <div className="flex items-center justify-center">
                <VxoLogoSmall />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <VxoLogo />
                <div className="flex flex-col">
                  <span className="text-[var(--color-text-muted)] text-xs">Dashboard</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              w-8 h-8 flex items-center justify-center rounded-full
              bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
              text-[var(--color-text-muted)] hover:text-[var(--color-text)]
              transition-all duration-300
              ${isCollapsed ? "absolute -right-3 top-6 shadow-lg border border-[var(--color-border)] bg-[var(--color-background)]" : ""}
            `}
          >
            <ChevronLeft 
              size={16} 
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed ? (
                <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {section.title}
                </h3>
              ) : (
                <div className="h-px bg-[var(--color-border)] my-3 mx-3" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItemComponent
                    key={item.label}
                    item={item}
                    isActive={activeItem === item.label}
                    isCollapsed={isCollapsed}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)]
              bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
              text-[var(--color-text-muted)] hover:text-[var(--color-text)]
              transition-all duration-300
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </span>
            )}
          </button>

          {/* User Card */}
          <div className="relative mt-3 group">
            <div
              onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
              className={`
                flex items-center gap-3 p-3 rounded-[var(--border-radius-md)]
                bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10
                border border-[var(--color-border)] cursor-pointer
                hover:from-[var(--color-primary)]/20 hover:to-[var(--color-secondary)]/20
                transition-all duration-300
                ${isCollapsed ? "justify-center p-2" : ""}
              `}
            >
              <UserAvatar
                isLoading={isLoadingProfile}
                imageUrl={profileImageUrl}
                displayName={displayName}
              />

              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    {isLoadingProfile ? (
                      <>
                        <div className="h-4 w-24 bg-[var(--color-surface)] rounded animate-pulse" />
                        <div className="h-3 w-20 bg-[var(--color-surface)] rounded animate-pulse mt-1" />
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{displayName}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">vxo.lat/{profileUrl}</p>
                      </>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--color-text-muted)] transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </div>

            {/* Desktop Dropdown */}
            {showUserMenu && !isCollapsed && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-[var(--border-radius-md)] border shadow-lg z-50 bg-[var(--color-background)] border-[var(--color-border)]"
              >
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    window.open(`https://vxo.lat/${profileUrl}`, "_blank");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all"
                >
                  <User size={18} />
                  <span className="text-sm">Ver Perfil Público</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all"
                >
                  <Settings size={18} />
                  <span className="text-sm">Configurações</span>
                </button>

                <div className="my-2 border-t border-[var(--color-border)]" />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut || isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                  <span className="text-sm">{isLoggingOut ? "Saindo..." : "Sair da conta"}</span>
                </button>
              </div>
            )}

            {/* Collapsed Tooltip */}
            {isCollapsed && (
              <div className="
                absolute left-full ml-3 px-3 py-2 rounded-[var(--border-radius-md)]
                bg-[var(--color-background)] border border-[var(--color-border)]
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 whitespace-nowrap z-50 shadow-lg
              ">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      size="small"
                      isLoading={isLoadingProfile}
                      imageUrl={profileImageUrl}
                      displayName={displayName}
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{displayName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">vxo.lat/{profileUrl}</p>
                    </div>
                  </div>
                  <div className="border-t border-[var(--color-border)] pt-2">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm disabled:opacity-50"
                    >
                      {isLoggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                      <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Content Spacer */}
      <div
        className="hidden lg:block flex-shrink-0 transition-[width] duration-300 ease-in-out"
        style={{ width: isCollapsed ? 80 : 280 }}
      />
    </>
  );
};

export default Sidebar;