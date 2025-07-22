-- Remove TODAS as políticas existentes na tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários aprovados podem atualizar próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários aprovados podem ver próprio perfil" ON public.profiles;

-- Criar funções security definer para evitar recursão
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_admin_status()
RETURNS RECORD AS $$
DECLARE
  result RECORD;
BEGIN
  SELECT is_admin, status INTO result
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar políticas sem recursão
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (public.is_profile_owner(id));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (public.is_profile_owner(id));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_profile_owner(id));