# 🔐 Configuração do Keycloak para Dashboard React

Este guia fornece instruções passo-a-passo para configurar um novo realm no seu Keycloak existente para integração com o Dashboard de Monitoramento de Clientes.

## 📋 Visão Geral

Vamos criar:
- **Realm**: `client-monitor`
- **Client**: `dashboard-spa` (Single Page Application)
- **Roles**: `admin`, `user`
- **Usuário Admin**: Para testes iniciais

## 🚀 Passo 1: Criando o Realm

1. **Acesse o Admin Console do Keycloak**
   - Faça login como administrador na sua instância Keycloak
   - URL geralmente: `https://seu-keycloak.dominio.com/admin/`

2. **Criar Novo Realm**
   - No canto superior esquerdo, clique no dropdown do realm atual
   - Clique em **"Create Realm"**
   - Preencha os campos:
     - **Realm name**: `client-monitor`
     - **Display name**: `Cliente Monitor Dashboard`
     - **Enabled**: ✅ Habilitado
   - Clique **"Create"**

3. **Configurações Básicas do Realm**
   - Vá em **Realm Settings** (menu lateral)
   - Na aba **General**:
     - **Display name**: `Cliente Monitor Dashboard`
     - **HTML display name**: `<strong>Cliente Monitor</strong> Dashboard`
     - **Frontend URL**: (deixe em branco se usar a mesma URL)
   - Na aba **Login**:
     - **User registration**: ❌ Desabilitado (por segurança)
     - **Edit username**: ✅ Habilitado
     - **Forgot password**: ✅ Habilitado
     - **Remember me**: ✅ Habilitado
     - **Login with email**: ✅ Habilitado
   - Clique **"Save"**

## 🔧 Passo 2: Configurando o Client (SPA)

1. **Criar Client**
   - No menu lateral, clique em **"Clients"**
   - Clique **"Create client"**
   - **General Settings**:
     - **Client type**: `OpenID Connect`
     - **Client ID**: `dashboard-spa`
     - **Name**: `Dashboard SPA Client`
     - **Description**: `Single Page Application para Dashboard de Monitoramento`
   - Clique **"Next"**

2. **Capability Config**
   - **Client authentication**: ❌ **OFF** (cliente público)
   - **Authorization**: ❌ **OFF**
   - **Authentication flow**:
     - **Standard flow**: ✅ **ON**
     - **Direct access grants**: ❌ **OFF** (mais seguro)
     - **Implicit flow**: ❌ **OFF** (deprecated)
     - **Service accounts roles**: ❌ **OFF**
   - Clique **"Next"**

3. **Login Settings**
   - **Root URL**: `http://localhost:5173` (para desenvolvimento)
   - **Home URL**: `http://localhost:5173`
   - **Valid redirect URIs**: 
     ```
     http://localhost:5173/*
     http://localhost:5174/*
     https://seu-dominio-producao.com/*
     ```
   - **Valid post logout redirect URIs**: 
     ```
     http://localhost:5173/*
     https://seu-dominio-producao.com/*
     ```
   - **Web origins**: 
     ```
     http://localhost:5173
     https://seu-dominio-producao.com
     ```
   - Clique **"Save"**

4. **Configurações Avançadas**
   - Vá na aba **"Settings"** do client criado
   - Em **"Advanced Settings"**:
     - **Proof Key for Code Exchange Code Challenge Method**: `S256`
     - **Access Token Lifespan**: `5 Minutes` (token de curta duração)
     - **Client Session Idle**: `30 Minutes`
     - **Client Session Max**: `12 Hours`
   - Clique **"Save"**

## 👥 Passo 3: Configurando Roles

1. **Realm Roles**
   - No menu lateral, clique em **"Realm roles"**
   - Clique **"Create role"**
   
   **Role: admin**
   - **Role name**: `admin`
   - **Description**: `Administrador do sistema`
   - Clique **"Save"**
   
   **Role: user**
   - Clique **"Create role"** novamente
   - **Role name**: `user`
   - **Description**: `Usuário padrão do sistema`
   - Clique **"Save"**

2. **Client Roles (Opcional)**
   - Clique em **"Clients"** → **"dashboard-spa"** → **"Roles"**
   - Clique **"Create role"**
   - **Role name**: `dashboard-access`
   - **Description**: `Acesso ao dashboard`
   - Clique **"Save"**

## 👤 Passo 4: Criando Usuário Admin

1. **Criar Usuário**
   - No menu lateral, clique em **"Users"**
   - Clique **"Add user"**
   - Preencha:
     - **Username**: `admin`
     - **Email**: `admin@empresa.com`
     - **First name**: `Admin`
     - **Last name**: `Sistema`
     - **Email verified**: ✅ **ON**
     - **Enabled**: ✅ **ON**
   - Clique **"Create"**

