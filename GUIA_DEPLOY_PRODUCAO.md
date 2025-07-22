# 🚀 Guia Completo de Deploy e Produção
**Painel JIRA - Núcleo de Apoio ao PJe - TRT15 - v2.15.2**

## 📊 Status Atual do Projeto

### ✅ Funcionalidades Implementadas
- ✅ **Sistema de Autenticação** (Supabase Auth)
- ✅ **Painel de Atalhos** com sincronização em tempo real
- ✅ **Base de Conhecimento** com upload de arquivos
- ✅ **Gestão de Chamados** JIRA
- ✅ **Calendário de Trabalho** (férias, presencial, remoto)
- ✅ **Sistema de Feriados e Aniversários**
- ✅ **🆕 Notificações Inteligentes de Eventos** (novo!)
- ✅ **Área Administrativa** completa
- ✅ **Chat Assistant** com IA
- ✅ **Post-it Notes** colaborativo

### 🔧 Tecnologias
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: GitHub Pages + GitHub Actions
- **Estado**: React Query + Context API

---

## 🌐 URLs de Ambiente

### 🚀 Produção
```
https://msribeiro2010.github.io/napje-painel-atalhos/
```

### 🧪 Desenvolvimento Local
```
http://localhost:8080
```

---

## 🔄 Configuração de Deploy

### 1. **GitHub Actions** (Automático)

O projeto está configurado para **deploy automático**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### 2. **Configuração do Vite**

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  base: mode === 'production' && process.env.GITHUB_ACTIONS ? '/napje-painel-atalhos/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable'],
        }
      }
    }
  }
}));
```

---

## 🚀 Processo de Deploy

### **1. Deploy Automático** (Recomendado)

```bash
# Fazer push para a branch main
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# O GitHub Actions executa automaticamente:
# ✅ npm ci
# ✅ npm run build
# ✅ Deploy para GitHub Pages
```

**Tempo estimado**: 2-3 minutos  
**Monitoramento**: https://github.com/msribeiro2010/napje-painel-atalhos/actions

### **2. Deploy Manual** (Se necessário)

```bash
# 1. Instalar dependências
npm install

# 2. Build para produção
npm run build

# 3. Preview local do build
npm run preview

# 4. Fazer upload da pasta 'dist' para o servidor
```

### **3. Verificação do Deploy**

```bash
# Verificar build local
npm run build
npm run preview

# Testar todas as funcionalidades:
# ✅ Login/Logout
# ✅ Atalhos funcionando
# ✅ Base de conhecimento
# ✅ Calendário de trabalho
# ✅ Notificações de eventos (NOVO!)
# ✅ Área administrativa
```

---

## 🔧 Configuração para Produção

### **1. Otimizações de Performance**

```typescript
// Chunking inteligente já configurado
manualChunks: {
  vendor: ['react', 'react-dom'],
  router: ['react-router-dom'],
  ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  query: ['@tanstack/react-query'],
  supabase: ['@supabase/supabase-js'],
  dnd: ['@dnd-kit/core', '@dnd-kit/sortable'],
}
```

### **2. Cache Strategy**

```typescript
// React Query cache configurado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
    },
  },
});
```

---

## 📱 Funcionalidades por Ambiente

### **🆕 Notificações de Eventos** (v2.15.2)

#### **Produção:**
- ✅ Modal automático para eventos urgentes
- ✅ Badge no cabeçalho com contador
- ✅ Painel inteligente no dashboard
- ✅ Sistema de snooze configurável
- ✅ Animações otimizadas
- ✅ Configurações persistentes (localStorage)

#### **Desenvolvimento:**
- 🔧 Logs detalhados de eventos
- 🔧 Toast para debugging
- 🔧 Configurações avançadas acessíveis

### **Sistema de Atalhos**

#### **Produção:**
- ✅ Sincronização em tempo real
- ✅ Cache invalidation automático
- ✅ Agrupamento inteligente
- ✅ Busca otimizada

---

## 🔐 Segurança em Produção

### **1. Autenticação**
```typescript
// Row Level Security (RLS) ativado no Supabase
// Políticas configuradas para todos os usuários
```

### **2. Proteção de Rotas**
```typescript
// ProtectedRoute implementado
<ProtectedRoute requireAdmin={true}>
  <AdminUsers />
