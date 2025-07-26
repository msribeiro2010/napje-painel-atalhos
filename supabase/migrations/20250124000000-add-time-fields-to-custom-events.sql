-- Adicionar campos de horário de início e fim na tabela user_custom_events
ALTER TABLE public.user_custom_events 
ADD COLUMN start_time time,
ADD COLUMN end_time time;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN public.user_custom_events.start_time IS 'Horário de início do evento (formato HH:MM)';
COMMENT ON COLUMN public.user_custom_events.end_time IS 'Horário de fim do evento (formato HH:MM)';