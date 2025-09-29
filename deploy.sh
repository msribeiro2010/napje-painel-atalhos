#!/bin/bash

# Deploy Script para PJe Painel de Atalhos
# Autor: Sistema automatizado
# Data: Setembro 2025

echo "🚀 Iniciando processo de deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está na branch main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Você está na branch '$CURRENT_BRANCH'. Mudando para 'main'...${NC}"
    git checkout main
fi

# Verificar se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}📝 Mudanças detectadas. Commitando...${NC}"
    git add .
    read -p "Digite a mensagem do commit: " commit_msg
    git commit -m "$commit_msg"
fi

# Atualizar da origem
echo "📥 Atualizando da origem..."
git pull origin main

# Verificar se o .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "Copie .env.example para .env e configure suas variáveis"
    exit 1
fi

# Build de produção
echo "🔨 Executando build de produção..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

# Push para GitHub
echo "📤 Enviando para GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao enviar para GitHub!${NC}"
    exit 1
fi

# Deploy no Vercel
echo "☁️  Fazendo deploy no Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo -e "${YELLOW}⚠️  Vercel CLI não instalado. Instale com: npm i -g vercel${NC}"
    echo "O deploy será feito automaticamente pelo Vercel ao detectar o push no GitHub"
fi

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique o deploy em: https://vercel.com/dashboard"
echo "2. Configure as variáveis de ambiente no Vercel se necessário"
echo "3. Teste a aplicação em produção"
echo ""
echo "🔗 URLs:"
echo "   GitHub: https://github.com/[seu-usuario]/napje-painel-atalhos"
echo "   Vercel: https://[seu-app].vercel.app"