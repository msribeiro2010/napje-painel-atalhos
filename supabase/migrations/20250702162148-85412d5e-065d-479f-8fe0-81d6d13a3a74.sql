-- Configurar storage para upload de PDFs da base de conhecimento
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge-base-files', 'knowledge-base-files', true);

-- Política para visualizar arquivos da base de conhecimento
CREATE POLICY "Todos podem visualizar arquivos da base de conhecimento" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'knowledge-base-files');

-- Política para upload de arquivos da base de conhecimento
CREATE POLICY "Usuários autenticados podem fazer upload de arquivos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-base-files');

-- Política para atualizar arquivos da base de conhecimento
CREATE POLICY "Usuários autenticados podem atualizar arquivos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'knowledge-base-files');

-- Política para deletar arquivos da base de conhecimento
CREATE POLICY "Usuários autenticados podem deletar arquivos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'knowledge-base-files');