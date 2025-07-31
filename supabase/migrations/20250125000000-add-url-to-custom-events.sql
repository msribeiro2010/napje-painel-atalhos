-- Adicionar campo URL aos eventos personalizados
ALTER TABLE public.user_custom_events
ADD COLUMN IF NOT EXISTS url TEXT;
