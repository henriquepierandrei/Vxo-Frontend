// TermsOfService.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// DADOS DOS TERMOS
// ============================================================================
const LAST_UPDATED = '15 de Janeiro de 2025';
const COMPANY_NAME = 'Vxo';
const COMPANY_EMAIL = 'suporte@vxo.com.br';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'aceitacao',
    title: '1. Aceitação dos Termos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <>
        <p>
          Ao acessar, criar uma conta ou utilizar qualquer funcionalidade da plataforma <strong>Vxo</strong>, 
          você declara que leu, compreendeu e concorda integralmente com estes Termos de Uso. 
          Caso não concorde com qualquer disposição, interrompa imediatamente o uso da plataforma.
        </p>
        <p>
          Estes termos constituem um contrato vinculante entre você ("Usuário") e a Vxo ("Plataforma", "nós"). 
          A utilização continuada após qualquer alteração implica aceitação tácita dos novos termos.
        </p>
      </>
    ),
  },
  {
    id: 'descricao',
    title: '2. Descrição do Serviço',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    content: (
      <>
        <p>
          A Vxo é uma plataforma de agregação e personalização de links (modelo "link-in-bio") que permite aos 
          usuários:
        </p>
        <ul>
          <li>Criar e gerenciar páginas personalizadas com múltiplos links;</li>
          <li>Personalizar a aparência dos cards (cores, fontes, imagens, layouts e temas);</li>
          <li>Acessar análises e métricas de cliques e visualizações;</li>
          <li>Integrar links de redes sociais, portfólios, lojas e outros destinos;</li>
          <li>Adquirir planos pagos com recursos premium, incluindo domínios personalizados, 
            remoção de marca d'água e funcionalidades avançadas de analytics;</li>
          <li>Utilizar recursos de monetização, como links de pagamento e integrações com e-commerce.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'conta',
    title: '3. Conta do Usuário',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    content: (
      <>
        <p><strong>3.1 Cadastro:</strong> Para utilizar a plataforma, você deve criar uma conta fornecendo 
          informações verdadeiras, completas e atualizadas. Você é responsável por manter a confidencialidade 
          de suas credenciais de acesso.</p>
        <p><strong>3.2 Idade Mínima:</strong> Você declara ter pelo menos 16 (dezesseis) anos de idade ou possuir 
          consentimento de responsável legal para utilizar a plataforma.</p>
        <p><strong>3.3 Segurança:</strong> Você é integralmente responsável por todas as atividades realizadas 
          em sua conta. Notifique-nos imediatamente em caso de uso não autorizado ou suspeita de violação 
          de segurança.</p>
        <p><strong>3.4 Uma Conta por Pessoa:</strong> Cada pessoa física ou jurídica pode manter apenas uma 
          conta ativa. Contas duplicadas poderão ser suspensas ou encerradas.</p>
      </>
    ),
  },
  {
    id: 'uso-aceitavel',
    title: '4. Uso Aceitável',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    content: (
      <>
        <p>Ao utilizar a Vxo, você concorda em <strong>NÃO</strong>:</p>
        <ul>
          <li>Publicar conteúdo ilegal, difamatório, discriminatório, obsceno ou que viole direitos de terceiros;</li>
          <li>Utilizar a plataforma para distribuir malware, phishing, spam ou qualquer forma de fraude;</li>
          <li>Inserir links para conteúdo que infrinja direitos autorais ou propriedade intelectual;</li>
          <li>Realizar engenharia reversa, scraping ou qualquer forma de extração automatizada de dados;</li>
          <li>Tentar acessar contas de outros usuários ou sistemas internos da plataforma;</li>
          <li>Utilizar bots, scripts ou ferramentas automatizadas para manipular métricas ou criar contas em massa;</li>
          <li>Revender, sublicenciar ou redistribuir o serviço sem autorização expressa;</li>
          <li>Violar qualquer lei ou regulamento aplicável, incluindo normas de proteção ao consumidor.</li>
        </ul>
        <div className="mt-4 p-4 rounded-lg" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <p className="text-sm flex items-start gap-2" style={{ color: 'var(--color-text)' }}>
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            A violação destas regras pode resultar em suspensão imediata da conta, remoção de conteúdo 
            e, quando aplicável, notificação às autoridades competentes.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'planos',
    title: '5. Planos, Pagamentos e Assinaturas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    content: (
      <>
        <p><strong>5.1 Plano Gratuito:</strong> A Vxo oferece um plano gratuito com funcionalidades básicas. 
          Este plano pode incluir marca d'água da plataforma e limitações de recursos.</p>
        <p><strong>5.2 Planos Pagos:</strong> Planos premium estão disponíveis mediante pagamento recorrente 
          (mensal ou anual). Os preços, funcionalidades e condições de cada plano estão descritos na 
          página de preços da plataforma.</p>
        <p><strong>5.3 Cobrança:</strong> Os pagamentos são processados por meio de provedores terceirizados 
          de pagamento. A cobrança é realizada automaticamente na data de renovação da assinatura.</p>
        <p><strong>5.4 Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento. O cancelamento 
          será efetivo ao final do período já pago, sem reembolso proporcional, salvo disposição legal em contrário.</p>
        <p><strong>5.5 Reembolso:</strong> Solicitações de reembolso serão analisadas individualmente conforme 
          o Código de Defesa do Consumidor. Para compras digitais, o prazo de arrependimento é de 7 (sete) dias 
          corridos a partir da data da contratação.</p>
        <p><strong>5.6 Alteração de Preços:</strong> Reservamo-nos o direito de alterar os preços dos planos, 
          mediante comunicação prévia de 30 (trinta) dias. A alteração não afetará períodos já contratados.</p>
      </>
    ),
  },
  {
    id: 'propriedade',
    title: '6. Propriedade Intelectual',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    content: (
      <>
        <p><strong>6.1 Nossa Propriedade:</strong> A plataforma Vxo, incluindo seu código-fonte, design, 
          marca, logotipos, textos e demais elementos, é de propriedade exclusiva da Vxo ou de seus licenciadores, 
          protegida pela legislação brasileira e tratados internacionais de propriedade intelectual.</p>
        <p><strong>6.2 Seu Conteúdo:</strong> Você mantém todos os direitos sobre o conteúdo que publica na 
          plataforma. Ao publicar, você nos concede uma licença mundial, não exclusiva, gratuita e sublicenciável 
          para hospedar, exibir e distribuir seu conteúdo exclusivamente no âmbito do funcionamento da plataforma.</p>
        <p><strong>6.3 Feedback:</strong> Sugestões, ideias ou feedbacks enviados por você poderão ser utilizados 
          por nós sem qualquer obrigação de compensação.</p>
      </>
    ),
  },
  {
    id: 'disponibilidade',
    title: '7. Disponibilidade e Suporte',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    content: (
      <>
        <p><strong>7.1</strong> A Vxo emprega esforços razoáveis para manter a plataforma disponível 24/7, 
          mas não garante disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência.</p>
        <p><strong>7.2</strong> Não nos responsabilizamos por indisponibilidades causadas por fatores externos, 
          incluindo falhas de provedores de infraestrutura, ataques cibernéticos ou casos de força maior.</p>
        <p><strong>7.3</strong> O suporte técnico está disponível conforme o plano contratado. Planos gratuitos 
          têm acesso a suporte via central de ajuda; planos pagos incluem suporte prioritário.</p>
      </>
    ),
  },
  {
    id: 'limitacao',
    title: '8. Limitação de Responsabilidade',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    content: (
      <>
        <p><strong>8.1</strong> A plataforma é fornecida "no estado em que se encontra" (<em>as is</em>). 
          Não garantimos que o serviço atenderá todas as suas necessidades específicas ou que será livre de erros.</p>
        <p><strong>8.2</strong> Não nos responsabilizamos por conteúdo publicado pelos usuários, links externos 
          ou transações realizadas através de links inseridos na plataforma.</p>
        <p><strong>8.3</strong> Em nenhuma hipótese nossa responsabilidade total excederá o valor pago por você 
          nos últimos 12 (doze) meses anteriores ao evento que originou a reclamação.</p>
        <p><strong>8.4</strong> Não nos responsabilizamos por perdas indiretas, incidentais, especiais ou 
          consequentes, incluindo perda de lucros, dados ou oportunidades de negócio.</p>
      </>
    ),
  },
  {
    id: 'encerramento',
    title: '9. Encerramento de Conta',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    content: (
      <>
        <p><strong>9.1 Por Você:</strong> Você pode encerrar sua conta a qualquer momento através das 
          configurações da plataforma. Após o encerramento, seus dados e links serão desativados e, 
          após 30 (trinta) dias, permanentemente excluídos.</p>
        <p><strong>9.2 Por Nós:</strong> Podemos suspender ou encerrar sua conta, com ou sem aviso prévio, 
          em caso de violação destes Termos, atividade fraudulenta ou por determinação legal.</p>
        <p><strong>9.3 Efeitos:</strong> Após o encerramento, você perde acesso a todos os recursos, dados e 
          personalizações. Links públicos serão desativados imediatamente.</p>
      </>
    ),
  },
  {
    id: 'alteracoes',
    title: '10. Alterações nos Termos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    content: (
      <>
        <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas 
          serão comunicadas por email ou notificação na plataforma com antecedência mínima de 15 (quinze) dias.</p>
        <p>O uso continuado da plataforma após as alterações constitui aceitação dos novos termos. 
          Caso discorde, você deve encerrar sua conta antes da data de vigência dos novos termos.</p>
      </>
    ),
  },
  {
    id: 'legislacao',
    title: '11. Legislação Aplicável e Foro',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    content: (
      <>
        <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Eventuais disputas serão 
          submetidas ao foro da comarca de São Paulo/SP, com exclusão de qualquer outro, por mais privilegiado 
          que seja.</p>
        <p>Antes de recorrer ao Judiciário, as partes se comprometem a buscar a resolução amigável do conflito 
          pelo prazo mínimo de 30 (trinta) dias.</p>
      </>
    ),
  },
  {
    id: 'contato',
    title: '12. Contato',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <>
        <p>Para dúvidas, reclamações ou solicitações relacionadas a estes Termos, entre em contato:</p>
        <div className="mt-3 p-4 rounded-lg" style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {COMPANY_EMAIL}</p>
            <p><strong>Plataforma:</strong> Central de Ajuda disponível no painel do usuário</p>
            <p><strong>Prazo de Resposta:</strong> Até 5 (cinco) dias úteis</p>
          </div>
        </div>
      </>
    ),
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const TermsOfService: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Detecta seção ativa
      const sectionElements = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i].el;
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sectionElements[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Background Sutil */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)`,
            transform: 'translate(-30%, 30%)',
          }}
        />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: 'var(--card-background-glass)',
          backdropFilter: 'blur(var(--blur-amount))',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>

          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              borderRadius: 'var(--border-radius-lg)',
            }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: 'var(--color-accent)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <a
            href="/privacy"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
          >
            Privacidade
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex gap-8">
        {/* Sidebar - Navegação (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav
            className="sticky top-24 p-4 space-y-1"
            style={{
              backgroundColor: 'var(--card-background-glass)',
              backdropFilter: 'blur(var(--blur-amount))',
              borderRadius: 'var(--border-radius-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3 px-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Navegação
            </p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: activeSection === section.id ? 'rgba(143, 124, 255, 0.1)' : 'transparent',
                  color: activeSection === section.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: activeSection === section.id ? 600 : 400,
                }}
              >
                {section.icon}
                <span className="truncate">{section.title.replace(/^\d+\.\s/, '')}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 min-w-0">
          {/* Título */}
          <div
            className="p-8 md:p-10 mb-8"
            style={{
              backgroundColor: 'var(--card-background-glass)',
              backdropFilter: 'blur(var(--blur-amount))',
              borderRadius: 'var(--border-radius-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  borderRadius: 'var(--border-radius-lg)',
                  boxShadow: '0 4px 20px rgba(143, 124, 255, 0.25)',
                }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: 'var(--color-accent)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Termos de Uso
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Plataforma {COMPANY_NAME}
                </p>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Atualizado em {LAST_UPDATED}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~8 min de leitura
              </span>
            </div>
          </div>

          {/* Introdução */}
          <div
            className="p-6 mb-6 flex items-start gap-3"
            style={{
              backgroundColor: 'rgba(143, 124, 255, 0.06)',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid rgba(143, 124, 255, 0.15)',
            }}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--color-primary)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              Leia atentamente estes Termos de Uso antes de utilizar a plataforma Vxo. 
              Este documento estabelece as regras, direitos e obrigações aplicáveis a todos os usuários, 
              incluindo funcionalidades gratuitas e pagas, personalização de cards e links.
            </p>
          </div>

          {/* Seções */}
          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 p-6 md:p-8 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--card-background-glass)',
                  backdropFilter: 'blur(var(--blur-amount))',
                  borderRadius: 'var(--border-radius-xl)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <h2
                  className="text-lg md:text-xl font-bold mb-4 flex items-center gap-3"
                  style={{ color: 'var(--color-text)' }}
                >
                  <span
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                      borderRadius: 'var(--border-radius-md)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {section.icon}
                  </span>
                  {section.title}
                </h2>
                <div
                  className="prose-custom space-y-3 text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer do conteúdo */}
          <div
            className="mt-8 p-6 md:p-8 text-center"
            style={{
              backgroundColor: 'var(--card-background-glass)',
              backdropFilter: 'blur(var(--blur-amount))',
              borderRadius: 'var(--border-radius-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Ao utilizar a plataforma Vxo, você confirma que leu e concorda com estes Termos de Uso.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 font-semibold text-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  color: 'var(--color-accent)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: '0 4px 15px rgba(143, 124, 255, 0.3)',
                }}
              >
                Criar conta grátis
              </button>
              <a
                href="/privacy"
                className="px-6 py-3 font-semibold text-sm transition-all duration-200 hover:opacity-80"
                style={{
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Ver Política de Privacidade
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Botão Voltar ao Topo */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 animate-slide-up"
          style={{
            background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
            color: 'var(--color-accent)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: '0 4px 20px rgba(143, 124, 255, 0.4)',
          }}
          aria-label="Voltar ao topo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Estilos */}
      <style>{`
        .prose-custom p {
          margin-bottom: 0.75rem;
        }
        .prose-custom p:last-child {
          margin-bottom: 0;
        }
        .prose-custom strong {
          color: var(--color-text);
          font-weight: 600;
        }
        .prose-custom ul {
          list-style: none;
          padding-left: 0;
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
          space-y: 0.5rem;
        }
        .prose-custom ul li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .prose-custom ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.5rem;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
        }
        .prose-custom em {
          font-style: italic;
          opacity: 0.85;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TermsOfService;