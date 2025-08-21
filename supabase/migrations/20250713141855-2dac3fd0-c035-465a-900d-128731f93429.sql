-- Habilitar RLS nas tabelas aniversariantes e feriados
ALTER TABLE public.aniversariantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;

-- Políticas para aniversariantes (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Todos podem visualizar aniversariantes" 
ON public.aniversariantes 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem inserir aniversariantes" 
ON public.aniversariantes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

CREATE POLICY "Apenas admins podem atualizar aniversariantes" 
ON public.aniversariantes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

CREATE POLICY "Apenas admins podem excluir aniversariantes" 
ON public.aniversariantes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

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