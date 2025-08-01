-- Habilitar RLS na tabela user_custom_events
ALTER TABLE public.user_custom_events ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seus próprios eventos  
CREATE POLICY "Users can view their own custom events"
ON public.user_custom_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Política para que usuários criem apenas seus próprios eventos
CREATE POLICY "Users can create their own custom events"  
ON public.user_custom_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Política para que usuários atualizem apenas seus próprios eventos
CREATE POLICY "Users can update their own custom events"
ON public.user_custom_events
FOR UPDATE  
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para que usuários deletem apenas seus próprios eventos
CREATE POLICY "Users can delete their own custom events"
ON public.user_custom_events
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
