# 🗄️ Configuração dos Bancos PostgreSQL PJe na Vercel

## 📊 Visão Geral dos Bancos

O sistema utiliza **dois bancos PostgreSQL** separados para diferentes instâncias do PJe:

- **Banco 1º Grau**: `pje_1grau` - Processos de primeira instância
- **Banco 2º Grau**: `pje_2grau` - Processos de segunda instância

## 🔧 Configuração na Vercel

### 1. Variáveis para Banco 1º Grau

```bash
# Banco PJe 1º Grau
PJE_DB1_HOST=pje-dbpr-a1-replica
PJE_DB1_DATABASE=pje_1grau
PJE_DB1_USER=[SEU_USUARIO_DB1]
PJE_DB1_PASSWORD=[SUA_SENHA_DB1]
```

### 2. Variáveis para Banco 2º Grau

```bash
# Banco PJe 2º Grau
PJE_DB2_HOST=pje-dbpr-a2-replica
PJE_DB2_DATABASE=pje_2grau
PJE_DB2_USER=[SEU_USUARIO_DB2]
PJE_DB2_PASSWORD=[SUA_SENHA_DB2]
```

### 3. Configuração da API

```bash
# URL da API que conecta aos bancos
VITE_PJE_API_URL=https://[SEU_DOMINIO]/api/pje
```

## 🛡️ Configurações de Segurança

### Acesso aos Bancos

1. **Usuários de Leitura**: Use usuários com permissões apenas de leitura
2. **IPs Permitidos**: Configure whitelist de IPs da Vercel
3. **SSL**: Sempre use conexões SSL/TLS
4. **Timeout**: Configure timeouts apropriados

### Exemplo de Usuário Seguro

```sql
-- Criar usuário apenas para leitura
CREATE USER pje_readonly WITH PASSWORD 'senha_segura';

-- Conceder permissões apenas de leitura
GRANT CONNECT ON DATABASE pje_1grau TO pje_readonly;
GRANT USAGE ON SCHEMA public TO pje_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pje_readonly;

-- Para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO pje_readonly;
```

## 🔍 Testando as Conexões

### 1. Teste Local

Antes de configurar na Vercel, teste localmente:

```bash
# Teste conexão banco 1º grau
psql -h pje-dbpr-a1-replica -U [usuario] -d pje_1grau

# Teste conexão banco 2º grau
psql -h pje-dbpr-a2-replica -U [usuario] -d pje_2grau
```

### 2. Teste via Aplicação

Use o script de teste incluído no projeto:

```bash
node test-supabase-connection.js
```

## 📋 Checklist de Configuração

### ✅ Pré-Deploy

- [ ] Credenciais dos dois bancos testadas
- [ ] Usuários com permissões corretas criados
- [ ] IPs da Vercel liberados no firewall
- [ ] SSL habilitado nos bancos
- [ ] Timeouts configurados

### ✅ Configuração na Vercel

- [ ] `PJE_DB1_HOST` configurado
- [ ] `PJE_DB1_DATABASE` configurado
- [ ] `PJE_DB1_USER` configurado
- [ ] `PJE_DB1_PASSWORD` configurado
- [ ] `PJE_DB2_HOST` configurado
- [ ] `PJE_DB2_DATABASE` configurado
- [ ] `PJE_DB2_USER` configurado
- [ ] `PJE_DB2_PASSWORD` configurado
- [ ] `VITE_PJE_API_URL` configurado

### ✅ Pós-Deploy

- [ ] Consultas ao banco 1º grau funcionando
- [ ] Consultas ao banco 2º grau funcionando
- [ ] Logs de conexão sem erros
- [ ] Performance adequada

## 🚨 Troubleshooting

### Erro de Conexão

**Sintomas**: `ECONNREFUSED` ou `timeout`

**Soluções**:
1. Verifique se o host está correto
2. Confirme se a porta está aberta (geralmente 5432)
3. Verifique se o IP da Vercel está liberado
4. Teste a conexão localmente

### Erro de Autenticação

**Sintomas**: `authentication failed`

**Soluções**:
1. Verifique usuário e senha
2. Confirme se o usuário tem permissões no banco
3. Verifique se o usuário pode conectar do IP da Vercel

### Erro de Permissão

**Sintomas**: `permission denied for table`

**Soluções**:
1. Conceda permissões de SELECT nas tabelas necessárias
2. Verifique se o schema está correto
3. Use `GRANT USAGE ON SCHEMA public TO usuario;`

### Performance Lenta

**Sintomas**: Consultas demoram muito

**Soluções**:
1. Verifique índices nas tabelas consultadas
2. Otimize as queries
3. Configure connection pooling
4. Ajuste timeouts

## 📊 Monitoramento

### Logs Importantes

Monitore estes logs na Vercel:

```bash
# Conexões bem-sucedidas
"Connected to PJE DB1"
"Connected to PJE DB2"

# Erros de conexão
"Failed to connect to PJE DB1"
"Connection timeout"
"Authentication failed"
```

### Métricas

Acompanhe:
- Tempo de resposta das consultas
- Número de conexões ativas
- Erros de timeout
- Taxa de sucesso das consultas

## 🔄 Manutenção

### Rotação de Senhas

1. Altere a senha no banco PostgreSQL
2. Atualize a variável na Vercel
3. Faça um novo deploy
4. Monitore os logs para confirmar

### Backup das Configurações

Mantenha um backup seguro das configurações:
- Hosts dos bancos
- Nomes dos usuários
- Estrutura das permissões

## 📞 Contatos de Suporte

- **DBA**: Para questões de banco de dados
- **Infraestrutura**: Para questões de rede/firewall
- **Desenvolvimento**: Para questões da aplicação

---

**⚠️ Importante**: Nunca commite credenciais reais no repositório. Use sempre as variáveis de ambiente da Vercel para informações sensíveis.