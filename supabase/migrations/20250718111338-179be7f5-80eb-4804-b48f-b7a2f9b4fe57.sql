-- Criação das tabelas para órgãos julgadores
CREATE TABLE public.orgaos_julgadores_1grau (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.orgaos_julgadores_2grau (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orgaos_julgadores_1grau ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgaos_julgadores_2grau ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários aprovados
CREATE POLICY "Usuários aprovados podem visualizar OJs 1grau" 
ON public.orgaos_julgadores_1grau 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND status = 'aprovado'
));

CREATE POLICY "Usuários aprovados podem visualizar OJs 2grau" 
ON public.orgaos_julgadores_2grau 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND status = 'aprovado'
));

-- Políticas para admins
CREATE POLICY "Admins podem gerenciar OJs 1grau" 
ON public.orgaos_julgadores_1grau 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

CREATE POLICY "Admins podem gerenciar OJs 2grau" 
ON public.orgaos_julgadores_2grau 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true AND status = 'aprovado'
));

-- Triggers para atualização automática do timestamp
CREATE TRIGGER update_orgaos_julgadores_1grau_updated_at
BEFORE UPDATE ON public.orgaos_julgadores_1grau
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orgaos_julgadores_2grau_updated_at
BEFORE UPDATE ON public.orgaos_julgadores_2grau
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados do 1º grau
INSERT INTO public.orgaos_julgadores_1grau (codigo, nome) VALUES
('68', 'Vara do Trabalho de Adamantina'),
('7', '1ª Vara do Trabalho de Americana'),
('99', '2ª Vara do Trabalho de Americana'),
('60', 'Vara do Trabalho de Amparo'),
('901', 'Posto Avançado da Justiça do Trabalho de Amparo em Pedreira'),
('56', 'Vara do Trabalho de Andradina'),
('902', 'Posto Avançado da Justiça do Trabalho de Andradina em Pereira Barreto'),
('147', 'Vara do Trabalho de Aparecida'),
('6', '1ª Vara do Trabalho de Araraquara'),
('79', '2ª Vara do Trabalho de Araraquara'),
('151', '3ª Vara do Trabalho de Araraquara'),
('602', 'Órgão Centralizador de Leilões Judiciais de Araraquara'),
('903', 'Posto Avançado da Justiça do Trabalho de Araraquara em Américo Brasiliense'),
('46', 'Vara do Trabalho de Araras'),
('19', '1ª Vara do Trabalho de Araçatuba'),
('61', '2ª Vara do Trabalho de Araçatuba'),
('103', '3ª Vara do Trabalho de Araçatuba'),
('401', 'Divisão de Execução de Araçatuba'),
('629', 'Juizado Especial da Infância e Adolescência de Araçatuba'),
('601', 'Órgão Centralizador de Leilões Judiciais de Araçatuba'),
('36', '1ª Vara do Trabalho de Assis'),
('100', '2ª Vara do Trabalho de Assis'),
('140', 'Vara do Trabalho de Atibaia'),
('31', 'Vara do Trabalho de Avaré'),
('11', 'Vara do Trabalho de Barretos'),
('75', 'Vara do Trabalho de Batatais'),
('5', '1ª Vara do Trabalho de Bauru'),
('89', '2ª Vara do Trabalho de Bauru'),
('90', '3ª Vara do Trabalho de Bauru'),
('91', '4ª Vara do Trabalho de Bauru'),
('630', 'Juizado Especial da Infância e Adolescência de Bauru'),
('603', 'Órgão Centralizador de Leilões Judiciais de Bauru'),
('58', 'Vara do Trabalho de Bebedouro'),
('73', 'Vara do Trabalho de Birigui'),
('25', 'Vara do Trabalho de Botucatu'),
('38', 'Vara do Trabalho de Bragança Paulista'),
('447', 'CON1 - Araraquara'),
('492', 'CON1 - Bauru');

-- Inserir dados do 2º grau (somente alguns exemplos, devido ao tamanho)
INSERT INTO public.orgaos_julgadores_2grau (codigo, nome) VALUES
('499', 'Assessoria de Precatórios'),
('524', 'Gabinete da Desembargadora Larissa Carotta Martins da Silva Scarabelim - 8ª Câmara'),
('297', 'Gabinete do Plantonista'),
('326', 'Gabinete do Desembargador Edison dos Santos Pelegrini - 1ª Câmara'),
('314', 'Gabinete de Desembargador Suplente no Órgão Especial 1'),
('315', 'Gabinete de Desembargador Suplente no Órgão Especial 2'),
('316', 'Gabinete de Desembargador Suplente no Órgão Especial 3'),
('128', 'Gabinete da Presidência'),
('407', 'CEJUSC JT 2º grau - Centro Judiciário de Métodos Consensuais de Solução de Disputa da Justiça do Trabalho');