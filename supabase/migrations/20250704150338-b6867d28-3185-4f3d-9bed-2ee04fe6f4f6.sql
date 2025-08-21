-- Adicionar política para admins poderem ver todos os perfis
CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true AND p.status = 'aprovado'
  )
);