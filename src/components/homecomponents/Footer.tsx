import { motion } from "framer-motion";
import { VxoLogo } from "../logo/LogoProps";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 md:py-20 bg-[var(--color-background)] overflow-hidden">
      {/* Gradient line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/20 to-transparent" />
      
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-[var(--color-primary)]/3 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center gap-10">
          
          {/* Logo Section */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="text-3xl font-bold text-[var(--color-text)]">
                <VxoLogo />
              </span>
              
              {/* Subtle glow behind logo on hover */}
              <div className="absolute inset-0 -z-10 bg-[var(--color-primary)]/10 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.a>

            <p className="text-[var(--color-text-muted)] text-sm text-center max-w-xs">
              Transformando suas ideias em experiências digitais memoráveis.
            </p>
          </motion.div>

          {/* Discord CTA */}
          <motion.a
            href="https://discord.com/invite/EvvcDcM3ay"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#5865F2]/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5865F2]/10 to-[#5865F2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Discord Icon */}
            <motion.div 
              className="relative z-10 w-10 h-10 rounded-xl bg-[#5865F2]/10 group-hover:bg-[#5865F2] flex items-center justify-center transition-all duration-300"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <svg 
                className="w-5 h-5 text-[#5865F2] group-hover:text-white transition-colors duration-300" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </motion.div>

            {/* Text */}
            <div className="relative z-10 flex flex-col">
              <span className="text-[var(--color-text)] text-sm font-medium group-hover:text-[#5865F2] transition-colors duration-300">
                Entre no Discord
              </span>
              <span className="text-[var(--color-text-muted)] text-xs">
                Junte-se à comunidade
              </span>
            </div>

            {/* Arrow */}
            <motion.svg 
              className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[#5865F2] relative z-10 transition-colors duration-300"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ x: 0 }}
              whileHover={{ x: 3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(88,101,242,0.2)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.a>

          {/* Divider with dots */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[var(--color-border)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[var(--color-border)]" />
          </motion.div>

          {/* Legal Links */}
          <motion.div 
            className="flex flex-wrap justify-center gap-1"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {[
              { label: "Termos de Serviço", href: "/termos" },
              { label: "Privacidade", href: "/privacidade" },
              { label: "Cookies", href: "/cookies" },
            ].map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-3 py-1.5 text-[var(--color-text-muted)] text-xs font-medium hover:text-[var(--color-text)] transition-colors duration-200 group"
              >
                {item.label}
                {index < 2 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-border)]">
                    ·
                  </span>
                )}
                <span className="absolute bottom-0 left-3 right-3 h-px bg-[var(--color-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>
            ))}
          </motion.div>

          {/* Copyright */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center gap-2 text-[var(--color-text-muted)] text-xs"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <span>© 2025 — {currentYear}</span>
            <span className="hidden sm:block">•</span>
            <span>
              <span className="text-[var(--color-primary)] font-medium">Vxo</span>
              {" "}— Todos os direitos reservados
            </span>
          </motion.div>
        </div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        onClick={scrollToTop}
        className="group fixed bottom-6 right-6 w-11 h-11 rounded-xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] overflow-hidden z-50 shadow-lg shadow-black/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Voltar ao topo"
      >
        {/* Gradient background on hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        
        {/* Icon */}
        <motion.svg 
          className="w-4 h-4 relative z-10 group-hover:text-white transition-colors duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </motion.svg>
        
        {/* Subtle ring on hover */}
        <div className="absolute -inset-1 rounded-xl bg-[var(--color-primary)]/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
      </motion.button>
    </footer>
  );
};

export default Footer;