# Validação de Token Keycloak no Backend

Este documento detalha como implementar a validação de tokens JWT do Keycloak no backend da aplicação Client Monitor.

## Visão Geral

O frontend envia tokens JWT (JSON Web Tokens) nas requisições HTTP que devem ser validados pelo backend para garantir:
- Autenticidade do token
- Autorização do usuário
- Expiração válida
- Integridade dos dados

## Configuração do Keycloak

### Informações Necessárias

```env
KEYCLOAK_URL=https://auth.fluxoideal.com
KEYCLOAK_REALM=client-monitor
KEYCLOAK_CLIENT_ID=dashboard-spa
KEYCLOAK_CLIENT_SECRET=your-client-secret  # ⚠️ OPCIONAL - veja explicação abaixo
```

### ⚠️ Sobre o CLIENT_SECRET

O `KEYCLOAK_CLIENT_SECRET` é **OPCIONAL** porque existem duas formas de validar tokens:

1. **Validação JWT/JWKS (Recomendada)**: 
   - ✅ Não precisa de `CLIENT_SECRET`
   - ✅ Usa chaves públicas do Keycloak (`/certs` endpoint)
   - ✅ Mais rápida e segura
   - ✅ Funciona offline

2. **Token Introspection**:
   - ⚠️ Precisa de `CLIENT_SECRET`
   - ⚠️ Chama o Keycloak a cada validação
   - ⚠️ Mais lenta, mas verifica revogação em tempo real

**Para aplicações SPA (Single Page Application)**, recomendamos a validação JWT/JWKS que não requer secret.

### URLs Importantes

- **Realm Configuration**: `{KEYCLOAK_URL}/realms/{REALM}`
- **JWKS Endpoint**: `{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs`
- **Token Introspection**: `{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token/introspect`
- **User Info**: `{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/userinfo`

## Estrutura do Token JWT

