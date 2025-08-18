-- Adicionar política para permitir DELETE na tabela chamados

-- Política para usuários poderem excluir seus próprios chamados
CREATE POLICY "Usuários podem excluir seus próprios chamados" 
ON public.chamados 
FOR DELETE 
USING (created_by = auth.uid());

-- Política para admins poderem excluir qualquer chamado
CREATE POLICY "Admins podem excluir qualquer chamado" 
ON public.chamados 
FOR DELETE 
USING (public.is_admin());