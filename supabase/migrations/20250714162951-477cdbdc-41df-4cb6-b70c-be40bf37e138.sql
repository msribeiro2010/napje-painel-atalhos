-- Inserir alguns eventos de teste para demonstrar a funcionalidade
-- Feriado hoje (para testar urgência máxima)
INSERT INTO feriados (data, descricao, tipo) 
VALUES (CURRENT_DATE, 'Dia de Teste - Hoje', 'nacional');

-- Feriado amanhã
INSERT INTO feriados (data, descricao, tipo) 
VALUES (CURRENT_DATE + INTERVAL '1 day', 'Dia de Teste - Amanhã', 'estadual');

-- Feriado em 3 dias
INSERT INTO feriados (data, descricao, tipo) 
VALUES (CURRENT_DATE + INTERVAL '3 days', 'Dia de Teste - Em 3 dias', 'municipal');

-- Aniversariante amanhã
INSERT INTO aniversariantes (nome, data_nascimento) 
VALUES ('Maria Silva - Teste', (CURRENT_DATE + INTERVAL '1 day') - INTERVAL '25 years');

-- Aniversariante em 5 dias
INSERT INTO aniversariantes (nome, data_nascimento) 
VALUES ('João Santos - Teste', (CURRENT_DATE + INTERVAL '5 days') - INTERVAL '35 years');