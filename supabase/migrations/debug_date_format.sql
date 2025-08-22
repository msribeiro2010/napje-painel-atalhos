-- Debug: Verificar formato das datas no banco
SELECT 
  id,
  date,
  status,
  date::text as date_text,
  to_char(date, 'YYYY-MM-DD') as date_formatted,
  extract(day from date) as day_number,
  extract(month from date) as month_number,
  extract(year from date) as year_number
FROM user_work_calendar 
WHERE date >= '2024-08-01' AND date <= '2024-08-31'
ORDER BY date;

-- Verificar especificamente as datas problemáticas
SELECT 
  'Verificação específica' as tipo,
  date,
  status,
  date::text as date_as_text
FROM user_work_calendar 
WHERE date IN ('2024-08-25', '2024-08-26', '2024-08-27')
ORDER BY date;

-- Verificar timezone e configurações
SELECT 
  'Configurações de timezone' as info,
  current_setting('timezone') as current_timezone,
  now() as current_timestamp,
  current_date as current_date;