// components/Navbar.tsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "../../hooks/ThemeProvider";
import { VxoLogo } from "../logo/LogoProps";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isNew?: boolean;
}

// ═══════════════════════════════════════════════════════════
// ICONS COMPONENTS
// ═══════════════════════════════════════════════════════════

const HomeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const TrophyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const DashboardIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// MAGNETIC BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════

const MagneticButton = ({ 
  children, 
  className = "", 
  onClick,
  strength = 0.3 
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  strength?: number;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════
// GLOW EFFECT COMPONENT
// ═══════════════════════════════════════════════════════════

const GlowEffect = ({ color = "primary", size = "md" }: { color?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${sizeClasses[size]}`}
      style={{
        background: color === "primary" 
          ? "linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
          : color
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.3, 0.2]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// ANIMATED GRADIENT BORDER
// ═══════════════════════════════════════════════════════════

const AnimatedBorder = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500" />
    <div className="relative">{children}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// THEME TOGGLE WITH 3D FLIP
// ═══════════════════════════════════════════════════════════

const ThemeToggle3D = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => {
  return (
    <MagneticButton
      onClick={onToggle}
      className={`
        relative w-10 h-10 rounded-xl flex items-center justify-center
        overflow-hidden transition-all duration-500
        ${isDark
          ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-purple-500/20"
          : "bg-gradient-to-br from-amber-50 to-orange-100 shadow-lg shadow-orange-300/30"
        }
      `}
    >
      {/* Glow effect */}
      <div className={`
        absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300
        ${isDark
          ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
          : "bg-gradient-to-br from-yellow-300/20 to-orange-300/20"
        }
      `} />
      
      {/* Ring */}
      <div className={`
        absolute inset-0 rounded-xl ring-1 ring-inset transition-colors duration-300
        ${isDark ? "ring-white/10" : "ring-black/5"}
      `} />

      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
          >
            {/* Moon with stars */}
            <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            {/* Stars */}
            <motion.div
              className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-0 -left-1 w-1 h-1 bg-blue-300 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
          >
            {/* Sun with rays */}
            <motion.svg
              className="w-5 h-5 text-amber-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>
    </MagneticButton>
  );
};

// ═══════════════════════════════════════════════════════════
// NAV ITEM WITH HOVER EFFECT
// ═══════════════════════════════════════════════════════════

const NavItemDesktop = ({
  item,
  index,
  isDark,
  isActive,
}: {
  item: NavItem;
  index: number;
  isDark: boolean;
  isActive: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={item.href}
      className="relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`
          relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-300
          ${isActive
            ? isDark
              ? "text-white"
              : "text-gray-900"
            : isDark
              ? "text-white/60 hover:text-white"
              : "text-gray-500 hover:text-gray-900"
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active/Hover Background */}
        <AnimatePresence>
          {(isActive || isHovered) && (
            <motion.div
              className={`
                absolute inset-0 rounded-xl
                ${isActive
                  ? isDark
                    ? "bg-white/10"
                    : "bg-black/5"
                  : isDark
                    ? "bg-white/5"
                    : "bg-black/[0.03]"
                }
              `}
              layoutId="navBackground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </AnimatePresence>

        {/* Icon with glow on active */}
        <span className={`relative z-10 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
          {item.icon}
        </span>
        
        <span className="relative z-10">{item.label}</span>

        {/* New Badge */}
        {item.isNew && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            NEW
          </motion.span>
        )}

        {/* Badge */}
        {item.badge && (
          <span className={`
            relative z-10 px-1.5 py-0.5 text-[10px] font-semibold rounded-full
            ${isDark
              ? "bg-purple-500/20 text-purple-300"
              : "bg-purple-100 text-purple-600"
            }
          `}>
            {item.badge}
          </span>
        )}

        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            layoutId="activeIndicator"
            initial={{ scale: 0, x: "-50%" }}
            animate={{ scale: 1, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </motion.div>
    </motion.a>
  );
};

// ═══════════════════════════════════════════════════════════
// MOBILE MENU ITEM
// ═══════════════════════════════════════════════════════════

const MobileMenuItem = ({
  item,
  index,
  isDark,
  isActive,
  onClick,
}: {
  item: NavItem;
  index: number;
  isDark: boolean;
  isActive: boolean;
  onClick: () => void;
}) => (
  <motion.a
    href={item.href}
    initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
    transition={{ delay: index * 0.08, duration: 0.3 }}
    onClick={onClick}
    className={`
      group relative flex items-center gap-4 px-4 py-4 rounded-2xl
      transition-all duration-300 overflow-hidden
      ${isActive
        ? isDark
          ? "bg-white/10"
          : "bg-black/5"
        : isDark
          ? "hover:bg-white/5 active:bg-white/10"
          : "hover:bg-black/[0.03] active:bg-black/5"
      }
    `}
  >
    {/* Gradient hover effect */}
    <div className={`
      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
      ${isDark
        ? "bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10"
        : "bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"
      }
    `} />

    {/* Icon container */}
    <motion.div
      className={`
        relative z-10 p-2.5 rounded-xl transition-all duration-300
        ${isActive
          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
          : isDark
            ? "bg-white/10 text-white/70 group-hover:bg-white/15 group-hover:text-white"
            : "bg-black/5 text-gray-500 group-hover:bg-black/10 group-hover:text-gray-900"
        }
      `}
      whileHover={{ scale: 1.05, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      {item.icon}
    </motion.div>

    {/* Label */}
    <div className="relative z-10 flex-1">
      <span className={`
        text-base font-semibold transition-colors duration-300
        ${isDark
          ? "text-white/90 group-hover:text-white"
          : "text-gray-700 group-hover:text-gray-900"
        }
      `}>
        {item.label}
      </span>
      {item.badge && (
        <span className={`
          ml-2 px-2 py-0.5 text-xs font-medium rounded-full
          ${isDark
            ? "bg-purple-500/20 text-purple-300"
            : "bg-purple-100 text-purple-600"
          }
        `}>
          {item.badge}
        </span>
      )}
    </div>

    {/* Arrow */}
    <motion.div
      className={`
        relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300
        ${isDark ? "text-white/50" : "text-gray-400"}
      `}
      initial={{ x: -10 }}
      whileHover={{ x: 0 }}
    >
      <ArrowRightIcon className="w-4 h-4" />
    </motion.div>

    {/* Active indicator */}
    {isActive && (
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500"
        layoutId="mobileActiveIndicator"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
      />
    )}
  </motion.a>
);

// ═══════════════════════════════════════════════════════════
// HAMBURGER MENU BUTTON
// ═══════════════════════════════════════════════════════════

const HamburgerButton = ({
  isOpen,
  onClick,
  isDark,
}: {
  isOpen: boolean;
  onClick: () => void;
  isDark: boolean;
}) => (
  <MagneticButton
    onClick={onClick}
    className={`
      relative w-10 h-10 rounded-xl flex items-center justify-center
      transition-all duration-300 overflow-hidden
      ${isDark
        ? "bg-white/10 hover:bg-white/15"
        : "bg-black/5 hover:bg-black/10"
      }
    `}
    strength={0.2}
  >
    <div className="relative w-5 h-5 flex flex-col items-center justify-center">
      <motion.span
        className={`absolute h-0.5 w-5 rounded-full ${isDark ? "bg-white" : "bg-gray-900"}`}
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -6,
          width: isOpen ? 20 : 20,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <motion.span
        className={`absolute h-0.5 rounded-full ${isDark ? "bg-white" : "bg-gray-900"}`}
        animate={{
          opacity: isOpen ? 0 : 1,
          width: isOpen ? 0 : 12,
          x: isOpen ? 0 : -4,
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className={`absolute h-0.5 w-5 rounded-full ${isDark ? "bg-white" : "bg-gray-900"}`}
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? 0 : 6,
          width: isOpen ? 20 : 16,
          x: isOpen ? 0 : 2,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  </MagneticButton>
);

// ═══════════════════════════════════════════════════════════
// LOGIN BUTTON
// ═══════════════════════════════════════════════════════════

const LoginButton = ({ isDark, isMobile = false }: { isDark: boolean; isMobile?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={() => window.location.href = "/login"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group overflow-hidden
        ${isMobile 
          ? "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl" 
          : "flex items-center gap-2 px-5 py-2.5 rounded-xl"
        }
        text-sm font-semibold transition-all duration-300
        ${isDark
          ? "bg-white text-gray-900 hover:shadow-lg hover:shadow-white/20"
          : "bg-gray-900 text-white hover:shadow-lg hover:shadow-black/20"
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)"
            : "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
        }}
        animate={isHovered ? { x: ["100%", "-100%"] } : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Gradient border on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.5), rgba(236,72,153,0.5))",
          padding: "1px"
        }}
      >
        <div className={`
          w-full h-full rounded-xl
          ${isDark ? "bg-white" : "bg-gray-900"}
        `} />
      </motion.div>

      <UserIcon className="w-4 h-4 relative z-10" />
      <span className="relative z-10">{isMobile ? "Fazer Login" : "Login"}</span>
      
      {/* Arrow that appears on hover */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, x: -10, width: 0 }}
        animate={isHovered ? { opacity: 1, x: 0, width: "auto" } : { opacity: 0, x: -10, width: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ArrowRightIcon className="w-4 h-4" />
      </motion.div>
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN NAVBAR COMPONENT
// ═══════════════════════════════════════════════════════════

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("/");
  const { isDark, toggleTheme } = useTheme();

  // Scroll handler with throttle
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detect current path
  useEffect(() => {
    setActiveItem(window.location.pathname);
  }, []);

  // Close menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems: NavItem[] = [
    { label: "Início", href: "/", icon: <HomeIcon className="w-4 h-4" /> },
    { label: "Ranking", href: "/ranking", icon: <TrophyIcon className="w-4 h-4" />, badge: "Top 100" },
    { label: "Premium", href: "/plans", icon: <SparklesIcon className="w-4 h-4" />, isNew: true },
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon className="w-4 h-4" /> },
  ];

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Floating container */}
        <div className={`
          transition-all duration-500 ease-out
          ${scrolled ? "pt-3 px-3 sm:pt-4 sm:px-4" : "pt-0 px-0"}
        `}>
          <AnimatedBorder className={scrolled ? "mx-auto max-w-5xl" : ""}>
            <div className={`
              relative overflow-hidden transition-all duration-500
              ${scrolled ? "rounded-2xl" : "rounded-none"}
            `}>
              {/* Glass background */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundColor: scrolled
                    ? isDark
                      ? "rgba(15, 15, 20, 0.8)"
                      : "rgba(255, 255, 255, 0.8)"
                    : isDark
                      ? "rgba(15, 15, 20, 1)"
                      : "rgba(255, 255, 255, 1)"
                }}
                transition={{ duration: 0.5 }}
                style={{
                  backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
                  WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
                }}
              />

              {/* Border */}
              <div className={`
                absolute inset-0 transition-all duration-500
                ${scrolled
                  ? isDark
                    ? "ring-1 ring-inset ring-white/10"
                    : "ring-1 ring-inset ring-black/5 shadow-lg shadow-black/5"
                  : isDark
                    ? "border-b border-white/5"
                    : "border-b border-black/5"
                }
                ${scrolled ? "rounded-2xl" : ""}
              `} />

              {/* Gradient line at top (scrolled state) */}
              {scrolled && (
                <motion.div
                  className="absolute inset-x-0 top-0 h-px"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: isDark
                      ? "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), rgba(236,72,153,0.5), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(168,85,247,0.3), rgba(236,72,153,0.3), transparent)"
                  }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-4">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <motion.a
                    href="/"
                    className="flex items-center gap-2 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="relative"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <VxoLogo />
                      {/* Logo glow */}
                      <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 bg-gradient-to-r from-purple-500 to-pink-500" />
                    </motion.div>
                  </motion.a>

                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
                    {navItems.map((item, index) => (
                      <NavItemDesktop
                        key={item.label}
                        item={item}
                        index={index}
                        isDark={isDark}
                        isActive={activeItem === item.href}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle3D isDark={isDark} onToggle={toggleTheme} />
                    
                    <div className="hidden sm:block">
                      <LoginButton isDark={isDark} />
                    </div>

                    <div className="md:hidden">
                      <HamburgerButton
                        isOpen={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        isDark={isDark}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedBorder>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 md:hidden"
              onClick={closeMobileMenu}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ backdropFilter: "blur(0px)" }}
                animate={{ backdropFilter: "blur(8px)" }}
                exit={{ backdropFilter: "blur(0px)" }}
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
                }}
              />
            </motion.div>

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-20 left-3 right-3 z-50 md:hidden"
            >
              <div className={`
                relative overflow-hidden rounded-3xl
                ${isDark
                  ? "bg-gray-900/95 ring-1 ring-white/10"
                  : "bg-white/95 ring-1 ring-black/5 shadow-2xl"
                }
                backdrop-blur-2xl backdrop-saturate-150
              `}>
                {/* Decorative gradient */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                
                {/* Glow effects */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 p-4">
                  {/* Nav Items */}
                  <div className="space-y-1">
                    {navItems.map((item, index) => (
                      <MobileMenuItem
                        key={item.label}
                        item={item}
                        index={index}
                        isDark={isDark}
                        isActive={activeItem === item.href}
                        onClick={closeMobileMenu}
                      />
                    ))}
                  </div>

                  {/* Divider */}
                  <motion.div
                    className={`my-4 h-px ${isDark ? "bg-white/10" : "bg-black/10"}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  />

                  {/* Login Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <LoginButton isDark={isDark} isMobile />
                  </motion.div>

                  {/* Theme Toggle Row */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4"
                  >
                    <button
                      onClick={toggleTheme}
                      className={`
                        w-full flex items-center justify-between px-4 py-4 rounded-2xl
                        transition-all duration-300
                        ${isDark
                          ? "bg-white/5 hover:bg-white/10"
                          : "bg-black/[0.03] hover:bg-black/5"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-2 rounded-xl
                          ${isDark ? "bg-white/10" : "bg-black/5"}
                        `}>
                          {isDark ? (
                            <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${isDark ? "text-white/70" : "text-gray-600"}`}>
                          {isDark ? "Modo Escuro" : "Modo Claro"}
                        </span>
                      </div>
                      
                      {/* iOS Style Toggle */}
                      <div className={`
                        relative w-14 h-8 rounded-full p-1 transition-all duration-500
                        ${isDark
                          ? "bg-gradient-to-r from-purple-600 to-pink-600"
                          : "bg-gray-300"
                        }
                      `}>
                        <motion.div
                          className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
                          animate={{ x: isDark ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <AnimatePresence mode="wait">
                            {isDark ? (
                              <motion.svg
                                key="moon-icon"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                className="w-3.5 h-3.5 text-purple-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                              </motion.svg>
                            ) : (
                              <motion.svg
                                key="sun-icon"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                className="w-3.5 h-3.5 text-amber-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                              </motion.svg>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </button>
                  </motion.div>

                  {/* Footer info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`
                      mt-4 pt-4 text-center text-xs
                      ${isDark ? "text-white/30" : "text-gray-400"}
                    `}
                  >
                    <p>© 2024 VXO. Todos os direitos reservados.</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;