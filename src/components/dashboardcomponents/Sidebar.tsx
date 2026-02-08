// components/Sidebar/Sidebar.tsx
import { useState } from "react";
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
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Início");
  const { isDark, toggleTheme } = useTheme();

  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { profileData, isLoadingProfile } = useProfile();

  // ═══════════════════════════════════════════════════════════
  // ✅ SEM early return — dados derivados usam fallback seguro
  // ═══════════════════════════════════════════════════════════

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const displayName = profileData?.name || user?.name || "Usuário";
  const profileUrl = profileData?.url || user?.urlName || "usuario";
  const profileImageUrl =
    profileData?.pageSettings?.mediaUrls?.profileImageUrl || "";

  const navSections: NavSection[] = [
    {
      title: "Painel",
      items: [
        { icon: <Home size={20} />, label: "Início", href: "/dashboard/start" },
        {
          icon: <ShoppingBag size={20} />,
          label: "Loja",
          href: "/dashboard/store",
          badge: "Novo",
          isBlock: false,
          blockReason: "Novo",
        },
      ],
    },
    {
      title: "Perfil",
      items: [
        {
          icon: <Image size={20} />,
          label: "Ativos",
          href: "/dashboard/assets",
        },
        {
          icon: <Palette size={20} />,
          label: "Customização",
          href: "/dashboard/customization",
        },
        { icon: <Tags size={20} />, label: "Tags", href: "/dashboard/tags" },
      ],
    },
    {
      title: "Widgets",
      items: [
        {
          icon: <Link2 size={20} />,
          label: "Links",
          href: "/dashboard/links",
        },
        {
          icon: <Share2 size={20} />,
          label: "Redes Sociais",
          href: "/dashboard/socialmedia",
        },
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
        {
          icon: <Settings size={20} />,
          label: "Configurações",
          href: "/dashboard/settings",
        },
        {
          icon: <Package size={20} />,
          label: "Inventário",
          href: "/dashboard/inventory",
        },
        {
          icon: <History size={20} />,
          label: "Histórico",
          href: "/dashboard/logs",
        },
      ],
    },
  ];

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
  };

  const mobileVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 },
  };

  // ═══════════════════════════════════════════════════════════
  // COMPONENTE: Avatar do Usuário (com skeleton integrado)
  // ═══════════════════════════════════════════════════════════

  const UserAvatar = ({ size = "default" }: { size?: "default" | "small" }) => {
    const sizeClasses = size === "small" ? "w-8 h-8" : "w-9 h-9";
    const textSize = size === "small" ? "text-xs" : "text-sm";

    if (isLoadingProfile) {
      return (
        <div className="relative">
          <div
            className={`${sizeClasses} rounded-full bg-[var(--color-surface)] animate-pulse`}
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-[var(--color-background)] animate-pulse" />
        </div>
      );
    }

    return (
      <div className="relative">
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center overflow-hidden`}
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
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
  };

  // ═══════════════════════════════════════════════════════════
  // COMPONENTE: NavItem Desktop
  // ═══════════════════════════════════════════════════════════

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = activeItem === item.label;
    const isBlocked = item.isBlock === true;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isBlocked) return;
      setActiveItem(item.label);
      window.location.href = item.href;
    };

    return (
      <motion.div
        className="relative"
        whileHover={isBlocked ? {} : { x: 4 }}
        whileTap={isBlocked ? {} : { scale: 0.98 }}
      >
        <a
          href={isBlocked ? undefined : item.href}
          onClick={handleClick}
          className={`
            relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)]
            transition-all duration-300 group
            ${isBlocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            ${
              isActive && !isBlocked
                ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                : isBlocked
                ? "text-[var(--color-text-muted)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            }
          `}
        >
          {isActive && !isBlocked && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-primary)] rounded-r-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          <span
            className={`flex-shrink-0 ${
              isActive && !isBlocked ? "text-[var(--color-primary)]" : ""
            }`}
          >
            {item.icon}
          </span>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className={`text-sm font-medium whitespace-nowrap overflow-hidden ${
                  isBlocked ? "line-through" : ""
                }`}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <div className="ml-auto flex items-center gap-2">
              {item.badge && !isBlocked && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary)] text-white"
                >
                  {item.badge}
                </motion.span>
              )}

              {isBlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <Lock size={14} className="text-[var(--color-text-muted)]" />
                  {item.blockReason && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                      {item.blockReason}
                    </span>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {isCollapsed && (
            <div
              className="
                absolute left-full ml-3 px-3 py-1.5 rounded-[var(--border-radius-sm)]
                bg-[var(--color-background)] border border-[var(--color-border)]
                text-[var(--color-text)] text-sm font-medium
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 whitespace-nowrap z-50
                shadow-lg flex items-center gap-2
              "
            >
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
                  {item.blockReason && (
                    <span className="text-xs">{item.blockReason}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </a>

        {isBlocked && (
          <div className="absolute inset-0 rounded-[var(--border-radius-sm)] pointer-events-none">
            <div className="absolute inset-0 overflow-hidden rounded-[var(--border-radius-sm)] opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  background: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    var(--color-text-muted) 10px,
                    var(--color-text-muted) 11px
                  )`,
                }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // COMPONENTE: NavItem Mobile
  // ═══════════════════════════════════════════════════════════

  const MobileNavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = activeItem === item.label;
    const isBlocked = item.isBlock === true;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isBlocked) return;
      setActiveItem(item.label);
      setIsMobileOpen(false);
      window.location.href = item.href;
    };

    return (
      <motion.a
        href={isBlocked ? undefined : item.href}
        onClick={handleClick}
        className={`
          relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)]
          transition-all duration-300
          ${isBlocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${
            isActive && !isBlocked
              ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
              : isBlocked
              ? "text-[var(--color-text-muted)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          }
        `}
        whileHover={isBlocked ? {} : { x: 4 }}
        whileTap={isBlocked ? {} : { scale: 0.98 }}
      >
        {isActive && !isBlocked && (
          <motion.div
            layoutId="mobileActiveIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-primary)] rounded-r-full"
          />
        )}

        <span
          className={
            isActive && !isBlocked ? "text-[var(--color-primary)]" : ""
          }
        >
          {item.icon}
        </span>

        <span
          className={`text-sm font-medium ${isBlocked ? "line-through" : ""}`}
        >
          {item.label}
        </span>

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
      </motion.a>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // Desktop Sidebar Content
  // ═══════════════════════════════════════════════════════════

  const DesktopSidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <motion.div
          className={`flex items-center gap-3 ${
            isCollapsed ? "justify-center w-full" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="small-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center mr-2"
              >
                <VxoLogoSmall />
              </motion.div>
            ) : (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <VxoLogo />
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="text-[var(--color-text-muted)] text-xs">
                    Dashboard
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden lg:flex w-8 h-8 items-center justify-center rounded-full
            bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
            text-[var(--color-text-muted)] hover:text-[var(--color-text)]
            transition-all duration-300
            ${
              isCollapsed
                ? "absolute -right-3 top-6 shadow-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                : ""
            }
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="">
        {navSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.h3
                  key="title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                >
                  {section.title}
                </motion.h3>
              ) : (
                <motion.div
                  key="divider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-px bg-[var(--color-border)] my-3 mx-3"
                />
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItemComponent key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <motion.button
          onClick={toggleTheme}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)]
            bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
            text-[var(--color-text-muted)] hover:text-[var(--color-text)]
            transition-all duration-300
            ${isCollapsed ? "justify-center" : ""}
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={20} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                {isDark ? "Modo Claro" : "Modo Escuro"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User Card com Dropdown - DESKTOP */}
        <div className="relative mt-3">
          <motion.div
            onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
            className={`
              flex items-center gap-3 p-3 rounded-[var(--border-radius-md)]
              bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10
              border border-[var(--color-border)] cursor-pointer
              hover:from-[var(--color-primary)]/20 hover:to-[var(--color-secondary)]/20
              transition-all duration-300
              ${isCollapsed ? "justify-center p-2" : ""}
            `}
            whileHover={{ scale: 1.02 }}
          >
            <UserAvatar />

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  {isLoadingProfile ? (
                    <>
                      <div className="h-4 w-24 bg-[var(--color-surface)] rounded animate-pulse" />
                      <div className="h-3 w-20 bg-[var(--color-surface)] rounded animate-pulse mt-1" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        vxo.lat/{profileUrl}
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: showUserMenu ? 180 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={16}
                    className="text-[var(--color-text-muted)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Dropdown Menu - DESKTOP */}
          <AnimatePresence>
            {showUserMenu && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-[var(--border-radius-md)] border shadow-lg z-50"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                }}
              >
                <motion.button
                  onClick={() => {
                    setShowUserMenu(false);
                    window.open(`https://vxo.lat/${profileUrl}`, "_blank");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  <User size={18} />
                  <span className="text-sm">Ver Perfil Público</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setShowUserMenu(false);
                    window.location.href = "/dashboard/settings";
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  <Settings size={18} />
                  <span className="text-sm">Configurações</span>
                </motion.button>

                <div className="my-2 border-t border-[var(--color-border)]" />

                <motion.button
                  onClick={handleLogout}
                  disabled={isLoggingOut || isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoggingOut ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogOut size={18} />
                  )}
                  <span className="text-sm">
                    {isLoggingOut ? "Saindo..." : "Sair da conta"}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip para modo collapsed */}
          {isCollapsed && (
            <div
              className="
                absolute left-full ml-3 px-3 py-2 rounded-[var(--border-radius-md)]
                bg-[var(--color-background)] border border-[var(--color-border)]
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 whitespace-nowrap z-50
                shadow-lg
              "
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <UserAvatar size="small" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {displayName}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      vxo.lat/{profileUrl}
                    </p>
                  </div>
                </div>
                <div className="border-t border-[var(--color-border)] pt-2">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <LogOut size={14} />
                    )}
                    <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ═══════════════════════════════════════════════════════════
  // Mobile Sidebar Content
  // ═══════════════════════════════════════════════════════════

  const MobileSidebarContent = () => (
    <>
      <div className="flex items-center justify-center p-4 border-b border-[var(--color-border)]">
        <motion.div className="flex items-center gap-3">
          <VxoLogo />
          <div className="flex flex-col">
            <span className="text-[var(--color-text-muted)] text-xs">
              Dashboard
            </span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6 scrollbar-thin scrollbar-thumb-[var(--color-surface-hover)] scrollbar-track-transparent">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <MobileNavItemComponent key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-[var(--color-border)]">
        <motion.button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-sm font-medium">
            {isDark ? "Modo Claro" : "Modo Escuro"}
          </span>
        </motion.button>

        {/* User Card com Dropdown - MOBILE */}
        <div className="relative mt-3">
          <motion.div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border border-[var(--color-border)] cursor-pointer hover:from-[var(--color-primary)]/20 hover:to-[var(--color-secondary)]/20 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <UserAvatar />

            <div className="flex-1 min-w-0">
              {isLoadingProfile ? (
                <>
                  <div className="h-4 w-24 bg-[var(--color-surface)] rounded animate-pulse" />
                  <div className="h-3 w-20 bg-[var(--color-surface)] rounded animate-pulse mt-1" />
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    vxo.lat/{profileUrl}
                  </p>
                </>
              )}
            </div>

            <motion.div
              animate={{ rotate: showUserMenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                size={16}
                className="text-[var(--color-text-muted)]"
              />
            </motion.div>
          </motion.div>

          {/* Dropdown Menu - MOBILE */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-[var(--border-radius-md)] border shadow-lg z-50"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                }}
              >
                <motion.button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsMobileOpen(false);
                    window.open(`https://vxo.lat/${profileUrl}`, "_blank");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  <User size={18} />
                  <span className="text-sm">Ver Perfil Público</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsMobileOpen(false);
                    window.location.href = "/dashboard/settings";
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  <Settings size={18} />
                  <span className="text-sm">Configurações</span>
                </motion.button>

                <div className="my-2 border-t border-[var(--color-border)]" />

                <motion.button
                  onClick={handleLogout}
                  disabled={isLoggingOut || isLoading}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoggingOut ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogOut size={18} />
                  )}
                  <span className="text-sm">
                    {isLoggingOut ? "Saindo..." : "Sair da conta"}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <>
      {/* Mobile Menu Button — CSS puro, sem framer-motion */}
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
            className="lg:hidden fixed inset-0 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            variants={mobileVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="
              lg:hidden fixed left-0 top-0 h-full w-[280px] z-50
              bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
              border-r border-[var(--color-border)]
              flex flex-col shadow-2xl
            "
          >
            <motion.button
              onClick={() => setIsMobileOpen(false)}
              className="
                absolute top-4 right-4 w-8 h-8
                flex items-center justify-center rounded-full
                bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
                text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                transition-all duration-200 z-10
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>
            <MobileSidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar — fixed */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="
          hidden lg:flex fixed left-0 top-0 h-full z-40
          bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
          border-r border-[var(--color-border)]
          flex-col shadow-xl
        "
      >
        <DesktopSidebarContent />
      </motion.aside>

      {/* ✅ Content Spacer — div PURO com CSS transition, SEM motion */}
      <div
        className="hidden lg:block flex-shrink-0 transition-[width] duration-300 ease-in-out"
        style={{ width: isCollapsed ? 80 : 280 }}
      />
    </>
  );
};

export default Sidebar;