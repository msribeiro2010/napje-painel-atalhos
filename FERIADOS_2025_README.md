# 📅 Sistema de Feriados 2025 - Guia de Implementação

## 🎯 Resumo

Foi implementado um sistema completo para gerenciar feriados de 2025 no calendário do NAPJE, incluindo:

- ✅ Arquivo JSON com todos os 13 feriados nacionais de 2025
- ✅ Script de importação automatizada
- ✅ Interface administrativa para importação via web
- ✅ Integração com o calendário existente

## 📁 Arquivos Criados

### 1. `feriados_2025.json`
```json
[
  { "data": "2025-01-01", "descricao": "Confraternização Universal", "tipo": "nacional" },
  { "data": "2025-02-17", "descricao": "Carnaval", "tipo": "nacional" },
  // ... 12 feriados nacionais
]
```

### 2. `scripts/import-feriados-2025.cjs`
Script Node.js para importação automatizada via linha de comando.

### 3. `src/components/admin/ImportFeriados2025.tsx`
Componente React para importação via interface administrativa.

## 🚀 Como Usar

### Opção 1: Interface Administrativa (Recomendado)

1. **Acesse a página de administração:**
   ```
   http://localhost:5173/admin/holidays
   ```

2. **Clique na aba "Feriados 2025"**

3. **Verifique o status atual:**
   - Clique em "Verificar Status" para ver quantos feriados já estão cadastrados

4. **Importe os feriados:**
   - Clique em "Importar Feriados de 2025"
   - O sistema irá substituir automaticamente feriados existentes
   - Aguarde a confirmação de sucesso

### Opção 2: Linha de Comando

```bash
# Executar script de importação
npm run import:feriados
```

**⚠️ Nota:** O script via linha de comando requer permissões de administrador no Supabase.

## 🔧 Funcionalidades

### ✨ Interface Administrativa
- **Verificação de Status:** Mostra quantos feriados já estão cadastrados
- **Importação Segura:** Substitui feriados existentes automaticamente
- **Feedback Visual:** Alertas e confirmações em tempo real
- **Lista Detalhada:** Visualização de todos os feriados que serão importados
- **Invalidação de Cache:** Atualiza automaticamente o calendário

### 📋 Feriados Incluídos (2025)
1. **01/01** - Confraternização Universal
2. **17/02** - Carnaval
3. **18/02** - Carnaval
4. **18/04** - Sexta-feira Santa
5. **21/04** - Tiradentes
6. **01/05** - Dia do Trabalhador
7. **19/06** - Corpus Christi
8. **07/09** - Independência do Brasil
9. **12/10** - Nossa Senhora Aparecida
10. **27/10** - Dia do Servidor Público
11. **02/11** - Finados
12. **15/11** - Proclamação da República
13. **25/12** - Natal

## 🔄 Integração com o Sistema

### Calendário Principal
Os feriados importados aparecerão automaticamente:
- **Dashboard:** Painel "Próximos Eventos"
- **Calendário:** Página `/calendario`
- **Sugestões de IA:** Sistema de recomendação de férias

### Invalidação de Cache
Após a importação, o sistema automaticamente:
- ♻️ Invalida cache de feriados
- 🔄 Atualiza eventos do calendário
- 📅 Refresh dos próximos eventos

## 🛡️ Segurança

### Políticas RLS (Row Level Security)
- **Visualização:** Todos os usuários podem ver feriados
- **Modificação:** Apenas administradores podem importar/editar
- **Validação:** Verificação automática de permissões

### Verificação de Admin
O sistema verifica se o usuário tem:
- ✅ `is_admin = true` na tabela `profiles`
- ✅ `status = 'aprovado'`
- ✅ Sessão ativa válida

## 🐛 Troubleshooting

### Problema: "Acesso Negado"
**Solução:** Verificar se o usuário é administrador
```sql
SELECT is_admin, status FROM profiles WHERE email = 'seu@email.com';
```

### Problema: "Feriados não aparecem no calendário"
**Solução:** 
1. Aguardar alguns segundos para invalidação do cache
2. Recarregar a página
3. Verificar se a importação foi bem-sucedida

### Problema: "Erro de RLS Policy"
**Solução:** 
- Usar a interface administrativa (recomendado)
- Verificar permissões de administrador
- Confirmar que as políticas RLS estão ativas

## 📊 Monitoramento

### Verificar Importação
```sql
SELECT COUNT(*) as total_feriados_2025 
FROM feriados 
WHERE data >= '2025-01-01' AND data <= '2025-12-31';
```

### Listar Feriados Importados
```sql
SELECT data, descricao, tipo 
FROM feriados 
WHERE data >= '2025-01-01' AND data <= '2025-12-31'
ORDER BY data;
```

## 🎉 Próximos Passos

1. **Testar a importação** via interface administrativa
2. **Verificar** se os feriados aparecem no calendário
3. **Validar** as sugestões de IA para férias
4. **Documentar** para outros administradores

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs no console do navegador
2. Confirmar permissões de administrador
3. Testar com a interface administrativa
4. Verificar se o Supabase está funcionando

**✅ Sistema pronto para uso!** 🚀