# Configuração do Proxy Reverso na Vercel

## ✅ Configuração Implementada

### 1. Arquivo `vercel.json` Atualizado

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/pje/:path*",
      "destination": "https://nonincandescent-comfortedly-sheridan.ngrok-free.dev/api/pje/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Variável de Ambiente Atualizada

No `.env.production`:
```env
VITE_PJE_API_URL=/api/pje
```

## Como Funciona

1. **Requisições do Frontend**: Todas as chamadas para `/api/pje/*` são feitas para o próprio domínio da Vercel
2. **Proxy Reverso**: A Vercel redireciona automaticamente essas requisições para o servidor ngrok
3. **Sem CORS**: Como as requisições são feitas para o mesmo domínio, não há problemas de CORS

## Vantagens desta Configuração

- ✅ **Sem problemas de CORS**
- ✅ **URLs relativas no frontend**
- ✅ **Fácil mudança de servidor backend**
- ✅ **Funciona em produção e desenvolvimento**

## Para Fazer Deploy

1. **Commit das alterações**:
   ```bash
   git add .
   git commit -m "Configurar proxy reverso para API PJe"
   git push
   ```

2. **Deploy automático**: A Vercel fará o deploy automaticamente

## Testando a Configuração

Após o deploy, teste:
- Acesse sua aplicação na Vercel
- Teste as funcionalidades do PJe
- Verifique no DevTools se as requisições estão sendo feitas para `/api/pje/*`

## Mudando o Servidor Backend

Para apontar para um servidor diferente, apenas altere a `destination` no `vercel.json`:

```json
{
  "source": "/api/pje/:path*",
  "destination": "https://seu-novo-servidor.com/api/pje/:path*"
}
```

## Troubleshooting

### Se ainda houver erros:

1. **Verifique os logs da Vercel**:
   - Acesse o dashboard da Vercel
   - Vá em "Functions" → "View Function Logs"

2. **Teste o servidor ngrok diretamente**:
   ```bash
   curl https://nonincandescent-comfortedly-sheridan.ngrok-free.dev/api/pje/test
   ```

3. **Verifique se o ngrok está rodando**:
   - O servidor ngrok precisa estar ativo
   - Confirme se a URL está correta

## Próximos Passos

1. **Deploy imediato** - As configurações já estão prontas
2. **Monitorar logs** - Verificar se há erros após o deploy
3. **Considerar servidor permanente** - O ngrok é temporário, considere um servidor fixo para produção