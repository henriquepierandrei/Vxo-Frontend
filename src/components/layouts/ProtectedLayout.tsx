// components/layouts/ProtectedLayout.tsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ✅ Loading dentro do layout - NÃO desmonta o pai
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
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ✅ Outlet renderiza as rotas filhas
  return <Outlet />;
};