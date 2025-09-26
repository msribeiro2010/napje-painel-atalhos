# ✅ Checklist de Segurança para Deploy em Produção - PJe

## 🚨 ANTES DE FAZER DEPLOY

### 1. Configuração do Banco de Dados
- [ ] Executar `sql/pje-security-tables.sql` no Supabase
- [ ] Dar permissão `can_access_pje = true` apenas para usuários autorizados
- [ ] Configurar backups automáticos das tabelas de log

### 2. Servidor Proxy
- [ ] Usar `pje-proxy-secure.js` ao invés do `pje-proxy.js`
- [ ] Configurar HTTPS com certificado SSL válido
- [ ] Configurar variáveis de ambiente no servidor:
  ```env
  NODE_ENV=production
  ALLOWED_ORIGINS=https://seu-dominio.com
  SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
  ```
- [ ] Instalar PM2 para gerenciar o processo:
  ```bash
  npm install -g pm2
  pm2 start server/pje-proxy-secure.js --name pje-api
  pm2 save
  pm2 startup
  ```

### 3. Frontend
- [ ] Atualizar componentes para usar `usePJeSearchSecure` ao invés de `usePJeSearch`
- [ ] Configurar `VITE_PJE_API_URL` para apontar para o servidor de produção com HTTPS
- [ ] Remover console.logs e comentários de debug

### 4. Infraestrutura
- [ ] Configurar firewall para permitir apenas IPs autorizados no servidor PJe
- [ ] Implementar VPN ou túnel SSH para conexão com bases PJe
- [ ] Configurar monitoramento e alertas (Sentry, DataDog, etc.)
- [ ] Configurar rate limiting no nginx/Apache

### 5. Segurança Adicional
- [ ] Instalar e configurar `express-rate-limit`:
  ```bash
  npm install express-rate-limit helmet
  ```
- [ ] Adicionar helmet para headers de segurança
- [ ] Implementar CORS restritivo
- [ ] Configurar CSP (Content Security Policy)
- [ ] Implementar timeout nas queries do banco

### 6. Logs e Auditoria
- [ ] Configurar rotação de logs
- [ ] Implementar sistema de alertas para acessos suspeitos
- [ ] Criar dashboard para visualizar logs de acesso
- [ ] Configurar backup dos logs

### 7. Testes
- [ ] Testar autenticação e autorização
- [ ] Testar rate limiting
- [ ] Testar com usuários sem permissão
- [ ] Realizar teste de carga
- [ ] Verificar logs de auditoria

### 8. Documentação
- [ ] Documentar processo de dar/remover acesso PJe
- [ ] Criar guia de troubleshooting
- [ ] Documentar processo de recovery
- [ ] Treinar equipe de suporte

## ⚠️ NUNCA FAÇA

- ❌ Commitar credenciais no repositório
- ❌ Expor o servidor proxy diretamente na internet sem autenticação
- ❌ Usar HTTP ao invés de HTTPS em produção
- ❌ Deixar logs com informações sensíveis (CPF, senhas) 
- ❌ Dar permissão `can_access_pje` para todos os usuários
- ❌ Esquecer de configurar backups
- ❌ Deploy sem testar autenticação

## 🔐 Variáveis de Ambiente para Produção

```env
# Servidor Proxy (NÃO commitar!)
NODE_ENV=production
PJE_API_PORT=3001
ALLOWED_ORIGINS=https://seu-dominio.com
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxx

# Bases PJe (usar secrets manager em produção)
PJE_DB1_HOST=pje-dbpr-a1-replica
PJE_DB1_DATABASE=pje_1grau
PJE_DB1_USER=msribeiro
PJE_DB1_PASSWORD=xxxxxxxxxx
PJE_DB2_HOST=pje-dbpr-a2-replica
PJE_DB2_DATABASE=pje_2grau
PJE_DB2_USER=msribeiro
PJE_DB2_PASSWORD=xxxxxxxxxx

# Frontend
VITE_PJE_API_URL=https://api-pje.seu-dominio.com/api/pje
```

## 📊 Monitoramento Pós-Deploy

### Primeiras 24h
- [ ] Monitorar logs de erro a cada hora
- [ ] Verificar performance das queries
- [ ] Analisar padrões de uso
- [ ] Verificar rate limiting

### Primeira Semana
- [ ] Revisar logs de acesso
- [ ] Otimizar queries lentas
- [ ] Ajustar rate limits se necessário
- [ ] Coletar feedback dos usuários

### Mensalmente
- [ ] Auditoria de segurança
- [ ] Revisão de permissões
- [ ] Análise de logs
- [ ] Atualização de dependências