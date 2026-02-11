// src/components/guards/RequiresPremium.tsx

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { embedService } from '../../services/embedService';

interface RequiresPremiumProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 🔒 Guard Component - Protege rotas premium
 * 
 * Verifica se o usuário é premium ANTES de renderizar os children.
 * Se não for premium, redireciona imediatamente.
 * 
 * @example
 * <RequiresPremium>
 *   <DashboardEmbeds />
 * </RequiresPremium>
 */
const RequiresPremium = ({ 
  children, 
  redirectTo = '/unauthorized' 
}: RequiresPremiumProps) => {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // Tenta acessar endpoint premium
      await embedService.getUserEmbed();
      
      // ✅ Se chegou aqui, é premium
      setStatus('authorized');
      console.log('[RequiresPremium] ✅ Acesso autorizado');
      
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message?.toLowerCase() || '';
      
      // ❌ Verifica se é erro de premium
      const isPremiumError = 
        status === 403 || 
        status === 400 && (
          message.includes('premium') || 
          message.includes('não é premium')
        );
      
      if (isPremiumError) {
        console.log('[RequiresPremium] ❌ Acesso negado - não é premium');
        setStatus('unauthorized');
      } else {
        // Outros erros (rede, etc) = permite acesso
        console.warn('[RequiresPremium] ⚠️ Erro na verificação, permitindo acesso:', error);
        setStatus('authorized');
      }
    }
  };

  // ⏳ LOADING - Mostra loader fullscreen
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-[var(--color-primary)] animate-spin" />
          <p className="text-[var(--color-text-muted)] text-sm">
            Verificando permissões...
          </p>
        </div>
      </div>
    );
  }

  // ❌ UNAUTHORIZED - Redireciona imediatamente
  if (status === 'unauthorized') {
    return <Navigate to={redirectTo} replace />;
  }

  // ✅ AUTHORIZED - Renderiza os children
  return <>{children}</>;
};

export default RequiresPremium;