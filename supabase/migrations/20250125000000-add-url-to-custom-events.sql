-- Adicionar campo URL na tabela user_custom_events
ALTER TABLE public.user_custom_events 
ADD COLUMN url text;

-- Adicionar comentário para documentar o novo campo
COMMENT ON COLUMN public.user_custom_events.url IS 'URL/link relacionado ao evento (opcional)';