-- Script para corrigir a tabela weekly_notifications
-- Execute este script no Supabase Dashboard > SQL Editor

-- Primeiro, vamos verificar se a tabela existe e criar se necessário
CREATE TABLE IF NOT EXISTS public.weekly_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar as colunas que estão faltando
ALTER TABLE public.weekly_notifications 
ADD COLUMN IF NOT EXISTS dayofweek integer DEFAULT 1;

ALTER TABLE public.weekly_notifications 
ADD COLUMN IF NOT EXISTS time text DEFAULT '09:00';

-- Adicionar constraints
DO $$
BEGIN
    -- Add check constraint for dayofweek if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'weekly_notifications_dayofweek_check') THEN
        ALTER TABLE public.weekly_notifications 
        ADD CONSTRAINT weekly_notifications_dayofweek_check 
        CHECK (dayofweek >= 0 AND dayofweek <= 6);
    END IF;
    
    -- Add check constraint for time if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'weekly_notifications_time_check') THEN
        ALTER TABLE public.weekly_notifications 
        ADD CONSTRAINT weekly_notifications_time_check 
        CHECK (time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');
    END IF;
END $$;

-- Atualizar registros existentes que possam ter valores NULL
UPDATE public.weekly_notifications 
SET dayofweek = 1 
WHERE dayofweek IS NULL;

UPDATE public.weekly_notifications 
SET time = '09:00' 
WHERE time IS NULL;

-- Tornar as colunas NOT NULL
ALTER TABLE public.weekly_notifications 
ALTER COLUMN dayofweek SET NOT NULL;

ALTER TABLE public.weekly_notifications 
ALTER COLUMN time SET NOT NULL;

-- Adicionar comentários
COMMENT ON COLUMN public.weekly_notifications.dayofweek IS 'Day of the week for notification (0 = Sunday, 1 = Monday, ..., 6 = Saturday)';
COMMENT ON COLUMN public.weekly_notifications.time IS 'Time for notification in HH:MM format (24-hour)';

-- Habilitar RLS
ALTER TABLE public.weekly_notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (DROP IF EXISTS e CREATE)
DROP POLICY IF EXISTS "Users can view all weekly notifications" ON public.weekly_notifications;
DROP POLICY IF EXISTS "Users can insert weekly notifications" ON public.weekly_notifications;
DROP POLICY IF EXISTS "Users can update weekly notifications" ON public.weekly_notifications;
DROP POLICY IF EXISTS "Users can delete weekly notifications" ON public.weekly_notifications;

CREATE POLICY "Users can view all weekly notifications" ON public.weekly_notifications
    FOR SELECT USING (true);

CREATE POLICY "Users can insert weekly notifications" ON public.weekly_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update weekly notifications" ON public.weekly_notifications
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete weekly notifications" ON public.weekly_notifications
    FOR DELETE USING (true);

-- Criar função e trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_weekly_notifications_updated_at ON public.weekly_notifications;
CREATE TRIGGER handle_weekly_notifications_updated_at
    BEFORE UPDATE ON public.weekly_notifications
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Verificação final
SELECT 'Script executado com sucesso!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'weekly_notifications' 
ORDER BY ordinal_position;