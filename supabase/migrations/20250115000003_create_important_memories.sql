-- Criar tabela para memórias importantes dos usuários
CREATE TABLE public.important_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  username TEXT,
  password TEXT,
  url TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comentário da tabela
COMMENT ON TABLE public.important_memories IS 'Tabela para armazenar memórias importantes dos usuários como senhas, logins e informações pessoais';

-- Comentários das colunas
COMMENT ON COLUMN public.important_memories.title IS 'Título da memória (ex: PJe Homologação)';
COMMENT ON COLUMN public.important_memories.description IS 'Descrição detalhada da memória';
COMMENT ON COLUMN public.important_memories.category IS 'Categoria da memória (sistemas, pessoal, trabalho, etc.)';
COMMENT ON COLUMN public.important_memories.username IS 'Nome de usuário/login quando aplicável';
COMMENT ON COLUMN public.important_memories.password IS 'Senha quando aplicável (será criptografada no frontend)';
COMMENT ON COLUMN public.important_memories.url IS 'URL do sistema quando aplicável';
COMMENT ON COLUMN public.important_memories.notes IS 'Notas adicionais';
COMMENT ON COLUMN public.important_memories.is_favorite IS 'Indica se a memória é favorita';

-- Habilitar Row Level Security
ALTER TABLE public.important_memories ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - usuários só podem ver suas próprias memórias
CREATE POLICY "Users can view their own memories" 
ON public.important_memories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories" 
ON public.important_memories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" 
ON public.important_memories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
ON public.important_memories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualização automática do timestamp
CREATE TRIGGER update_important_memories_updated_at
BEFORE UPDATE ON public.important_memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_important_memories_user_id ON public.important_memories(user_id);
CREATE INDEX idx_important_memories_category ON public.important_memories(category);
CREATE INDEX idx_important_memories_is_favorite ON public.important_memories(is_favorite);