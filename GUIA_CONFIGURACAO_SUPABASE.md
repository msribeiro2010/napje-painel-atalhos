# 🚀 Guia de Configuração do Supabase

## 📋 Passo a Passo para Configurar o Supabase

### 1. Criar Conta e Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project" ou "Sign up"
3. Faça login com GitHub, Google ou email
4. Clique em "New Project"
5. Escolha uma organização ou crie uma nova
6. Configure o projeto:
   - **Name**: `napje-painel-atalhos`
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha a região mais próxima (ex: South America)
   - **Pricing Plan**: Free (para desenvolvimento)

### 2. Obter Credenciais do Projeto

Após criar o projeto:

1. Vá para **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xxxxxxxxxxx.supabase.co`)
   - **anon public** key (chave pública)
   - **service_role** key (chave de serviço - mantenha secreta!)

### 3. Atualizar o arquivo .env

Substitua as credenciais de exemplo no arquivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE_AQUI
```

### 4. Criar a Tabela user_custom_events

1. No painel do Supabase, vá para **SQL Editor**
2. Execute o seguinte SQL:

```sql
-- Criar tabela user_custom_events
CREATE TABLE IF NOT EXISTS user_custom_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    category TEXT DEFAULT 'personal',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    notification_enabled BOOLEAN DEFAULT true,
    notification_time INTEGER DEFAULT 60, -- minutos antes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_custom_events_user_id ON user_custom_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_events_date ON user_custom_events(event_date);
CREATE INDEX IF NOT EXISTS idx_user_custom_events_category ON user_custom_events(category);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_custom_events_updated_at
    BEFORE UPDATE ON user_custom_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Configurar Políticas RLS (Row Level Security)

```sql
-- Habilitar RLS na tabela
ALTER TABLE user_custom_events ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários podem ver apenas seus próprios eventos
CREATE POLICY "Users can view own events" ON user_custom_events
    FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT: usuários podem criar eventos para si mesmos
CREATE POLICY "Users can insert own events" ON user_custom_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários podem atualizar apenas seus próprios eventos
CREATE POLICY "Users can update own events" ON user_custom_events
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE: usuários podem deletar apenas seus próprios eventos
CREATE POLICY "Users can delete own events" ON user_custom_events
    FOR DELETE USING (auth.uid() = user_id);
```

### 6. Configurar Autenticação (Opcional)

Se ainda não configurou:

1. Vá para **Authentication** → **Settings**
2. Configure os provedores de autenticação desejados
3. Para desenvolvimento, você pode habilitar:
   - Email/Password
   - Magic Links
   - OAuth (Google, GitHub, etc.)

### 7. Testar a Conexão

Após configurar tudo:

```bash
# Execute o script de teste
node test-supabase-connection.js
```

### 8. Reiniciar o Servidor de Desenvolvimento

```bash
# Parar o servidor atual (Ctrl+C)
# Depois executar:
npm run dev
```

## 🔧 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou as chaves corretamente
- Certifique-se de usar a chave `anon` para VITE_SUPABASE_ANON_KEY

### Erro: "relation does not exist"
- Execute os comandos SQL para criar a tabela
- Verifique se está no projeto correto

### Erro: "Row Level Security"
- Execute os comandos SQL para configurar as políticas RLS
- Certifique-se de estar autenticado na aplicação

### Erro de CORS
- Verifique se a URL do Supabase está correta
- Certifique-se de que não há espaços extras nas variáveis de ambiente

## 📚 Recursos Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript)

---

**Próximos passos após configuração:**
1. Testar criação de eventos customizados
2. Verificar notificações
3. Testar sincronização entre dispositivos