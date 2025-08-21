-- Adicionar constraint para evitar nomes duplicados
ALTER TABLE aniversariantes 
ADD CONSTRAINT unique_nome_aniversariante UNIQUE (nome);