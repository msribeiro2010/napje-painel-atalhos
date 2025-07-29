# 🚀 Deploy da Edge Function Atualizada

## 📋 O que foi Atualizado

A Edge Function `chat-assistant` foi **significativamente melhorada** com:

- 🌐 **Busca inteligente na internet** de fontes oficiais
- 🧠 **Decisão automática** de quando buscar informações externas  
- 🎯 **Priorização** de informações internas vs externas
- 📊 **Logs aprimorados** para monitoramento

## 🔧 Como Fazer o Deploy Manual

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. **Acesse o Dashboard**:
   - Vá para: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz
   - Entre na seção "Edge Functions"

2. **Localize a função `chat-assistant`**:
   - Clique na função existente
   - Clique em "Edit Function" ou "Update"

3. **Substitua o código**:
   - Copie todo o conteúdo do arquivo `supabase/functions/chat-assistant/index.ts`
   - Cole no editor do dashboard
   - Clique em "Save" ou "Deploy"

### Opção 2: Via Supabase CLI (se conseguir acesso)

```bash
# Fazer login novamente
supabase login

# Tentar deploy
supabase functions deploy chat-assistant --project-ref zpufcvesenbhtmizmjiz
```

### Opção 3: Recriar a Função

Se necessário, você pode deletar e recriar:

1. **Delete a função atual** no dashboard
2. **Crie uma nova função** chamada `chat-assistant`
3. **Cole o código atualizado**
4. **Configure as variáveis de ambiente**:
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## ✅ Verificar se o Deploy Funcionou

### Teste 1: Pergunta Simples (sem busca web)
```bash
curl -X POST "https://zpufcvesenbhtmizmjiz.supabase.co/functions/v1/chat-assistant" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdWZjdmVzZW5iaHRtaXptaml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDY5ODMsImV4cCI6MjA2NTA4Mjk4M30.aD0E3fkuTjaYnHRdWpYjCk_hPK-sKhVT2VdIfXy3Hy8" \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como você está?"}'
```

### Teste 2: Pergunta que Aciona Busca Web
```bash
curl -X POST "https://zpufcvesenbhtmizmjiz.supabase.co/functions/v1/chat-assistant" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdWZjdmVzZW5iaHRtaXptaml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDY5ODMsImV4cCI6MjA2NTA4Mjk4M30.aD0E3fkuTjaYnHRdWpYjCk_hPK-sKhVT2VdIfXy3Hy8" \
  -H "Content-Type: application/json" \
  -d '{"message": "Quais são as novas atualizações do PJe em 2025?"}'
```

## 📊 Verificar Logs

Após o deploy, monitore os logs para ver a busca web funcionando:

```bash
# Ver logs em tempo real
supabase functions logs chat-assistant --project-ref zpufcvesenbhtmizmjiz --follow

# Ou via dashboard
# https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz/functions/chat-assistant/logs
```

### O que Procurar nos Logs:
- ✅ `"Performing web search for enhanced context..."`
- ✅ `"Starting enhanced web search for: [pergunta]"`
- ✅ `"Searching: site:trt15.jus.br [pergunta]"`
- ✅ `"Web search completed. Context length: X characters"`
- ✅ `"webSearchPerformed": true`

## 🧪 Testar no Frontend

Após o deploy da Edge Function:

1. **Abra o chatbot** na aplicação
2. **Teste perguntas simples**:
   - "Olá" (não deve fazer busca web)
   - "Quem faz aniversário hoje?" (não deve fazer busca web)

3. **Teste perguntas que acionam busca web**:
   - "Quais são as novas atualizações do PJe?"
   - "Como fazer login quando dá erro?"
   - "Qual a nova resolução do CNJ sobre prazos?"
   - "O que é o sistema PJe?"

4. **Verifique as respostas**:
   - Devem ser mais completas
   - Podem mencionar "informações complementares"
   - Devem citar fontes quando usar info da web

## 🔍 Troubleshooting

### Se a busca web não funcionar:
1. **Verifique os logs** para erros de timeout
2. **Teste a conectividade** da Edge Function com a internet
3. **Verifique se o código foi deployado** corretamente

### Se houver erros de timeout:
- É normal alguns timeouts ocasionais
- A função continua funcionando com a base interna
- Logs mostrarão "Search error for [query]"

### Se as respostas não mudaram:
- Verifique se está fazendo perguntas que acionam busca web
- Confirme que o deploy foi feito corretamente
- Teste com perguntas específicas sobre "atualizações 2025"

## 📝 Código da Edge Function

O arquivo atualizado está em: `supabase/functions/chat-assistant/index.ts`

**Principais mudanças**:
- Função `searchWebContent()` completamente reescrita
- Lógica `shouldSearchWeb()` para decisão inteligente
- Prompt do sistema atualizado para priorizar fontes
- Logs aprimorados para monitoramento

---

**🎯 Após o deploy, o chatbot terá acesso a informações atualizadas da internet!**

*Lembre-se: A base de conhecimento interna sempre tem prioridade.*