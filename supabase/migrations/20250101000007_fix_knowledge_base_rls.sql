-- Temporariamente desabilitar RLS para desenvolvimento
-- Isso permite inserções na base de conhecimento sem autenticação
ALTER TABLE base_conhecimento DISABLE ROW LEVEL SECURITY;

-- Criar bucket de storage se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge-base-files', 'knowledge-base-files', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage (caso não existam)
DO $$ 
BEGIN
    -- Política para visualizar arquivos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Todos podem visualizar arquivos da base de conhecimento'
    ) THEN
        CREATE POLICY "Todos podem visualizar arquivos da base de conhecimento" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'knowledge-base-files');
    END IF;

    -- Política para upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem fazer upload de arquivos'
    ) THEN
        CREATE POLICY "Usuários autenticados podem fazer upload de arquivos" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (bucket_id = 'knowledge-base-files');
    END IF;

    -- Política para atualizar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem atualizar arquivos'
    ) THEN
        CREATE POLICY "Usuários autenticados podem atualizar arquivos" 
        ON storage.objects 
        FOR UPDATE 
        USING (bucket_id = 'knowledge-base-files');
    END IF;

    -- Política para deletar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem deletar arquivos'
    ) THEN
        CREATE POLICY "Usuários autenticados podem deletar arquivos" 
        ON storage.objects 
        FOR DELETE 
        USING (bucket_id = 'knowledge-base-files');
    END IF;
END $$;