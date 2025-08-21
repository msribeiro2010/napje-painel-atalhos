-- Migração inicial para criar todas as tabelas necessárias

-- Remover tabelas existentes se necessário
DROP TABLE IF EXISTS public.user_custom_events CASCADE;
DROP TABLE IF EXISTS public.user_work_calendar CASCADE;
DROP TABLE IF EXISTS public.media_files CASCADE;
DROP TABLE IF EXISTS public.important_memories CASCADE;
DROP TABLE IF EXISTS public.shortcuts CASCADE;
DROP TABLE IF EXISTS public.chamados CASCADE;
DROP TABLE IF EXISTS public.base_conhecimento CASCADE;
DROP TABLE IF EXISTS public.postit_notes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Criar tabela profiles
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  nome_completo text,
  avatar_url text,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id)
);

-- Criar tabela base_conhecimento
CREATE TABLE public.base_conhecimento (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  conteudo text,
  problema_descricao text,
  solucao text,
  categoria text,
  tags text[],
  arquivo_url text,
  arquivo_print text,
  media_files jsonb,
  visualizacoes integer DEFAULT 0,
  util_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  notificacao_semanal boolean DEFAULT false,
  mensagem_notificacao text
);

-- Criar tabela chamados
CREATE TABLE public.chamados (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resumo text NOT NULL,
  grau text,
  orgao_julgador text,
  perfil_usuario_afetado text,
  cpf_usuario_afetado text,
  nome_usuario_afetado text,
  processos text,
  notas text,
  chamado_origem text,
  descricao_gerada text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Criar tabela important_memories
CREATE TABLE public.important_memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  notes text,
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Criar tabela media_files
CREATE TABLE public.media_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid REFERENCES public.important_memories(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela shortcuts
CREATE TABLE public.shortcuts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  icon text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Criar tabela user_work_calendar
CREATE TABLE public.user_work_calendar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_working_day boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Criar tabela user_custom_events
CREATE TABLE public.user_custom_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time,
  end_time time,
  url text,
  color text DEFAULT '#3b82f6',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela postit_notes
CREATE TABLE public.postit_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  color text DEFAULT '#fbbf24',
  position jsonb DEFAULT '{"x": 100, "y": 100}',
  size jsonb DEFAULT '{"width": 288, "height": 208}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_conhecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortcuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_work_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postit_notes ENABLE ROW LEVEL SECURITY;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_chamados_created_at ON public.chamados(created_at);
CREATE INDEX IF NOT EXISTS idx_important_memories_user_id ON public.important_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_important_memories_category ON public.important_memories(category);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_base_conhecimento
  BEFORE UPDATE ON public.base_conhecimento
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_important_memories
  BEFORE UPDATE ON public.important_memories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_shortcuts
  BEFORE UPDATE ON public.shortcuts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_work_calendar
  BEFORE UPDATE ON public.user_work_calendar
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_custom_events
  BEFORE UPDATE ON public.user_custom_events
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_postit_notes
  BEFORE UPDATE ON public.postit_notes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();