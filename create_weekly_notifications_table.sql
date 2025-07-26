-- SQL Script to create weekly_notifications table in production
-- Execute this in Supabase Dashboard > SQL Editor

-- Criar tabela para notificações semanais separadas
CREATE TABLE IF NOT EXISTS public.weekly_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.weekly_notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view all weekly notifications" ON public.weekly_notifications
    FOR SELECT USING (true);

CREATE POLICY "Users can insert weekly notifications" ON public.weekly_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update weekly notifications" ON public.weekly_notifications
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete weekly notifications" ON public.weekly_notifications
    FOR DELETE USING (true);

-- Criar função para updated_at se não existir
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS handle_weekly_notifications_updated_at ON public.weekly_notifications;
CREATE TRIGGER handle_weekly_notifications_updated_at
    BEFORE UPDATE ON public.weekly_notifications
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Nota: As colunas mensagem_notificacao e notificacao_semanal foram removidas da tabela base_conhecimento
-- A migração de dados não é mais necessária pois essas colunas não existem mais
-- Se houver dados antigos para migrar, eles devem ser inseridos manualmente

-- Comentário sobre a tabela
COMMENT ON TABLE public.weekly_notifications IS 'Tabela para gerenciar notificações semanais separadamente da base de conhecimento';

-- Verificar se a tabela foi criada com sucesso
SELECT 'weekly_notifications table created successfully' as status;
SELECT COUNT(*) as total_records FROM public.weekly_notifications;