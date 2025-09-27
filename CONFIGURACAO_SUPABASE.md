# 🔧 Configuração do Supabase - Guia Completo

## ⚠️ Status Atual

**Problema identificado:** As variáveis de ambiente do Supabase não estão configuradas corretamente no arquivo `.env`.

## 📝 Passos para Configurar

### 1. Criar conta no Supabase (se ainda não tiver)
1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou email

### 2. Criar um novo projeto
1. Clique em "New Project"
2. Preencha os dados:
   - **Project name:** napje-painel-atalhos (ou outro nome)
   - **Database Password:** Crie uma senha forte
   - **Region:** Escolha a mais próxima (South America - São Paulo)
   - **Pricing Plan:** Free tier é suficiente

### 3. Obter as credenciais
1. Após criar o projeto, vá para **Settings > API**
2. Você encontrará:
   - **Project URL:** (algo como `https://xyzxyzxyz.supabase.co`)
   - **anon/public key:** (uma string longa que começa com `eyJ...`)

### 4. Configurar o arquivo .env
1. Edite o arquivo `.env` na raiz do projeto
2. Substitua os valores de exemplo pelas suas credenciais reais:

```env
VITE_SUPABASE_URL=https://seu-projeto-aqui.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 5. Criar as tabelas no Supabase

Execute o seguinte SQL no editor SQL do Supabase (SQL Editor no menu lateral):

```sql
-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de chamados
CREATE TABLE IF NOT EXISTS chamados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'aberto',
  prioridade TEXT DEFAULT 'media',
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tags de chamados
CREATE TABLE IF NOT EXISTS chamado_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chamado_id UUID REFERENCES chamados(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de base de conhecimento
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  categoria TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos customizados
CREATE TABLE IF NOT EXISTS custom_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  cor TEXT DEFAULT '#3B82F6',
  recorrente BOOLEAN DEFAULT FALSE,
  tipo_recorrencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias de contatos
CREATE TABLE IF NOT EXISTS contact_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES contact_categories(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  ramal TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  board_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'media',
  data_vencimento DATE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de boards de tarefas
CREATE TABLE IF NOT EXISTS task_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configuração do PJe
CREATE TABLE IF NOT EXISTS pje_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  config_type TEXT NOT NULL,
  config_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de analytics do PJe
CREATE TABLE IF NOT EXISTS pje_analytics_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_processo TEXT NOT NULL,
  data_distribuicao DATE,
  classe_judicial TEXT,
  assunto TEXT,
  valor_causa DECIMAL(10,2),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamado_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pje_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pje_analytics_processes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança básicas (ajustar conforme necessário)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own chamados" ON chamados
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own knowledge base" ON knowledge_base
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own events" ON custom_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own boards" ON task_boards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own PJe config" ON pje_config
  FOR ALL USING (auth.uid() = user_id);

-- Categorias podem ser vistas por todos
CREATE POLICY "Anyone can view categories" ON contact_categories
  FOR SELECT USING (true);

-- Analytics pode ser visto por todos (ajustar se necessário)
CREATE POLICY "Anyone can view analytics" ON pje_analytics_processes
  FOR SELECT USING (true);
```

### 6. Testar a conexão

Após configurar, execute:

```bash
npm run supabase:check
```

Se tudo estiver correto, você verá:
- ✅ Conexão estabelecida
- ✅ Tabelas acessíveis

### 7. Configurar autenticação (opcional)

No painel do Supabase:
1. Vá para **Authentication > Providers**
2. Configure os provedores desejados (Email, Google, etc.)
3. Configure as URLs de redirecionamento

## 🚨 Troubleshooting

### Erro: "fetch failed"
- Verifique se a URL do Supabase está correta
- Confirme que a chave anon está correta
- Verifique sua conexão com internet

### Erro: "relation does not exist"
- Execute o SQL de criação de tabelas acima
- Verifique no Table Editor se as tabelas foram criadas

### Erro: "permission denied"
- Verifique as políticas RLS
- Confirme que o usuário está autenticado

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/sql)

## ✅ Checklist de Configuração

- [ ] Conta criada no Supabase
- [ ] Projeto criado
- [ ] Credenciais obtidas (URL e chave anon)
- [ ] Arquivo .env configurado com credenciais reais
- [ ] Tabelas criadas no banco de dados
- [ ] RLS configurado
- [ ] Teste de conexão bem-sucedido

## 💡 Dica Importante

**NUNCA commite o arquivo `.env` com credenciais reais!** O arquivo já está no `.gitignore` para prevenir isso.