</ProtectedRoute>
```

### **3. Headers de Segurança**
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
}
```

---

## 📊 Monitoramento e Logs

### **1. GitHub Actions**
- **URL**: https://github.com/msribeiro2010/napje-painel-atalhos/actions
- **Status**: Verificar se workflows passaram ✅
- **Logs**: Disponíveis para debug

### **2. Supabase Dashboard**
- **URL**: https://supabase.com/dashboard
- **Logs**: Queries, Auth, Storage
- **Performance**: Métricas em tempo real

### **3. Browser DevTools**
- **Console**: Logs de desenvolvimento
- **Network**: Performance de requests
- **Application**: localStorage, sessionStorage

---

## 🚨 Troubleshooting

### **Problemas Comuns:**

#### **1. Deploy Falha**
```bash
# Verificar GitHub Actions
# Se falhar, rodar localmente:
npm ci
npm run build

# Verificar erros no console
```

#### **2. Supabase Connection**
```typescript
// Verificar se as credenciais estão corretas
// URL: https://zpufcvesenbhtmizmjiz.supabase.co
// Status: https://status.supabase.com/
```

#### **3. Notificações Não Aparecem**
```typescript
// Verificar se há eventos próximos no banco
// Limpar localStorage se necessário
localStorage.removeItem('event-notification-settings');
```

#### **4. Atalhos Desatualizados**
```typescript
// Forçar reload do cache
queryClient.invalidateQueries(['shortcuts']);
```

---

## 📋 Checklist de Deploy

### **Antes do Deploy:**
- [ ] ✅ Testes locais passando
- [ ] ✅ Build sem erros (`npm run build`)
- [ ] ✅ TypeScript sem erros (`npx tsc --noEmit`)
- [ ] ✅ Funcionalidades testadas
- [ ] ✅ Notificações configuradas e testadas
- [ ] ✅ Dados do Supabase funcionando

### **Após o Deploy:**
- [ ] ✅ URL de produção acessível
- [ ] ✅ Login funcionando
- [ ] ✅ Atalhos carregando
- [ ] ✅ Base de conhecimento operacional
- [ ] ✅ Notificações de eventos ativas
- [ ] ✅ Área administrativa acessível
- [ ] ✅ Performance satisfatória

---

## 🔄 Processo de Atualização

### **1. Desenvolvimento**
```bash
# Criar nova feature
git checkout -b feature/nova-funcionalidade

# Desenvolvimento e testes
npm run dev

# Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### **2. Deploy**
```bash
# Merge para main
git checkout main
git merge feature/nova-funcionalidade
git push origin main

# Deploy automático via GitHub Actions
```

### **3. Hotfix (Urgente)**
```bash
# Branch de hotfix
git checkout -b hotfix/correcao-urgente

# Correção rápida
# Commit e push
git push origin hotfix/correcao-urgente

# Deploy direto para main (se crítico)
git checkout main
git merge hotfix/correcao-urgente
git push origin main
```

---

## 💡 Melhorias Futuras

### **Próximas Versões:**
1. **PWA** - Progressive Web App
2. **Notificações Push** do navegador
3. **Modo Offline** para funcionalidades críticas
4. **Analytics** de uso
5. **Backup automático** de configurações
6. **Integração** com Google Calendar
7. **API REST** própria para integrações

### **Performance:**
1. **Service Worker** para cache
2. **Image optimization** automática
3. **Lazy loading** de imagens
4. **Prefetch** de rotas críticas

---

**Status Atual**: 🟢 **PRODUÇÃO ESTÁVEL**  
**Última Atualização**: v2.15.2 - Sistema de Notificações Inteligentes  
**Próxima Release**: v2.16.0 - PWA e Melhorias de Performance
