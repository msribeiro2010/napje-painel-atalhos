-- Adicionar campos para notificações semanais na tabela base_conhecimento
ALTER TABLE base_conhecimento 
ADD COLUMN IF NOT EXISTS notificacao_semanal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mensagem_notificacao TEXT;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN base_conhecimento.notificacao_semanal IS 'Indica se este item deve gerar notificações semanais';
COMMENT ON COLUMN base_conhecimento.mensagem_notificacao IS 'Mensagem personalizada para a notificação semanal';

-- Criar índice para melhorar performance das consultas de notificação
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_notificacao_semanal 
ON base_conhecimento(notificacao_semanal) 
WHERE notificacao_semanal = TRUE;

-- Atualizar a política RLS para incluir os novos campos
DROP POLICY IF EXISTS "Usuários aprovados podem acessar base conhecimento" ON base_conhecimento;
CREATE POLICY "Usuários aprovados podem acessar base conhecimento" 
ON base_conhecimento 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND status = 'aprovado'
  )
);