-- Garantir que as datas de agosto estejam corretas
-- Primeiro, verificar usuários existentes
SELECT 'Usuários na tabela profiles:' as info, id, email FROM auth.users LIMIT 5;

-- Limpar entradas de agosto para recriar corretamente
DELETE FROM user_work_calendar 
WHERE date >= '2024-08-01' AND date <= '2024-08-31';

-- Inserir as datas corretas para todos os usuários existentes
-- 25/08 = presencial, 27/08 = remoto
WITH user_ids AS (
  SELECT id FROM auth.users LIMIT 1
)
INSERT INTO user_work_calendar (user_id, date, status, created_at, updated_at)
SELECT 
  u.id,
  date_val,
  status_val,
  NOW(),
  NOW()
FROM user_ids u
CROSS JOIN (
  VALUES 
    ('2024-08-25'::date, 'presencial'::text),
    ('2024-08-27'::date, 'remoto'::text)
) AS dates(date_val, status_val)
ON CONFLICT (user_id, date) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- Verificar o resultado
SELECT 
  'Resultado final' as info,
  date,
  status,
  extract(day from date) as day_num
FROM user_work_calendar 
WHERE date >= '2024-08-01' AND date <= '2024-08-31'
ORDER BY date;