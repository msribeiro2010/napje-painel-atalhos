-- Limpar dados relacionados ao usuário antes de deletar
DELETE FROM admin_messages WHERE from_user_id = '09ce76d6-ddf0-4977-9688-02b039fd3794' OR to_user_id = '09ce76d6-ddf0-4977-9688-02b039fd3794';
DELETE FROM profiles WHERE id = '09ce76d6-ddf0-4977-9688-02b039fd3794';
DELETE FROM user_sessions WHERE user_id = '09ce76d6-ddf0-4977-9688-02b039fd3794';

-- Agora deletar o usuário
DELETE FROM auth.users WHERE email = 'msribeiro@trt15.jus.br';