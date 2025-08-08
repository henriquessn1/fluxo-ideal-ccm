import { createContext, useContext } from 'react';
import type { KeycloakInstance } from 'keycloak-js';

export interface AuthContextType {
  keycloak: KeycloakInstance | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    roles?: string[];
  } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  getToken: () => Promise<string | undefined>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};