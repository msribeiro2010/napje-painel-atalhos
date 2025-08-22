-- Script para verificar como as datas estão armazenadas na tabela user_work_calendar
-- Verificando especialmente as entradas de agosto de 2024

SELECT 
    id,
    user_id,
    date,
    status,
    date::text as date_text,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    EXTRACT(DAY FROM date) as day,
    created_at,
    updated_at
FROM user_work_calendar 
WHERE 
    EXTRACT(YEAR FROM date) = 2024 
    AND EXTRACT(MONTH FROM date) = 8
ORDER BY date;

-- Verificar especificamente as datas 25, 26 e 27 de agosto
SELECT 
    date,
    status,
    date::text as date_text,
    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date
FROM user_work_calendar 
WHERE 
    date IN ('2024-08-25', '2024-08-26', '2024-08-27')
ORDER BY date;

-- Verificar todas as entradas de trabalho remoto em agosto
SELECT 
    date,
    status,
    date::text as date_text,
    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date
FROM user_work_calendar 
WHERE 
    status = 'remoto'
    AND EXTRACT(YEAR FROM date) = 2024 
    AND EXTRACT(MONTH FROM date) = 8
ORDER BY date;