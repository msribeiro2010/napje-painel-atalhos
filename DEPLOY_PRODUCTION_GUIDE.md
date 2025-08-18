# 🚀 Guia Completo de Deploy e Produção

## Sistema NAPJe com IA Avançada - Versão 2.0

Este guia fornece instruções detalhadas para fazer deploy do sistema NAPJe com todas as funcionalidades de IA em produção.

---

## 📋 Pré-requisitos

### **Ferramentas Necessárias**
- ✅ Node.js 18+ 
- ✅ npm ou yarn
- ✅ Git
- ✅ Supabase CLI (opcional, para Edge Functions)
- ✅ Conta GitHub
- ✅ Projeto Supabase configurado

### **Variáveis de Ambiente Necessárias**
```bash
# Supabase (Obrigatório)
VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# OpenAI (Para funcionalidades avançadas de IA)
OPENAI_API_KEY=sk-sua_chave_openai_aqui

# Configurações de IA
VITE_AI_FEATURES_ENABLED=true
VITE_SMART_SEARCH_ENABLED=true
VITE_AI_INSIGHTS_ENABLED=true
VITE_SMART_NOTIFICATIONS_ENABLED=true
VITE_SMART_FORMS_ENABLED=true

# Analytics (Opcional)
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=sua_sentry_dsn_aqui
```

---

## 🛠 Métodos de Deploy

### **Método 1: Deploy Automático (GitHub Actions) - Recomendado**

#### 1. Configurar Secrets no GitHub

Acesse: `Settings` → `Secrets and variables` → `Actions`

**Secrets necessários:**
```bash
VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_ACCESS_TOKEN=sua_access_token_supabase
SUPABASE_PROJECT_ID=zpufcvesenbhtmizmjiz
OPENAI_API_KEY=sk-sua_chave_openai_aqui
```

#### 2. Ativar GitHub Pages

1. Vá em `Settings` → `Pages`
2. Source: `GitHub Actions`
3. Salve as configurações

#### 3. Fazer Deploy

```bash
# Fazer push para a branch main
git add .
git commit -m "feat: deploy with AI features"
git push origin main

# Ou usar deploy manual
gh workflow run "Deploy Produção" --ref main
```

#### 4. Monitorar Deploy

- 🔗 **Actions**: https://github.com/msribeiro2010/napje-painel-atalhos/actions
- 🌐 **Produção**: https://msribeiro2010.github.io/napje-painel-atalhos/

---

### **Método 2: Deploy Manual (Script Local)**

#### 1. Preparar Ambiente

```bash
# Clonar repositório
git clone https://github.com/msribeiro2010/napje-painel-atalhos.git
cd napje-painel-atalhos

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.production
# Editar .env.production com suas credenciais
```

#### 2. Executar Deploy

```bash
# Dar permissão ao script
chmod +x scripts/deploy-production.sh

# Executar deploy
./scripts/deploy-production.sh

# Ou usar npm script
npm run deploy:production
```

#### 3. Upload Manual (se necessário)

```bash
# Fazer upload da pasta dist para seu servidor
scp -r dist/* usuario@servidor:/caminho/para/web/
```

---

### **Método 3: Deploy em Outros Provedores**

#### **Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variáveis de ambiente no painel Vercel
```

#### **Netlify**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Ou fazer upload manual no painel Netlify
```

#### **Servidor Próprio (Nginx)**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /var/www/napje-painel;
    index index.html;
    
    # Configuração para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Compressão
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

---

## 🤖 Configuração das Edge Functions de IA

### **1. Setup Supabase CLI**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link com projeto
supabase link --project-ref zpufcvesenbhtmizmjiz
```

### **2. Deploy das Functions**

```bash
# Deploy todas as functions
supabase functions deploy

# Deploy function específica
supabase functions deploy semantic-search

# Deploy com logs
supabase functions deploy --debug
```

### **3. Configurar Variáveis das Functions**

```bash
# No painel Supabase: Settings → Edge Functions
# Adicionar variáveis:
OPENAI_API_KEY=sk-sua_chave_aqui
ANTHROPIC_API_KEY=sua_chave_anthropic
```

### **4. Testar Functions**

```bash
# Testar localmente
supabase functions serve semantic-search

# Testar em produção
curl -X POST 'https://zpufcvesenbhtmizmjiz.supabase.co/functions/v1/semantic-search' \
  -H 'Authorization: Bearer sua_anon_key' \
  -H 'Content-Type: application/json' \
  -d '{"query": "teste"}'
```

---

## 📊 Monitoramento e Analytics

### **1. Configurar Monitoramento**

```bash
# Sentry para error tracking
VITE_SENTRY_DSN=https://sua-sentry-dsn@sentry.io/projeto

# Google Analytics (opcional)
VITE_GA_TRACKING_ID=G-XXXXXXXX

# Performance monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### **2. Dashboard de Monitoramento**

**URLs importantes:**
- 🔗 **GitHub Actions**: https://github.com/msribeiro2010/napje-painel-atalhos/actions
- 🔗 **Supabase Dashboard**: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz
- 🔗 **Vercel Dashboard**: https://vercel.com/dashboard (se usar Vercel)
- 🔗 **Netlify Dashboard**: https://app.netlify.com (se usar Netlify)

### **3. Logs e Debugging**

```bash
# Ver logs do Supabase
supabase functions logs semantic-search

# Ver logs em tempo real
supabase functions logs --follow

# Debug de performance
npm run build:analyze
```

---

## 🔧 Otimizações de Produção

