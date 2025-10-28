# 🚂 Railway Setup - PJe API Server

## 🎯 Objetivo

Configurar servidor de API PJe no Railway para acesso aos bancos de dados internos.

## 🚀 Quick Start

### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login e Setup

```bash
# Login no Railway
railway login

# Criar novo projeto
railway new pje-api-server

# Ou linkar projeto existente
railway link
```

### 3. Deploy

```bash
# Deploy automático
./deploy-railway.sh

# Ou manual
railway up
```

## ⚙️ Configuração de Variáveis

### Via CLI

```bash
# Configurações básicas
railway variables set NODE_ENV=production
railway variables set PORT=3001

# Banco 1º Grau
railway variables set PJE_DB_HOST_1GRAU=pje-dbpr-a1-replica
railway variables set PJE_DB_PORT_1GRAU=5432
railway variables set PJE_DB_NAME_1GRAU=pje
railway variables set PJE_DB_USER_1GRAU=seu_usuario
railway variables set PJE_DB_PASSWORD_1GRAU=sua_senha

# Banco 2º Grau
railway variables set PJE_DB_HOST_2GRAU=pje-dbpr-a2-replica
railway variables set PJE_DB_PORT_2GRAU=5432
railway variables set PJE_DB_NAME_2GRAU=pje
railway variables set PJE_DB_USER_2GRAU=seu_usuario
railway variables set PJE_DB_PASSWORD_2GRAU=sua_senha

# SSL
railway variables set PJE_DB_SSL=true
railway variables set PJE_DB_SSL_REJECT_UNAUTHORIZED=false
```

### Via Dashboard

1. Acesse [railway.app](https://railway.app)
2. Selecione seu projeto
3. Vá em **Variables**
4. Adicione as variáveis do arquivo `.env.railway.example`

## 🔍 Verificação

### Health Check

```bash
curl https://seu-app.up.railway.app/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "databases": {
    "pje1grau": "connected",
    "pje2grau": "connected"
  }
}
```

### Teste de Conexão PJe

```bash
curl https://seu-app.up.railway.app/api/pje/test-connection
```

### Teste de Distribuição

```bash
curl "https://seu-app.up.railway.app/api/pje/distribuicao-diaria?grau=1&data=2024-01-15"
```

## 📊 Monitoramento

### Logs

```bash
# Ver logs em tempo real
railway logs

# Ver logs específicos
railway logs --tail 100

# Filtrar por nível
railway logs | grep ERROR
```

### Métricas

- **CPU**: Monitorar uso
- **Memória**: < 512MB recomendado
- **Rede**: Latência para bancos PJe
- **Uptime**: > 99%

## 🔧 Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar variáveis
railway variables

# Verificar logs
railway logs | grep "database\|connection\|error"

# Testar conexão
railway run node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.PJE_DB_HOST_1GRAU,
  port: process.env.PJE_DB_PORT_1GRAU,
  database: process.env.PJE_DB_NAME_1GRAU,
  user: process.env.PJE_DB_USER_1GRAU,
  password: process.env.PJE_DB_PASSWORD_1GRAU
});
pool.query('SELECT 1').then(() => console.log('OK')).catch(console.error);
"
```

### Deploy Falha

```bash
# Ver logs de build
railway logs --deployment

# Rebuild
railway up --detach

# Verificar Dockerfile
railway run cat Dockerfile
```

### Performance Issues

```bash
# Verificar recursos
railway status

# Escalar se necessário (planos pagos)
railway scale --memory 1GB
railway scale --cpu 2
```

## 🔄 Atualizações

### Deploy Automático

O Railway faz deploy automático quando você faz push para o branch principal:

```bash
git add .
git commit -m "Update API"
git push origin main
```

### Deploy Manual

```bash
railway up
```

### Rollback

```bash
# Ver deployments
railway deployments

# Rollback para deployment específico
railway rollback <deployment-id>
```

## 🛡️ Segurança

### Variáveis de Ambiente

- ✅ Nunca commitar senhas no código
- ✅ Usar variáveis de ambiente para credenciais
- ✅ Configurar SSL para bancos de dados
- ✅ Limitar acesso de rede quando possível

### Monitoramento

- ✅ Configurar alertas para falhas
- ✅ Monitorar logs de erro
- ✅ Verificar tentativas de acesso não autorizado

## 📞 Suporte

### Comandos Úteis

```bash
# Status do projeto
railway status

# Informações do projeto
railway info

# Conectar ao shell
railway shell

# Executar comando
railway run <comando>

# Ver variáveis
railway variables

# Backup de variáveis
railway variables > backup-vars.txt
```

### Links Úteis

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/reference/cli-api)
- [Railway Pricing](https://railway.app/pricing)

---

**💡 Dica**: Mantenha este arquivo atualizado com suas configurações específicas!