import keycloak from '../config/keycloak';

export class AuthService {
  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    return keycloak.authenticated || false;
  }

  /**
   * Obtém o token de acesso atual
   */
  static async getAccessToken(): Promise<string | undefined> {
    if (!keycloak.authenticated) return undefined;
    
    try {
      // Renovar token se necessário (30 segundos antes de expirar)
      await keycloak.updateToken(30);
      return keycloak.token;
    } catch (error) {
      console.error('Erro ao obter token de acesso:', error);
      return undefined;
    }
  }

  /**
   * Obtém o refresh token
   */
  static getRefreshToken(): string | undefined {
    return keycloak.refreshToken;
  }

  /**
   * Obtém informações do token decodificado
   */
  static getTokenParsed() {
    return keycloak.tokenParsed;
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  static hasRole(role: string): boolean {
    if (!keycloak.authenticated || !keycloak.tokenParsed) return false;
    
    const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
    const clientRoles = keycloak.tokenParsed.resource_access?.[keycloak.clientId || '']?.roles || [];
    
    return [...realmRoles, ...clientRoles].includes(role);
  }

  /**
   * Verifica se o usuário tem pelo menos uma das roles especificadas
   */
  static hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Verifica se o usuário tem todas as roles especificadas
   */
  static hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Obtém todas as roles do usuário (realm + client)
   */
  static getUserRoles(): string[] {
    if (!keycloak.authenticated || !keycloak.tokenParsed) return [];
    
    const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
    const clientRoles = keycloak.tokenParsed.resource_access?.[keycloak.clientId || '']?.roles || [];
    
    return [...realmRoles, ...clientRoles];
  }

  /**
   * Obtém o perfil do usuário
   */
  static async getUserProfile() {
    if (!keycloak.authenticated) return null;
    
    try {
      await keycloak.loadUserProfile();
      return keycloak.profile;
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      return null;
    }
  }

  /**
   * Obtém informações básicas do usuário do token
   */
  static getUserInfo() {
    if (!keycloak.authenticated || !keycloak.tokenParsed) return null;
    
    const token = keycloak.tokenParsed;
    return {
      id: token.sub,
      username: token.preferred_username,
      email: token.email,
      firstName: token.given_name,
      lastName: token.family_name,
      fullName: `${token.given_name || ''} ${token.family_name || ''}`.trim() || token.preferred_username,
      roles: this.getUserRoles()
    };
  }

  /**
   * Realiza login
   */
  static async login(): Promise<void> {
    try {
      await keycloak.login();
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Falha na autenticação');
    }
  }

  /**
   * Realiza logout
   */
  static async logout(): Promise<void> {
    try {
      await keycloak.logout({
        redirectUri: import.meta.env.VITE_APP_URL
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      throw new Error('Falha no logout');
    }
  }

  /**
   * Força a renovação do token
   */
  static async refreshToken(): Promise<boolean> {
    if (!keycloak.authenticated) return false;
    
    try {
      return await keycloak.updateToken(-1); // Força renovação
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  }

  /**
   * Obtém o tempo de expiração do token em segundos
   */
  static getTokenExpirationTime(): number | undefined {
    if (!keycloak.tokenParsed?.exp) return undefined;
    
    const now = Math.floor(Date.now() / 1000);
    return keycloak.tokenParsed.exp - now;
  }

  /**
   * Verifica se o token expira em X segundos
   */
  static isTokenExpiring(seconds: number = 30): boolean {
    const expirationTime = this.getTokenExpirationTime();
    return expirationTime !== undefined && expirationTime <= seconds;
  }

  /**
   * Obtém headers de autorização para requisições HTTP
   */
  static async getAuthHeader(): Promise<Record<string, string> | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Cria um interceptor para Axios com renovação automática de token
   */
  static createAxiosInterceptor() {
    return {
      request: async (config: { headers?: Record<string, string> }) => {
        const authHeader = await this.getAuthHeader();
        if (authHeader) {
          config.headers = { ...config.headers, ...authHeader };
        }
        return config;
      },
      
      response: (response: unknown) => response,
      
      error: async (error: { response?: { status?: number }; config?: { headers?: Record<string, string> } }) => {
        if (error.response?.status === 401) {
          // Token inválido, tentar renovar
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Repetir a requisição com o novo token
            const authHeader = await this.getAuthHeader();
            if (authHeader && error.config) {
              error.config.headers = { ...error.config.headers, ...authHeader };
            }
            return error.config;
          } else {
            // Não conseguiu renovar, fazer logout
            await this.logout();
          }
        }
        return Promise.reject(error);
      }
    };
  }
}

export default AuthService;