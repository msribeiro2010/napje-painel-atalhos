-- Identificar e remover registros duplicados mantendo apenas o mais antigo de cada nome
WITH duplicados AS (
  SELECT id, nome, data_nascimento, created_at,
         ROW_NUMBER() OVER (PARTITION BY nome ORDER BY created_at ASC) as rn
  FROM aniversariantes
)
DELETE FROM aniversariantes 
WHERE id IN (
  SELECT id FROM duplicados WHERE rn > 1
);