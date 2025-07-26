-- Adicionar campo para múltiplas mídias na base de conhecimento
ALTER TABLE base_conhecimento 
ADD COLUMN media_files JSONB DEFAULT '[]'::jsonb;

-- Comentário para documentação
COMMENT ON COLUMN base_conhecimento.media_files IS 'Array JSON com informações de múltiplas imagens e vídeos: [{"id": "uuid", "url": "storage_path", "name": "filename", "type": "image|video", "size": number}]';

-- Criar índice para consultas no campo JSON
CREATE INDEX idx_base_conhecimento_media_files ON base_conhecimento USING GIN (media_files);

-- Atualizar política RLS para incluir o novo campo
DROP POLICY IF EXISTS "Users can view all knowledge base items" ON base_conhecimento;
CREATE POLICY "Users can view all knowledge base items" ON base_conhecimento
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert knowledge base items" ON base_conhecimento;
CREATE POLICY "Users can insert knowledge base items" ON base_conhecimento
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update knowledge base items" ON base_conhecimento;
CREATE POLICY "Users can update knowledge base items" ON base_conhecimento
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete knowledge base items" ON base_conhecimento;
CREATE POLICY "Users can delete knowledge base items" ON base_conhecimento
  FOR DELETE USING (true);