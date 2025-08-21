-- Criar tabelas para gerenciamento dinâmico de atalhos
CREATE TABLE public.shortcut_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.shortcuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.shortcut_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shortcut_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortcuts ENABLE ROW LEVEL SECURITY;

-- Policies para visualização (todos os usuários aprovados podem ver)
CREATE POLICY "Usuários aprovados podem visualizar grupos de atalhos" 
ON public.shortcut_groups 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND status = 'aprovado'
));

CREATE POLICY "Usuários aprovados podem visualizar atalhos" 
ON public.shortcuts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND status = 'aprovado'
));

-- Policies para administração (apenas admins podem modificar)
CREATE POLICY "Admins podem gerenciar grupos de atalhos" 
ON public.shortcut_groups 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

CREATE POLICY "Admins podem gerenciar atalhos" 
ON public.shortcuts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

-- Triggers para updated_at
CREATE TRIGGER update_shortcut_groups_updated_at
BEFORE UPDATE ON public.shortcut_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shortcuts_updated_at
BEFORE UPDATE ON public.shortcuts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais dos grupos existentes
INSERT INTO public.shortcut_groups (id, title, icon_name, display_order) VALUES
('planilha-presencial', 'Presencial/Plantão/Férias', 'CalendarCheck', 1),
('consulta-documentos', 'Consulta CPF/OAB/CNPJ', 'Search', 2),
('google-apps', 'Google Apps', 'Globe', 3),
('assyst-pje', 'Assyst-PJe', 'Headset', 4),
('atendimento-externo', '(0800) e Tawk.to', 'Phone', 5),
('info-funcionais', 'Relatórios de Distribuição', 'FileText', 6),
('info-holerite', 'Contra-Cheque/SISAD...', 'Cash', 7),
('trabalho-plantao', 'Requerimentos NAPJe', 'CalendarCheck', 8),
('pje-producao', 'PJe-Produção', 'Building2', 9),
('pje-incidentes', 'PJe-Incidentes', 'Bug', 10),
('pje-homologacao', 'PJe-Homologação', 'CheckCircle', 11),
('pje-treino', 'PJe-Treino', 'PersonStanding', 12),
('sistemas-administrativos', 'Sistemas Administrativos', 'Diagram3', 13),
('acesso-outros', 'Acesso a Outros Sistemas', 'Shield', 14),
('utilitarios', 'Utilitários', 'QuestionCircle', 15);

-- Inserir atalhos do grupo 'planilha-presencial'
INSERT INTO public.shortcuts (group_id, title, url, icon_name, display_order) VALUES
('planilha-presencial', 'Painel/Controle NAPJe', 'https://script.google.com/a/macros/trt15.jus.br/s/AKfycbzucXdGYLOxqBol7ri-eyT3fzXuWMdqvgnVkRuVVlV7/dev', 'Calendar', 1),
('planilha-presencial', 'GERENCIADOR DE FÉRIAS', 'https://msribeiro2010.github.io/controle-ferias/', 'CalendarCheck', 2);