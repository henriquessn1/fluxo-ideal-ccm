import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { AuthLoadingScreen } from '../components/auth/AuthLoadingScreen';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: string[];
  requireAllRoles?: boolean;
  fallback?: ReactNode;
}

export function PrivateRoute({ 
  children, 
  roles = [], 
  requireAllRoles = false, 
  fallback 
}: PrivateRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasAnyRole, login } = useAuth();

  // Mostrar loading durante inicialização
  if (isLoading) {
    return <AuthLoadingScreen message="Verificando permissões..." />;
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-8">
            Você precisa fazer login para acessar esta página.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('🔐 Botão de login clicado');
                login();
              }}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Fazer Login
            </button>
            
            <button
              onClick={() => {
                console.log('🔐 Tentando login direto via URL');
                const keycloakUrl = `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${import.meta.env.VITE_KEYCLOAK_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=openid`;
                console.log('🔐 URL de login:', keycloakUrl);
                window.location.href = keycloakUrl;
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Login Direto (Debug)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar permissões de roles se especificadas
  if (roles.length > 0) {
    const hasPermission = requireAllRoles 
      ? roles.every(role => hasRole(role))
      : hasAnyRole(roles);

    if (!hasPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Roles necessárias: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roles.join(', ')}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }
  }

  // Usuário autenticado e com permissões, renderizar children
  return <>{children}</>;
}

