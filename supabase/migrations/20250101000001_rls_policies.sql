-- Políticas RLS e funções de segurança

-- Função para verificar se é o dono do perfil
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Função para verificar se o usuário está aprovado
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND status = 'aprovado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas para profiles
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

CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins podem gerenciar todos os perfis" 
ON public.profiles 
FOR ALL 
USING (public.is_admin());

-- Políticas para base_conhecimento
CREATE POLICY "Usuários aprovados podem ver base de conhecimento" 
ON public.base_conhecimento 
FOR SELECT 
USING (public.is_approved_user());

CREATE POLICY "Admins podem gerenciar base de conhecimento" 
ON public.base_conhecimento 
FOR ALL 
USING (public.is_admin());

-- Políticas para chamados
CREATE POLICY "Usuários aprovados podem ver chamados" 
ON public.chamados 
FOR SELECT 
USING (public.is_approved_user());

CREATE POLICY "Usuários aprovados podem criar chamados" 
ON public.chamados 
FOR INSERT 
WITH CHECK (public.is_approved_user() AND created_by = auth.uid());

CREATE POLICY "Usuários podem editar seus próprios chamados" 
ON public.chamados 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Admins podem gerenciar todos os chamados" 
ON public.chamados 
FOR ALL 
USING (public.is_admin());

-- Políticas para important_memories
CREATE POLICY "Users can manage their own memories" 
ON public.important_memories 
FOR ALL 
USING (user_id = auth.uid());

-- Políticas para media_files
CREATE POLICY "Users can manage media files of their memories" 
ON public.media_files 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.important_memories 
    WHERE id = media_files.memory_id AND user_id = auth.uid()
  )
);

-- Políticas para shortcuts
CREATE POLICY "Usuários aprovados podem ver shortcuts" 
ON public.shortcuts 
FOR SELECT 
USING (public.is_approved_user());

CREATE POLICY "Admins podem gerenciar shortcuts" 
ON public.shortcuts 
FOR ALL 
USING (public.is_admin());

-- Políticas para user_work_calendar
CREATE POLICY "Users can manage their own work calendar" 
ON public.user_work_calendar 
FOR ALL 
USING (user_id = auth.uid());

-- Políticas para user_custom_events
CREATE POLICY "Users can manage their own custom events" 
ON public.user_custom_events 
FOR ALL 
USING (user_id = auth.uid());

-- Políticas para postit_notes
CREATE POLICY "Users can manage their own postit notes" 
ON public.postit_notes 
FOR ALL 
USING (user_id = auth.uid());