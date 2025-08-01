-- Migração para corrigir estrutura das tabelas de calendário

-- Primeiro, verificar se as tabelas existem e recriar se necessário
-- com a estrutura correta

-- Recriar tabela user_work_calendar com estrutura correta
DROP TABLE IF EXISTS public.user_work_calendar CASCADE;

CREATE TABLE public.user_work_calendar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status varchar(20) NOT NULL CHECK (status IN ('presencial', 'remoto', 'ferias', 'folga', 'plantao')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Recriar tabela user_custom_events com estrutura correta
DROP TABLE IF EXISTS public.user_custom_events CASCADE;

CREATE TABLE public.user_custom_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  type varchar(32) NOT NULL, -- curso, webinario, reuniao, outro
  title varchar(128) NOT NULL,
  description text,
  start_time varchar(5), -- HH:MM format
  end_time varchar(5), -- HH:MM format  
  url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.user_work_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_events ENABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS
DROP POLICY IF EXISTS "Users can manage their own work calendar" ON public.user_work_calendar;
CREATE POLICY "Users can manage their own work calendar" 
ON public.user_work_calendar 
FOR ALL 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own custom events" ON public.user_custom_events;
CREATE POLICY "Users can manage their own custom events" 
ON public.user_custom_events 
FOR ALL 
USING (user_id = auth.uid());

-- Recriar triggers para updated_at
DROP TRIGGER IF EXISTS handle_updated_at_user_work_calendar ON public.user_work_calendar;
CREATE TRIGGER handle_updated_at_user_work_calendar
  BEFORE UPDATE ON public.user_work_calendar
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_user_custom_events ON public.user_custom_events;
CREATE TRIGGER handle_updated_at_user_custom_events
  BEFORE UPDATE ON public.user_custom_events
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_work_calendar_user_date ON public.user_work_calendar(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_custom_events_user_date ON public.user_custom_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_custom_events_type ON public.user_custom_events(type);

-- Comentários para documentação
COMMENT ON TABLE public.user_work_calendar IS 'Tabela para armazenar modalidades de trabalho dos usuários';
COMMENT ON COLUMN public.user_work_calendar.status IS 'Modalidade de trabalho: presencial, remoto, ferias, folga, plantao';

COMMENT ON TABLE public.user_custom_events IS 'Tabela para armazenar eventos personalizados dos usuários';
COMMENT ON COLUMN public.user_custom_events.type IS 'Tipo do evento: curso, webinario, reuniao, outro';
COMMENT ON COLUMN public.user_custom_events.start_time IS 'Horário de início do evento (formato HH:MM)';
COMMENT ON COLUMN public.user_custom_events.end_time IS 'Horário de fim do evento (formato HH:MM)';
COMMENT ON COLUMN public.user_custom_events.url IS 'URL/link relacionado ao evento (opcional)';