-- Adicionar campos de horário aos eventos personalizados
ALTER TABLE public.user_custom_events
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;
