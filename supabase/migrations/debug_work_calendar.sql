-- Debug script para verificar dados de trabalho remoto em agosto de 2024
-- e corrigir discrepância de data (26/08 para 27/08)

-- 1. Verificar todos os registros de agosto de 2024
SELECT 
    id,
    user_id,
    date,
    status,
    created_at,
    updated_at
FROM user_work_calendar 
WHERE date >= '2024-08-01' 
    AND date <= '2024-08-31'
ORDER BY date;

-- 2. Verificar especificamente registros de trabalho remoto em agosto
SELECT 
    id,
    user_id,
    date,
    status,
    created_at,
    updated_at
FROM user_work_calendar 
WHERE date >= '2024-08-01' 
    AND date <= '2024-08-31'
    AND status = 'remoto'
ORDER BY date;

-- 3. Verificar se existe registro para 26/08/2024 com status remoto
SELECT 
    id,
    user_id,
    date,
    status,
    created_at,
    updated_at
FROM user_work_calendar 
WHERE date = '2024-08-26'
    AND status = 'remoto';

-- 4. Verificar se existe registro para 27/08/2024
SELECT 
    id,
    user_id,
    date,
    status,
    created_at,
    updated_at
FROM user_work_calendar 
WHERE date = '2024-08-27';

-- 5. Se necessário, corrigir a data de 26/08 para 27/08 (comentado por segurança)
-- UPDATE user_work_calendar 
-- SET date = '2024-08-27', updated_at = now()
-- WHERE date = '2024-08-26' AND status = 'remoto';

-- 6. Verificar próximos eventos de trabalho remoto
SELECT 
    id,
    user_id,
    date,
    status,
    created_at,
    updated_at
FROM user_work_calendar 
WHERE status = 'remoto'
    AND date >= CURRENT_DATE
ORDER BY date
LIMIT 5;