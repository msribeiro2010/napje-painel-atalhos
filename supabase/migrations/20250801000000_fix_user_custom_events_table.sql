-- Verificar e corrigir a estrutura da tabela user_custom_events

-- Primeiro, vamos garantir que a tabela existe com a estrutura correta
DO $$ 
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_custom_events') THEN
        -- Criar a tabela se não existir
        CREATE TABLE public.user_custom_events (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            date date NOT NULL,
            type varchar(32) NOT NULL,
            title varchar(128) NOT NULL,
            description text,
            start_time time,
            end_time time,
            url text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Verificar e adicionar colunas que podem estar faltando
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_custom_events' AND column_name = 'start_time') THEN
        ALTER TABLE public.user_custom_events ADD COLUMN start_time time;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_custom_events' AND column_name = 'end_time') THEN
        ALTER TABLE public.user_custom_events ADD COLUMN end_time time;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_custom_events' AND column_name = 'url') THEN
        ALTER TABLE public.user_custom_events ADD COLUMN url text;
    END IF;
END $$;

-- Garantir que o RLS está habilitado
ALTER TABLE public.user_custom_events ENABLE ROW LEVEL SECURITY;

-- Recriar a política se necessário
DROP POLICY IF EXISTS "Users can manage their own custom events" ON public.user_custom_events;
CREATE POLICY "Users can manage their own custom events" 
ON public.user_custom_events 
FOR ALL 
USING (user_id = auth.uid());

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_custom_events_user_id ON public.user_custom_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_events_date ON public.user_custom_events(date);
CREATE INDEX IF NOT EXISTS idx_user_custom_events_user_date ON public.user_custom_events(user_id, date);

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_custom_events_updated_at ON public.user_custom_events;
CREATE TRIGGER update_user_custom_events_updated_at
    BEFORE UPDATE ON public.user_custom_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();