# 🚀 Deploy Rápido - PJe Painel de Atalhos

## 📋 Checklist de Deploy

### 1️⃣ Primeira vez configurando:

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/napje-painel-atalhos.git
cd napje-painel-atalhos

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# 3. Instale as dependências
npm install

# 4. Teste localmente
npm run dev
# Acesse http://localhost:8080

# 5. Teste o servidor PJe
npm run pje:server
# Em outro terminal, teste: curl http://localhost:3001/health
```

### 2️⃣ Deploy para GitHub:

```bash
# Método 1: Script automatizado
./deploy.sh

# Método 2: Manual
git add .
git commit -m "feat: Sua mensagem de commit"
git push origin main
```

### 3️⃣ Deploy para Vercel:

#### Primeira vez:
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Import Project"
3. Selecione o repositório do GitHub
4. Configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
VITE_PJE_API_URL=https://seu-servidor.vercel.app/api/pje
```

#### Deploys subsequentes:
```bash
# Automático ao fazer push para main
git push origin main

# Ou usando Vercel CLI
vercel --prod
```

## 🔐 Variáveis de Ambiente Necessárias

### No arquivo .env local:
```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# PJe API (obrigatório)
VITE_PJE_API_URL=http://localhost:3001/api/pje

# Bancos PJe (obrigatório para servidor)
PJE_DB1_HOST=pje-dbpr-a1-replica
PJE_DB1_DATABASE=pje_1grau
PJE_DB1_USER=seu_usuario
PJE_DB1_PASSWORD=sua_senha

PJE_DB2_HOST=pje-dbpr-a2-replica
PJE_DB2_DATABASE=pje_2grau
PJE_DB2_USER=seu_usuario
PJE_DB2_PASSWORD=sua_senha
```

### No GitHub Secrets:
Vá em **Settings > Secrets** e adicione todas as variáveis acima.

### No Vercel:
Vá em **Settings > Environment Variables** e adicione todas as variáveis VITE_*.

## 🌐 URLs de Acesso

Após o deploy, sua aplicação estará disponível em:

- **Local**: http://localhost:8080
- **GitHub Pages**: https://SEU_USUARIO.github.io/napje-painel-atalhos/
- **Vercel**: https://napje-painel-atalhos.vercel.app
- **Domínio customizado**: https://seu-dominio.com.br (opcional)

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Roda aplicação em modo dev
npm run pje:server   # Roda servidor PJe

# Build
npm run build        # Build de desenvolvimento
npm run build:prod   # Build de produção

# Qualidade
npm run lint         # Verifica código
npm run type-check   # Verifica tipos TypeScript

# Deploy
./deploy.sh          # Deploy automatizado
vercel               # Deploy para Vercel (staging)
vercel --prod        # Deploy para Vercel (produção)
```

## ❓ Troubleshooting

### Erro: "Invalid API key"
- Verifique as variáveis VITE_SUPABASE_* no .env
- Confirme que as chaves estão corretas no Supabase Dashboard

### Erro: "Cannot connect to PJe database"
- Verifique se está na rede interna ou VPN do TRT15
- Confirme credenciais PJE_DB* no .env
- Teste conexão: `psql -h pje-dbpr-a1-replica -U usuario -d pje_1grau`

### Erro: "Build failed"
- Execute `npm run lint` para ver erros de código
- Execute `npm run type-check` para erros de TypeScript
- Verifique se todas as dependências estão instaladas: `npm ci`

### Erro: "CORS blocked"
- Verifique VITE_PJE_API_URL no frontend
- Confirme que o servidor está rodando com CORS habilitado
- Adicione sua URL no CORS do servidor se necessário

## 📞 Suporte

Em caso de dúvidas:
1. Verifique o [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instruções detalhadas
2. Consulte a documentação no [README.md](./README.md)
3. Abra uma issue no GitHub
4. Entre em contato com a equipe de TI

## 🎯 Deploy em 5 minutos

```bash
# Clone, configure e faça deploy rapidamente
git clone https://github.com/SEU_USUARIO/napje-painel-atalhos.git
cd napje-painel-atalhos
cp .env.example .env
# (edite o .env com suas credenciais)
npm install
./deploy.sh
```

Pronto! 🎉 Sua aplicação está no ar!