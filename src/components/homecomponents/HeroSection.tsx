import React from 'react';
import {
  Link2,
  DollarSign,
  ArrowRight,
  Play,
  Zap,
  Heart,
  Music2
} from 'lucide-react';
import GridBackground from './GridBackground';
import NeonButton from '../homecomponents/NeoButton';

const HeroSection: React.FC = () => {
  // Avatares para Social Proof
  const avatars = [
    'https://i.pravatar.cc/100?img=1',
    'https://i.pravatar.cc/100?img=2',
    'https://i.pravatar.cc/100?img=3',
    'https://i.pravatar.cc/100?img=4',
    'https://i.pravatar.cc/100?img=5',
  ];

  // Cards de recursos
  const features = [
    {
      icon: Link2,
      title: 'Redes Sociais',
      description: 'Divulgue quantas redes sociais desejar no seu perfil divulgando tudo em um só link.',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      number: '01',
    },
    {
      icon: Music2,
      title: 'Músicas e Vídeos',
      description: 'Personalize com músicas, vídeos do YouTub e plano de fundo animados.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      number: '02',
    },
    {
      icon: DollarSign,
      title: 'Monetização',
      description: 'Venda produtos direto pelo seu link.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      number: '03',
    },
    {
      icon: DollarSign,
      title: 'Planos Premium',
      description: 'Recursos exclusivos como álbuns de fotos e insígnias especiais.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      number: '04',
    },
  ];

  return (
    <section className="relative min-h-screen bg-[var(--color-background)] overflow-hidden">
      <GridBackground />
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Glow Principal - Topo */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, var(--color-secondary)/30 0%, var(--color-primary)/10 40%, transparent 70%)',
          }}
        />

        {/* Glow Secundário - Esquerda */}
        <div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--color-primary)/40 0%, transparent 60%)',
          }}
        />

        {/* Glow Terciário - Direita */}
        <div
          className="absolute top-1/3 -right-32 w-[400px] h-[400px] opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--color-accent)/30 0%, transparent 60%)',
          }}
        />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

        {/* Badge Superior */}
        <div className="flex justify-center mb-8">
          <div className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-secondary)/10] to-[var(--color-primary)/10] border border-[var(--color-secondary)] backdrop-blur-sm cursor-pointer hover:border-[var(--color-secondary)]/40 transition-all duration-300">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-secondary)/5] to-[var(--color-primary)/5] blur-xl group-hover:blur-2xl transition-all" />
            <Heart className="w-4 h-4 text-[var(--color-secondary)] animate-pulse" />
            <span className="relative text-sm font-medium bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] bg-clip-text text-transparent">
              Compartilhe-se para o mundo!
            </span>
            <ArrowRight className="w-4 h-4 text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Título Principal */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--color-text)] leading-[1.1]">
            <span className="block">Mostre para o mundo</span>
            <span className="block mt-2">Seus links.</span>
            <span className="block mt-2 bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Um só lugar.
            </span>
          </h1>
        </div>

        {/* Subtítulo */}
        <p className="text-center text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Conecte sua audiência a todo o seu conteúdo com uma interface de
          <span className="text-[var(--color-text)] font-medium"> alto padrão </span>
          e análises em
          <span className="text-[var(--color-text)] font-medium"> tempo real</span>.
        </p>

        {/* Botões CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* Botão Principal */}
          <button className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[var(--color-secondary)]/25">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-primary)] to-[var(--color-accent)]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
            <Zap className="relative w-5 h-5 fill-current" />
            <span className="relative">Criar meu Link Grátis</span>
          </button>

          {/* Botão Secundário */}
          <NeonButton />
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          {/* Avatares Sobrepostos */}
          <div className="flex -space-x-3">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className="relative w-10 h-10 rounded-full ring-2 ring-[var(--color-border)] overflow-hidden transition-transform hover:scale-110 hover:z-10"
                style={{ zIndex: avatars.length - index }}
              >
                <img
                  src={avatar}
                  alt={`User ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Online Indicator para o último */}
                {index === avatars.length - 1 && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[var(--color-border)]" />
                )}
              </div>
            ))}

            {/* More Users Indicator */}
            <div className="relative w-10 h-10 rounded-full ring-2 ring-[var(--color-border)] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">+5K</span>
            </div>
          </div>

          {/* Texto */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-400 text-sm">
              Junte-se a <span className="text-[var(--color-primary)] font-semibold">+5.000</span> usuários
            </span>
          </div>
        </div>

        {/* Cards de Recursos */}
        <div className="max-w-5xl mx-auto">
          {/* Header da seção (opcional) */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              Recursos Incríveis
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tudo o que você precisa para criar o perfil perfeito
            </p>
          </div>

          {/* Grid de Cards 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 cursor-pointer nh">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Badge Numérica */}
                <div
                  className="absolute -top-3 -left-3 z-20 w-11 h-11 rounded-full flex items-center justify-center
                 font-bold text-lg text-white shadow-lg transition-transform duration-300 group-hover:scale-110 "
                  style={{
                    backgroundColor: '#2563eb',
                    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  {feature.number}
                </div>

                {/* Card Container */}
                <div
                  className="relative overflow-hidden rounded-2xl p-6 pt-7 h-full transition-all duration-300 ease-out group-hover:translate-y-[-2px]"
                  style={{
                    backgroundColor: 'var(--card-background-glass)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {/* Hover Border Glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      border: '1px solid rgba(37, 99, 235, 0.3)',
                      boxShadow: '0 0 30px rgba(37, 99, 235, 0.1)'
                    }}
                  />

                  {/* Subtle Gradient Overlay on Hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at top left, rgba(37, 99, 235, 0.05) 0%, transparent 50%)'
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Ícone + Título */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105"
                        style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)' }}
                      >
                        <feature.icon
                          className="w-5 h-5 transition-colors duration-300"
                          style={{ color: '#3b82f6' }}
                        />
                      </div>
                      <h3 className="text-[var(--color-text)] font-bold text-lg tracking-tight">
                        {feature.title}
                      </h3>
                    </div>

                    {/* Descrição */}
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#71717a' }}
                    >
                      {feature.description}
                    </p>
                  </div>

                  {/* Corner Decoration */}
                  <div
                    className="absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.08) 0%, transparent 70%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="mt-16 flex justify-center">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[var(--color-background)] to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;