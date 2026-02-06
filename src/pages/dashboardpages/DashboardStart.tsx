import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  LayoutDashboard,
  Eye,
  Zap,
  Award,
  CreditCard,
  User,
  Settings,
  Image,
  Link,
  LogOut,
  Users,
  Lock,
  Unlock,
  Send,
  Bell,
  Sparkles,
  Crown,
  CheckCircle,
  Palette,
  BookImage,
  EyeOff,
  Globe,
  Star,
  ExternalLink,
  Construction,
  ChevronDown,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface Group {
  id: string;
  name: string;
  status: "open" | "closed" | "request";
  members: number;
  description: string;
  image?: string;
}

interface PremiumFeature {
  id: string;
  name: string;
  icon: React.ElementType;
  available: boolean;
}

interface Update {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "feature" | "fix" | "improvement";
}

// ═══════════════════════════════════════════════════════════
// DADOS DE EXEMPLO
// ═══════════════════════════════════════════════════════════

const STATS: StatCard[] = [
  {
    id: "views",
    label: "Visualizações",
    value: 204,
    icon: Eye,
    color: "#8B5CF6",
    trend: { value: 12, isPositive: true },
  },
  {
    id: "vcoins",
    label: "Zyons",
    value: 0,
    icon: Zap,
    color: "#F59E0B",
  },
  {
    id: "badges",
    label: "Insígnias",
    value: 0,
    icon: Award,
    color: "#10B981",
  },
  {
    id: "account",
    label: "Conta",
    value: "Grátis",
    icon: CreditCard,
    color: "#3B82F6",
  },
];

const GROUPS: Group[] = [
  {
    id: "1",
    name: "Grupo Aberto",
    status: "open",
    members: 24,
    description: "Grupo aberto, participe agora e faça parte da nossa pequena comunidade.",
  },
  {
    id: "2",
    name: "Grupo Fechado",
    status: "closed",
    members: 8,
    description: "Grupo fechado para todas as entradas, aguarde o status ser alterado.",
  },
  {
    id: "3",
    name: "Grupo Trancado",
    status: "request",
    members: 15,
    description: "Grupo trancado atualmente, você pode enviar uma solicitação de entrada.",
  },
];

const PREMIUM_FEATURES: PremiumFeature[] = [
  { id: "frame", name: "Moldura", icon: Image, available: false },
  { id: "premium-tag", name: "Tag premium", icon: Crown, available: false },
  { id: "verified-tag", name: "Tag verificado", icon: CheckCircle, available: false },
  { id: "neon-card", name: "Neon no card", icon: Sparkles, available: false },
  { id: "neon-color", name: "Cor do Neon", icon: Palette, available: false },
  { id: "favicon", name: "Favicon", icon: Globe, available: false },
  { id: "album", name: "Album de fotos", icon: BookImage, available: false },
  { id: "hide-views", name: "Ocultar Views", icon: EyeOff, available: false },
  { id: "hide-brand", name: "Ocultar Marca", icon: EyeOff, available: false },
];

const UPDATES: Update[] = [];

// ═══════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════

// Card Component
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

// Section Header
const SectionHeader = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="p-2 sm:p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10 flex-shrink-0">
        <Icon size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)]" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">{title}</h2>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 sm:mt-1">{description}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

