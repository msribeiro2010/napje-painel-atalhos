-- Criar tabela para configurações do sistema
CREATE TABLE public.system_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES auth.users(id)
);

-- Inserir configuração padrão para os links do botão "Acesso Rápido"
INSERT INTO public.system_config (key, value, description) VALUES (
  'quick_access_links',
  '[
    {
      "name": "Assyst Query 996",
      "url": "https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=996&queryProfileForm.columnProfileId=67",
      "order": 1
    },
    {
      "name": "Gmail",
      "url": "https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ifkv=AcMMx-fJZqEhabl9HDEfW2R7SrGxQKLfCcVCZrbfUkrYapnrKOuYor_ptr3gP8dRypgOM6siUZ--&rip=1&sacu=1&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-1241181511%3A1732804609017929&ddm=1",
      "order": 2
    },
    {
      "name": "Assyst Query 423",
      "url": "https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=423&queryProfileForm.columnProfileId=67",
      "order": 3
    }
  ]',
  'Configuração dos links do botão "Acesso Rápido" no Dashboard'
);

-- RLS (Row Level Security) para system_config
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ler e modificar todas as configurações
CREATE POLICY "Admins can manage system config" ON public.system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_admin = true 
      AND status = 'aprovado'
    )
  );

-- Política: Usuários aprovados podem apenas ler configurações
CREATE POLICY "Approved users can read system config" ON public.system_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND status = 'aprovado'
    )
  );

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant de permissões
GRANT SELECT ON public.system_config TO authenticated;
GRANT ALL ON public.system_config TO service_role;