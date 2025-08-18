-- Função para criar perfil automaticamente quando um novo usuário se registra

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_status text := 'pendente';
BEGIN
  -- Verificar se o email é do domínio @trt15.jus.br
  IF NEW.email LIKE '%@trt15.jus.br' THEN
    user_status := 'aprovado';
  END IF;

  -- Inserir novo perfil
  INSERT INTO public.profiles (
    id,
    email,
    nome_completo,
    status,
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.raw_user_meta_data->>'full_name', ''),
    user_status,
    false,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro (em produção, você pode querer usar uma tabela de logs)
    RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();