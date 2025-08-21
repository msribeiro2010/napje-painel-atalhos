-- Remover a política problemática
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;

-- Criar função security definer para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar a política usando a função
CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());