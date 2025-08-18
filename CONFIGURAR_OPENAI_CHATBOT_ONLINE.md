# 🔑 Configurar OpenAI - ChatBot TRT15 Online

## 🎯 **Objetivo: Sair do Modo Offline para Modo Online**

**Status Atual:** ⚠️ Modo Offline - Conectividade limitada
**Status Desejado:** ✅ Modo Online - IA completa funcionando

---

## 📋 **Pré-requisitos**

### **1. Chave OpenAI**
- ✅ Conta OpenAI ativa
- ✅ Chave API válida (formato: `sk-...`)
- ✅ Créditos disponíveis na conta

### **2. Acesso ao Supabase**
- ✅ Projeto: `zpufcvesenbhtmizmjiz`
- ✅ Permissões administrativas
- ✅ Acesso às Edge Functions

---

## 🚀 **Passo a Passo para Configuração**

### **PASSO 1: Obter Chave OpenAI**

#### **Opção A: Criar Nova Chave**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em **"+ Create new secret key"**
4. Nomeie a chave: `TRT15-ChatBot-Production`
5. **COPIE A CHAVE** (formato: sk-xxx...)
6. ⚠️ **IMPORTANTE:** Salve em local seguro (não será exibida novamente)

#### **Opção B: Usar Chave Existente**
- Use uma chave OpenAI já criada
- Verifique se tem créditos disponíveis
- Formato deve ser: `sk-...`

---

### **PASSO 2: Configurar no Supabase**

#### **2.1 Acessar Dashboard do Supabase**
```
URL: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz
```

#### **2.2 Navegar para Edge Functions**
1. No menu lateral, clique em **"Edge Functions"**
2. Clique na aba **"Settings"** (Configurações)

#### **2.3 Adicionar Variável de Ambiente**
1. Na seção **"Environment Variables"**
2. Clique em **"Add new variable"**
3. Configure:
   ```
   Name: OPENAI_API_KEY
   Value: sk-... (sua chave OpenAI completa)
   ```
4. Clique em **"Save"**

#### **2.4 Reiniciar Edge Functions**
1. Vá para aba **"Functions"**
2. Localize a função **"chat-assistant"**
3. Clique no menu de 3 pontos (⋯)
4. Selecione **"Restart"** ou **"Redeploy"**

---

### **PASSO 3: Verificar Configuração**

#### **3.1 Testar Script de Verificação**
```bash
# No terminal do projeto
node scripts/test-ai-connection.js
```

**Resultado esperado:**
```
✅ VITE_SUPABASE_URL configurada
✅ VITE_SUPABASE_ANON_KEY configurada
✅ Conectividade com Supabase: OK
✅ OpenAI configurada nas Edge Functions
```

#### **3.2 Testar ChatBot**
1. Acesse: https://msribeiro2010.github.io/napje-painel-atalhos/
2. Abra o ChatBot
3. Envie uma mensagem de teste
4. Verifique se sai do "Modo Offline"

---

## 🔧 **Alternativa: Configuração Manual no Código**

### **Se não tiver acesso ao dashboard do Supabase:**

#### **1. Atualizar arquivo .env**
```env
# Adicionar no arquivo .env local
OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

#### **2. Atualizar Edge Function (Desenvolvimento)**
```typescript
// Em supabase/functions/chat-assistant/index.ts
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || 'sk-sua-chave-aqui';
```

**⚠️ ATENÇÃO:** Método não recomendado para produção por segurança.

---

## 🎯 **Verificação de Funcionamento**

### **Indicadores de Sucesso:**

#### **1. ChatBot Online**
- ❌ Badge: "Modo Offline"
- ✅ Badge: "Inteligente" / "Base Interna" / "Busca Web"

#### **2. Respostas da IA**
- ❌ Respostas locais padronizadas
- ✅ Respostas personalizadas e contextuais

#### **3. Console do Navegador**
- ❌ Erros de "OpenAI API key not configured"
- ✅ Logs de "OpenAI response received"

---

## 🔍 **Troubleshooting**

### **Problema 1: "OpenAI API key not configured"**
```
Solução:
1. Verificar se a chave foi salva corretamente no Supabase
2. Reiniciar a Edge Function
3. Aguardar 2-3 minutos para propagar
```

### **Problema 2: "Invalid API key"**
```
Solução:
1. Verificar formato da chave (deve começar com sk-)
2. Confirmar que a chave não expirou
3. Verificar créditos na conta OpenAI
```

### **Problema 3: "Rate limit exceeded"**
```
Solução:
1. Aguardar alguns minutos
2. Verificar limites da conta OpenAI
3. Considerar upgrade do plano OpenAI
```

### **Problema 4: Ainda em "Modo Offline"**
```
Solução:
1. Limpar cache do navegador
2. Recarregar a página
3. Verificar console para erros
4. Testar script de verificação
```

---

## 📊 **Monitoramento**

### **Verificar Logs das Edge Functions:**
1. Supabase Dashboard → Edge Functions
2. Selecionar "chat-assistant"
3. Aba "Logs"
4. Procurar por mensagens de erro ou sucesso

### **Verificar Console do Navegador:**
```javascript
// Abrir DevTools (F12) e verificar:
- Erros relacionados ao Supabase
- Mensagens de sucesso da OpenAI
- Status das requisições
```

---

## 💰 **Custos da OpenAI**

### **Estimativa de Uso:**
- **Modelo:** GPT-4o-mini (econômico)
- **Custo:** ~$0.001 por conversa
- **Uso médio:** 50 conversas/dia = ~$1.50/mês
- **Recomendação:** Configurar limite de $10/mês

### **Otimização de Custos:**
- ✅ Modo "Base Interna" usa 0 créditos OpenAI
- ✅ Modo "Auto" usa OpenAI apenas quando necessário
- ✅ Limite de 500 tokens por resposta
- ✅ Timeout de 30 segundos por requisição

---

## 🔐 **Segurança**

### **Boas Práticas:**
- ✅ Chave armazenada como variável de ambiente
- ✅ Não expor chave no código fonte
- ✅ Rotacionar chave periodicamente
- ✅ Monitorar uso e gastos

### **Configurações de Segurança:**
```
- Rate limiting: Ativado
- CORS: Configurado
- API key: Criptografada
- Logs: Não registram dados sensíveis
```

---

## 📞 **Suporte**

### **Se precisar de ajuda:**

1. **Verificar documentação:** Este guia completo
2. **Testar script:** `node scripts/test-ai-connection.js`
3. **Verificar logs:** Supabase Dashboard
4. **Console do navegador:** Erros técnicos

### **Contatos:**
- **Dashboard Supabase:** https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz
- **OpenAI Platform:** https://platform.openai.com/api-keys
- **Documentação OpenAI:** https://platform.openai.com/docs

---

## ✅ **Checklist Final**

```
□ Chave OpenAI obtida (sk-...)
□ Variável OPENAI_API_KEY configurada no Supabase
□ Edge Function reiniciada
□ Script de teste executado com sucesso
□ ChatBot testado e funcionando online
□ Badge mudou de "Modo Offline" para modo normal
□ Respostas da IA funcionando corretamente
```

---

**🎯 Resultado Esperado:**
**ChatBot TRT15 funcionando online com IA completa!**

**De:** ⚠️ "Modo Offline - Conectividade limitada"
**Para:** ✅ "Busca Inteligente" com IA da OpenAI funcionando

**🚀 Pronto para uso completo!**