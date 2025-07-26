-- Remove colunas de notificação semanal da tabela base_conhecimento
ALTER TABLE public.base_conhecimento 
DROP COLUMN IF EXISTS notificacao_semanal,
DROP COLUMN IF EXISTS mensagem_notificacao;