### **1. Performance**

```bash
# Build otimizado
npm run build:prod

# Análise de bundle
npm run build:analyze

# Verificar tamanho
du -sh dist/
```

### **2. Compressão**

```bash
# Gzip automático no build
find dist -name "*.js" -o -name "*.css" -o -name "*.html" | xargs gzip -k

# Brotli (se suportado pelo servidor)
find dist -name "*.js" -o -name "*.css" -o -name "*.html" | xargs brotli -k
```

### **3. CDN (Opcional)**

```bash
# Cloudflare
# Adicionar domínio no Cloudflare
# Configurar DNS

# AWS CloudFront
# Criar distribuição apontando para GitHub Pages
```

---

## 🛡️ Configurações de Segurança

### **1. Variáveis de Ambiente**

```bash
# NUNCA committar chaves em .env
echo ".env*" >> .gitignore

# Usar secrets do GitHub para CI/CD
# Usar variáveis de ambiente no servidor
```

### **2. HTTPS**

```bash
# GitHub Pages: HTTPS automático
# Servidor próprio: certificado SSL/TLS
# Cloudflare: SSL automático
```

### **3. Cabeçalhos de Segurança**

```nginx
# Nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'";
```

---

## 🚀 Checklist de Deploy

### **Pré-Deploy**
- [ ] Código commitado e pushed
- [ ] Variáveis de ambiente configuradas
- [ ] Tests passando
- [ ] TypeScript sem erros
- [ ] Lint sem problemas

### **Deploy**
- [ ] Build gerado com sucesso
- [ ] Edge Functions deployadas
- [ ] Variáveis de produção configuradas
- [ ] DNS configurado (se domínio próprio)

### **Pós-Deploy**
- [ ] Site acessível
- [ ] Funcionalidades de IA funcionando
- [ ] Analytics configurados
- [ ] Monitoramento ativo
- [ ] Backups configurados

---

## 🔄 Processo de Atualização

### **Deploy de Hotfix**

```bash
# 1. Criar branch de hotfix
git checkout -b hotfix/nome-do-fix

# 2. Fazer correção
# ... editar arquivos ...

# 3. Commit e push
git add .
git commit -m "fix: descrição do fix"
git push origin hotfix/nome-do-fix

# 4. Merge para main
git checkout main
git merge hotfix/nome-do-fix
git push origin main

# 5. Deploy automático via GitHub Actions
```

### **Deploy de Nova Feature**

```bash
# 1. Criar branch de feature
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver feature
# ... desenvolvimento ...

# 3. Testar localmente
npm run dev
npm run type-check
npm run lint

# 4. Build de teste
npm run build:prod

# 5. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# 6. Criar Pull Request
# 7. Review e merge
# 8. Deploy automático
```

---

## 📞 Troubleshooting

### **Problemas Comuns**

#### **Build Falha**
```bash
# Limpar cache
npm run clean
npm ci

# Verificar TypeScript
npm run type-check

# Verificar lint
npm run lint:fix
```

#### **Edge Functions Não Funcionam**
```bash
# Verificar se está logado
supabase projects list

# Re-deploy functions
supabase functions deploy --debug

# Verificar logs
supabase functions logs semantic-search
```

#### **Site Não Carrega**
```bash
# Verificar GitHub Pages
# Settings → Pages → Source: GitHub Actions

# Verificar DNS (se domínio próprio)
nslookup seu-dominio.com

# Verificar SSL
curl -I https://seu-dominio.com
```

#### **IA Não Funciona**
```bash
# Verificar variáveis de ambiente
echo $VITE_AI_FEATURES_ENABLED

# Verificar console do navegador
# F12 → Console → Ver erros

# Verificar Edge Functions
curl -X POST 'https://zpufcvesenbhtmizmjiz.supabase.co/functions/v1/semantic-search'
```

---

## 📈 Métricas de Sucesso

### **KPIs de Deploy**
- ⏱️ **Tempo de build**: < 5 minutos
- 📦 **Tamanho do bundle**: < 2MB
- 🚀 **Tempo de deploy**: < 10 minutos
- ✅ **Success rate**: > 95%

### **KPIs de Performance**
- ⚡ **First Contentful Paint**: < 1.5s
- 🎯 **Largest Contentful Paint**: < 2.5s
- 📱 **Cumulative Layout Shift**: < 0.1
- 🤖 **IA Response Time**: < 3s

---

## 🎯 Próximos Passos

1. **✅ Deploy Inicial**: Seguir este guia
2. **🔧 Configurar Monitoramento**: Sentry, Analytics
3. **🤖 Otimizar IA**: Treinar modelos com dados reais
4. **📱 PWA**: Transformar em Progressive Web App
5. **🔄 CI/CD Avançado**: Testes automatizados, deploy staging
6. **📊 Analytics Avançados**: Dashboard de métricas customizado

---

## 🆘 Suporte

### **Recursos de Ajuda**
- 📖 **Documentação Vite**: https://vitejs.dev/
- 📖 **Documentação Supabase**: https://supabase.com/docs
- 📖 **GitHub Actions**: https://docs.github.com/actions
- 📖 **React + TypeScript**: https://react-typescript-cheatsheet.netlify.app/

### **Contato**
- 🐛 **Issues**: https://github.com/msribeiro2010/napje-painel-atalhos/issues
- 💬 **Discussões**: https://github.com/msribeiro2010/napje-painel-atalhos/discussions

---

**🎉 Parabéns! Seu sistema NAPJe com IA está pronto para produção!** 🚀🤖