-- Criar tabela aniversariantes
CREATE TABLE public.aniversariantes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  data_nascimento date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.aniversariantes ENABLE ROW LEVEL SECURITY;

-- Políticas para aniversariantes (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Todos podem visualizar aniversariantes"
ON public.aniversariantes
FOR SELECT
USING (true);

CREATE POLICY "Apenas admins podem inserir aniversariantes"
ON public.aniversariantes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Apenas admins podem atualizar aniversariantes"
ON public.aniversariantes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Apenas admins podem excluir aniversariantes"
ON public.aniversariantes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_updated_at_aniversariantes
  BEFORE UPDATE ON public.aniversariantes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();