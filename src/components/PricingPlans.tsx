// src/pages/PricingPlans.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Lock, LogIn, Loader2, Crown, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { checkoutService } from '../services/checkoutService';
import type { PlanType } from '../types/checkout.type';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  apiPlanType?: PlanType; // Tipo do plano para a API
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  price: number;
  priceLabel: string;
  features: PricingFeature[];
  buttonText: string;
  isPopular?: boolean;
  isFree?: boolean;
}

// ═══════════════════════════════════════════════════════════
// DADOS DOS PLANOS (com mapeamento para API)
// ═══════════════════════════════════════════════════════════

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Grátis',
    tagline: 'Sem benefícios extras',
    description: 'Use recursos padrões da Vxo.',
    price: 0,
    priceLabel: '',
    features: [
      { text: 'Links ilimitados', included: true },
      { text: 'Temas básicos', included: true },
      { text: 'Estatísticas simples', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Moldura Premium no avatar', included: false },
      { text: 'Efeito Neon no perfil', included: false },
      { text: 'Badge Verificado ✓', included: false },
      { text: 'Badge Premium 👑', included: false },
      { text: 'Sem marca d\'água', included: false },
      { text: 'Favicon personalizado', included: false },
    ],
    buttonText: 'Começar Grátis',
    isFree: true,
  },
  {
    id: 'premium_monthly',
    apiPlanType: 'plan-monthly', // ✅ Mapeamento para API
    name: 'Premium Mensal',
    tagline: 'Mensal',
    description: 'Use recursos avançados e tenha uma melhor experiência.',
    price: 29.90, // Preço real da API
    priceLabel: '/mês',
    features: [
      { text: 'Tudo do plano Grátis', included: true },
      { text: 'Moldura Premium no avatar', included: true },
      { text: 'Efeito Neon no perfil', included: true },
      { text: 'Badge Verificado ✓', included: true },
      { text: 'Badge Premium 👑', included: true },
      { text: 'Sem marca d\'água', included: true },
      { text: 'Favicon personalizado', included: true },
      { text: 'Álbum de fotos exclusivo', included: true },
      { text: 'Maior limite de upload', included: true },
      { text: 'Suporte prioritário', included: false },
    ],
    buttonText: 'Assinar Mensal',
    isPopular: false,
  },
  {
    id: 'premium_yearly',
    apiPlanType: 'plan-annual', // ✅ Mapeamento para API
    name: 'Premium Anual',
    badge: 'Melhor oferta',
    tagline: 'Anual',
    description: 'Economize 33% com o plano anual.',
    price: 299.90, // Preço real da API
    priceLabel: '/ano',
    features: [
      { text: 'Tudo do plano Grátis', included: true },
      { text: 'Moldura Premium no avatar', included: true },
      { text: 'Efeito Neon no perfil', included: true },
      { text: 'Badge Verificado ✓', included: true },
      { text: 'Badge Premium 👑', included: true },
      { text: 'Sem marca d\'água', included: true },
      { text: 'Favicon personalizado', included: true },
      { text: 'Álbum de fotos exclusivo', included: true },
      { text: 'Maior limite de upload', included: true },
      { text: 'Suporte prioritário 24/7', included: true },
    ],
    buttonText: 'Assinar Anual',
    isPopular: true
  },
];

// ═══════════════════════════════════════════════════════════
// ÍCONES SVG
// ═══════════════════════════════════════════════════════════

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CrossIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// COMPONENTE DO CARD DE PRICING
// ═══════════════════════════════════════════════════════════

interface PricingCardProps {
  plan: PricingPlan;
  isAuthenticated: boolean;
  isLoading: boolean;
  processingPlanId: string | null;
  onSubscribe: (plan: PricingPlan) => void;
  onLoginRequired: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  isAuthenticated, 
  processingPlanId,
  onSubscribe,
  onLoginRequired 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Verifica se este card está processando
  const isProcessing = processingPlanId === plan.id;

  // Formata o preço corretamente
  const displayPrice = plan.price === 0 ? 'Grátis' : `R$${plan.price.toFixed(2).replace('.', ',')}`;

  // Verifica se o botão deve estar bloqueado (planos pagos sem login)
  const isLocked = !plan.isFree && !isAuthenticated;

  // Verifica se qualquer checkout está em andamento
  const isAnyProcessing = processingPlanId !== null;