### Header do Token
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id"
}
```

### Payload (Claims) Principais
```json
{
  "exp": 1234567890,           // Expiração (timestamp)
  "iat": 1234567890,           // Issued at (timestamp)
  "auth_time": 1234567890,     // Tempo de autenticação
  "jti": "token-id",           // JWT ID único
  "iss": "https://auth.fluxoideal.com/realms/client-monitor",
  "aud": ["dashboard-spa"],    // Audience
  "sub": "user-uuid",          // Subject (ID do usuário)
  "typ": "Bearer",
  "azp": "dashboard-spa",      // Authorized party
  "session_state": "session-uuid",
  "scope": "openid email profile",
  
  // User Information
  "email_verified": true,
  "preferred_username": "usuario.teste",
  "given_name": "Usuário",
  "family_name": "Teste",
  "email": "usuario@exemplo.com",
  
  // Roles and Permissions
  "realm_access": {
    "roles": ["user", "admin"]
  },
  "resource_access": {
    "dashboard-spa": {
      "roles": ["client-admin"]
    }
  }
}
```

## Métodos de Validação - Comparação Detalhada

### 🏆 Método 1: Validação JWT com JWKS (Recomendado)

**Como funciona:**
```
1. Keycloak assina o token com sua chave privada (RSA)
2. Backend busca a chave pública do Keycloak (endpoint /certs)
3. Backend valida a assinatura usando a chave pública
4. Se a assinatura for válida = token é autêntico
```

**Prós:**
- ✅ **Performance**: Não precisa chamar Keycloak a cada validação
- ✅ **Segurança**: Chaves públicas podem ser expostas sem risco
- ✅ **Confiabilidade**: Funciona mesmo se Keycloak estiver indisponível
- ✅ **Padrão**: É como JWT foi projetado para funcionar
- ✅ **Não precisa de SECRET**: Cliente público (SPA)

**Contras:**
- ❌ **Não detecta revogação**: Se token for revogado, ainda será válido até expirar
- ❌ **Cache de chaves**: Precisa gerenciar cache das chaves públicas

### 🔍 Método 2: Token Introspection

**Como funciona:**
```
1. Backend envia token para Keycloak via POST /introspect
2. Keycloak verifica internamente se token é válido/ativo
3. Keycloak retorna status + metadados do token
4. Backend usa a resposta para decidir se aceita ou rejeita
```

**Prós:**
- ✅ **Revogação em tempo real**: Detecta tokens revogados
- ✅ **Metadados extras**: Informações adicionais sobre o token
- ✅ **Validação centralizada**: Keycloak é fonte da verdade

**Contras:**
- ❌ **Performance**: Chamada HTTP a cada validação
- ❌ **Dependência**: Se Keycloak cair, validação para
- ❌ **Precisa de SECRET**: Para autenticar a requisição de introspection

### 🎯 Recomendação

**Use JWT/JWKS para:**
- APIs com alto volume de requisições
- Aplicações que precisam funcionar offline
- Clientes públicos (SPAs, apps mobile)

**Use Introspection para:**
- Operações críticas que precisam verificar revogação
- Como validação adicional em endpoints sensíveis
- Quando precisa de metadados extras do token

## Implementação da Validação

### 1. Middleware de Autenticação

O middleware deve:

```javascript
async function authenticateToken(req, res, next) {
  try {
    // 1. Extrair o token do header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // 2. Validar e decodificar o token
    const decodedToken = await validateKeycloakToken(token);

    // 3. Anexar informações do usuário à requisição
    req.user = {
      id: decodedToken.sub,
      username: decodedToken.preferred_username,
      email: decodedToken.email,
      firstName: decodedToken.given_name,
      lastName: decodedToken.family_name,
      roles: [
        ...(decodedToken.realm_access?.roles || []),
        ...(decodedToken.resource_access?.[CLIENT_ID]?.roles || [])
      ],
      token: decodedToken
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

### 2. Função de Validação do Token

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Cliente JWKS para buscar chaves públicas
const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  requestHeaders: {},
  timeout: 30000,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

async function validateKeycloakToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: CLIENT_ID,
      issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}
```

### 3. Validação por Introspection (Alternativa)

Para maior segurança, use o endpoint de introspection:

```javascript
const axios = require('axios');

async function introspectToken(token) {
  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`,
      new URLSearchParams({
        token: token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET // apenas se confidential
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokenInfo = response.data;
    
    if (!tokenInfo.active) {
      throw new Error('Token não está ativo');
    }

    return tokenInfo;
  } catch (error) {
    throw new Error(`Erro na introspection: ${error.message}`);
  }
}
```

## Middleware de Autorização (Roles)

```javascript
function requireRoles(requiredRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        required_roles: requiredRoles,
        user_roles: userRoles
      });
    }

    next();
  };
}

// Uso:
app.get('/api/admin/users', 
  authenticateToken, 
  requireRoles(['admin']), 
  getUsersController
);
```

## Exemplo de Implementação Completa (Node.js/Express)

### Dependências Necessárias

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "jwks-rsa": "^3.0.0",
    "axios": "^1.4.0"
  }
}
```

### Estrutura de Arquivos

```
src/
├── middleware/
│   ├── auth.js
│   └── roles.js
├── services/
│   └── keycloakService.js
└── config/
    └── keycloak.js
```

### config/keycloak.js

```javascript
module.exports = {
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'https://auth.fluxoideal.com',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'client-monitor',
  CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'dashboard-spa',
  CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET, // opcional
  
  // URLs calculadas
  get REALM_URL() {
    return `${this.KEYCLOAK_URL}/realms/${this.KEYCLOAK_REALM}`;
  },
  
  get JWKS_URL() {
    return `${this.REALM_URL}/protocol/openid-connect/certs`;
  },
  
  get INTROSPECT_URL() {
    return `${this.REALM_URL}/protocol/openid-connect/token/introspect`;
  },
  
  get USERINFO_URL() {
    return `${this.REALM_URL}/protocol/openid-connect/userinfo`;
  }
};
```

### services/keycloakService.js

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const axios = require('axios');
const config = require('../config/keycloak');

class KeycloakService {
  constructor() {
    this.jwksClient = jwksClient({
      jwksUri: config.JWKS_URL,
      requestHeaders: {},
      timeout: 30000,
    });
  }

  getKey = (header, callback) => {
    this.jwksClient.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  async validateToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.getKey, {
        audience: config.CLIENT_ID,
        issuer: config.REALM_URL,
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) {
          reject(new Error(`Token inválido: ${err.message}`));
        } else {
          resolve(decoded);
        }
      });
    });
  }

  async introspectToken(token) {
    try {
      const params = new URLSearchParams({
        token: token,
        client_id: config.CLIENT_ID
      });

      if (config.CLIENT_SECRET) {
        params.append('client_secret', config.CLIENT_SECRET);
      }

      const response = await axios.post(config.INTROSPECT_URL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.data.active) {
        throw new Error('Token não está ativo');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Erro na introspection: ${error.message}`);
    }
  }

  async getUserInfo(token) {
    try {
      const response = await axios.get(config.USERINFO_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar informações do usuário: ${error.message}`);
    }
  }

  extractUserFromToken(decodedToken) {
    return {
      id: decodedToken.sub,
      username: decodedToken.preferred_username,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      firstName: decodedToken.given_name,
      lastName: decodedToken.family_name,
      fullName: `${decodedToken.given_name || ''} ${decodedToken.family_name || ''}`.trim(),
      realmRoles: decodedToken.realm_access?.roles || [],
      clientRoles: decodedToken.resource_access?.[config.CLIENT_ID]?.roles || [],
      
      get allRoles() {
        return [...this.realmRoles, ...this.clientRoles];
      }
    };
  }
}

module.exports = new KeycloakService();
```

### middleware/auth.js

```javascript
const keycloakService = require('../services/keycloakService');

async function authenticateToken(req, res, next) {
  try {
    // Extrair token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso não fornecido',
        code: 'MISSING_TOKEN'
      });
    }

    // Validar token
    const decodedToken = await keycloakService.validateToken(token);
    
    // Extrair informações do usuário
    const user = keycloakService.extractUserFromToken(decodedToken);
    
    // Anexar à requisição
    req.user = user;
    req.token = token;
    req.decodedToken = decodedToken;

    console.log(`Usuário autenticado: ${user.username} (${user.email})`);
    next();

  } catch (error) {
    console.error('Erro na autenticação:', error.message);
    
    return res.status(401).json({ 
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { authenticateToken };
```

### middleware/roles.js

```javascript
function requireRoles(requiredRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRoles = req.user.allRoles;
    
    const hasRequiredRole = requiredRoles.length === 0 || 
      requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ 
        error: 'Acesso negado - permissões insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: requiredRoles,
        user_roles: userRoles,
        user: req.user.username
      });
    }

    console.log(`Autorização concedida para ${req.user.username}: ${requiredRoles.join(', ')}`);
    next();
  };
}

function requireAnyRole(roles = []) {
  return requireRoles(roles);
}

function requireAllRoles(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRoles = req.user.allRoles;
    const hasAllRoles = roles.every(role => userRoles.includes(role));

    if (!hasAllRoles) {
      return res.status(403).json({ 
        error: 'Acesso negado - todas as permissões são necessárias',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: roles,
        user_roles: userRoles,
        user: req.user.username
      });
    }

    next();
  };
}

module.exports = { 
  requireRoles, 
  requireAnyRole, 
  requireAllRoles 
};
```

## Uso nas Rotas da API

```javascript
const express = require('express');
const { authenticateToken } = require('./middleware/auth');
const { requireRoles } = require('./middleware/roles');

const app = express();

// Rotas públicas (sem autenticação)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rotas protegidas (requer autenticação)
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    message: 'Perfil do usuário'
  });
});

// Rotas com autorização por roles
app.get('/api/clients', 
  authenticateToken, 
  requireRoles(['user', 'admin']),
  (req, res) => {
    // Lista clientes
    res.json({ clients: [] });
  }
);

app.post('/api/clients', 
  authenticateToken, 
  requireRoles(['admin']),
  (req, res) => {
    // Criar cliente (apenas admins)
    res.json({ message: 'Cliente criado' });
  }
);

app.delete('/api/clients/:id', 
  authenticateToken, 
  requireRoles(['admin']),
  (req, res) => {
    // Deletar cliente (apenas admins)
    res.json({ message: 'Cliente deletado' });
  }
);
```

## Tratamento de Erros

```javascript
// Error handler middleware
app.use((error, req, res, next) => {
  console.error('Erro na API:', error);

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token JWT malformado',
      code: 'MALFORMED_TOKEN'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      code: 'EXPIRED_TOKEN'
    });
  }

  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR'
  });
});
```

## Headers de Requisição do Frontend

O frontend deve enviar o token em todas as requisições:

```javascript
// No frontend (já implementado no authService.js)
const response = await fetch('/api/clients', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Logs e Monitoramento

```javascript
// Logger personalizado
const logger = {
  auth: (message, user = null) => {
    console.log(`[AUTH] ${new Date().toISOString()} - ${message}${user ? ` - User: ${user}` : ''}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }
};

// Uso nos middlewares
logger.auth('Token validado com sucesso', req.user.username);
logger.error('Falha na validação do token', error);
```

## Considerações de Segurança

1. **HTTPS**: Sempre use HTTPS em produção
2. **CORS**: Configure CORS adequadamente
3. **Rate Limiting**: Implemente rate limiting
4. **Logs**: Não faça log de tokens completos
5. **Timeouts**: Configure timeouts para requisições ao Keycloak
6. **Cache**: Considere cache de chaves públicas JWKS
7. **Refresh Tokens**: O frontend já gerencia refresh automático

## Testes

```javascript
// Exemplo de teste
const request = require('supertest');
const app = require('../app');

describe('Authentication', () => {
  test('should reject request without token', async () => {
    const response = await request(app)
      .get('/api/clients')
      .expect(401);
      
    expect(response.body.error).toBe('Token de acesso não fornecido');
  });

  test('should accept valid token', async () => {
    const token = 'valid-jwt-token';
    
    const response = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

Este documento fornece uma implementação completa e robusta para validação de tokens Keycloak no backend. A implementação inclui validação JWT, autorização baseada em roles, tratamento de erros e considerações de segurança.