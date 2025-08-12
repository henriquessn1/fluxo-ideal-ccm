# Setup do Ambiente Local

Este guia fornece instruções passo a passo para configurar e testar o sistema localmente usando o servidor 10.102.1.16.

## Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- Acesso ao servidor 10.102.1.16 (PostgreSQL e Redis)
- Git configurado

## Passo 1: Clonar o Repositório

```bash
git clone [URL_DO_REPOSITORIO]
cd fluxo-ideal-ccm
```

## Passo 2: Instalar Dependências

```bash
npm install
```

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes configurações:

```env
# Configuração do Banco de Dados PostgreSQL
VITE_DB_HOST=10.102.1.16
VITE_DB_PORT=5432
VITE_DB_USER=geraldb_user
VITE_DB_PASSWORD=Jk16OFyM6rBebmWJS5YPp6Y9
VITE_DB_NAME=geraldb

# Configuração do Redis
VITE_REDIS_HOST=10.102.1.16
VITE_REDIS_PORT=6379
VITE_REDIS_PASSWORD=plBroNb2Hhfnan3v5LqnX9J4

# Configuração da API Backend
VITE_API_BASE_URL=http://localhost:3000

# Configuração do Keycloak (ajustar conforme seu ambiente)
VITE_KEYCLOAK_URL=http://localhost:8080/auth
VITE_KEYCLOAK_REALM=fluxo-ideal
VITE_KEYCLOAK_CLIENT_ID=ccm-frontend

# Modo de desenvolvimento
VITE_USE_MOCK_DATA=false
```

## Passo 4: Verificar Conectividade

### Testar conexão com PostgreSQL:

```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName 10.102.1.16 -Port 5432

# Linux/Mac
nc -zv 10.102.1.16 5432
```

### Testar conexão com Redis:

```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName 10.102.1.16 -Port 6379

# Linux/Mac
nc -zv 10.102.1.16 6379
```

## Passo 5: Configurar o Backend (se necessário)

Se você tiver um backend separado, configure as conexões:

### Exemplo de configuração para Node.js backend:

```javascript
// config/database.js
module.exports = {
  postgres: {
    host: process.env.DB_HOST || '10.102.1.16',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'geraldb_user',
    password: process.env.DB_PASSWORD || 'Jk16OFyM6rBebmWJS5YPp6Y9',
    database: process.env.DB_NAME || 'geraldb'
  },
  redis: {
    host: process.env.REDIS_HOST || '10.102.1.16',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || 'plBroNb2Hhfnan3v5LqnX9J4'
  }
};
```

## Passo 6: Iniciar a Aplicação

### Modo de Desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em: http://localhost:5173

### Modo de Produção (preview):

```bash
npm run build
npm run preview
```

## Passo 7: Verificar Funcionalidades

### Checklist de Testes:

- [ ] **Conexão com PostgreSQL**
  - Verificar se os dados estão sendo lidos corretamente
  - Testar operações CRUD de clientes

- [ ] **Conexão com Redis**
  - Verificar cache de sessões
  - Testar invalidação de cache

- [ ] **Autenticação (se Keycloak local)**
  - Login com usuário admin
  - Login com usuário comum
  - Logout e refresh token

- [ ] **Dashboard**
  - Visualização de clientes
  - Atualização automática (30 segundos)
  - Filtros e busca

- [ ] **Operações CRUD**
  - Criar novo cliente
  - Editar cliente existente
  - Excluir cliente
  - Visualizar detalhes

## Solução de Problemas

### Erro de Conexão com PostgreSQL

1. Verificar se o PostgreSQL está rodando no servidor:
```bash
psql -h 10.102.1.16 -U geraldb_user -d geraldb
# Senha: Jk16OFyM6rBebmWJS5YPp6Y9
```

2. Verificar firewall/portas abertas no servidor

3. Confirmar credenciais no arquivo `.env.local`

### Erro de Conexão com Redis

1. Testar conexão via redis-cli:
```bash
redis-cli -h 10.102.1.16 -a plBroNb2Hhfnan3v5LqnX9J4
```

2. Verificar se a porta 6379 está aberta

### Problemas com Keycloak

1. Se usar Keycloak local, verificar se está rodando
2. Confirmar configurações de realm e client
3. Verificar redirect URIs configuradas

## Scripts Úteis

### Limpar cache e reinstalar:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Verificar logs do PostgreSQL:
```bash
psql -h 10.102.1.16 -U geraldb_user -d geraldb -c "SELECT * FROM pg_stat_activity WHERE datname = 'geraldb';"
```

### Monitorar Redis:
```bash
redis-cli -h 10.102.1.16 -a plBroNb2Hhfnan3v5LqnX9J4 MONITOR
```

## Contatos e Suporte

Em caso de problemas com o ambiente local:

1. Verificar logs em `console` do navegador
2. Verificar logs do terminal onde `npm run dev` está rodando
3. Confirmar conectividade de rede com o servidor 10.102.1.16
4. Revisar configurações em `.env.local`

## Notas Importantes

- **Segurança**: Nunca commitar arquivos `.env.local` com senhas
- **Performance**: Para testes de carga, considerar usar Redis local
- **Backup**: Fazer backup do banco antes de testes destrutivos
- **Isolamento**: Considerar usar schemas separados no PostgreSQL para diferentes desenvolvedores