# 🌐 Guia de Acesso Remoto - Painel PJe

Este guia explica como configurar e acessar a aplicação PJe de outros computadores através da internet.

## 📋 Pré-requisitos

1. **ngrok** instalado e configurado
2. **Servidor PJe** rodando localmente na porta 3001
3. **Frontend** configurado com as variáveis de ambiente corretas

## 🚀 Configuração Rápida

### 1. Iniciar o Servidor PJe
```bash
npm run pje:server
```

### 2. Iniciar o ngrok
```bash
ngrok http 3001
```

### 3. Obter a URL do ngrok
```bash
curl -s http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'
```

### 4. Configurar Variáveis de Ambiente

**Para desenvolvimento local com acesso remoto:**
```bash
# Copie o arquivo .env.remote e ajuste a URL do ngrok
cp .env.remote .env.local
```

**Para produção (Vercel):**
- Configure `VITE_PJE_API_URL` com a URL do ngrok no painel da Vercel

## 🔗 URLs de Acesso

### URLs Atuais (Exemplo)
- **API Remota**: `https://nonincandescent-comfortedly-sheridan.ngrok-free.dev`
- **Frontend Local**: `http://localhost:8080`
- **Frontend Produção**: `https://napje-painel-atalhos.vercel.app`

### Endpoints Principais
- **Distribuição**: `/api/pje/distribuicao-diaria?grau=1&data=2025-09-28`
- **Órgãos Julgadores**: `/api/pje/orgaos-julgadores?grau=1`
- **Processos**: `/api/pje/processos?grau=1&numero=XXX`
- **Servidores**: `/api/pje/servidores?grau=1&nome=João`

## 🛠️ Configurações Técnicas

### CORS Configurado
O servidor PJe foi configurado com CORS permissivo para acesso remoto:
- ✅ Permite qualquer origem (`origin: true`)
- ✅ Suporte a credenciais
- ✅ Headers personalizados
- ✅ Métodos HTTP completos

### Headers de Segurança
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
```

## 🧪 Teste de Conectividade

### Teste da API Remota
```bash
curl -X GET "https://nonincandescent-comfortedly-sheridan.ngrok-free.dev/api/pje/distribuicao-diaria?grau=1&data=2025-09-28" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Content-Type: application/json"
```

### Teste do Frontend
1. Acesse: `http://localhost:8080/consultas-pje`
2. Vá para: **Consultas PJe → Distribuição**
3. Configure: Grau 1º, Data atual
4. Clique: **Buscar Distribuição**

## 📱 Acesso de Outros Computadores

### Opção 1: ngrok URL (Recomendado)
1. Compartilhe a URL do ngrok: `https://[seu-ngrok-url].ngrok-free.dev`
2. Outros usuários podem acessar diretamente esta URL
3. **Nota**: A URL do ngrok muda a cada reinicialização

### Opção 2: Frontend Produção + API ngrok
1. Configure `VITE_PJE_API_URL` na Vercel com a URL do ngrok
2. Acesse: `https://napje-painel-atalhos.vercel.app`
3. A aplicação usará a API local via ngrok

## ⚠️ Considerações Importantes

### Segurança
- O ngrok expõe seu servidor local na internet
- Use apenas em ambientes de desenvolvimento/teste
- Para produção, considere soluções mais seguras

### Performance
- A latência pode ser maior via ngrok
- Monitore o uso de dados
- O ngrok gratuito tem limitações de largura de banda

### Estabilidade
- A URL do ngrok muda a cada reinicialização
- Para URLs fixas, considere o plano pago do ngrok
- Mantenha o servidor PJe sempre rodando

## 🔄 Fluxo Completo de Configuração

1. **Iniciar Serviços**:
   ```bash
   # Terminal 1: Servidor PJe
   npm run pje:server
   
   # Terminal 2: ngrok
   ngrok http 3001
   
   # Terminal 3: Frontend (opcional)
   npm run dev
   ```

2. **Obter URLs**:
   ```bash
   # URL do ngrok
   curl -s http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'
   ```

3. **Configurar Frontend**:
   - Atualize `.env.local` ou `.env.remote`
   - Configure Vercel se necessário

4. **Testar Acesso**:
   - Teste local: `http://localhost:8080`
   - Teste remoto: URL do ngrok
   - Teste produção: Vercel URL

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o servidor PJe está rodando
2. Confirme se o ngrok está ativo
3. Teste a conectividade com curl
4. Verifique as configurações de CORS
5. Monitore os logs do servidor

---

**Última atualização**: 28/09/2025
**Versão**: 1.0.0