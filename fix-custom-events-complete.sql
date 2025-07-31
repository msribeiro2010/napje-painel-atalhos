-- ============================================
-- Script COMPLETO para corrigir eventos personalizados
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.user_custom_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  type varchar(32) NOT NULL, -- curso, webinario, reuniao, outro
  title varchar(128) NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Adicionar campos em falta se não existirem
ALTER TABLE public.user_custom_events 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS url TEXT;

-- 3. Habilitar RLS
ALTER TABLE public.user_custom_events ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own custom events" ON public.user_custom_events;
DROP POLICY IF EXISTS "Users can create their own custom events" ON public.user_custom_events;  
DROP POLICY IF EXISTS "Users can update their own custom events" ON public.user_custom_events;
DROP POLICY IF EXISTS "Users can delete their own custom events" ON public.user_custom_events;

-- 5. Criar políticas RLS corretas
CREATE POLICY "Users can view their own custom events"
ON public.user_custom_events
FOR SELECT  
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own custom events"
ON public.user_custom_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom events"  
ON public.user_custom_events
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own custom events"
ON public.user_custom_events
FOR DELETE
TO authenticated  
USING (user_id = auth.uid());

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_custom_events_user_date 
ON public.user_custom_events(user_id, date);

CREATE INDEX IF NOT EXISTS idx_user_custom_events_date 
ON public.user_custom_events(date);

-- 7. Teste de inserção (descomente e ajuste o USER_ID)
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo seu ID real do Supabase Auth

/*
-- Para encontrar seu USER_ID, execute esta query primeiro:
SELECT auth.uid() as current_user_id;

-- Depois substitua o ID na linha abaixo e descomente:
INSERT INTO public.user_custom_events (user_id, date, type, title, description)
VALUES ('SEU_USER_ID_AQUI', '2025-08-04', 'curso', 'Teste de Evento para 04/08/2025', 'Evento de teste para verificar funcionamento')
ON CONFLICT DO NOTHING;
*/

-- 8. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_custom_events' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_custom_events';

SELECT 'Tabela user_custom_events configurada com sucesso!' as status;
SELECT 'Para testar, crie um evento no calendário para o dia 04/08/2025' as instrucao;