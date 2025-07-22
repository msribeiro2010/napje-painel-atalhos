-- Remove políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Criar função security definer para verificar se é o próprio usuário
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Criar políticas RLS usando a função security definer
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