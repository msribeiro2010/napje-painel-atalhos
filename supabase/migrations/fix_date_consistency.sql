-- Verificar e corrigir inconsistências de data
-- Primeiro, vamos ver exatamente o que temos no banco

SELECT 
  'Estado atual das datas' as info,
  date,
  status,
  date::text as date_string,
  extract(day from date) as day_num,
  extract(month from date) as month_num
FROM user_work_calendar 
WHERE date >= '2024-08-01' AND date <= '2024-08-31'
ORDER BY date;

-- Verificar se há alguma entrada duplicada ou inconsistente
SELECT 
  date,
  status,
  count(*) as count
FROM user_work_calendar 
WHERE date >= '2024-08-01' AND date <= '2024-08-31'
GROUP BY date, status
HAVING count(*) > 1;

-- Verificar especificamente as datas problemáticas mencionadas
SELECT 
  'Datas específicas' as tipo,
  date,
  status,
  case 
    when date = '2024-08-25' then 'Deveria ser presencial'
    when date = '2024-08-26' then 'Verificar se existe'
    when date = '2024-08-27' then 'Deveria ser remoto'
    else 'Outra data'
  end as expectativa
FROM user_work_calendar 
WHERE date IN ('2024-08-25', '2024-08-26', '2024-08-27')
ORDER BY date;