# Deploy na Vercel

## Pré-requisitos
- Conta na Vercel (https://vercel.com)
- Repositório já está no GitHub

## Passos para Deploy

### 1. Conectar o Repositório na Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Conecte sua conta GitHub se ainda não estiver conectada
4. Procure por "napje-painel-atalhos" e selecione o repositório
5. Clique em "Import"

### 2. Configurar as Variáveis de Ambiente

Na tela de configuração, adicione as seguintes variáveis de ambiente:

```
VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdWZjdmVzZW5iaHRtaXptaml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDY5ODMsImV4cCI6MjA2NTA4Mjk4M30.aD0E3fkuTjaYnHRdWpYjCk_hPK-sKhVT2VdIfXy3Hy8
```

**IMPORTANTE**: As variáveis do banco PJe NÃO devem ser configuradas na Vercel por questões de segurança. O servidor PJe deve rodar apenas localmente.

### 3. Configurações de Build

- **Framework Preset**: Vite
- **Build Command**: `npm run build` (já configurado)
- **Output Directory**: `dist` (já configurado)
- **Install Command**: `npm install`

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o processo de build e deploy
3. Após conclusão, você receberá uma URL do tipo: `https://napje-painel-atalhos.vercel.app`

## Atualizações Automáticas

- Cada push para a branch `main` no GitHub acionará automaticamente um novo deploy
- Você pode acompanhar os deploys em: https://vercel.com/dashboard

## Domínio Personalizado (Opcional)

1. No dashboard da Vercel, acesse seu projeto
2. Vá em "Settings" > "Domains"
3. Adicione seu domínio personalizado
4. Configure os DNS conforme instruções da Vercel

## Funcionalidades na Vercel

✅ Funcionalidades que funcionarão na Vercel:
- Login/Autenticação (Supabase)
- Gerenciamento de Links
- Calendário
- Knowledge Base
- Tickets/Chamados
- Todas as funcionalidades que usam Supabase

❌ Funcionalidades que NÃO funcionarão na Vercel:
- Consultas PJe (requer servidor local com acesso ao banco PJe)
- Busca de Servidores PJe
- Busca de Processos por CPF/CNPJ
- OJs do Servidor

Para usar as funcionalidades PJe, é necessário rodar o servidor localmente com:
```bash
npm run pje:server
```

## Troubleshooting

### Build falhou
- Verifique se todas as dependências estão no package.json
- Confirme que as variáveis de ambiente estão configuradas

### Página em branco após deploy
- Verifique se as variáveis VITE_SUPABASE_* estão configuradas
- Confira o console do navegador para erros

### Rotas não funcionam
- O arquivo vercel.json já está configurado para SPA
- Se ainda houver problemas, verifique as rewrites no vercel.json

## Comandos Úteis

```bash
# Testar build localmente antes do deploy
npm run build
npm run preview

# Ver logs de build na Vercel
vercel logs

# Deploy manual (requer Vercel CLI)
vercel --prod
```
