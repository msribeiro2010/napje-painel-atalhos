-- Adicionar política para permitir que admins atualizem perfis de outros usuários
CREATE POLICY "Admins podem atualizar todos os perfis" 
ON public.profiles 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());