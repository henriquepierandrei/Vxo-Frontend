// components/Navbar.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/ThemeProvider";
import { VxoLogo } from "../LogoProps";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ✅ CORREÇÃO: Desestruturar isDark e toggleTheme do hook
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fechar menu mobile ao mudar tema
  useEffect(() => {
    // Opcional: fechar menu ao trocar tema no mobile
  }, [isDark]);

  const navItems = [
    { label: "Início", href: "/" },
    { label: "Ranking", href: "/ranking" },
    { label: "Premium", href: "/plans" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Container externo com padding para efeito "floating" */}
        <div className={`transition-all duration-500 ${scrolled ? "pt-2 px-2 sm:pt-3 sm:px-4" : "pt-0 px-0"}`}>
          
          {/* Barra principal com Glass Effect */}
          <div
            className={`
              relative overflow-hidden transition-all duration-500 ease-out rounded-3xl
              ${scrolled 
                ? "mx-auto max-w-5xl rounded-2xl shadow-lg" 
                : "rounded-none"
              }
            `}
          >
            <div
              className={`
                absolute inset-0 transition-all duration-500 rounded-3xl
                ${scrolled
                  ? isDark
                    ? "bg-[var(--card-background-glass)] backdrop-blur-3xl backdrop-saturate-150"
                    : "bg-[var(--card-background-glass)]  backdrop-blur-3xl backdrop-saturate-150"
                  : isDark
                    ? "bg-[var(--color-background)] backdrop-blur-md"
                    : "bg-[var(--color-background)] backdrop-blur-md"
                }
              `}
            />

            {/* Border Glass Effect */}
            <div
              className={`
                absolute inset-0 rounded-2xl transition-all duration-500
                ${scrolled
                  ? isDark
                    ? "ring-1 ring-white/10 ring-inset"
                    : "ring-1 ring-black/5 ring-inset shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"
                  : ""
                }
              `}
            />

            {/* Highlight superior (estilo iOS) */}
            {scrolled && (
              <div 
                className={`
                  absolute inset-x-0 top-0 h-px
                  ${isDark
                    ? "bg-gradient-to-r from-transparent white/20 to-transparent"
                    : "bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  }
                `}
              />
            )}

            {/* Conteúdo da Navbar */}
            <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                
                {/* Logo */}
                <motion.a
                  href="#"
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                 
                  
                  <span 
                    className={`text-lg sm:text-xl font-semibold tracking-tight transition-colors duration-300 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
                  >
                    <VxoLogo />
                  </span>
                </motion.a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      className={`
                        relative px-4 py-2 rounded-full text-sm font-medium
                        transition-all duration-300
                        ${isDark 
                          ? "text-white/70 hover:text-white hover:bg-white/10" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                        }
                      `}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                  
                  {/* Theme Toggle Button */}
                  <motion.button
                    onClick={toggleTheme}
                    className={`
                      relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${isDark
                        ? "bg-white/10 hover:bg-white/20 text-black-300"
                        : "bg-black/5 hover:bg-black/10 text-black"
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Alternar tema"
                  >
                    <AnimatePresence mode="wait">
                      {isDark ? (
                        <motion.svg
                          key="sun"
                          initial={{ rotate: -90, opacity: 0, scale: 0 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: 90, opacity: 0, scale: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          key="moon"
                          initial={{ rotate: 90, opacity: 0, scale: 0 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: -90, opacity: 0, scale: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Login Button - Desktop */}
                  <motion.button
                    onClick={() => window.location.href = "/login"}
                    className={`
                      hidden sm:flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 
                      rounded-full text-sm font-medium
                      transition-all duration-300
                      ${isDark
                        ? "bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10"
                        : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-black/10"
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Login
                  </motion.button>

                  {/* Mobile Menu Button */}
                  <motion.button
                    className={`
                      md:hidden relative w-9 h-9 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${isDark
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-black/5 hover:bg-black/10 text-gray-900"
                      }
                    `}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Abrir menu"
                  >
                    <div className="relative w-5 h-5 flex flex-col items-center justify-center">
                      <motion.span
                        className={`absolute h-0.5 w-5 rounded-full transition-colors ${isDark ? "bg-white" : "bg-gray-900"}`}
                        animate={{
                          rotate: mobileMenuOpen ? 45 : 0,
                          y: mobileMenuOpen ? 0 : -4,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      <motion.span
                        className={`absolute h-0.5 w-5 rounded-full transition-colors ${isDark ? "bg-white" : "bg-gray-900"}`}
                        animate={{
                          opacity: mobileMenuOpen ? 0 : 1,
                          scale: mobileMenuOpen ? 0 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      <motion.span
                        className={`absolute h-0.5 w-5 rounded-full transition-colors ${isDark ? "bg-white" : "bg-gray-900"}`}
                        animate={{
                          rotate: mobileMenuOpen ? -45 : 0,
                          y: mobileMenuOpen ? 0 : 4,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
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
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className={`
                absolute inset-0
                ${isDark ? "bg-black/60" : "bg-black/30"}
                backdrop-blur-sm
              `} />
            </motion.div>

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-20 left-3 right-3 z-50 md:hidden"
            >
              {/* ✅ CORREÇÃO: Classes de background corrigidas */}
              <div className={`
                relative overflow-hidden rounded-2xl
                ${isDark 
                  ? "bg-[var(--color-background)/70] ring-1 ring-white/10" 
                  : "bg-white/70 ring-1 ring-black/5 shadow-xl"
                }
                backdrop-blur-2xl backdrop-saturate-150
              `}>
                <div className="relative z-10 p-4">
                  
                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {navItems.map((item, index) => (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          text-base font-medium transition-all duration-200
                          ${isDark 
                            ? "text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20" 
                            : "text-gray-700 hover:text-gray-900 hover:bg-black/5 active:bg-black/10"
                          }
                        `}
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                      >
                        {item.label === "Início" && (
                          <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        )}
                        {item.label === "Ranking" && (
                          <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        )}
                        {item.label === "Premium" && (
                          <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        )}
                        {item.label === "Comunidade" && (
                          <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {item.label}
                      </motion.a>
                    ))}
                  </div>

                  <div className={`my-4 h-px ${isDark ? "bg-white/10" : "bg-black/10"}`} />

                  {/* Login Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      w-full flex items-center justify-center gap-2 px-4 py-3.5
                      rounded-xl text-base font-semibold
                      transition-all duration-300
                      ${isDark
                        ? "bg-white text-gray-900 hover:bg-gray-100 active:bg-gray-200"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700"
                      }
                    `}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Fazer Login
                  </motion.button>

                  {/* Theme Toggle */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <button
                      onClick={toggleTheme}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl
                        transition-all duration-300
                        ${isDark 
                          ? "bg-white/5 hover:bg-white/10" 
                          : "bg-black/5 hover:bg-black/10"
                        }
                      `}
                    >
                      <span className={`text-sm font-medium ${isDark ? "text-white/70" : "text-gray-600"}`}>
                        Aparência
                      </span>
                      
                      {/* Toggle Switch iOS Style */}
                      <div className={`
                        relative w-14 h-8 rounded-full p-1 transition-colors duration-300
                        ${isDark ? "bg-blue-600" : "bg-gray-300"}
                      `}>
                        <motion.div
                          className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                          animate={{ x: isDark ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          {isDark ? (
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </motion.div>
                      </div>
                    </button>
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