-- Adicionar campos de credenciais e URL à tabela important_memories
-- Estes campos são usados para armazenar senhas e links de sistemas importantes

-- Adicionar campos faltantes
ALTER TABLE public.important_memories 
ADD COLUMN username text,
ADD COLUMN password text,
ADD COLUMN url text;

-- Comentários para documentação
COMMENT ON COLUMN public.important_memories.username IS 'Nome de usuário para sistemas/serviços';
COMMENT ON COLUMN public.important_memories.password IS 'Senha para sistemas/serviços (deve ser criptografada no frontend)';
COMMENT ON COLUMN public.important_memories.url IS 'URL do sistema/serviço ou link relacionado';

-- Criar índices para performance (opcional)
CREATE INDEX IF NOT EXISTS idx_important_memories_url ON public.important_memories(url) WHERE url IS NOT NULL;