2. **Definir Senha**
   - Na tela do usuário criado, vá na aba **"Credentials"**
   - Clique **"Set password"**
   - **Password**: `admin123` (troque por uma senha segura)
   - **Password confirmation**: `admin123`
   - **Temporary**: ❌ **OFF** (para não precisar trocar no primeiro login)
   - Clique **"Save"**

3. **Atribuir Roles**
   - Na aba **"Role mapping"**
   - Clique **"Assign role"**
   - Selecione **"admin"** e **"user"**
   - Clique **"Assign"**

## ⚙️ Passo 5: Configurações de Segurança

1. **Tokens e Sessions**
   - Em **"Realm Settings"** → **"Sessions"**:
     - **SSO Session Idle**: `30 Minutes`
     - **SSO Session Max**: `12 Hours`
     - **Client Session Idle**: `30 Minutes`
     - **Client Session Max**: `12 Hours`
   
2. **Configurações de Login**
   - Em **"Realm Settings"** → **"Security Defenses"**:
     - **Headers**: 
       - **X-Frame-Options**: `SAMEORIGIN`
       - **Content-Security-Policy**: (deixar padrão)
       - **X-Content-Type-Options**: `nosniff`
     - **Brute Force Detection**: ✅ **ON**
       - **Max Login Failures**: `5`
       - **Wait Increment**: `60 Seconds`
       - **Quick Login Check**: `1000 Milliseconds`

## 🌐 Passo 6: URLs para Produção

Quando for para produção, atualize as URLs no client:

1. **Client Settings** (`dashboard-spa`)
   - **Root URL**: `https://dashboard.seu-dominio.com`
   - **Valid redirect URIs**: `https://dashboard.seu-dominio.com/*`
   - **Valid post logout redirect URIs**: `https://dashboard.seu-dominio.com/*`
   - **Web origins**: `https://dashboard.seu-dominio.com`

## 🔍 Passo 7: Testando a Configuração

1. **URL de Login de Teste**
   ```
   https://seu-keycloak.dominio.com/realms/client-monitor/protocol/openid-connect/auth?client_id=dashboard-spa&redirect_uri=http://localhost:5173&response_type=code&scope=openid
   ```

2. **Informações para o Frontend**
   ```bash
   VITE_KEYCLOAK_URL=https://seu-keycloak.dominio.com
   VITE_KEYCLOAK_REALM=client-monitor
   VITE_KEYCLOAK_CLIENT_ID=dashboard-spa
   ```

## 📊 Passo 8: Configurações Opcionais

### Personalização do Login
- **Realm Settings** → **Themes**:
  - **Login theme**: `keycloak` (padrão) ou customizado
  - **Account theme**: `keycloak`
  - **Email theme**: `keycloak`

### Configuração de Email (Para reset de senha)
- **Realm Settings** → **Email**:
  - Configure SMTP se necessário para funcionalidades de email

### Eventos e Auditoria
- **Events** → **Config**:
  - **Save Events**: ✅ **ON**
  - **Login Events**: ✅ **ON**
  - **Admin Events**: ✅ **ON**

## 🚨 Troubleshooting

### Erro de CORS
- Verifique se as **Web origins** estão corretas no client
- Adicione `*` temporariamente para testes locais

### Erro de Redirect
- Confirme as **Valid redirect URIs** no client
- Use `/*` no final das URLs para permitir sub-rotas

### Token Expirado
- Ajuste **Access Token Lifespan** se necessário
- Implemente refresh token no frontend

### Login não funciona
- Verifique se o usuário está **Enabled**
- Confirme se a senha foi definida corretamente
- Verifique se o realm está **Enabled**

## ✅ Checklist Final

- [ ] Realm `client-monitor` criado
- [ ] Client `dashboard-spa` configurado como SPA público
- [ ] PKCE habilitado no client
- [ ] Roles `admin` e `user` criadas
- [ ] Usuário admin criado e configurado
- [ ] URLs de redirect configuradas
- [ ] Configurações de segurança aplicadas
- [ ] Teste de login realizado

## 📝 Próximos Passos

Após completar esta configuração:

1. **Configure as variáveis de ambiente** no projeto React
2. **Instale a dependência** `keycloak-js`
3. **Implemente a integração** no frontend
4. **Teste a autenticação** completa

---

**⚠️ Importante**: Salve essas configurações e mantenha as credenciais de admin seguras. Para produção, use senhas robustas e configure HTTPS obrigatório.