-- Criar trigger para validar domínio de email na criação de usuários
-- Isso impede que qualquer pessoa se cadastre com email que não seja @trt15.jus.br

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();