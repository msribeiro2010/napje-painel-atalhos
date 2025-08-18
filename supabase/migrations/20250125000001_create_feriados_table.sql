-- Criar tabela feriados
CREATE TABLE public.feriados (
  id serial PRIMARY KEY,
  data date NOT NULL,
  descricao text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('nacional', 'estadual', 'municipal')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;

-- Políticas para feriados (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Todos podem visualizar feriados" 
ON public.feriados 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem inserir feriados" 
ON public.feriados 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

CREATE POLICY "Apenas admins podem atualizar feriados" 
ON public.feriados 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

CREATE POLICY "Apenas admins podem excluir feriados" 
ON public.feriados 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_updated_at_feriados
  BEFORE UPDATE ON public.feriados
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Adicionar constraint para evitar duplicatas
ALTER TABLE feriados 
ADD CONSTRAINT unique_feriado_data_descricao UNIQUE (data, descricao);

-- Inserir alguns feriados básicos de 2025
INSERT INTO feriados (data, descricao, tipo) VALUES
('2025-01-01', 'Ano Novo', 'nacional'),
('2025-04-21', 'Tiradentes', 'nacional'),
('2025-05-01', 'Dia do Trabalho', 'nacional'),
('2025-09-07', 'Independência do Brasil', 'nacional'),
('2025-10-12', 'Nossa Senhora Aparecida', 'nacional'),
('2025-11-02', 'Finados', 'nacional'),
('2025-11-15', 'Proclamação da República', 'nacional'),
('2025-12-25', 'Natal', 'nacional')
ON CONFLICT (data, descricao) DO NOTHING;