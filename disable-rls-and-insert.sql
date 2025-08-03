-- Script para desabilitar RLS temporariamente e inserir dados de teste
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE chamados DISABLE ROW LEVEL SECURITY;

-- 2. Inserir dados de teste
INSERT INTO chamados (
  grau,
  orgao_julgador,
  perfil_usuario_afetado,
  nome_usuario_afetado,
  cpf_usuario_afetado,
  chamado_origem
) VALUES 
(
  'Primeiro Grau',
  'Vara Cível de São Paulo',
  'Advogado',
  'João Silva',
  '123.456.789-00',
  'Sistema PJe'
),
(
  'Segundo Grau',
  'Tribunal de Justiça do Rio de Janeiro',
  'Servidor',
  'Maria Santos',
  '987.654.321-00',
  'Sistema Interno'
),
(
  'Primeiro Grau',
  'Vara Criminal de Brasília',
  'Magistrado',
  'Dr. Carlos Oliveira',
  '456.789.123-00',
  'Portal do Usuário'
);

-- 3. Verificar dados inseridos
SELECT 
  id,
  grau,
  orgao_julgador,
  nome_usuario_afetado,
  created_at
FROM chamados 
ORDER BY created_at DESC;

-- 4. Reabilitar RLS (opcional - descomente se necessário)
-- ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;

-- 5. Criar política permissiva para desenvolvimento (opcional)
-- CREATE POLICY "Allow all operations for development" ON chamados
-- FOR ALL USING (true) WITH CHECK (true);

-- INSTRUÇÕES:
-- 1. Copie e cole este script no Supabase SQL Editor
-- 2. Execute o script
-- 3. Teste o dashboard para ver se os chamados aparecem
-- 4. Se necessário, reabilite o RLS depois dos testes