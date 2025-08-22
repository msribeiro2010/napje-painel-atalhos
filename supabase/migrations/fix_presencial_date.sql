-- Script para corrigir a data do trabalho presencial de 27/08/2024 para 25/08/2024

-- Primeiro, vamos verificar se existe uma entrada para 27/08/2024 com status 'presencial'
SELECT * FROM user_work_calendar 
WHERE date = '2024-08-27' AND status = 'presencial';

-- Se existir, vamos atualizar para 25/08/2024
UPDATE user_work_calendar 
SET date = '2024-08-25', updated_at = now()
WHERE date = '2024-08-27' AND status = 'presencial';

-- Verificar se já existe uma entrada para 25/08/2024
SELECT * FROM user_work_calendar 
WHERE date = '2024-08-25';

-- Se não existir entrada para 25/08/2024 com status presencial, criar uma nova
INSERT INTO user_work_calendar (user_id, date, status, created_at, updated_at)
SELECT 
    user_id,
    '2024-08-25'::date,
    'presencial',
    now(),
    now()
FROM user_work_calendar 
WHERE date = '2024-08-27' AND status = 'presencial'
AND NOT EXISTS (
    SELECT 1 FROM user_work_calendar 
    WHERE date = '2024-08-25' AND status = 'presencial'
);

-- Remover a entrada incorreta de 27/08/2024 se ela existir
DELETE FROM user_work_calendar 
WHERE date = '2024-08-27' AND status = 'presencial';

-- Verificar o resultado final
SELECT * FROM user_work_calendar 
WHERE date IN ('2024-08-25', '2024-08-27') 
ORDER BY date;