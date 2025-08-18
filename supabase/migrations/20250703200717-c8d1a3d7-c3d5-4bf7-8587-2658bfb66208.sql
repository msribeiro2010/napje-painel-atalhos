-- Definir o primeiro usuário que se cadastrar como administrador
-- Para facilitar o teste do sistema
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'msribeiro@trt15.jus.br';