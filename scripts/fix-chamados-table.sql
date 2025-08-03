-- Script para corrigir a estrutura da tabela chamados
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar colunas ausentes na tabela chamados
ALTER TABLE chamados 
ADD COLUMN IF NOT EXISTS resumo TEXT NOT NULL DEFAULT 'Sem título',
ADD COLUMN IF NOT EXISTS notas TEXT,
ADD COLUMN IF NOT EXISTS processos TEXT,
ADD COLUMN IF NOT EXISTS descricao_gerada TEXT;

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chamados_created_at ON chamados(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chamados_resumo ON chamados(resumo);
CREATE INDEX IF NOT EXISTS idx_chamados_grau ON chamados(grau);

-- 3. Configurar RLS (Row Level Security) - permitir leitura para usuários autenticados
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura de chamados" ON chamados;
DROP POLICY IF EXISTS "Permitir inserção de chamados" ON chamados;
DROP POLICY IF EXISTS "Permitir atualização de chamados" ON chamados;
DROP POLICY IF EXISTS "Permitir exclusão de chamados" ON chamados;

-- Criar novas políticas mais permissivas para desenvolvimento
CREATE POLICY "Permitir leitura de chamados" ON chamados
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de chamados" ON chamados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de chamados" ON chamados
    FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de chamados" ON chamados
    FOR DELETE USING (true);

-- 4. Verificar se RLS está habilitado
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;

-- 5. Inserir alguns dados de exemplo
INSERT INTO chamados (
    resumo,
    notas,
    grau,
    processos,
    orgao_julgador,
    perfil_usuario_afetado,
    nome_usuario_afetado,
    cpf_usuario_afetado,
    chamado_origem
) VALUES 
(
    'Problema de acesso ao sistema PJe',
    'Usuário não consegue acessar o sistema PJe após atualização do navegador. Erro de certificado digital.',
    'Primeiro Grau',
    '1234567-89.2024.8.02.0001',
    'Vara Cível de Maceió',
    'Advogado',
    'João Silva Santos',
    '123.456.789-00',
    'Telefone'
),
(
    'Erro na petição inicial',
    'Sistema apresenta erro ao tentar protocolar petição inicial. Mensagem: "Documento não pode ser processado".',
    'Segundo Grau',
    '9876543-21.2024.8.02.0002',
    'Tribunal de Justiça de Alagoas',
    'Servidor',
    'Maria Oliveira Costa',
    '987.654.321-00',
    'E-mail'
),
(
    'Lentidão no carregamento de processos',
    'Sistema muito lento para carregar lista de processos. Timeout frequente nas consultas.',
    'Primeiro Grau',
    '5555555-55.2024.8.02.0003',
    'Vara Criminal de Arapiraca',
    'Magistrado',
    'Dr. Carlos Eduardo Lima',
    '555.666.777-88',
    'Presencial'
),
(
    'Certificado digital não reconhecido',
    'Sistema não reconhece certificado digital válido. Usuário já tentou reinstalar o certificado.',
    'Segundo Grau',
    '1111111-11.2024.8.02.0004',
    'Câmara Cível do TJAL',
    'Advogado',
    'Ana Paula Ferreira',
    '111.222.333-44',
    'Chat'
),
(
    'Erro ao anexar documentos',
    'Não é possível anexar documentos PDF ao processo. Sistema retorna erro 500.',
    'Primeiro Grau',
    '7777777-77.2024.8.02.0005',
    'Vara da Fazenda Pública',
    'Procurador',
    'Roberto Almeida Souza',
    '777.888.999-00',
    'Sistema'
);

-- 6. Verificar se os dados foram inseridos
SELECT 
    id,
    resumo,
    notas,
    grau,
    orgao_julgador,
    created_at
FROM chamados 
ORDER BY created_at DESC
LIMIT 10;