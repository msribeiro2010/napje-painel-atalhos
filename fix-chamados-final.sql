-- Script final para resolver problemas da tabela chamados
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para inserir dados de teste
ALTER TABLE chamados DISABLE ROW LEVEL SECURITY;

-- 2. Inserir dados de teste
INSERT INTO chamados (
  titulo,
  descricao,
  grau,
  orgao_julgador,
  perfil_usuario_afetado,
  nome_usuario_afetado,
  cpf_usuario_afetado,
  chamado_origem,
  numero_processo,
  tipo,
  status,
  prioridade
) VALUES 
(
  'Problema no sistema PJe - Login não funciona',
  'Usuário não consegue fazer login no sistema PJe. Aparece mensagem de erro "Credenciais inválidas" mesmo com dados corretos.',
  'Primeiro Grau',
  'Vara Cível de São Paulo',
  'Advogado',
  'João Silva',
  '123.456.789-00',
  'Sistema PJe',
  '1001234-56.2024.8.26.0100',
  'Técnico',
  'Aberto',
  3
),
(
  'Erro ao anexar documentos',
  'Sistema apresenta erro ao tentar anexar documentos PDF. Mensagem: "Formato de arquivo não suportado".',
  'Segundo Grau',
  'Tribunal de Justiça do Rio de Janeiro',
  'Servidor',
  'Maria Santos',
  '987.654.321-00',
  'Sistema Interno',
  '2002345-67.2024.8.19.0001',
  'Funcional',
  'Em Andamento',
  2
),
(
  'Lentidão no carregamento de processos',
  'Sistema muito lento para carregar a lista de processos. Demora mais de 5 minutos para exibir os dados.',
  'Primeiro Grau',
  'Vara Criminal de Brasília',
  'Magistrado',
  'Dr. Carlos Oliveira',
  '456.789.123-00',
  'Portal do Usuário',
  '3003456-78.2024.8.07.0001',
  'Performance',
  'Aberto',
  4
),
(
  'Falha na integração com sistema externo',
  'Sistema não consegue se comunicar com o sistema de protocolo externo. Timeout na conexão.',
  'Segundo Grau',
  'Tribunal Regional Federal',
  'Servidor',
  'Ana Costa',
  '321.654.987-00',
  'Sistema Integrado',
  '4004567-89.2024.4.03.0001',
  'Integração',
  'Aberto',
  5
),
(
  'Problema na impressão de relatórios',
  'Relatórios não estão sendo gerados corretamente. Dados aparecem truncados na impressão.',
  'Primeiro Grau',
  'Vara da Fazenda Pública',
  'Analista',
  'Pedro Almeida',
  '654.321.987-00',
  'Sistema de Relatórios',
  '5005678-90.2024.8.26.0053',
  'Relatório',
  'Pendente',
  2
);

-- 3. Verificar dados inseridos
SELECT 
  id,
  titulo,
  grau,
  orgao_julgador,
  status,
  created_at
FROM chamados 
ORDER BY created_at DESC;

-- 4. Criar política permissiva para desenvolvimento (opcional)
-- Descomente as linhas abaixo se quiser reabilitar RLS com política permissiva

-- ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations for development" ON chamados
-- FOR ALL USING (true) WITH CHECK (true);

-- INSTRUÇÕES:
-- 1. Copie e cole este script no Supabase SQL Editor
-- 2. Execute o script
-- 3. Teste o dashboard para ver se os chamados aparecem
-- 4. Se necessário, reabilite o RLS depois dos testes (descomente as últimas linhas)

-- NOTA: Este script desabilita temporariamente o RLS para permitir inserção de dados de teste.
-- Em produção, configure políticas adequadas em vez de desabilitar o RLS.