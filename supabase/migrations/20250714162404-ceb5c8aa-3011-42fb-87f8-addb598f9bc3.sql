-- Inserir um feriado de teste para amanhã (apenas para demonstração)
INSERT INTO feriados (data, descricao, tipo) 
VALUES (CURRENT_DATE + INTERVAL '1 day', 'Dia de Teste - Sistema de Alertas', 'Nacional');

-- Inserir um aniversariante de teste para amanhã (apenas para demonstração)  
INSERT INTO aniversariantes (nome, data_nascimento) 
VALUES ('João Silva - Teste', (CURRENT_DATE + INTERVAL '1 day') - INTERVAL '30 years');