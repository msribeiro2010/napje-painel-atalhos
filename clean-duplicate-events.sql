-- Script para limpar eventos duplicados na tabela user_custom_events
-- Este script identifica e remove eventos duplicados baseado em data, título e user_id

-- 1. Primeiro, vamos identificar as duplicatas
WITH duplicate_events AS (
  SELECT 
    id,
    user_id,
    date,
    title,
    type,
    description,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, date, LOWER(TRIM(title)) 
      ORDER BY created_at ASC
    ) as row_num
  FROM user_custom_events
),
events_to_keep AS (
  SELECT id 
  FROM duplicate_events 
  WHERE row_num = 1
),
events_to_delete AS (
  SELECT id 
  FROM duplicate_events 
  WHERE row_num > 1
)

-- 2. Mostrar quantas duplicatas serão removidas
SELECT 
  'Eventos duplicados encontrados: ' || COUNT(*) as summary
FROM events_to_delete;

-- 3. Uncomment the line below to actually delete the duplicates
-- WARNING: This will permanently delete duplicate events!
-- DELETE FROM user_custom_events WHERE id IN (SELECT id FROM events_to_delete);

-- 4. Para executar a limpeza, descomente a linha abaixo:
/*
WITH duplicate_events AS (
  SELECT 
    id,
    user_id,
    date,
    title,
    type,
    description,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, date, LOWER(TRIM(title)) 
      ORDER BY created_at ASC
    ) as row_num
  FROM user_custom_events
)
DELETE FROM user_custom_events 
WHERE id IN (
  SELECT id 
  FROM duplicate_events 
  WHERE row_num > 1
);
*/

-- 5. Verificar se há eventos restantes
SELECT 
  user_id,
  date,
  title,
  type,
  COUNT(*) as count
FROM user_custom_events
GROUP BY user_id, date, LOWER(TRIM(title)), type
HAVING COUNT(*) > 1
ORDER BY user_id, date;