  const handleButtonClick = async () => {
    // Se está processando, não faz nada
    if (isProcessing || isAnyProcessing) return;

    // Se é plano grátis, vai para registro
    if (plan.isFree) {
      if (!isAuthenticated) {
        onLoginRequired();
      }
      return;
    }

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    // Processa a assinatura
    onSubscribe(plan);
  };

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <Loader2 size={16} className="animate-spin" />
          Redirecionando...
        </>
      );
    }

    if (isAnyProcessing) {
      return (
        <>
          <Loader2 size={16} className="animate-spin opacity-50" />
          Aguarde...
        </>
      );
    }

    if (isLocked) {
      return (
        <>
          <Lock size={16} />
          Faça login para assinar
        </>
      );
    }

    if (plan.isFree && !isAuthenticated) {
      return (
        <>
          <LogIn size={16} />
          Criar conta grátis
        </>
      );
    }

    return plan.buttonText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative p-6 lg:p-8 transition-all duration-300
        ${plan.isPopular ? 'border-2' : 'border'}
      `}
      style={{
        borderRadius: 'var(--border-radius-lg)',
        backdropFilter: 'blur(var(--blur-amount))',
        backgroundColor: plan.isPopular 
          ? 'rgba(143, 124, 255, 0.08)' 
          : 'var(--card-background-glass)',
        borderColor: plan.isPopular 
          ? 'rgba(143, 124, 255, 0.4)' 
          : 'var(--color-border)',
        boxShadow: isHovered 
          ? plan.isPopular 
            ? '0 0 40px rgba(143, 124, 255, 0.25)' 
            : '0 20px 40px rgba(0, 0, 0, 0.2)'
          : plan.isPopular 
            ? '0 0 40px rgba(143, 124, 255, 0.15)' 
            : 'none',
      }}
    >
      {/* Popular Badge */}
      {plan.badge && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-3 right-4 px-3 py-1 text-xs font-medium text-white shadow-lg flex items-center gap-1"
          style={{
            borderRadius: 'var(--border-radius-sm)',
            background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
          }}
        >
          <Crown size={12} />
          {plan.badge}
        </motion.div>
      )}

      {/* Lock Overlay para planos não autenticados */}
      <AnimatePresence>
        {isLocked && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            style={{
              borderRadius: 'var(--border-radius-lg)',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="text-center p-4">
              <Lock size={32} className="mx-auto mb-2 text-[var(--color-primary)]" />
              <p className="text-white text-sm font-medium">
                Faça login para assinar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{
              borderRadius: 'var(--border-radius-lg)',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="text-center p-4">
              <Loader2 size={40} className="mx-auto mb-3 text-[var(--color-primary)] animate-spin" />
              <p className="text-white text-sm font-medium">
                Preparando checkout...
              </p>
              <p className="text-white/60 text-xs mt-1">
                Você será redirecionado
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text)' }}
        >
          {plan.name}
        </h3>
        <span 
          className="text-xs px-3 py-1.5 border"
          style={{
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          {plan.tagline}
        </span>
      </div>

      {/* Description */}
      <p 
        className="mt-2 text-sm leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {plan.description}
      </p>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-1">
        <span
          className="text-4xl font-bold"
          style={{
            color: plan.isPopular ? 'var(--color-primary)' : 'var(--color-text)',
          }}
        >
          {displayPrice}
        </span>
        {plan.priceLabel && (
          <span 
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {plan.priceLabel}
          </span>
        )}
      </div>

      {/* Savings Badge for Annual */}
      {plan.id === 'premium_yearly' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium"
          style={{
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: 'rgb(34, 197, 94)',
          }}
        >
          <Sparkles size={12} />
          Economize R$58,90 por ano
        </motion.div>
      )}

      {/* Divider */}
      <div 
        className="my-6 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, var(--color-border), transparent)',
        }}
      />

      {/* Features */}
      <ul className="space-y-3">
        {plan.features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 text-sm"
            style={{
              color: feature.included 
                ? 'var(--color-text)' 
                : 'var(--color-text-muted)',
              opacity: feature.included ? 0.9 : 0.4,
            }}
          >
            {feature.included ? (
              <CheckIcon 
                className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" 
              />
            ) : (
              <CrossIcon 
                className="w-4 h-4 flex-shrink-0 text-[var(--color-text)] opacity-70" 
              />
            )}
            <span className={!feature.included ? 'line-through' : ''}>
              {feature.text}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: (isLocked || isAnyProcessing) ? 1 : 1.02 }}
        whileTap={{ scale: (isLocked || isAnyProcessing) ? 1 : 0.98 }}
        onClick={handleButtonClick}
        disabled={isProcessing || isAnyProcessing}
        className={`
          mt-8 w-full py-3 px-6 text-sm font-medium 
          transition-all duration-300 
          flex items-center justify-center gap-2
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
        style={{
          borderRadius: 'var(--border-radius-xl)',
          backgroundColor: isLocked || isAnyProcessing
            ? 'var(--color-surface)' 
            : plan.isPopular 
              ? 'var(--color-primary)' 
              : 'var(--color-surface)',
          color: isLocked || isAnyProcessing
            ? 'var(--color-text-muted)' 
            : plan.isPopular 
              ? 'white' 
              : 'var(--color-text)',
          border: plan.isPopular && !isLocked && !isAnyProcessing
            ? 'none' 
            : '1px solid var(--color-border)',
        }}
      >
        {getButtonContent()}
      </motion.button>

      {/* Login hint para planos bloqueados */}
      {isLocked && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Você precisa estar logado para assinar este plano
        </motion.p>
      )}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DA PÁGINA
