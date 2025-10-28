# 🚀 Configuração de Variáveis de Ambiente na Vercel para Produção

## 📋 Pré-requisitos

- Conta na Vercel configurada
- Projeto conectado ao repositório GitHub
- Acesso aos bancos PostgreSQL de produção
- Chaves do Supabase de produção

## 🔧 Passo a Passo para Configurar na Vercel

### 1. Acessar o Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto `napje-painel-atalhos`
4. Vá para a aba **Settings**
5. Clique em **Environment Variables**

### 2. Configurar Variáveis Obrigatórias

#### 🔐 Configurações do Supabase
```
VITE_SUPABASE_URL = https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY = [SUA_CHAVE_ANON_DO_SUPABASE]
```

#### 🏗️ Configurações da Aplicação
```
NODE_ENV = production
VITE_APP_ENV = production
VITE_APP_TITLE = PJe - Painel de Atalhos Inteligente
VITE_APP_VERSION = 20250815162240
```

#### 🤖 Funcionalidades de IA
```
VITE_AI_FEATURES_ENABLED = true
VITE_SMART_SEARCH_ENABLED = true
VITE_AI_INSIGHTS_ENABLED = true
VITE_SMART_NOTIFICATIONS_ENABLED = true
VITE_SMART_FORMS_ENABLED = true
```

#### 📊 Analytics e Monitoramento
```
VITE_ENABLE_ANALYTICS = true
VITE_ENABLE_PERFORMANCE_MONITORING = true
VITE_SENTRY_DSN = [SEU_SENTRY_DSN] (opcional)
```

### 3. Configurar Bancos PostgreSQL (PJe)

#### 🗄️ Banco 1º Grau
```
PJE_DB1_HOST = [HOST_DO_BANCO_1_GRAU]
PJE_DB1_DATABASE = pje_1grau
PJE_DB1_USER = [USUARIO_DO_BANCO_1_GRAU]
PJE_DB1_PASSWORD = [SENHA_DO_BANCO_1_GRAU]
```

#### 🗄️ Banco 2º Grau
```
PJE_DB2_HOST = [HOST_DO_BANCO_2_GRAU]
PJE_DB2_DATABASE = pje_2grau
PJE_DB2_USER = [USUARIO_DO_BANCO_2_GRAU]
PJE_DB2_PASSWORD = [SENHA_DO_BANCO_2_GRAU]
```

#### 🌐 API do PJe
```
VITE_PJE_API_URL = https://[SEU_DOMINIO]/api/pje
```

### 4. Configurações Opcionais

#### 🔍 Debug e Desenvolvimento
```
VITE_DEBUG = false
VITE_OFFLINE_MODE = false
```

#### 🔑 Chaves de APIs Externas (se necessário)
```
VITE_OPENAI_API_KEY = [SUA_CHAVE_OPENAI] (opcional)
VITE_WEATHER_API_KEY = [SUA_CHAVE_WEATHER] (opcional)
VITE_GOOGLE_ANALYTICS_ID = [SEU_GA_ID] (opcional)
```

## 🛡️ Configurações de Segurança

### Environment Scope
Para cada variável, configure o **Environment Scope**:

- **Production**: Para variáveis de produção
- **Preview**: Para branches de teste
- **Development**: Para desenvolvimento local

### Variáveis Sensíveis
⚠️ **NUNCA** commite as seguintes variáveis no código:
- Senhas dos bancos PostgreSQL
- Chaves do Supabase
- Tokens de APIs
- DSNs do Sentry

## 📝 Checklist de Configuração

### ✅ Antes do Deploy

- [ ] Todas as variáveis obrigatórias configuradas
- [ ] Credenciais dos bancos PostgreSQL testadas
- [ ] Chaves do Supabase válidas
- [ ] URLs de produção corretas
- [ ] Funcionalidades de IA habilitadas conforme necessário

### ✅ Após o Deploy

- [ ] Aplicação carregando corretamente
- [ ] Conexão com Supabase funcionando
- [ ] Consultas aos bancos PJe funcionando
- [ ] Analytics configurado (se habilitado)
- [ ] Logs de erro monitorados

## 🔄 Como Atualizar Variáveis

1. Acesse **Settings > Environment Variables** no projeto Vercel
2. Clique no ícone de edição da variável
3. Atualize o valor
4. Clique em **Save**
5. Faça um novo deploy para aplicar as mudanças

## 🚨 Troubleshooting

### Erro de Conexão com Banco
- Verifique se as credenciais estão corretas
- Confirme se o host está acessível da Vercel
- Teste a conexão localmente primeiro

### Erro do Supabase
- Verifique se a URL está correta
- Confirme se a chave anon está válida
- Verifique as políticas RLS no Supabase

### Aplicação não carrega
- Verifique os logs na aba **Functions** da Vercel
- Confirme se todas as variáveis obrigatórias estão configuradas
- Teste localmente com as mesmas variáveis

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da Vercel
2. Teste as configurações localmente
3. Confirme se todas as variáveis estão configuradas
4. Verifique a conectividade com os bancos externos

---

**⚡ Dica**: Use o arquivo `.env.production` como referência para as variáveis, mas nunca commite valores reais de produção no repositório.