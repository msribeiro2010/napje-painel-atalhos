-- Popular dados de aniversariantes
INSERT INTO public.aniversariantes (nome, data_nascimento) VALUES
('Marta', '1990-02-28'),
('Caetano', '1985-03-26'),
('Silvio', '1988-03-26'),
('Natália', '1992-03-31'),
('Wagner', '1980-04-07'),
('Lloyd', '1995-04-12'),
('Thaís', '1987-05-11'),
('Nathany', '1993-09-23'),
('Tatiana', '1989-09-28'),
('Marcelo', '1982-12-29')
ON CONFLICT DO NOTHING;

-- Popular dados de feriados de 2025
INSERT INTO public.feriados (data, descricao, tipo) VALUES
('2025-01-01', 'Ano Novo', 'nacional'),
('2025-01-25', 'Aniversário de São Paulo', 'municipal'),
('2025-02-17', 'Carnaval', 'nacional'),
('2025-02-18', 'Carnaval', 'nacional'),
('2025-03-19', 'Dia de São José', 'municipal'),
('2025-04-18', 'Sexta-feira Santa', 'nacional'),
('2025-04-21', 'Tiradentes', 'nacional'),
('2025-05-01', 'Dia do Trabalho', 'nacional'),
('2025-06-12', 'Corpus Christi', 'nacional'),
('2025-07-09', 'Revolução Constitucionalista', 'estadual'),
('2025-09-07', 'Independência do Brasil', 'nacional'),
('2025-10-12', 'Nossa Senhora Aparecida', 'nacional'),
('2025-11-02', 'Finados', 'nacional'),
('2025-11-15', 'Proclamação da República', 'nacional'),
('2025-11-20', 'Dia da Consciência Negra', 'municipal'),
('2025-12-25', 'Natal', 'nacional')
ON CONFLICT DO NOTHING;