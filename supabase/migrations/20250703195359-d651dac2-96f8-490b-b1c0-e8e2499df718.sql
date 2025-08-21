-- Reset da senha do usuário para permitir novo cadastro
-- Isso vai permitir que você redefina a senha
UPDATE auth.users 
SET 
  encrypted_password = '',
  email_change_token = '',
  email_change = '',
  email_change_confirm_status = 0,
  recovery_token = '',
  recovery_sent_at = NULL
WHERE email = 'msribeiro@trt15.jus.br';