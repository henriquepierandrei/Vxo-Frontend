// src/pages/Unauthorized.tsx

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Lock,
  Crown,
  ArrowLeft,
  Home,
  Sparkles,
} from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Main Card */}
        <div className="bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-8 sm:p-12">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <ShieldAlert size={48} className="text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center border-4 border-[var(--color-background)]"
              >
                <Lock size={20} className="text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
              Acesso Não Autorizado
            </h1>
            <p className="text-[var(--color-text-muted)] text-lg mb-2">
              Este recurso é exclusivo para usuários <span className="text-amber-400 font-semibold">Premium</span>
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Você tentou acessar uma área restrita. Para desbloquear este e outros recursos incríveis, assine nosso plano premium.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {[
              { icon: Sparkles, label: "Embeds personalizados" },
              { icon: Crown, label: "Badge premium" },
              { icon: Lock, label: "Recursos exclusivos" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center"
              >
                <feature.icon size={24} className="mx-auto mb-2 text-amber-400" />
                <p className="text-xs text-[var(--color-text-muted)]">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/pricing")} // Ajuste para sua rota de preços
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all shadow-lg shadow-amber-500/20"
            >
              <Crown size={20} />
              Assinar Premium
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all"
            >
              <ArrowLeft size={20} />
              Voltar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium transition-all"
            >
              <Home size={20} />
              Dashboard
            </motion.button>
          </motion.div>

          {/* Info Alert */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-start gap-3 p-4 rounded-[var(--border-radius-md)] bg-blue-500/10 border border-blue-500/20"
          >
            <ShieldAlert size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Dica de Segurança</p>
              <p className="text-blue-300/80">
                Não tente burlar o sistema. Todas as ações são monitoradas e registradas.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-[var(--color-text-muted)] mt-6"
        >
          Código de erro: <span className="font-mono text-red-400">403_PREMIUM_REQUIRED</span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Unauthorized;