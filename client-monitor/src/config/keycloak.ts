import Keycloak from 'keycloak-js';

// Configuração do Keycloak baseada nas variáveis de ambiente
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

// Instância global do Keycloak
let keycloakInstance: Keycloak | null = null;
let initializationPromise: Promise<boolean> | null = null;
let isInitialized = false;

export const getKeycloakInstance = () => {
  if (!keycloakInstance) {
    console.log('🔐 Criando nova instância do Keycloak');
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
};

export const initializeKeycloak = async (): Promise<boolean> => {
  // Se já está sendo inicializado, retornar a promessa existente
  if (initializationPromise) {
    console.log('🔐 Aguardando inicialização em progresso...');
    return initializationPromise;
  }

  // Se já foi inicializado, retornar o estado atual
  if (isInitialized) {
    console.log('🔐 Keycloak já foi inicializado');
    return keycloakInstance?.authenticated || false;
  }

  // Inicializar pela primeira vez
  const keycloak = getKeycloakInstance();
  
  initializationPromise = keycloak.init(keycloakInitOptions).then((authenticated) => {
    isInitialized = true;
    initializationPromise = null; // Limpar para futuras verificações
    console.log('🔐 Inicialização concluída, autenticado:', authenticated);
    return authenticated;
  }).catch((error) => {
    initializationPromise = null; // Limpar em caso de erro
    throw error;
  });

  return initializationPromise;
};

export const isKeycloakInitialized = () => isInitialized;

// Configurações de inicialização
export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  checkLoginIframe: false, // Desabilita iframe para evitar CSP issues
  pkceMethod: 'S256' as const,
  enableLogging: true, // Para debug
};

export default getKeycloakInstance();