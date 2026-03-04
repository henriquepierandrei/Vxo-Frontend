// PrivacyPolicy.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// DADOS DA POLÍTICA
// ============================================================================
const LAST_UPDATED = '15 de Janeiro de 2025';
const COMPANY_NAME = 'Vxo';
const COMPANY_EMAIL = 'privacidade@vxo.com.br';
const DPO_EMAIL = 'dpo@vxo.com.br';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'introducao',
    title: '1. Introdução',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <>
        <p>
          A <strong>Vxo</strong> valoriza e respeita a sua privacidade. Esta Política de Privacidade descreve 
          como coletamos, utilizamos, armazenamos, compartilhamos e protegemos suas informações pessoais quando 
          você utiliza nossa plataforma de personalização de links.
        </p>
        <p>
          Esta política foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei 
          nº 13.709/2018)</strong> e demais normas aplicáveis de proteção de dados.
        </p>
        <p>
          Ao utilizar a Vxo, você consente com as práticas descritas nesta política. Recomendamos a leitura 
          integral deste documento.
        </p>
      </>
    ),
  },
  {
    id: 'dados-coletados',
    title: '2. Dados que Coletamos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    content: (
      <>
        <p><strong>2.1 Dados Fornecidos por Você:</strong></p>
        <ul>
          <li><strong>Dados de cadastro:</strong> nome, email, senha (criptografada), foto de perfil (opcional);</li>
          <li><strong>Dados de perfil:</strong> nome de usuário, biografia, links adicionados, configurações 
            de personalização de cards (cores, fontes, imagens, temas);</li>
        </ul>

        <p><strong>2.2 Dados Coletados Automaticamente:</strong></p>
        <ul>
          <li><strong>Dados de uso:</strong> páginas visitadas, cliques em links, horários de acesso, 
            funcionalidades utilizadas;</li>
          <li><strong>Dados do dispositivo:</strong> endereço IP, tipo de navegador, sistema operacional, 
            resolução de tela, idioma;</li>
          <li><strong>Cookies e tecnologias similares:</strong> utilizamos cookies essenciais, de performance 
            e de funcionalidade (veja seção 8);</li>
          <li><strong>Dados de analytics:</strong> métricas de visualização e cliques nas páginas de links 
            dos usuários.</li>
        </ul>

        <p><strong>2.3 Dados de Terceiros:</strong></p>
        <ul>
          <li><strong>Login social:</strong> ao cadastrar-se via Google, GitHub ou outras integrações, 
            recebemos nome, email e foto de perfil conforme as permissões concedidas;</li>
          <li><strong>Provedores de pagamento:</strong> confirmação de transação, status do pagamento.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'finalidade',
    title: '3. Como Utilizamos seus Dados',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    content: (
      <>
        <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>

        <div className="grid gap-3 mt-3">
          {[
            { purpose: 'Prestação do Serviço', desc: 'Criar e manter sua conta, exibir suas páginas de links, aplicar personalizações de cards e temas.' },
            { purpose: 'Processamento de Pagamentos', desc: 'Processar assinaturas, cobranças, emitir notas fiscais e gerenciar planos.' },
            { purpose: 'Analytics e Métricas', desc: 'Fornecer estatísticas de cliques e visualizações dos seus links para seu painel.' },
            { purpose: 'Melhorias na Plataforma', desc: 'Analisar padrões de uso para aprimorar funcionalidades, UX e performance.' },
            { purpose: 'Comunicação', desc: 'Enviar notificações sobre sua conta, atualizações de termos, alertas de segurança e, com seu consentimento, comunicações de marketing.' },
            { purpose: 'Segurança', desc: 'Detectar e prevenir fraudes, abusos, atividades ilegais e proteger a integridade da plataforma.' },
            { purpose: 'Obrigações Legais', desc: 'Cumprir obrigações fiscais, regulatórias e responder a ordens judiciais.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                {item.purpose}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'base-legal',
    title: '4. Base Legal (LGPD)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    content: (
      <>
        <p>O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais 
          previstas na LGPD:</p>
        <ul>
          <li><strong>Execução de contrato (Art. 7º, V):</strong> para prestação do serviço contratado;</li>
          <li><strong>Consentimento (Art. 7º, I):</strong> para comunicações de marketing e cookies não essenciais;</li>
          <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para melhorias na plataforma, analytics 
            internos e prevenção a fraudes;</li>
          <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> para obrigações fiscais e regulatórias;</li>
          <li><strong>Exercício regular de direitos (Art. 7º, VI):</strong> para defesa em processos administrativos 
            ou judiciais.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    title: '5. Compartilhamento de Dados',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    content: (
      <>
        <p>Seus dados pessoais podem ser compartilhados com:</p>
        <ul>
          <li><strong>Processadores de pagamento:</strong> Stripe, Mercado Pago ou similar, para processar 
            transações financeiras de forma segura;</li>
          <li><strong>Serviços de infraestrutura:</strong> provedores de hospedagem, CDN e banco de dados 
            (ex: AWS, Vercel, Cloudflare);</li>
          <li><strong>Ferramentas de analytics:</strong> para métricas internas da plataforma (dados anonimizados);</li>
          <li><strong>Autoridades legais:</strong> quando exigido por lei, ordem judicial ou para proteger 
            direitos e segurança;</li>
          <li><strong>Parceiros de negócio:</strong> apenas com seu consentimento explícito e para finalidades 
            específicas.</li>
        </ul>

        <div className="mt-4 p-4 rounded-lg" style={{
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <p className="text-sm flex items-start gap-2" style={{ color: 'var(--color-text)' }}>
            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <strong>Compromisso:</strong>&nbsp;Nunca vendemos seus dados pessoais a terceiros para fins 
            publicitários ou de marketing.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'armazenamento',
    title: '6. Armazenamento e Segurança',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    content: (
      <>
        <p><strong>6.1 Armazenamento:</strong> Seus dados são armazenados em servidores seguros localizados 
          no Brasil e/ou nos Estados Unidos, com redundância e backups regulares.</p>
        
        <p><strong>6.2 Medidas de Segurança:</strong> Implementamos medidas técnicas e organizacionais para 
          proteger seus dados, incluindo:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-4">
          {[
            { icon: '🔐', text: 'Criptografia em trânsito (TLS/SSL)' },
            { icon: '🔑', text: 'Senhas com hash bcrypt' },
            { icon: '🛡️', text: 'Firewall e proteção DDoS' },
            { icon: '📋', text: 'Controle de acesso baseado em função' },
            { icon: '🔍', text: 'Monitoramento contínuo de ameaças' },
            { icon: '💾', text: 'Backups criptografados diários' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <p><strong>6.3 Retenção:</strong> Seus dados são mantidos enquanto sua conta estiver ativa. 
          Após exclusão da conta, os dados são removidos em até 30 (trinta) dias, exceto quando a 
          retenção for necessária por obrigação legal (ex: dados fiscais por 5 anos).</p>
      </>
    ),
  },
  {
    id: 'direitos',
    title: '7. Seus Direitos (LGPD)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    content: (
      <>
        <p>Conforme a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:</p>

        <div className="space-y-2 mt-3">
          {[
            { right: 'Confirmação e Acesso', desc: 'Saber se tratamos seus dados e acessar uma cópia deles.' },
            { right: 'Correção', desc: 'Corrigir dados incompletos, inexatos ou desatualizados.' },
            { right: 'Anonimização ou Bloqueio', desc: 'Solicitar anonimização ou bloqueio de dados desnecessários ou excessivos.' },
            { right: 'Eliminação', desc: 'Solicitar a exclusão dos dados tratados com base em consentimento.' },
            { right: 'Portabilidade', desc: 'Solicitar a transferência dos seus dados a outro fornecedor de serviço.' },
            { right: 'Revogação do Consentimento', desc: 'Revogar o consentimento a qualquer momento, sem afetar a licitude do tratamento anterior.' },
            { right: 'Oposição', desc: 'Opor-se ao tratamento realizado com base em legítimo interesse, se aplicável.' },
            { right: 'Informação', desc: 'Ser informado sobre entidades públicas e privadas com as quais compartilhamos dados.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  color: 'var(--color-accent)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                {idx + 1}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  {item.right}
                </p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-lg" style={{
          backgroundColor: 'rgba(143, 124, 255, 0.06)',
          border: '1px solid rgba(143, 124, 255, 0.15)',
        }}>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            Para exercer qualquer desses direitos, envie um email para{' '}
            <strong style={{ color: 'var(--color-primary)' }}>{DPO_EMAIL}</strong>{' '}
            ou utilize as opções disponíveis nas configurações da sua conta. 
            Responderemos em até <strong>15 (quinze) dias úteis</strong>.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '8. Cookies e Tecnologias Similares',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    content: (
      <>
        <p>Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma:</p>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm" style={{ color: 'var(--color-text)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left p-3 font-semibold">Tipo</th>
                <th className="text-left p-3 font-semibold">Finalidade</th>
                <th className="text-left p-3 font-semibold">Obrigatório</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Essenciais', purpose: 'Autenticação, segurança e funcionamento básico', required: 'Sim' },
                { type: 'Funcionais', purpose: 'Preferências de tema, idioma e personalização', required: 'Não' },
                { type: 'Analytics', purpose: 'Métricas de uso e performance da plataforma', required: 'Não' },
                { type: 'Marketing', purpose: 'Anúncios relevantes (somente com consentimento)', required: 'Não' },
              ].map((cookie, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="p-3 font-medium">{cookie.type}</td>
                  <td className="p-3" style={{ color: 'var(--color-text-muted)' }}>{cookie.purpose}</td>
                  <td className="p-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: cookie.required === 'Sim'
                          ? 'rgba(143, 124, 255, 0.1)'
                          : 'rgba(107, 114, 128, 0.1)',
                        color: cookie.required === 'Sim'
                          ? 'var(--color-primary)'
                          : 'var(--color-text-muted)',
                      }}
                    >
                      {cookie.required}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          Você pode gerenciar suas preferências de cookies nas configurações do seu navegador ou 
          através do banner de consentimento exibido ao acessar a plataforma.
        </p>
      </>
    ),
  },
  {
    id: 'menores',
    title: '9. Dados de Menores',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    content: (
      <>
        <p>
          A Vxo não se destina a menores de 16 (dezesseis) anos sem o consentimento de um responsável legal. 
          Não coletamos intencionalmente dados de menores de idade sem autorização.
        </p>
        <p>
          Caso identifiquemos que dados de um menor foram coletados sem consentimento adequado, tomaremos 
          medidas para excluí-los imediatamente. Se você é responsável por um menor e acredita que dados 
          foram coletados indevidamente, entre em contato conosco.
        </p>
      </>
    ),
  },
  {
    id: 'transferencia',
    title: '10. Transferência Internacional',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <>
        <p>
          Alguns dos nossos provedores de serviços (hospedagem, CDN, processamento de pagamentos) podem estar 
          localizados fora do Brasil. Nesses casos, garantimos que a transferência internacional de dados é 
          realizada com salvaguardas adequadas, incluindo:
        </p>
        <ul>
          <li>Cláusulas contratuais padrão aprovadas pela ANPD;</li>
          <li>Certificações de segurança (SOC 2, ISO 27001) dos provedores;</li>
          <li>Transferência para países com nível adequado de proteção de dados.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'alteracoes',
    title: '11. Alterações nesta Política',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    content: (
      <>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas 
          práticas, tecnologias ou requisitos legais. Alterações significativas serão comunicadas por:
        </p>
        <ul>
          <li>Notificação por email para os usuários cadastrados;</li>
          <li>Aviso em destaque na plataforma;</li>
          <li>Atualização da data "Última atualização" neste documento.</li>
        </ul>
        <p>
          Recomendamos revisar esta política periodicamente. O uso continuado da plataforma após alterações 
          constitui aceitação da versão atualizada.
        </p>
      </>
    ),
  },
  {
    id: 'contato',
    title: '12. Contato e Encarregado (DPO)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <>
        <p>Para questões relacionadas à privacidade e proteção de dados, entre em contato:</p>

        <div className="grid gap-3 mt-3">
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>
              📧 Canal de Privacidade
            </p>
            <div className="space-y-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <p><strong>Email:</strong> {COMPANY_EMAIL}</p>
              <p><strong>Assunto:</strong> Solicitação de Privacidade - [seu nome]</p>
              <p><strong>Prazo de resposta:</strong> Até 15 dias úteis</p>
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>
              🛡️ Encarregado de Proteção de Dados (DPO)
            </p>
            <div className="space-y-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <p><strong>Email:</strong> {DPO_EMAIL}</p>
              <p><strong>Responsável:</strong> Equipe de Compliance Vxo</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg" style={{
          backgroundColor: 'rgba(143, 124, 255, 0.06)',
          border: '1px solid rgba(143, 124, 255, 0.15)',
        }}>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            Caso não esteja satisfeito com nossa resposta, você também pode registrar uma reclamação 
            junto à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> pelo site{' '}
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
              style={{ color: 'var(--color-primary)' }}
            >
              gov.br/anpd
            </a>.
          </p>
        </div>
      </>
    ),
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

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
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)`,
            transform: 'translate(-30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)`,
            transform: 'translate(30%, 30%)',
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
            href="/terms"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
          >
            Termos de Uso
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Política de Privacidade
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
                ~10 min de leitura
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Conforme LGPD
              </span>
            </div>
          </div>

          {/* Badge LGPD */}
          <div
            className="p-6 mb-6 flex items-start gap-3"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.06)',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
            }}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Compromisso com sua Privacidade
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                A Vxo está em conformidade com a Lei Geral de Proteção de Dados (LGPD). 
                Tratamos seus dados com transparência, segurança e respeito. Você tem o controle 
                sobre suas informações pessoais.
              </p>
            </div>
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
            <div
              className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: '0 4px 20px rgba(143, 124, 255, 0.25)',
              }}
            >
              <svg
                className="w-7 h-7"
                style={{ color: 'var(--color-accent)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Sua privacidade importa para nós
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Tem dúvidas sobre como tratamos seus dados? Entre em contato com nossa equipe de privacidade.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`mailto:${DPO_EMAIL}`}
                className="px-6 py-3 font-semibold text-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  color: 'var(--color-accent)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: '0 4px 15px rgba(143, 124, 255, 0.3)',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contatar DPO
              </a>
              <a
                href="/terms"
                className="px-6 py-3 font-semibold text-sm transition-all duration-200 hover:opacity-80"
                style={{
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Ver Termos de Uso
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
        .prose-custom a {
          color: var(--color-primary);
          text-decoration: underline;
        }
        .prose-custom a:hover {
          opacity: 0.8;
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

export default PrivacyPolicy;