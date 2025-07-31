-- Script para corrigir a tabela user_custom_events
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar campos em falta se não existirem
ALTER TABLE public.user_custom_events 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS url TEXT;

-- 2. Habilitar RLS se não estiver habilitado
ALTER TABLE public.user_custom_events ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own custom events" ON public.user_custom_events;
DROP POLICY IF EXISTS "Users can create their own custom events" ON public.user_custom_events;  
DROP POLICY IF EXISTS "Users can update their own custom events" ON public.user_custom_events;
DROP POLICY IF EXISTS "Users can delete their own custom events" ON public.user_custom_events;

-- 4. Criar novas políticas
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

-- 5. Teste inserindo um evento de exemplo (substitua USER_ID pelo seu ID)
-- INSERT INTO public.user_custom_events (user_id, date, type, title, description)
-- VALUES ('YOUR_USER_ID', '2025-08-04', 'curso', 'Teste de Evento', 'Evento de teste para verificar funcionamento');

SELECT 'Tabela user_custom_events corrigida com sucesso!' as status;
