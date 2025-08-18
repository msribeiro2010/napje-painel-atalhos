-- Adicionar campo de status para aprovação manual
-- Novos usuários ficam pendentes até aprovação do admin

ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente' 
CHECK (status IN ('pendente', 'aprovado', 'rejeitado'));

-- Adicionar data de aprovação para controle
ALTER TABLE public.profiles 
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Atualizar usuários existentes como aprovados
UPDATE public.profiles SET status = 'aprovado', approved_at = NOW();

-- Criar índice para performance
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Atualizar RLS policies para só permitir acesso a usuários aprovados
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

-- Nova policy: usuários só podem ver próprio perfil se aprovados
CREATE POLICY "Usuários aprovados podem ver próprio perfil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id AND status = 'aprovado');

-- Nova policy: usuários aprovados podem atualizar próprio perfil (exceto status)
CREATE POLICY "Usuários aprovados podem atualizar próprio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id AND status = 'aprovado')
WITH CHECK (auth.uid() = id AND status = 'aprovado');

-- Policy para admins gerenciarem usuários
CREATE POLICY "Admins podem gerenciar todos os perfis" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true AND p.status = 'aprovado'
  )
);

-- Atualizar políticas das outras tabelas para só usuários aprovados
DROP POLICY IF EXISTS "Permitir acesso total aos chamados" ON public.chamados;
CREATE POLICY "Usuários aprovados podem acessar chamados" 
ON public.chamados 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND status = 'aprovado'
  )
);

DROP POLICY IF EXISTS "Permitir acesso total à base de conhecimento" ON public.base_conhecimento;
CREATE POLICY "Usuários aprovados podem acessar base conhecimento" 
ON public.base_conhecimento 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND status = 'aprovado'
  )
);