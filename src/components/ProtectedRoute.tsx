// ProtectedRoute.tsx — agora só protege o CONTEÚDO interno
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ✅ Loading agora é só dentro da área de conteúdo
  // A sidebar e o grid do DashboardLayout já estão renderizados
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ 
              borderColor: 'var(--color-primary)', 
              borderTopColor: 'transparent' 
            }}
          />
          <p style={{ color: 'var(--color-text-muted)' }}>
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};