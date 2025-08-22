-- Script para corrigir a data do trabalho remoto de 26/08/2024 para 27/08/2024
-- Baseado na solicitação do usuário para corrigir discrepância no painel

-- 1. Primeiro, verificar se existe registro para 26/08/2024 com status remoto
DO $$
BEGIN
    -- Verificar se existe o registro incorreto
    IF EXISTS (
        SELECT 1 FROM user_work_calendar 
        WHERE date = '2024-08-26' AND status = 'remoto'
    ) THEN
        -- Log da correção
        RAISE NOTICE 'Encontrado registro de trabalho remoto em 26/08/2024. Corrigindo para 27/08/2024...';
        
        -- Verificar se já existe registro para 27/08/2024
        IF EXISTS (
            SELECT 1 FROM user_work_calendar 
            WHERE date = '2024-08-27'
        ) THEN
            RAISE NOTICE 'Já existe registro para 27/08/2024. Removendo registro duplicado de 26/08/2024...';
            -- Se já existe registro para 27/08, apenas remove o de 26/08
            DELETE FROM user_work_calendar 
            WHERE date = '2024-08-26' AND status = 'remoto';
        ELSE
            RAISE NOTICE 'Atualizando data de 26/08/2024 para 27/08/2024...';
            -- Atualizar a data de 26/08 para 27/08
            UPDATE user_work_calendar 
            SET 
                date = '2024-08-27',
                updated_at = now()
            WHERE date = '2024-08-26' AND status = 'remoto';
        END IF;
        
        RAISE NOTICE 'Correção concluída com sucesso!';
    ELSE
        RAISE NOTICE 'Nenhum registro de trabalho remoto encontrado para 26/08/2024.';
    END IF;
END $$;

-- 2. Verificar o resultado da correção
SELECT 
    'Registros após correção:' as info,
    date,
    status,
    user_id,
    updated_at
FROM user_work_calendar 
WHERE date IN ('2024-08-26', '2024-08-27')
ORDER BY date;

-- 3. Verificar próximos eventos de trabalho remoto
SELECT 
    'Próximos eventos de trabalho remoto:' as info,
    date,
    status,
    user_id
FROM user_work_calendar 
WHERE status = 'remoto'
    AND date >= CURRENT_DATE
ORDER BY date
LIMIT 5;