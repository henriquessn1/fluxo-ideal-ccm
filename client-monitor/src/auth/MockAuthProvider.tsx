import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextType } from './AuthContext';

interface MockAuthProviderProps {
  children: ReactNode;
}

// Provider para desenvolvimento/teste sem Keycloak
export function MockAuthProvider({ children }: MockAuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular delay de inicialização
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const mockUser = {
    id: 'mock-user-123',
    username: 'usuario.teste',
    email: 'usuario@exemplo.com',
    firstName: 'Usuário',
    lastName: 'Teste',
    fullName: 'Usuário Teste',
    roles: ['admin', 'user']
  };

  const contextValue: AuthContextType = {
    keycloak: null,
    isAuthenticated: true,
    isLoading,
    user: mockUser,
    login: async () => {
      console.log('Mock login');
    },
    logout: async () => {
      console.log('Mock logout');
    },
    hasRole: (role: string) => mockUser.roles.includes(role),
    hasAnyRole: (roles: string[]) => roles.some(role => mockUser.roles.includes(role)),
    getToken: async () => 'mock-token'
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}