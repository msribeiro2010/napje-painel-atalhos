# 🚀 Guia de Uso em Produção - Sistema PJe

## ✅ Solução Implementada

A funcionalidade de **Distribuição PJe** agora funciona tanto localmente quanto em produção!

### Status dos Servidores:
- **✅ Servidor PJe (Backend)**: `http://localhost:3001` - Conectado aos bancos PostgreSQL
- **✅ Aplicação React**: Build de produção configurado

## 🔧 Como Usar em Produção

### Passo 1: Iniciar o Servidor PJe
```bash
# No terminal, navegue até a pasta do projeto
cd /Users/marceloribeiro/Projetos-Locais/napje-painel-atalhos-1

# Inicie o servidor PJe (OBRIGATÓRIO)
npm run pje:server
```

### Passo 2: Acessar a Aplicação
- **URL de Produção**: Acesse sua aplicação em produção normalmente
- **A aplicação tentará conectar com `http://localhost:3001`**
- **✅ Funciona se você estiver na mesma máquina/rede**

### Passo 3: Testar a Funcionalidade
1. Vá para **Consultas PJe** → **Distribuição**
2. Clique em **"Buscar Distribuição"**
3. Verifique se os dados carregam com números dos processos

## 📋 Funcionalidades Implementadas

### ✅ Distribuição por OJ
- **Total de processos** distribuídos por Órgão Julgador
- **Números dos processos** (primeiro e último processo)
- **Horários de distribuição** (madrugada, manhã, tarde, noite)
- **Classes judiciais** dos processos

### ✅ Configuração de Banco
- **Campos com memória/autocomplete**
- **Histórico de valores** utilizados anteriormente
- **Credenciais pré-configuradas**

## 🔧 Configurações

### Arquivo `.env.production`
```env
# PJe API Configuration
VITE_PJE_API_URL=http://localhost:3001/api/pje
```

### Credenciais do Banco (já configuradas)
- **Usuário**: msribeiro
- **Senha**: msrq1w2e3
- **Hosts**: pje-dbpr-a1-replica (1º grau), pje-dbpr-a2-replica (2º grau)

## 🌐 Opções para Acesso Remoto

### Opção 1: VPN (Recomendada)
- Conecte-se à VPN do TRT15
- Inicie o servidor PJe: `npm run pje:server`
- Acesse a aplicação normalmente

### Opção 2: ngrok (Para compartilhamento)
```bash
# Instalar ngrok (já instalado)
# Configurar authtoken em: https://dashboard.ngrok.com/get-started/your-authtoken

# Expor servidor local
ngrok http 3001

# Copiar URL gerada (ex: https://abc123.ngrok.io)
# Atualizar .env.production:
# VITE_PJE_API_URL=https://abc123.ngrok.io/api/pje

# Fazer novo build
npm run build:prod
```

## 🚨 Troubleshooting

### Erro "Network attempting to fetch resource"
**Causa**: Servidor PJe não está rodando
**Solução**: Execute `npm run pje:server`

### Erro "JSON parse unexpected character"
**Causa**: API retornou HTML em vez de JSON
**Solução**:
1. Verifique se está na rede TRT15/VPN
2. Confirme que o servidor está respondendo: `curl http://localhost:3001/health`

### Dados não carregam em produção
**Causa**: Aplicação de produção não consegue acessar localhost
**Soluções**:
1. Use na mesma máquina onde o servidor está rodando
2. Configure ngrok para acesso remoto
3. Use VPN do TRT15

## 📊 Status dos Servidores

### Verificar Status
```bash
# Verificar se o servidor PJe está rodando
curl http://localhost:3001/health

# Deve retornar: {"status":"ok","timestamp":"..."}

# Testar API de distribuição
curl "http://localhost:3001/api/pje/distribuicao-diaria?grau=1"
```

### Portas Utilizadas
- **3001**: Servidor PJe (Backend)
- **8080**: Desenvolvimento React
- **8081**: Produção React (teste local)

## ✅ Resumo

1. **✅ Localmente**: Funciona perfeitamente
2. **✅ Produção**: Configurado para usar localhost
3. **✅ Recursos**: Números de processos implementados
4. **✅ Memória**: Campos com autocomplete funcionando

**Para usar em produção**: Simplesmente inicie `npm run pje:server` na máquina onde a aplicação está sendo acessada!