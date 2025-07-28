-- Script para corrigir a tabela important_memories
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'important_memories') THEN
        -- Se a tabela não existe, criar ela completa
        CREATE TABLE public.important_memories (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            title text NOT NULL,
            description text,
            category text NOT NULL,
            username text,
            password text,
            url text,
            notes text,
            is_favorite boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
        );
        
        -- Habilitar RLS
        ALTER TABLE public.important_memories ENABLE ROW LEVEL SECURITY;
        
        -- Criar trigger para updated_at
        CREATE TRIGGER handle_updated_at_important_memories
        BEFORE UPDATE ON public.important_memories
        FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_important_memories_user_id ON public.important_memories(user_id);
        CREATE INDEX IF NOT EXISTS idx_important_memories_category ON public.important_memories(category);
        CREATE INDEX IF NOT EXISTS idx_important_memories_url ON public.important_memories(url) WHERE url IS NOT NULL;
        
        -- Criar políticas RLS
        CREATE POLICY "Usuários podem ver suas próprias memórias" 
        ON public.important_memories 
        FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem inserir suas próprias memórias" 
        ON public.important_memories 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar suas próprias memórias" 
        ON public.important_memories 
        FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem deletar suas próprias memórias" 
        ON public.important_memories 
        FOR DELETE 
        USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Tabela important_memories criada com sucesso!';
    ELSE
        -- Se a tabela existe, adicionar colunas faltantes
        
        -- Adicionar username se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'important_memories' AND column_name = 'username') THEN
            ALTER TABLE public.important_memories ADD COLUMN username text;
            RAISE NOTICE 'Coluna username adicionada!';
        END IF;
        
        -- Adicionar password se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'important_memories' AND column_name = 'password') THEN
            ALTER TABLE public.important_memories ADD COLUMN password text;
            RAISE NOTICE 'Coluna password adicionada!';
        END IF;
        
        -- Adicionar url se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'important_memories' AND column_name = 'url') THEN
            ALTER TABLE public.important_memories ADD COLUMN url text;
            RAISE NOTICE 'Coluna url adicionada!';
        END IF;
        
        RAISE NOTICE 'Tabela important_memories atualizada com sucesso!';
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON TABLE public.important_memories IS 'Tabela para armazenar memórias importantes dos usuários como senhas, links, etc.';
COMMENT ON COLUMN public.important_memories.username IS 'Nome de usuário para sistemas/serviços';
COMMENT ON COLUMN public.important_memories.password IS 'Senha para sistemas/serviços (deve ser criptografada no frontend)';
COMMENT ON COLUMN public.important_memories.url IS 'URL do sistema/serviço ou link relacionado';

-- Verificar se tudo foi criado corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'important_memories' 
ORDER BY ordinal_position;