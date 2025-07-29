# 🌐 Chatbot com Busca na Internet - TRT15

## 🚀 Nova Funcionalidade Implementada

O chatbot agora possui capacidade **inteligente de busca na internet** para complementar a base de conhecimento interna com informações atualizadas de fontes oficiais.

## 🧠 Como Funciona

### 1. **Decisão Inteligente de Busca**
O sistema decide automaticamente quando fazer busca na internet baseado em palavras-chave:

#### Triggers para Busca Web:
- **Informações atuais**: "novo", "atualização", "mudança", "2025", "recente"
- **Procedimentos**: "como fazer", "passo a passo", "tutorial", "guia"
- **Problemas técnicos**: "erro", "problema", "falha", "não funciona"
- **Legislação**: "lei", "decreto", "portaria", "resolução"
- **Sistemas específicos**: "trt15", "pje", "cnj", "tst"
- **Dúvidas gerais**: "o que é", "qual é", "quando", "onde"

### 2. **Fontes de Busca Priorizadas**
```
🥇 Sites Oficiais Específicos:
   - site:trt15.jus.br
   - site:cnj.jus.br
   - site:tst.jus.br
   - site:stf.jus.br
   - site:stj.jus.br

🥈 Buscas Contextualizadas:
   - "[pergunta] direito trabalhista"
   - "[pergunta] PJe processo judicial eletrônico"
   - "[pergunta] tribunal regional trabalho"
   - "[pergunta] sistema judiciário"
```

### 3. **Ordem de Prioridade das Informações**
```
1. 🥇 Base de conhecimento interna (SEMPRE PRIMEIRO)
2. 🥈 Chamados recentes similares
3. 🥉 Calendário e eventos
4. 🏅 Memórias importantes
5. 🌐 Informações da internet (complementar)
6. 📚 Conhecimento geral
```

## 💡 Exemplos de Uso

### ✅ **Perguntas que Acionam Busca Web:**

**Usuário**: "Quais são as novas atualizações do PJe em 2025?"
- ✅ Busca web ativada (palavras: "novas", "atualizações", "2025")
- 🔍 Busca em sites oficiais do CNJ, TST, TRT15
- 📋 Combina com base interna

**Usuário**: "Como fazer login no sistema quando dá erro?"
- ✅ Busca web ativada (palavras: "como fazer", "erro")
- 🔍 Busca procedimentos atualizados
- 📋 Prioriza soluções da base interna

**Usuário**: "Qual a nova resolução do CNJ sobre prazos?"
- ✅ Busca web ativada (palavras: "nova", "resolução", "CNJ")
- 🔍 Busca especificamente no site do CNJ
- 📋 Informações mais recentes

### ❌ **Perguntas que NÃO Acionam Busca Web:**

**Usuário**: "Olá, como você está?"
- ❌ Busca web não necessária
- 💬 Resposta baseada apenas no contexto interno

**Usuário**: "Quem faz aniversário hoje?"
- ❌ Busca web não necessária
- 📅 Informação disponível no calendário interno

## 🔧 Configuração Técnica

### **Timeout e Limites**
- ⏱️ Timeout por busca: 3 segundos
- 🔢 Máximo de buscas: 8 por pergunta
- ⏳ Delay entre buscas: 200ms
- 📏 Contexto web limitado para otimização

### **APIs Utilizadas**
- **DuckDuckGo Instant Answer API**: Busca principal
- **User-Agent**: `TRT15-Assistant/1.0`
- **Formato**: JSON sem HTML

### **Tratamento de Erros**
- 🛡️ Timeout automático
- 🔄 Fallback para base interna
- 📝 Logs detalhados para debugging

## 📊 Monitoramento

### **Logs Disponíveis**
```bash
# Ver logs da Edge Function
supabase functions logs chat-assistant --project-ref zpufcvesenbhtmizmjiz
```

### **Informações nos Logs**
- ✅ Decisão de busca web (sim/não)
- 🔍 Queries de busca executadas
- 📏 Tamanho do contexto web obtido
- ⏱️ Tempo de execução das buscas
- ❌ Erros de busca (se houver)

## 🎯 Benefícios

### **Para os Usuários**
- 📈 **Informações mais atualizadas** sobre legislação e procedimentos
- 🔄 **Respostas mais completas** combinando interno + externo
- ⚡ **Busca automática** sem necessidade de comandos especiais
- 🎯 **Fontes confiáveis** apenas de sites oficiais

### **Para o Sistema**
- 🧠 **Inteligência aprimorada** do chatbot
- 📚 **Base de conhecimento expandida** dinamicamente
- 🔍 **Busca contextualizada** específica para área jurídica
- ⚖️ **Balanceamento** entre informações internas e externas

## 🚨 Importante

### **Prioridade das Informações**
- ✅ **Base interna SEMPRE tem prioridade**
- ⚠️ **Web é apenas complementar**
- 🔍 **Conflitos são sinalizados** ao usuário
- 📝 **Fonte é sempre mencionada**

### **Exemplo de Resposta**
```
Com base na nossa base de conhecimento interna, o procedimento 
para reset de senha é [procedimento interno].

Complementando com informações atualizadas do site do CNJ, 
houve uma atualização recente que [informação da web].

Recomendo seguir primeiro o procedimento interno e, se 
necessário, consultar as atualizações oficiais.
```

## 🔄 Atualizações Futuras

### **Melhorias Planejadas**
- 🎯 **Busca mais específica** por tipo de pergunta
- 📊 **Cache de buscas** frequentes
- 🔍 **Mais fontes oficiais** (Tribunais Regionais)
- 📈 **Analytics** de efetividade das buscas

---

**🎉 O chatbot agora é mais inteligente e atualizado!**

*Última atualização: 28/07/2025*