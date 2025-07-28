# Correção - Notificações Semanais

## Problemas Identificados e Soluções

### 1. Erro "Could not find the 'dayofweek' column"

**Problema**: Inconsistência entre o nome da coluna no banco de dados (`dayOfWeek`) e o código TypeScript (`dayofweek`).

**Solução**: 
- Criada migração `/workspace/supabase/migrations/20250129000000_fix_dayofweek_column_name.sql` para renomear a coluna
- Atualizado o arquivo `/workspace/src/integrations/supabase/types.ts` para incluir as colunas `dayofweek` e `time`

### 2. Campos Duplicados na Interface

**Problema**: Os campos "Dia da Semana" e "Horário" apareciam tanto no modal principal quanto no dialog de nova notificação, causando confusão.

**Solução**: 
- Removidos os campos de agendamento do modal principal (`WeeklyNotificationsManager.tsx`)
- Mantidos apenas no dialog de nova/editar notificação (`WeeklyNotificationDialog.tsx`)
- Adicionada visualização do agendamento nos cards das notificações existentes

## Arquivos Modificados

### 1. Migração do Banco de Dados
```sql
-- /workspace/supabase/migrations/20250129000000_fix_dayofweek_column_name.sql
ALTER TABLE public.weekly_notifications 
RENAME COLUMN "dayOfWeek" TO dayofweek;

COMMENT ON COLUMN public.weekly_notifications.dayofweek IS 'Day of the week for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
```

### 2. Tipos do Supabase
- `/workspace/src/integrations/supabase/types.ts`: Adicionadas colunas `dayofweek` e `time`

### 3. Interface do Usuário
- `/workspace/src/components/weekly-notifications/WeeklyNotificationsManager.tsx`: 
  - Removidos campos duplicados de agendamento
  - Simplificada interface do modal principal
  - Adicionada visualização do agendamento nos cards das notificações

## Como Aplicar a Correção

### 1. Se estiver usando Supabase Local
```bash
# Aplicar a migração no banco local
npx supabase db reset --local
```

### 2. Se estiver usando Supabase em Produção
Execute o seguinte SQL no Supabase Dashboard > SQL Editor:

```sql
-- Renomear coluna para consistência
ALTER TABLE public.weekly_notifications 
RENAME COLUMN "dayOfWeek" TO dayofweek;

-- Atualizar comentário
COMMENT ON COLUMN public.weekly_notifications.dayofweek IS 'Day of the week for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
```

## Melhorias Implementadas

1. **Interface mais limpa**: Campos de agendamento aparecem apenas onde são necessários
2. **Consistência de dados**: Nome da coluna consistente entre banco e código
3. **Melhor UX**: Usuário configura dia/hora diretamente ao criar cada notificação
4. **Visualização clara**: Cards das notificações mostram quando cada uma será enviada

## Testando a Correção

1. Abra a seção "Notificações Semanais" 
2. Clique em "Nova Notificação"
3. Preencha os campos incluindo dia da semana e horário
4. Salve a notificação
5. Verifique se a notificação aparece na lista com o agendamento correto

O erro "Could not find the 'dayofweek' column" deve estar resolvido, e não deve haver mais campos duplicados na interface.