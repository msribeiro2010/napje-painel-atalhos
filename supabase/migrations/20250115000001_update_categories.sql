-- Atualizar categorias existentes para as novas categorias permitidas
-- Todas as categorias que não sejam 'PJe-1o.Grau', 'PJe-2o.Grau' ou 'Outros' serão alteradas para 'Outros'

UPDATE base_conhecimento 
SET categoria = 'Outros'
WHERE categoria IS NOT NULL 
  AND categoria NOT IN ('PJe-1o.Grau', 'PJe-2o.Grau', 'Outros');

-- Comentário para documentar a mudança
COMMENT ON COLUMN base_conhecimento.categoria IS 'Categoria do item: PJe-1o.Grau, PJe-2o.Grau ou Outros';

-- Verificar quantos registros foram atualizados
-- SELECT categoria, COUNT(*) as total 
-- FROM base_conhecimento 
-- WHERE categoria IS NOT NULL 
-- GROUP BY categoria 
-- ORDER BY categoria;