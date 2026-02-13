import React from 'react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  price: number;
  priceLabel: string;
  features: PricingFeature[];
  buttonText: string;
  isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
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
  },
  {
    name: 'Premium Mensal',
    tagline: 'Mensal',
    description: 'Use recursos avançados e tenha uma melhor experiência.',
    price: 9.99,
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
    name: 'Premium Anual',
    badge: 'Melhor oferta',
    tagline: 'Anual',
    description: 'Economize 33% com o plano anual.',
    price: 79.99,
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

const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
  // Formata o preço corretamente
  const displayPrice = plan.price === 0 ? 'Grátis' : `R$${plan.price.toFixed(2)}`;

  return (
    <div
      className={`
        relative p-6 lg:p-8 transition-all duration-300
        hover:translate-y-[-4px] hover:shadow-2xl
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
        boxShadow: plan.isPopular 
          ? '0 0 40px rgba(143, 124, 255, 0.15)' 
          : 'none',
      }}
    >
      {/* Popular Badge */}
      {plan.badge && (
        <div 
          className="absolute -top-3 right-4 px-3 py-1 text-xs font-medium text-white shadow-lg"
          style={{
            borderRadius: 'var(--border-radius-sm)',
            background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
          }}
        >
          {plan.badge}
        </div>
      )}

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
          <li
            key={index}
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
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        className="mt-8 w-full py-3 px-6 text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          borderRadius: 'var(--border-radius-xl)',
          backgroundColor: plan.isPopular 
            ? 'var(--color-primary)' 
            : 'var(--color-surface)',
          color: plan.isPopular 
            ? 'white' 
            : 'var(--color-text)',
          border: plan.isPopular 
            ? 'none' 
            : '1px solid var(--color-border)',
        }}
        onMouseEnter={(e) => {
          if (plan.isPopular) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(143, 124, 255, 0.4)';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (plan.isPopular) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = 'none';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }
        }}
      >
        {plan.buttonText}
      </button>
    </div>
  );
};

const PricingPage: React.FC = () => {
  return (
    <section
      id="pricing"
      className="min-h-screen py-16 lg:py-24"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span 
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
          </span>

          <h2
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
          </h2>

          <p 
            className="mt-4 text-lg max-w-xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Escolhe a melhor opção para você e não deixe escapar essas vantagens exclusivas. Com o plano Premium, você terá acesso a recursos únicos.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPage;