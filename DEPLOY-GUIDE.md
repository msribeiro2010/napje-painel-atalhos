# 🚀 Guia de Deploy - PJe em Produção

## 📋 Visão Geral

Este guia explica como configurar o sistema PJe em produção usando:
- **Vercel**: Frontend (React + Vite)
- **Railway**: Backend API (Node.js + Express + PostgreSQL)

## 🏗️ Arquitetura da Solução

```
┌─────────────────┐    HTTPS    ┌─────────────────┐    Internal    ┌─────────────────┐
│   Vercel        │ ──────────► │   Railway       │ ──────────────► │   PJe Database  │
│   (Frontend)    │             │   (API Server)  │                 │   (PostgreSQL)  │
│                 │             │                 │                 │                 │
│ • React App     │             │ • Express API   │                 │ • 1º Grau       │
│ • Static Files  │             │ • PG Connections│                 │ • 2º Grau       │
│ • Routing       │             │ • CORS Config   │                 │                 │
└─────────────────┘             └─────────────────┘                 └─────────────────┘
```

## 🛠️ Pré-requisitos

- [ ] Conta no [Railway](https://railway.app)
- [ ] Conta no [Vercel](https://vercel.com)
- [ ] Acesso aos bancos de dados PJe
- [ ] Railway CLI instalado: `npm install -g @railway/cli`
- [ ] Vercel CLI instalado: `npm install -g vercel`

## 📦 Passo 1: Deploy da API no Railway

### 1.1 Preparar o Projeto

```bash
# Clone o repositório (se necessário)
git clone <seu-repositorio>
cd napje-painel-atalhos-1

# Instalar dependências
npm install
```

### 1.2 Configurar Railway

```bash
# Login no Railway
railway login

# Criar novo projeto
railway new

# Ou linkar projeto existente
railway link
```

### 1.3 Configurar Variáveis de Ambiente

No dashboard do Railway, configure as seguintes variáveis:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# PJe Database - 1º Grau
PJE_DB_HOST_1GRAU=pje-dbpr-a1-replica
PJE_DB_PORT_1GRAU=5432
PJE_DB_NAME_1GRAU=pje
PJE_DB_USER_1GRAU=seu_usuario
PJE_DB_PASSWORD_1GRAU=sua_senha

# PJe Database - 2º Grau
PJE_DB_HOST_2GRAU=pje-dbpr-a2-replica
PJE_DB_PORT_2GRAU=5432
PJE_DB_NAME_2GRAU=pje
PJE_DB_USER_2GRAU=seu_usuario
PJE_DB_PASSWORD_2GRAU=sua_senha

# SSL Configuration
PJE_DB_SSL=true
PJE_DB_SSL_REJECT_UNAUTHORIZED=false
```

### 1.4 Deploy

```bash
# Deploy automático
./deploy-railway.sh

# Ou manual
railway up
```

### 1.5 Obter URL do Railway

Após o deploy, anote a URL gerada (ex: `https://seu-app.up.railway.app`)

## 🌐 Passo 2: Configurar Frontend no Vercel

### 2.1 Atualizar Variáveis de Ambiente

No dashboard do Vercel, configure:

```env
NODE_ENV=production
VITE_APP_ENV=production

# Supabase (já configurado)
VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PJe API - SUBSTITUA pela URL do Railway
VITE_PJE_API_URL=https://seu-app.up.railway.app/api/pje
```

### 2.2 Atualizar .env.production

```bash
# Editar arquivo local
nano .env.production

# Atualizar a linha:
VITE_PJE_API_URL=https://seu-app.up.railway.app/api/pje
```

### 2.3 Deploy no Vercel

```bash
# Deploy automático via Git
git add .
git commit -m "Configure Railway API URL"
git push origin main

# Ou deploy manual
vercel --prod
```

## 🧪 Passo 3: Testar a Integração

### 3.1 Teste Automatizado

```bash
# Configurar URL do Railway
export RAILWAY_URL=https://seu-app.up.railway.app

# Executar testes
node test-integration.js
```

### 3.2 Teste Manual

1. **Health Check Railway**:
   ```bash
   curl https://seu-app.up.railway.app/health
   ```

2. **Teste PJe Connection**:
   ```bash
   curl https://seu-app.up.railway.app/api/pje/test-connection
   ```

3. **Teste Distribuição Diária**:
   ```bash
   curl "https://seu-app.up.railway.app/api/pje/distribuicao-diaria?grau=1&data=2024-01-15"
   ```

4. **Teste Frontend**:
   - Acesse sua aplicação no Vercel
   - Navegue para a seção PJe
   - Teste a funcionalidade de distribuição diária

## 🔧 Passo 4: Monitoramento e Logs

### 4.1 Logs do Railway

```bash
# Ver logs em tempo real
railway logs

# Ver logs específicos
railway logs --tail 100
```

### 4.2 Logs do Vercel

```bash
# Ver logs de build
vercel logs

# Ver logs de função
vercel logs --follow
```

## 🚨 Troubleshooting

### Problema: Erro de Conexão com Banco

**Sintomas**: `getaddrinfo ENOTFOUND`

**Soluções**:
1. Verificar credenciais do banco
2. Confirmar acesso de rede do Railway aos bancos PJe
3. Verificar configuração SSL

### Problema: CORS Error

**Sintomas**: `Access-Control-Allow-Origin`

**Soluções**:
1. Verificar configuração CORS na API
2. Confirmar URL do Railway no frontend
3. Verificar headers de resposta

### Problema: 404 Not Found

**Sintomas**: Endpoint não encontrado

**Soluções**:
1. Verificar URL da API no frontend
2. Confirmar deploy da API no Railway
3. Verificar rotas da API

## 📊 Monitoramento de Performance

### Métricas Importantes

- **Latência da API**: < 2s
- **Uptime**: > 99%
- **Conexões DB**: Monitorar pool
- **Memória**: < 512MB

### Alertas Recomendados

1. **API Down**: Health check falha
2. **DB Connection**: Erro de conexão
3. **High Latency**: Resposta > 5s
4. **Memory Usage**: > 80%

## 🔄 Atualizações e Manutenção

### Deploy de Atualizações

```bash
# 1. Atualizar código
git add .
git commit -m "Update: descrição"
git push origin main

# 2. Railway deploy automático via Git
# 3. Vercel deploy automático via Git

# Ou deploy manual
railway up
vercel --prod
```

### Backup e Recuperação

1. **Código**: Git repository
2. **Configurações**: Documentar variáveis de ambiente
3. **Logs**: Railway/Vercel dashboards

## 📞 Suporte

### Recursos Úteis

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Contatos

- **Desenvolvedor**: [Seu contato]
- **Infraestrutura**: [Contato TI]
- **PJe**: [Contato PJe]

---

## ✅ Checklist de Deploy

- [ ] Railway configurado e funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Conexão com bancos PJe testada
- [ ] Frontend atualizado com URL Railway
- [ ] Vercel configurado e funcionando
- [ ] Testes de integração passando
- [ ] Monitoramento configurado
- [ ] Documentação atualizada

**🎉 Parabéns! Seu sistema PJe está em produção!**