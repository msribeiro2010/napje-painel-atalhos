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

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_weekly_notifications_updated_at
    BEFORE UPDATE ON public.weekly_notifications
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Nota: As colunas mensagem_notificacao e notificacao_semanal foram removidas da tabela base_conhecimento
-- A migração de dados não é mais necessária pois essas colunas não existem mais

-- Comentário sobre a migração
COMMENT ON TABLE public.weekly_notifications IS 'Tabela para gerenciar notificações semanais separadamente da base de conhecimento';