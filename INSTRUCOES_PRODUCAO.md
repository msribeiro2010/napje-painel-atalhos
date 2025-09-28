# 🚀 Instruções para Uso em Produção

## ❌ **O Erro que Você Está Vendo**
```
Erro ao buscar distribuicao diaria: JSON parse: unexpected character at line 1 of the JSON data
```

**Causa**: A aplicação de produção tenta acessar `http://localhost:3001` mas o servidor PJe não está rodando na máquina onde a aplicação está sendo acessada.

## ✅ **Soluções Disponíveis**

### **Solução 1: Usar na Mesma Máquina (Mais Simples)**

**Para usar a aplicação de produção**:

1. **Na máquina onde a aplicação está hospedada**, execute:
   ```bash
   cd /Users/marceloribeiro/Projetos-Locais/napje-painel-atalhos-1
   npm run pje:server
   ```

2. **Acesse a aplicação** - a funcionalidade funcionará perfeitamente

3. **Mantenha o terminal aberto** com o servidor rodando

### **Solução 2: Acesso Remoto com ngrok**

**Para acessar de qualquer lugar**:

1. **Na máquina com acesso aos bancos PJe**:
   ```bash
   # Terminal 1: Iniciar servidor PJe
   cd /Users/marceloribeiro/Projetos-Locais/napje-painel-atalhos-1
   npm run pje:server

   # Terminal 2: Expor com ngrok
   ngrok authtoken SEU_TOKEN  # Pegar em https://dashboard.ngrok.com/get-started/your-authtoken
   ngrok http 3001
   ```

2. **Copiar a URL do ngrok** (ex: `https://abc123.ngrok.io`)

3. **Atualizar a configuração de produção**:
   ```bash
   # Editar .env.production
   VITE_PJE_API_URL=https://abc123.ngrok.io/api/pje

   # Rebuild
   npm run build:prod

   # Deploy novamente
   ```

### **Solução 3: VPN + Servidor Local**

**Para uso dentro da rede TRT15**:

1. **Conectar à VPN do TRT15**
2. **Executar o servidor** na máquina local:
   ```bash
   npm run pje:server
   ```
3. **Acessar a aplicação** normalmente

## 🔧 **Configuração Atual**

### Arquivo `.env.production`
```env
VITE_PJE_API_URL=http://localhost:3001/api/pje
```

### Bancos Configurados
- **1º Grau**: pje-dbpr-a1-replica/pje_1grau
- **2º Grau**: pje-dbpr-a2-replica/pje_2grau
- **Usuário**: msribeiro
- **Senha**: msrq1w2e3

## 📊 **Status do Sistema**

### ✅ **Funcionando Localmente**
- Servidor PJe: ✅ Conectado aos bancos
- Aplicação React: ✅ Acessando dados
- Funcionalidade Distribuição: ✅ Mostrando números dos processos

### ⚠️ **Em Produção Remota**
- Aplicação tenta acessar `localhost:3001` que não existe
- Solução: Usar uma das opções acima

## 🎯 **Recomendação Final**

### **Para Uso Imediato**
Use a **Solução 1** - execute o servidor na mesma máquina onde está acessando a aplicação de produção.

### **Para Compartilhamento**
Use a **Solução 2** - configure ngrok para acesso remoto.

### **Para Rede Corporativa**
Use a **Solução 3** - VPN + servidor local.

## 🔄 **Comandos Rápidos**

```bash
# Verificar se servidor está rodando
curl http://localhost:3001/health

# Iniciar servidor PJe
npm run pje:server

# Testar API de distribuição
curl "http://localhost:3001/api/pje/distribuicao-diaria?grau=1"

# Build de produção (após mudanças)
npm run build:prod
```

## 📱 **Testando**

Para testar se tudo está funcionando:

1. **Inicie o servidor**: `npm run pje:server`
2. **Acesse**: Consultas PJe → Distribuição
3. **Clique**: "Buscar Distribuição"
4. **Resultado**: Deve mostrar dados com números dos processos

**A aplicação está funcionando perfeitamente - só precisa do servidor PJe rodando na máquina certa!** 🚀