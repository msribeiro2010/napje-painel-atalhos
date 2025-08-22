-- Corrigir data do trabalho remoto de 26/08/2024 para 27/08/2024
-- Primeiro, verificar se existe uma entrada para 26/08/2024 com status 'remoto'
UPDATE user_work_calendar 
SET date = '2024-08-27'
WHERE date = '2024-08-26' AND status = 'remoto';

-- Verificar se a atualização foi bem-sucedida
SELECT * FROM user_work_calendar 
WHERE date IN ('2024-08-26', '2024-08-27') 
AND status = 'remoto'
ORDER BY date;