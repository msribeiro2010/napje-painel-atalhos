# ✅ Checklist de Deploy - Painel JIRA NAPJe

## 🔍 Verificações Pré-Deploy

### **Código & Build**
- [ ] ✅ Todos os commits feitos
- [ ] ✅ Branch main atualizada
- [ ] ✅ `npm run type-check` sem erros
- [ ] ✅ `npm run lint` sem erros críticos
- [ ] ✅ `npm run build` executado com sucesso
- [ ] ✅ Pasta `dist` gerada corretamente

### **Funcionalidades Críticas**
- [ ] ✅ Login/Logout funcionando
- [ ] ✅ Painel de atalhos carregando
- [ ] ✅ Base de conhecimento acessível
- [ ] ✅ Calendário de trabalho operacional
- [ ] ✅ **🆕 Notificações de eventos ativas**
- [ ] ✅ Área administrativa funcionando
- [ ] ✅ Supabase conectado

### **Performance & Otimização**
- [ ] ✅ Build otimizado (< 5MB total)
- [ ] ✅ Chunks organizados adequadamente
- [ ] ✅ Imagens otimizadas
- [ ] ✅ Cache do React Query configurado

### **Segurança**
- [ ] ✅ Headers de segurança configurados
- [ ] ✅ Variáveis sensíveis não expostas
- [ ] ✅ RLS do Supabase ativo
- [ ] ✅ Rotas protegidas funcionando

---

## 🚀 Comandos de Deploy

### **1. Verificação Rápida**
```bash
npm run deploy:check
```

### **2. Deploy com Script**
```bash
npm run deploy
```

### **3. Deploy Manual**
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

---

## 📊 Monitoramento Pós-Deploy

### **URLs para Verificar**
- 🌐 **Produção**: https://msribeiro2010.github.io/napje-painel-atalhos/
- 📈 **GitHub Actions**: https://github.com/msribeiro2010/napje-painel-atalhos/actions
- 🗄️ **Supabase**: https://supabase.com/dashboard

### **Testes Essenciais** (após deploy)
- [ ] ✅ URL principal carregando
- [ ] ✅ Login com usuário teste
- [ ] ✅ Atalhos aparecendo corretamente
- [ ] ✅ **Notificações de eventos funcionando**
- [ ] ✅ Upload de arquivos (base de conhecimento)
- [ ] ✅ Área admin acessível (para admins)

### **Performance** (verificar no DevTools)
- [ ] ✅ Lighthouse Score > 90
- [ ] ✅ FCP (First Contentful Paint) < 2s
- [ ] ✅ LCP (Largest Contentful Paint) < 2.5s
- [ ] ✅ TTI (Time to Interactive) < 3s

---

## 🚨 Troubleshooting Comum

### **Deploy Falha**
```bash
# Verificar erros no GitHub Actions
# Limpar cache e tentar novamente
npm run clean
npm install
npm run build
```

### **Aplicação Não Carrega**
```bash
# Verificar console do browser
# Verificar se Supabase está funcionando
# Verificar se URLs estão corretas
```

### **Notificações Não Aparecem**
```bash
# Verificar localStorage
localStorage.clear()

# Verificar se há eventos no banco
# Supabase > Tables > feriados, aniversariantes
```

---

## 📝 Log de Deploys

### **v2.15.2** - Sistema de Notificações
- **Data**: 2024-01-XX
- **Funcionalidades**: 
  - ✅ SmartEventNotifications
  - ✅ EventNotificationModal
  - ✅ EventNotificationBadge
  - ✅ Sistema de configurações
- **Status**: 🟢 Sucesso

### **v2.15.1** - Correções
- **Data**: 2024-01-XX
- **Funcionalidades**: Sincronização de atalhos
- **Status**: 🟢 Sucesso

---

## �� Próximos Passos

### **Planejado para v2.16.0**
- [ ] PWA (Progressive Web App)
- [ ] Notificações push do navegador
- [ ] Modo offline básico
- [ ] Analytics de uso
- [ ] Otimizações de performance

### **Melhorias Contínuas**
- [ ] Monitoramento automático
- [ ] Testes automatizados
- [ ] CI/CD melhorado
- [ ] Backup automático

---

**Responsável**: Desenvolvedor Principal  
**Última Atualização**: 2024-01-XX  
**Status**: 🟢 Pronto para Produção
