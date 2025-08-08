import { useState, useEffect, type ReactNode } from 'react';
import type { KeycloakInstance } from 'keycloak-js';
import { AuthContext, type AuthContextType } from './AuthContext';
import { getKeycloakInstance, initializeKeycloak } from '../config/keycloak';
import { AuthLoadingScreen } from '../components/auth/AuthLoadingScreen';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [keycloakInstance, setKeycloakInstance] = useState<KeycloakInstance | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Inicializando autenticação...');
  const [user, setUser] = useState<AuthContextType['user']>(null);

  useEffect(() => {
    let isMounted = true;

    const initKeycloak = async () => {
      try {
        console.log('🔐 Iniciando processo de autenticação...');
        setLoadingMessage('Conectando com servidor de autenticação...');
        
        const authenticated = await initializeKeycloak();
        
        if (!isMounted) return;

        const keycloak = getKeycloakInstance();
        
        console.log('🔐 Keycloak inicializado. Autenticado:', authenticated);
        console.log('🔐 Instância do Keycloak:', keycloak);
        console.log('🔐 URL do servidor:', keycloak.authServerUrl);
        console.log('🔐 Realm:', keycloak.realm);
        console.log('🔐 ClientId:', keycloak.clientId);
        
        setKeycloakInstance(keycloak);
        console.log('🔐 Instância definida no estado');
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Carregar informações do usuário
          setLoadingMessage('Carregando perfil do usuário...');
          await loadUserProfile();
        }

        setIsLoading(false);

        // Configurar eventos do Keycloak
        keycloak.onAuthSuccess = () => {
          console.log('🔐 Autenticação realizada com sucesso');
          setIsAuthenticated(true);
          loadUserProfile();
        };

        keycloak.onAuthError = (error) => {
          console.error('🔐 Erro na autenticação:', error);
          setIsAuthenticated(false);
          setUser(null);
        };

        keycloak.onAuthLogout = () => {
          console.log('🔐 Logout realizado');
          setIsAuthenticated(false);
          setUser(null);
        };

        keycloak.onTokenExpired = () => {
          console.log('🔐 Token expirado, renovando...');
          keycloak.updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                console.log('🔐 Token renovado com sucesso');
              }
            })
            .catch((error) => {
              console.error('🔐 Erro ao renovar token:', error);
              // Usar keycloak.logout diretamente para evitar dependência circular
              keycloak.logout({
                redirectUri: import.meta.env.VITE_APP_URL
              });
            });
        };

      } catch (error) {
        console.error('🔐 Erro ao inicializar Keycloak:', error);
        
        if (isMounted) {
          setIsLoading(false);
          
          // Se for um erro de timeout ou configuração, mostrar mensagem específica
          if (error && typeof error === 'object' && 'error' in error) {
            console.error('🔐 Detalhes do erro:', error);
            setLoadingMessage(`Erro de autenticação: ${JSON.stringify(error)}`);
          } else {
            setLoadingMessage('Erro ao conectar com o servidor de autenticação. Verifique a configuração.');
          }
        }
      }
    };

    const loadUserProfile = async () => {
      try {
        const keycloak = getKeycloakInstance();
        
        if (!keycloak.authenticated) return;

        await keycloak.loadUserProfile();
        
        const profile = keycloak.profile;
        const tokenParsed = keycloak.tokenParsed;

        const userRoles = [
          ...(tokenParsed?.realm_access?.roles || []),
          ...(tokenParsed?.resource_access?.[keycloak.clientId || '']?.roles || [])
        ];

        const userData = {
          id: profile?.id || tokenParsed?.sub,
          username: profile?.username || tokenParsed?.preferred_username,
          email: profile?.email || tokenParsed?.email,
          firstName: profile?.firstName || tokenParsed?.given_name,
          lastName: profile?.lastName || tokenParsed?.family_name,
          fullName: `${profile?.firstName || tokenParsed?.given_name || ''} ${profile?.lastName || tokenParsed?.family_name || ''}`.trim() || profile?.username || tokenParsed?.preferred_username,
          roles: userRoles
        };

        setUser(userData);
        console.log('👤 Perfil do usuário carregado:', userData);
      } catch (error) {
        console.error('👤 Erro ao carregar perfil do usuário:', error);
      }
    };

    initKeycloak();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async () => {
    console.log('🔐 Tentando fazer login...');
    
    if (!keycloakInstance) {
      console.error('🔐 Keycloak não foi inicializado');
      return;
    }

    try {
      console.log('🔐 Redirecionando para Keycloak...');
      await keycloakInstance.login({
        redirectUri: window.location.origin
      });
    } catch (error) {
      console.error('🔐 Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (keycloakInstance) {
      try {
        await keycloakInstance.logout({
          redirectUri: import.meta.env.VITE_APP_URL
        });
      } catch (error) {
        console.error('🔐 Erro no logout:', error);
        throw error;
      }
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const getToken = async (): Promise<string | undefined> => {
    if (!keycloakInstance?.authenticated) return undefined;
    
    try {
      // Renovar token se necessário (30 segundos antes de expirar)
      await keycloakInstance.updateToken(30);
      return keycloakInstance.token;
    } catch (error) {
      console.error('🔐 Erro ao obter token:', error);
      return undefined;
    }
  };

  const contextValue: AuthContextType = {
    keycloak: keycloakInstance,
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    hasRole,
    hasAnyRole,
    getToken
  };

  // Mostrar loading screen durante inicialização
  if (isLoading) {
    return <AuthLoadingScreen message={loadingMessage} />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}