-- Verificar se a correção da data do trabalho presencial foi aplicada corretamente

-- Verificar todas as entradas de agosto de 2024
SELECT 
    date,
    status,
    user_id,
    created_at,
    updated_at
FROM user_work_calendar 
WHERE date >= '2024-08-01' AND date <= '2024-08-31'
ORDER BY date;

-- Verificar especificamente as datas 25/08 e 27/08
SELECT 
    date,
    status,
    COUNT(*) as count
FROM user_work_calendar 
WHERE date IN ('2024-08-25', '2024-08-27')
GROUP BY date, status
ORDER BY date, status;