# 🔧 SOLUÇÃO: ChatBot TRT15 Offline - Problema de Autenticação

## 📋 **DIAGNÓSTICO CONFIRMADO**

**❌ PROBLEMA PRINCIPAL:** JWT Inválido (Erro 401)  
**❌ CAUSA RAIZ:** Chave de autenticação Supabase expirada  
**❌ RESULTADO:** ChatBot em "Modo Offline"

### **🚨 NÃO É PROBLEMA DE LIMITES NO SUPABASE!**

O problema identificado é de **AUTENTICAÇÃO**, não de cotas ou limites de acesso.

---

## 🎯 **PROBLEMAS IDENTIFICADOS**

1. **❌ JWT Token Inválido**
   - Status: `401 Unauthorized`
   - Mensagem: `"Invalid JWT"`
   - Causa: Chave anon expirada

2. **❌ OpenAI API Key**
   - Não configurada nas Edge Functions
   - Necessária para IA funcionar

3. **❌ Edge Function Inacessível**
   - Falha na autenticação impede acesso
   - chat-assistant não responde

---

## 🔧 **SOLUÇÃO COMPLETA**

### **ETAPA 1: Obter Nova Chave Supabase**

1. **Acesse o Dashboard:**
   ```
   https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz
   ```

2. **Navegue para API Settings:**
   - Clique em "Settings" (menu lateral)
   - Selecione "API"

3. **Copie as Chaves Atualizadas:**
   - **URL:** `https://zpufcvesenbhtmizmjiz.supabase.co`
   - **anon public:** (copie a chave completa - começa com `eyJ`)

### **ETAPA 2: Atualizar Arquivo .env**

Substitua no arquivo `.env` do projeto:

```env
# Supabase Configuration - ATUALIZADAS
VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_NOVA_CHAVE_ANON_AQUI

# Outras configurações permanecem iguais
NODE_ENV=development
VITE_APP_TITLE=NAPJe - Painel de Atalhos
VITE_APP_VERSION=1.0.0
VITE_OPENAI_API_KEY=sua-chave-openai-aqui
VITE_DEBUG=false
VITE_ENABLE_ANALYTICS=false
```

### **ETAPA 3: Configurar OpenAI nas Edge Functions**

1. **No Dashboard do Supabase:**
   - Vá em "Edge Functions" (menu lateral)
   - Clique em "Settings"

2. **Adicionar Variável de Ambiente:**
   - Seção: "Environment Variables"
   - Clique em "Add new variable"
   
3. **Configurar OpenAI:**
   ```
   Nome: OPENAI_API_KEY
   Valor: sk-... (sua chave OpenAI completa)
   ```

4. **Salvar e Reiniciar:**
   - Clique em "Save"
   - Vá para aba "Functions"
   - Encontre "chat-assistant"
   - Clique nos 3 pontos (⋯) → "Restart"

### **ETAPA 4: Testar a Correção**

Execute o teste de conexão:

```bash
node scripts/test-ai-connection.js
```

**Resultado Esperado:**
```
✅ Conectividade com Supabase: OK
✅ ChatBot Edge Function: FUNCIONANDO
✅ OpenAI: Configurada corretamente
✅ ChatBot: MODO ONLINE
```

### **ETAPA 5: Verificar na Produção**

1. **Acesse o App:**
   ```
   https://msribeiro2010.github.io/napje-painel-atalhos/
   ```

2. **Teste o ChatBot:**
   - Abra o ChatBot
   - Envie uma mensagem
   - Verifique se saiu do "Modo Offline"

---

## ✅ **INDICADORES DE SUCESSO**

### **❌ ANTES (Problema):**
- Badge: "Modo Offline - Conectividade limitada"
- Erro 401: Invalid JWT
- Edge Function inaccessível
- Sem respostas da IA

### **✅ DEPOIS (Funcionando):**
- Badge: "Busca Inteligente" ou "Base Interna"
- Status 200: Requisições OK
- Edge Function respondendo
- IA da OpenAI funcionando

---

## 🔍 **TROUBLESHOOTING**

### **Se ainda não funcionar:**

1. **Verificar Chave OpenAI:**
   - Formato correto: `sk-...`
   - Conta com créditos
   - Chave não expirada

2. **Limpar Cache:**
   - Ctrl+F5 no navegador
   - Limpar localStorage
   - Recarregar página

3. **Verificar Logs:**
   - Supabase → Edge Functions → Logs
   - Console do navegador (F12)

---

## 📊 **LINKS DE ACESSO RÁPIDO**

| Recurso | URL |
|---------|-----|
| **Dashboard Supabase** | https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz |
| **API Settings** | https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz/settings/api |
| **Edge Functions** | https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz/functions |
| **App Produção** | https://msribeiro2010.github.io/napje-painel-atalhos/ |
| **OpenAI Platform** | https://platform.openai.com/api-keys |

---

## ⏱️ **TEMPO ESTIMADO**

- **Obter chaves:** 2 minutos
- **Atualizar .env:** 1 minuto  
- **Configurar OpenAI:** 3 minutos
- **Teste e validação:** 4 minutos
- **TOTAL:** ~10 minutos

---

## 💰 **CUSTOS**

**✅ Supabase:** Gratuito (dentro dos limites)  
**✅ OpenAI:** ~$0.001 por conversa (muito baixo)  
**✅ Hosting:** Gratuito (GitHub Pages)

---

## 🎯 **RESULTADO FINAL**

Após seguir todos os passos:

**De:** ⚠️ "ChatBot em Modo Offline"  
**Para:** ✅ "ChatBot Online com IA Completa"

**Funcionalidades Ativas:**
- ✅ Busca na base de conhecimento
- ✅ Consulta de chamados recentes  
- ✅ Integração com OpenAI
- ✅ Respostas contextuais
- ✅ Modo inteligente completo

---

## 📞 **SUPORTE**

Se precisar de ajuda adicional:

1. **Executar script de diagnóstico:**
   ```bash
   node scripts/fix-supabase-auth.js
   ```

2. **Verificar logs detalhados:**
   ```bash
   node scripts/test-ai-connection.js
   ```

3. **Documentação de referência:**
   - `CONFIGURAR_OPENAI_CHATBOT_ONLINE.md`
   - `GUIA_CORRECAO_SUPABASE.md`

---

**🚀 Pronto! Seu ChatBot TRT15 deve estar funcionando online com IA completa!**