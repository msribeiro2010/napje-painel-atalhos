-- Limpar feriados duplicados de 2025 e inserir dados corretos
DELETE FROM feriados WHERE EXTRACT(YEAR FROM data) = 2025;

-- Inserir feriados de 2025
INSERT INTO feriados (data, descricao, tipo) VALUES
-- Janeiro
('2025-01-01', 'Ano Novo', 'nacional'),
('2025-01-25', 'Aniversário de São Paulo', 'municipal'),

-- Fevereiro  
('2025-02-17', 'Carnaval', 'nacional'),
('2025-02-18', 'Carnaval', 'nacional'),

-- Março
('2025-03-19', 'Dia de São José', 'municipal'),

-- Abril
('2025-04-18', 'Sexta-feira Santa', 'nacional'),
('2025-04-21', 'Tiradentes', 'nacional'),

-- Maio
('2025-05-01', 'Dia do Trabalho', 'nacional'),

-- Junho
('2025-06-12', 'Corpus Christi', 'nacional'),

-- Julho
('2025-07-09', 'Revolução Constitucionalista', 'estadual'),

-- Setembro
('2025-09-07', 'Independência do Brasil', 'nacional'),

-- Outubro
('2025-10-12', 'Nossa Senhora Aparecida', 'nacional'),

-- Novembro
('2025-11-02', 'Finados', 'nacional'),
('2025-11-15', 'Proclamação da República', 'nacional'),
('2025-11-20', 'Dia da Consciência Negra', 'municipal'),

-- Dezembro
('2025-12-25', 'Natal', 'nacional');

-- Adicionar constraint para evitar duplicatas
ALTER TABLE feriados 
ADD CONSTRAINT unique_feriado_data UNIQUE (data, descricao);