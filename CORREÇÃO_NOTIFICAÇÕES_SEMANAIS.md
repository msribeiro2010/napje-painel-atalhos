# Correção - Notificações Semanais

## Problema Identificado

**Erro**: `42703: column "dayOfWeek" does not exist`

**Causa**: A tabela `weekly_notifications` não possui as colunas `dayofweek` e `time` necessárias para o funcionamento das notificações com agendamento.

## Solução Implementada

### 1. Problema de Schema - Colunas Faltando
**Causa**: As migrações que adicionam as colunas de agendamento não foram aplicadas no banco de produção.

**Solução**: 
- ✅ Criado script SQL robusto para adicionar as colunas necessárias
- ✅ Removidos campos duplicados da interface
- ✅ Atualizado arquivo de tipos do Supabase

### 2. Interface Simplificada
**Melhorias aplicadas**:
- ✅ Removidos campos duplicados do modal principal
- ✅ Campos de agendamento aparecem apenas no dialog de criar/editar
- ✅ Visualização clara do agendamento nos cards das notificações

## ⚡ COMO CORRIGIR O PROBLEMA

### Execute este script no Supabase Dashboard > SQL Editor:

```sql
-- Script para corrigir a tabela weekly_notifications
-- Adiciona as colunas necessárias se elas não existirem

-- Adicionar as colunas que estão faltando
ALTER TABLE public.weekly_notifications 
ADD COLUMN IF NOT EXISTS dayofweek integer DEFAULT 1;

ALTER TABLE public.weekly_notifications 
ADD COLUMN IF NOT EXISTS time text DEFAULT '09:00';

-- Adicionar constraints de validação
DO $$
BEGIN
    -- Constraint para dayofweek (0-6)
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'weekly_notifications_dayofweek_check') THEN
        ALTER TABLE public.weekly_notifications 
        ADD CONSTRAINT weekly_notifications_dayofweek_check 
        CHECK (dayofweek >= 0 AND dayofweek <= 6);
    END IF;
    
    -- Constraint para time (formato HH:MM)
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'weekly_notifications_time_check') THEN
        ALTER TABLE public.weekly_notifications 
        ADD CONSTRAINT weekly_notifications_time_check 
        CHECK (time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');
    END IF;
END $$;

-- Atualizar registros existentes
UPDATE public.weekly_notifications 
SET dayofweek = 1 WHERE dayofweek IS NULL;

UPDATE public.weekly_notifications 
SET time = '09:00' WHERE time IS NULL;

-- Tornar as colunas obrigatórias
ALTER TABLE public.weekly_notifications 
ALTER COLUMN dayofweek SET NOT NULL;

ALTER TABLE public.weekly_notifications 
ALTER COLUMN time SET NOT NULL;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.weekly_notifications.dayofweek IS 'Day of the week for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
COMMENT ON COLUMN public.weekly_notifications.time IS 'Time for notification in HH:MM format (24-hour)';
```

### OU use o script completo:

Se preferir, execute o arquivo `FIX_WEEKLY_NOTIFICATIONS.sql` que está na raiz do projeto. Ele contém a correção completa incluindo criação da tabela se não existir.

## Arquivos Modificados

### 1. Migração Robusta
- `/workspace/supabase/migrations/20250129000001_ensure_weekly_notifications_columns.sql`
- `/workspace/FIX_WEEKLY_NOTIFICATIONS.sql` (script direto)

### 2. Tipos Atualizados
- `/workspace/src/integrations/supabase/types.ts`: Adicionadas colunas `dayofweek` e `time`

### 3. Interface Simplificada
- `/workspace/src/components/weekly-notifications/WeeklyNotificationsManager.tsx`: 
  - Removidos campos duplicados de agendamento
  - Adicionada visualização do agendamento nos cards

## Testando a Correção

1. **Execute o script SQL** no Supabase Dashboard
2. **Abra a seção "Notificações Semanais"** na aplicação
3. **Clique em "Nova Notificação"**
4. **Preencha todos os campos** incluindo dia da semana e horário
5. **Salve a notificação**
6. **Verifique** se a notificação aparece na lista com o agendamento correto

## Resultado Esperado

- ✅ Erro `column "dayOfWeek" does not exist` resolvido
- ✅ Possibilidade de criar novas notificações
- ✅ Interface mais limpa sem campos duplicados
- ✅ Visualização clara do agendamento de cada notificação

## Estrutura Final da Tabela

Após a correção, a tabela `weekly_notifications` terá estas colunas:

- `id` (uuid, PRIMARY KEY)
- `titulo` (text, NOT NULL)
- `mensagem` (text, NOT NULL) 
- `ativo` (boolean, DEFAULT true)
- `dayofweek` (integer, NOT NULL, 0-6)
- `time` (text, NOT NULL, formato HH:MM)
- `created_at` (timestamp)
- `updated_at` (timestamp)