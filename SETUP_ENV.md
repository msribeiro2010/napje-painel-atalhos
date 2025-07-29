# 🔧 Configuração de Variáveis de Ambiente

## 📋 Setup Local

1. **Copie o arquivo de exemplo:**
```bash
cp .env.example .env
```

2. **Configure as variáveis no arquivo `.env`:**
```env
VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY=[sua_chave_supabase_aqui]
VITE_OPENAI_API_KEY=[sua_chave_openai_aqui]
```

## 🚀 Deploy no Vercel

Configure as seguintes variáveis no dashboard do Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `VITE_APP_TITLE`
- `VITE_APP_VERSION`
- `VITE_OPENAI_API_KEY`

## ⚠️ Importante

- Nunca commite arquivos `.env` com chaves reais
- As chaves estão disponíveis no dashboard do Supabase
- A chave da OpenAI deve estar configurada nas Edge Functions do Supabase