// Stat Card Component
const StatCardComponent = ({ stat, index }: { stat: StatCard; index: number }) => {
  const Icon = stat.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)] rounded-[var(--border-radius-lg)] p-4 sm:p-5 group cursor-pointer"
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${stat.color} 0%, transparent 100%)` }}
      />
      
      {/* Icon */}
      <div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--border-radius-md)] flex items-center justify-center mb-3"
        style={{ backgroundColor: `${stat.color}20` }}
      >
        <Icon size={20} className="sm:w-6 sm:h-6" style={{ color: stat.color }} />
      </div>
      
      {/* Content */}
      <div>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mb-1">{stat.label}</p>
        <div className="flex items-end gap-2">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
            {stat.value}
          </p>
          {stat.trend && (
            <div className={`flex items-center gap-0.5 text-xs ${stat.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <TrendingUp size={12} className={stat.trend.isPositive ? '' : 'rotate-180'} />
              <span>{stat.trend.value}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Profile Card Component
const ProfileCard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { icon: User, label: "Ver Perfil", href: "/profile" },
    { icon: Image, label: "Editar Imagens", href: "/dashboard/images" },
    { icon: Link, label: "Editar Links", href: "/dashboard/links" },
  ];

  return (
    <DashboardCard className="relative overflow-hidden" delay={0.2}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-transparent" />
      </div>
      
      <div className="relative">
        {/* Avatar Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative mb-4"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg shadow-[var(--color-primary)]/20">
              H
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[var(--color-background)]" />
          </motion.div>
          
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">hpf</h3>
          <p className="text-sm text-[var(--color-text-muted)]">@hpf</p>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-all group"
            >
              <item.icon size={18} className="text-[var(--color-primary)]" />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            </motion.a>
          ))}
          
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-red-500/10 text-[var(--color-text)] hover:text-red-400 transition-all w-full group"
          >
            <LogOut size={18} className="text-[var(--color-text-muted)] group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-medium flex-1 text-left">Sair</span>
          </motion.button>
        </div>
      </div>
    </DashboardCard>
  );
};

// Group Card Component
const GroupCard = ({ group, index }: { group: Group; index: number }) => {
  const getStatusConfig = (status: Group["status"]) => {
    switch (status) {
      case "open":
        return { icon: Unlock, label: "Open", color: "text-green-400", bg: "bg-green-400/10" };
      case "closed":
        return { icon: Lock, label: "Closed", color: "text-red-400", bg: "bg-red-400/10" };
      case "request":
        return { icon: Send, label: "Request", color: "text-yellow-400", bg: "bg-yellow-400/10" };
    }
  };

  const statusConfig = getStatusConfig(group.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="p-4 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Group Avatar */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--border-radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {group.name.charAt(0)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">{group.name}</h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon size={10} />
              {statusConfig.label}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-text-muted)] mb-2">
            <Users size={14} />
            <span>{group.members} membros</span>
          </div>
          
          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
            — {group.description}
          </p>
        </div>
        
        {/* Action */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-[var(--color-background)] hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all opacity-0 group-hover:opacity-100"
        >
          <ExternalLink size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Premium Feature Badge
const PremiumFeatureBadge = ({ feature, index }: { feature: PremiumFeature; index: number }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-[var(--border-radius-md)]
        border transition-all cursor-pointer
        ${feature.available 
          ? "border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
        }
      `}
    >
      <Icon size={14} />
      <span className="text-xs font-medium">{feature.name}</span>
      {feature.available && <CheckCircle size={12} className="text-green-400" />}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardStart = () => {
  // Animação de entrada escalonada
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
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
          <span className="text-[var(--color-text)]">Visão Geral</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
              <LayoutDashboard className="text-[var(--color-primary)] w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              Visão Geral
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-[var(--color-text-muted)] mt-1 sm:mt-2">
              Bem-vindo ao seu painel zyo.se. Aqui você tem uma visão rápida do seu perfil, análises e configurações.
            </p>
          </div>
          
    
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {STATS.map((stat, index) => (
          <StatCardComponent key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6"
      >
        {/* Profile Card */}
        <div className="xl:col-span-1">
          <ProfileCard />
        </div>

        {/* Groups Section */}
        <div className="xl:col-span-2">
          <DashboardCard delay={0.3}>
            <SectionHeader
              icon={Users}
              title="Gerenciamento de Grupos"
              description="Em breve você poderá criar seus próprios grupos, convidar amigos entre outros."
            />

            {/* Construction Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 p-4 rounded-[var(--border-radius-md)] bg-amber-500/10 border border-amber-500/20 mb-6"
            >
              <div className="p-2 rounded-full bg-amber-500/20">
                <Construction size={18} className="text-amber-400" />
              </div>
              <p className="text-sm text-amber-200">
                Este recurso ainda se encontra em construção, e em breve estará disponível para o uso de todos.
              </p>
            </motion.div>

            {/* Groups Subtitle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Seus Grupos</h3>
              <span className="text-xs text-[var(--color-text-muted)]">{GROUPS.length} grupos</span>
            </div>

            {/* Groups List */}
            <div className="space-y-3">
              {GROUPS.map((group, index) => (
                <GroupCard key={group.id} group={group} index={index} />
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* Updates Section */}
        <div className="xl:col-span-1">
          <DashboardCard delay={0.4}>
            <SectionHeader
              icon={Bell}
              title="Atualizações do Painel"
              description="Fique por dentro das atualizações."
            />

            {UPDATES.length > 0 ? (
              <div className="space-y-3">
                {UPDATES.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-3 rounded-[var(--border-radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-[var(--color-text)]">{update.title}</h4>
                      <span className="text-xs text-[var(--color-text-muted)]">{update.date}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">{update.description}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
                  <Bell size={24} className="text-[var(--color-text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--color-text)]">Nenhuma atualização disponível</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  No momento não encontramos atualizações. Volte mais tarde.
                </p>
              </motion.div>
            )}
          </DashboardCard>
        </div>

        {/* Premium Section */}
        <div className="xl:col-span-2">
          <DashboardCard delay={0.5}>
            <SectionHeader
              icon={Crown}
              title="Melhore sua experiência"
              description="Desbloqueie recursos premium e destaque seu perfil."
              action={
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium transition-all shadow-lg shadow-amber-500/20"
                >
                  <Star size={16} />
                  Ver planos premium
                </motion.button>
              }
            />

            {/* Premium Features Grid */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {PREMIUM_FEATURES.map((feature, index) => (
                <PremiumFeatureBadge key={feature.id} feature={feature} index={index} />
              ))}
            </div>

            {/* Premium CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6 p-4 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">Destaque-se com o Premium</h4>
                    <p className="text-xs text-[var(--color-text-muted)]">Acesse todos os recursos exclusivos</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[var(--border-radius-md)] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium transition-all"
                >
                  Assinar agora
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          </DashboardCard>
        </div>
      </motion.div>

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-[var(--border-radius-lg)] bg-[var(--card-background-glass)] backdrop-blur-[var(--blur-amount)] border border-[var(--color-border)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-[var(--border-radius-md)] bg-[var(--color-primary)]/10">
              <Activity size={24} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">Resumo de Atividade</h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">Última atualização: agora</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[var(--color-text-muted)]" />
              <span className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                Membro desde Jan 2024
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[var(--color-text-muted)]" />
              <span className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                204 visualizações totais
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardStart;