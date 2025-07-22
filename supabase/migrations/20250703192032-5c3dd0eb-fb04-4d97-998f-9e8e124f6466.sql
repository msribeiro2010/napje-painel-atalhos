-- Desabilitar confirmação de email para facilitar uso interno
-- Isso permite login imediato após o cadastro
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmation_token = NULL 
WHERE email_confirmed_at IS NULL;