// ═══════════════════════════════════════════════════════════

const PricingPlans: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleLoginRequired = () => {
    navigate('/login', { 
      state: { 
        from: '/pricing', 
        message: 'Faça login para assinar um plano Premium' 
      } 
    });
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    // Verifica se tem o tipo de plano para API
    if (!plan.apiPlanType) {
      console.error('[PricingPage] Plano sem apiPlanType:', plan.id);
      showNotification('error', 'Este plano não está disponível para assinatura');
      return;
    }

    console.log('[PricingPage] Iniciando checkout do plano:', plan.id, plan.apiPlanType);
    
    setProcessingPlanId(plan.id);
    
    try {
      showNotification('info', 'Preparando checkout...');
      
      // Chama o serviço de checkout
      const response = await checkoutService.checkoutPlan(plan.apiPlanType);
      
      console.log('[PricingPage] Resposta do checkout:', response);
      
      if (response.success && response.checkoutUrl) {
        showNotification('success', 'Redirecionando para o pagamento...');
        
        // Pequeno delay para mostrar a notificação antes de redirecionar
        setTimeout(() => {
          checkoutService.redirectToCheckout(response.checkoutUrl!);
        }, 500);
      } else {
        throw new Error(response.error || 'Erro ao criar checkout');
      }
      
    } catch (error: any) {
      console.error('[PricingPage] Erro ao processar assinatura:', error);
      showNotification('error', error.message || 'Erro ao processar assinatura. Tente novamente.');
      setProcessingPlanId(null);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    
    // Auto-hide apenas para sucesso e info
    if (type !== 'error') {
      setTimeout(() => setNotification(null), 5000);
    } else {
      setTimeout(() => setNotification(null), 7000);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <section
      id="pricing"
      className="min-h-screen py-16 lg:py-24"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-50 w-full max-w-md px-4"
          >
            <div
              className={`p-4 rounded-lg shadow-lg backdrop-blur-md border flex items-center gap-3 ${
                notification.type === 'success'
                  ? 'bg-green-500/10 border-green-500/50 text-green-400'
                  : notification.type === 'error'
                  ? 'bg-red-500/10 border-red-500/50 text-red-400'
                  : 'bg-blue-500/10 border-blue-500/50 text-blue-400'
              }`}
            >
              {notification.type === 'success' && <CheckCircle size={20} />}
              {notification.type === 'error' && <AlertCircle size={20} />}
              {notification.type === 'info' && <Loader2 size={20} className="animate-spin" />}
              <p className="text-sm font-medium flex-1">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider border"
            style={{
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'rgba(143, 124, 255, 0.1)',
              color: 'var(--color-primary)',
              borderColor: 'rgba(143, 124, 255, 0.2)',
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Planos
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
            style={{ 
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              color: 'var(--color-text)',
            }}
          >
            Plano Premium
            <span 
              className="block mt-1"
              style={{
                background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary), var(--color-primary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              para mais benefícios
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg max-w-xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Escolhe a melhor opção para você e não deixe escapar essas vantagens exclusivas. 
            Com o plano Premium, você terá acesso a recursos únicos.
          </motion.p>

          {/* Auth Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            {isAuthenticated ? (
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm"
                style={{
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: 'rgb(34, 197, 94)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                <CheckIcon className="w-4 h-4" />
                Logado como <strong>{user?.name || user?.email}</strong>
              </div>
            ) : (
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'rgba(143, 124, 255, 0.1)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(143, 124, 255, 0.2)',
                }}
                onClick={handleLoginRequired}
              >
                <LogIn className="w-4 h-4" />
                Faça login para desbloquear planos Premium
              </div>
            )}
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <PricingCard 
                plan={plan} 
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                processingPlanId={processingPlanId}
                onSubscribe={handleSubscribe}
                onLoginRequired={handleLoginRequired}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div 
              className="inline-flex flex-col sm:flex-row items-center gap-4 p-6"
              style={{
                borderRadius: 'var(--border-radius-lg)',
                backgroundColor: 'var(--card-background-glass)',
                backdropFilter: 'blur(var(--blur-amount))',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' 
                  }}
                >
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    Não tem uma conta ainda?
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Crie uma conta gratuita e assine o Premium
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 text-sm font-medium transition-all"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Fazer Login
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 text-sm font-medium text-white transition-all"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  }}
                >
                  Criar Conta Grátis
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-xs flex items-center justify-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagamento seguro processado pelo Mercado Pago
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPlans;