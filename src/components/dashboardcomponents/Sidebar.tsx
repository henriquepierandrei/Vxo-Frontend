// components/Sidebar/Sidebar.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/ThemeProvider";
import { NeoLogo } from "../LogoProps";
import { NeoLogoSmall } from "../LogoPropsSmall";

import {
  Home,
  ShoppingBag,
  Layout,
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
  Lock, // ✅ Ícone de cadeado para itens bloqueados
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  isBlock?: boolean;
  blockReason?: string; // ✅ Motivo do bloqueio (opcional)
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Início");
  const { isDark, toggleTheme } = useTheme();

  const navSections: NavSection[] = [
    {
      title: "Painel",
      items: [
        { icon: <Home size={20} />, label: "Início", href: "/dashboard/start" },
        {
          icon: <ShoppingBag size={20} />,
          label: "Loja",
          href: "/loja",
          badge: "Novo",
          isBlock: true,
          blockReason: "Em breve" // ✅ Motivo do bloqueio
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
        { icon: <Code size={20} />, label: "Embeds", href: "/embeds", isBlock: true, blockReason: "Premium" },
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
  ];

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
  };

  const mobileVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 },
  };

  // ✅ Componente NavItem atualizado com lógica de block
  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = activeItem === item.label;
    const isBlocked = item.isBlock === true;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();

      // ✅ Se estiver bloqueado, não faz nada
      if (isBlocked) {
        return;
      }

      setActiveItem(item.label);
      window.location.href = item.href;
    };

    return (
      <motion.div
        className="relative"
        // ✅ Desabilita animações se estiver bloqueado
        whileHover={isBlocked ? {} : { x: 4 }}
        whileTap={isBlocked ? {} : { scale: 0.98 }}
      >
        <a
          href={isBlocked ? undefined : item.href}
          onClick={handleClick}
          className={`
            relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)]
            transition-all duration-300 group
            
            ${isBlocked
              ? "cursor-not-allowed opacity-50" // ✅ Estilo bloqueado
              : "cursor-pointer"
            }
            
            ${isActive && !isBlocked
              ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
              : isBlocked
                ? "text-[var(--color-text-muted)]" // ✅ Cor para bloqueado
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            }
          `}
        >
          {/* Active Indicator - Não mostra se bloqueado */}
          {isActive && !isBlocked && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-primary)] rounded-r-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Icon */}
          <span className={`flex-shrink-0 ${isActive && !isBlocked ? "text-[var(--color-primary)]" : ""}`}>
            {item.icon}
          </span>

          {/* Label */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className={`text-sm font-medium whitespace-nowrap overflow-hidden ${isBlocked ? "line-through" : ""}`}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* ✅ Badge ou Lock Icon */}
          {!isCollapsed && (
            <div className="ml-auto flex items-center gap-2">
              {/* Badge normal */}
              {item.badge && !isBlocked && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary)] text-white"
                >
                  {item.badge}
                </motion.span>
              )}

              {/* ✅ Lock indicator quando bloqueado */}
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

          {/* ✅ Tooltip for collapsed state - Atualizado para bloqueados */}
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

              {/* Badge no tooltip */}
              {item.badge && !isBlocked && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-primary)] text-white">
                  {item.badge}
                </span>
              )}

              {/* ✅ Lock no tooltip */}
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

        {/* ✅ Overlay visual para itens bloqueados (opcional - efeito extra) */}
        {isBlocked && (
          <div className="absolute inset-0 rounded-[var(--border-radius-sm)] pointer-events-none">
            {/* Linha diagonal sutil */}
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
                  )`
                }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // ✅ Componente para Mobile NavItem com lógica de block
  // ✅ Componente para Mobile NavItem CORRIGIDO
  const MobileNavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = activeItem === item.label;
    const isBlocked = item.isBlock === true;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();

      if (isBlocked) {
        return;
      }

      setActiveItem(item.label);
      setIsMobileOpen(false);

      // ✅ ADICIONADO: Navegação para o link
      window.location.href = item.href;
    };

    return (
      <motion.a
        href={isBlocked ? undefined : item.href}
        onClick={handleClick}
        className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--border-radius-sm)]
        transition-all duration-300
        
        ${isBlocked
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
          }
        
        ${isActive && !isBlocked
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

        <span className={isActive && !isBlocked ? "text-[var(--color-primary)]" : ""}>
          {item.icon}
        </span>

        <span className={`text-sm font-medium ${isBlocked ? "line-through" : ""}`}>
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

  // ✅ Desktop Sidebar Content
  const DesktopSidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <motion.div
          className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
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
                <NeoLogoSmall />
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
                <NeoLogo />
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="text-[var(--color-text-muted)] text-xs">Dashboard</span>
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
            ${isCollapsed ? "absolute -right-3 top-6 shadow-lg border border-[var(--color-border)] bg-[var(--color-background)]" : ""}
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

        <motion.div
          className={`
            mt-3 flex items-center gap-3 p-3 rounded-[var(--border-radius-md)]
            bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10
            border border-[var(--color-border)] cursor-pointer
            hover:from-[var(--color-primary)]/20 hover:to-[var(--color-secondary)]/20
            transition-all duration-300
            ${isCollapsed ? "justify-center p-2" : ""}
          `}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">US</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-background)]" />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                  Usuário
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  usuario@zyo.se
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );

  // ✅ Mobile Sidebar Content
  const MobileSidebarContent = () => (
    <>
      <div className="flex items-center justify-center p-4 border-b border-[var(--color-border)]">
        <motion.div className="flex items-center gap-3">
          <NeoLogo />
          <div className="flex flex-col">
            <span className="text-[var(--color-text-muted)] text-xs">Dashboard</span>
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

        <motion.div
          className="mt-3 flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border border-[var(--color-border)] cursor-pointer hover:from-[var(--color-primary)]/20 hover:to-[var(--color-secondary)]/20 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">US</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-background)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">Usuário</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">usuario@zyo.se</p>
          </div>
        </motion.div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsMobileOpen(true)}
        className="
          lg:hidden fixed top-4 left-4 z-50 w-11 h-11
          flex items-center justify-center rounded-[var(--border-radius-sm)]
          bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)]
          border border-[var(--color-border)]
          text-[var(--color-text)] shadow-lg
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu size={22} />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0  backdrop-blur-sm z-40"
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

      {/* Desktop Sidebar */}
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

      {/* Content Spacer */}
      <motion.div
        className="hidden lg:block flex-shrink-0"
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      />
    </>
  );
};

export default Sidebar;