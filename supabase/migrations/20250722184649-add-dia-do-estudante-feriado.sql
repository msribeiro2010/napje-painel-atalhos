-- Adicionar feriado "Dia do Estudante" que estava faltando
-- Data: 11/08/2025 (segunda-feira)  
-- Tipo: Nacional

INSERT INTO feriados (data, descricao, tipo) 
VALUES ('2025-08-11', 'Dia do Estudante', 'nacional')
ON CONFLICT (data, descricao) DO NOTHING;
