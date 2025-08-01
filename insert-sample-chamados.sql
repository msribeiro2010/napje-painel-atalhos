-- Script para inserir dados de exemplo na tabela chamados
INSERT INTO public.chamados (
  resumo,
  grau,
  orgao_julgador,
  perfil_usuario_afetado,
  cpf_usuario_afetado,
  nome_usuario_afetado,
  processos,
  notas,
  chamado_origem,
  descricao_gerada
) VALUES 
(
  'Problema com acesso ao sistema PJe',
  '1º Grau',
  'TRT15 - Campinas',
  'Servidor',
  '12345678901',
  'João Silva Santos',
  '1000123-45.2024.5.15.0001',
  'Usuário relata que não consegue acessar o sistema PJe. Aparece mensagem de erro "Credenciais inválidas" mesmo com senha correta.',
  'CHM-2024-001',
  'Chamado sobre problema de acesso ao sistema PJe para o usuário João Silva Santos, servidor do TRT15.'
),
(
  'Solicitação de certificado digital',
  '2º Grau',
  'TRT15 - Campinas',
  'Magistrado',
  '98765432109',
  'Dra. Maria Oliveira',
  '2000456-78.2024.5.15.0002',
  'Magistrada solicita renovação do certificado digital A3 para assinatura de documentos eletrônicos.',
  'CHM-2024-002',
  'Solicitação de renovação de certificado digital para a magistrada Dra. Maria Oliveira.'
),
(
  'Erro na geração de relatórios',
  '1º Grau',
  'TRT15 - Sorocaba',
  'Analista',
  '11122233344',
  'Carlos Eduardo Lima',
  '3000789-12.2024.5.15.0003',
  'Sistema apresenta erro ao tentar gerar relatório mensal de produtividade. Erro: "Timeout na consulta ao banco de dados".',
  'CHM-2024-003',
  'Problema na geração de relatórios mensais reportado pelo analista Carlos Eduardo Lima.'
);