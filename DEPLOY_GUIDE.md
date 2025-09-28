# 🚀 Guia de Deploy - PJe Painel de Atalhos

Este guia explica como fazer o deploy da aplicação no GitHub e Vercel, mantendo as configurações funcionando em qualquer estação e cidade.

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Vercel
- Conta no Supabase (para banco de dados e autenticação)
- Node.js 18+ instalado
- Git instalado

## 🔧 Configuração Local Inicial

### 1. Preparar o Projeto

```bash
# Verificar se o .gitignore está configurado corretamente
cat .gitignore | grep -E "\.env|node_modules"

# Garantir que .env não será enviado ao GitHub
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. Criar Arquivo de Configuração

```bash
# Copiar o template de configuração
cp .env.example .env.local

# Editar com suas configurações
nano .env.local
```

## 📦 Deploy no GitHub

### 1. Criar Repositório

```bash
# Inicializar git se ainda não estiver
git init

# Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/napje-painel-atalhos.git

# Verificar arquivos que serão enviados
git status

# Adicionar todos os arquivos (exceto .env)
git add .

# Commit inicial
git commit -m "feat: Deploy inicial do PJe Painel de Atalhos"

# Push para o GitHub
git push -u origin main
```

### 2. GitHub Secrets (para CI/CD)

No GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anon do Supabase
- `PJE_DB1_HOST`: Host do banco PJe 1º grau
- `PJE_DB1_DATABASE`: Nome do banco 1º grau
- `PJE_DB1_USER`: Usuário do banco 1º grau
- `PJE_DB1_PASSWORD`: Senha do banco 1º grau
- `PJE_DB2_HOST`: Host do banco PJe 2º grau
- `PJE_DB2_DATABASE`: Nome do banco 2º grau
- `PJE_DB2_USER`: Usuário do banco 2º grau
- `PJE_DB2_PASSWORD`: Senha do banco 2º grau

## 🌐 Deploy no Vercel

### 1. Conectar com GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente

### 2. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon

# Aplicação
VITE_APP_TITLE=PJe - Painel de Atalhos
VITE_APP_VERSION=1.0.0

# PJe API (URL do servidor)
VITE_PJE_API_URL=https://seu-servidor-pje.vercel.app/api/pje

# Configurações de desenvolvimento
VITE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
VITE_AI_FEATURES_ENABLED=false
```

### 3. Configurar Build Settings

```yaml
Framework Preset: Vite
Build Command: npm run build:prod
Output Directory: dist
Install Command: npm install
```

## 🖥️ Servidor PJe (Backend)

### Opção 1: Deploy Separado do Servidor PJe

Crie um novo projeto para o servidor PJe:

```bash
# Criar pasta do servidor
mkdir pje-server
cd pje-server

# Copiar arquivos do servidor
cp -r ../napje-painel-atalhos/server/* .

# Criar package.json
npm init -y

# Instalar dependências
npm install express cors dotenv pg

# Criar arquivo vercel.json
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/pje-proxy-simple.mjs",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/pje/(.*)",
      "dest": "server/pje-proxy-simple.mjs"
    }
  ]
}
```

### Opção 2: Usar Servidor Local com ngrok

Para desenvolvimento e testes:

```bash
# Instalar ngrok
npm install -g ngrok

# Rodar servidor PJe local
npm run pje:server

# Em outro terminal, expor com ngrok
ngrok http 3001

# Usar a URL do ngrok no VITE_PJE_API_URL
```

## 🔒 Configuração de Segurança para Acesso Remoto

### 1. VPN TRT15

Para acessar os bancos PJe de fora da rede interna:

```bash
# Configurar VPN do TRT15
# Detalhes específicos devem ser obtidos com o setor de TI
```

### 2. Proxy Reverso Seguro

Criar um proxy reverso seguro para os bancos:

```javascript
// server/secure-proxy.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Validar token de acesso
app.use((req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token !== process.env.ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Proxy para banco PJe
app.use('/api/pje', createProxyMiddleware({
  target: 'http://pje-dbpr-a1-replica:5432',
  changeOrigin: true,
  secure: true
}));

app.listen(process.env.PORT || 3001);
```

## 📱 Configuração para Diferentes Estações

### 1. Arquivo de Configuração por Ambiente

Crie diferentes arquivos de configuração:

```bash
# Desenvolvimento local
.env.local

# Produção
.env.production

# Staging
.env.staging
```

### 2. Script de Inicialização

```json
// package.json
{
  "scripts": {
    "dev:local": "VITE_ENV=local vite",
    "dev:remote": "VITE_ENV=remote vite",
    "build:staging": "VITE_ENV=staging vite build",
    "build:prod": "VITE_ENV=production vite build"
  }
}
```

## 🔄 Sincronização de Dados

### 1. Backup Automático

```bash
# Script de backup
#!/bin/bash
# backup-pje.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

# Backup do banco Supabase
npx supabase db dump > "$BACKUP_DIR/supabase_$DATE.sql"

# Backup das configurações
cp .env "$BACKUP_DIR/env_$DATE.bak"

echo "Backup concluído: $DATE"
```

### 2. Sincronização com Git

```bash
# Atualizar configurações
git pull origin main

# Enviar mudanças
git add .
git commit -m "feat: Atualização de configurações"
git push origin main
```

## 🐛 Troubleshooting

### Problema: Erro de conexão com banco PJe

**Solução:**
```bash
# Verificar conectividade
ping pje-dbpr-a1-replica

# Testar conexão PostgreSQL
psql -h pje-dbpr-a1-replica -U seu_usuario -d pje_1grau
```

### Problema: CORS errors

**Solução:**
```javascript
// Adicionar no servidor Express
app.use(cors({
  origin: ['http://localhost:5173', 'https://seu-app.vercel.app'],
  credentials: true
}));
```

### Problema: Variáveis de ambiente não carregando

**Solução:**
```bash
# Verificar variáveis
echo $VITE_SUPABASE_URL

# Recarregar
source ~/.bashrc
```

## 📝 Checklist de Deploy

- [ ] Configurar .gitignore
- [ ] Criar .env.example atualizado
- [ ] Fazer commit no GitHub
- [ ] Configurar secrets no GitHub
- [ ] Conectar Vercel com GitHub
- [ ] Configurar variáveis no Vercel
- [ ] Testar build local
- [ ] Deploy no Vercel
- [ ] Testar aplicação em produção
- [ ] Configurar domínio customizado (opcional)
- [ ] Configurar SSL/HTTPS
- [ ] Testar em diferentes dispositivos
- [ ] Documentar URLs de acesso

## 🔗 URLs Importantes

- **Produção**: https://seu-app.vercel.app
- **Staging**: https://seu-app-staging.vercel.app
- **Servidor PJe**: https://pje-server.vercel.app
- **Supabase Dashboard**: https://app.supabase.com/project/seu-projeto
- **GitHub Repo**: https://github.com/seu-usuario/napje-painel-atalhos

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Documentação Vercel: https://vercel.com/docs
- Documentação Supabase: https://supabase.com/docs
- Issues do projeto: https://github.com/seu-usuario/napje-painel-atalhos/issues

---

**Última atualização**: Setembro 2025