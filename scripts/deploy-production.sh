#!/bin/bash

# 🚀 Script de Deploy para Produção - Sistema NAPJe com IA
# Versão: 2.0 com funcionalidades avançadas de IA

set -e

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/dist"
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-zpufcvesenbhtmizmjiz}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funções de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] ❌ $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] ℹ️  $1${NC}"
}

ai_log() {
    echo -e "${PURPLE}[AI] 🤖 $1${NC}"
}

step() {
    echo -e "${CYAN}[STEP] 🔄 $1${NC}"
}

# Banner
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🚀 DEPLOY PRODUÇÃO                       ║"
echo "║              Sistema NAPJe com IA Avançada                  ║"
echo "║                     Versão 2.0                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar pré-requisitos
step "Verificando pré-requisitos..."

# Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale Node.js 18+"
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versão 18+ necessária. Versão atual: $(node --version)"
fi
info "Node.js: $(node --version) ✅"

# npm
if ! command -v npm &> /dev/null; then
    error "npm não encontrado"
fi
info "npm: $(npm --version) ✅"

# Supabase CLI (opcional)
if command -v supabase &> /dev/null; then
    info "Supabase CLI: $(supabase --version) ✅"
    SUPABASE_CLI_AVAILABLE=true
else
    warn "Supabase CLI não encontrado. Edge Functions não serão deployadas automaticamente."
    SUPABASE_CLI_AVAILABLE=false
fi

# Git
if ! command -v git &> /dev/null; then
    error "Git não encontrado"
fi
info "Git: $(git --version) ✅"

# Verificar se estamos na branch correta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    warn "Você está na branch '$CURRENT_BRANCH'. Recomendado fazer deploy da branch 'main' ou 'master'."
    read -p "Continuar mesmo assim? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deploy cancelado pelo usuário"
    fi
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warn "Há mudanças não commitadas no repositório"
    read -p "Continuar mesmo assim? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deploy cancelado. Commit suas mudanças primeiro."
    fi
fi

# Limpeza
step "Limpando builds anteriores..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    log "Build anterior removido"
fi

# Instalar dependências
step "Instalando dependências..."
cd "$PROJECT_ROOT"
npm ci --production=false || error "Falha ao instalar dependências"
log "Dependências instaladas com sucesso"

# Verificar variáveis de ambiente necessárias
step "Verificando configurações de produção..."

# Criar arquivo .env.production se não existir
if [ ! -f ".env.production" ]; then
    info "Criando arquivo .env.production..."
    cat > .env.production << EOF
# Configurações de Produção - Sistema NAPJe com IA
NODE_ENV=production
VITE_APP_ENV=production

# Supabase Configuration
VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# AI Features
VITE_AI_FEATURES_ENABLED=true
VITE_SMART_SEARCH_ENABLED=true
VITE_AI_INSIGHTS_ENABLED=true
VITE_SMART_NOTIFICATIONS_ENABLED=true
VITE_SMART_FORMS_ENABLED=true

# Performance & Analytics
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_SENTRY_DSN=YOUR_SENTRY_DSN_HERE

# Application Info
VITE_APP_TITLE=NAPJe - Painel de Atalhos Inteligente
VITE_APP_VERSION=$(date +%Y%m%d%H%M%S)
VITE_BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
VITE_COMMIT_HASH=$(git rev-parse --short HEAD)
EOF
    warn ".env.production criado. Configure as variáveis necessárias!"
fi

# Verificar se as variáveis críticas estão configuradas
if grep -q "YOUR_ANON_KEY_HERE" .env.production; then
    warn "Configure VITE_SUPABASE_ANON_KEY em .env.production"
fi

# Lint e verificações de código
step "Executando verificações de código..."
npm run lint || warn "Problemas de lint encontrados"
npm run type-check || error "Erros de TypeScript encontrados"
log "Verificações de código concluídas"

# Deploy das Edge Functions (se Supabase CLI disponível)
if [ "$SUPABASE_CLI_AVAILABLE" = true ]; then
    step "Deployando Edge Functions de IA..."
    
    # Verificar se está logado no Supabase
    if ! supabase projects list &> /dev/null; then
        warn "Não está logado no Supabase. Execute: supabase login"
    else
        # Link do projeto se necessário
        if [ ! -f "supabase/.temp/project-ref" ]; then
            info "Fazendo link com projeto Supabase..."
            supabase link --project-ref "$SUPABASE_PROJECT_ID" || warn "Falha ao fazer link com Supabase"
        fi
        
        # Deploy das functions
        if [ -d "supabase/functions" ]; then
            ai_log "Deployando Edge Functions de IA..."
            supabase functions deploy || warn "Falha ao deployar Edge Functions"
            log "Edge Functions deployadas"
        else
            warn "Pasta supabase/functions não encontrada"
        fi
    fi
else
    warn "Supabase CLI não disponível. Edge Functions devem ser deployadas manualmente."
fi

# Build otimizado para produção
step "Construindo aplicação para produção..."

# Configurar variáveis de build
export NODE_ENV=production
export VITE_BUILD_TIMESTAMP=$(date +%s)
export VITE_COMMIT_HASH=$(git rev-parse --short HEAD)
export VITE_BRANCH_NAME=$(git branch --show-current)

# Build com otimizações
npm run build:prod || error "Falha no build de produção"

# Verificar se o build foi gerado
if [ ! -d "$BUILD_DIR" ]; then
    error "Pasta 'dist' não foi gerada"
fi

log "Build de produção gerado com sucesso!"

# Análise do build
step "Analisando build gerado..."

# Tamanho do build
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
info "Tamanho total do build: $BUILD_SIZE"

# Contar arquivos
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
info "Número de arquivos: $FILE_COUNT"

# Verificar arquivos críticos
if [ ! -f "$BUILD_DIR/index.html" ]; then
    error "index.html não encontrado no build"
fi

if [ ! -d "$BUILD_DIR/assets" ]; then
    warn "Pasta assets não encontrada no build"
fi

# Verificar se há arquivos muito grandes
LARGE_FILES=$(find "$BUILD_DIR" -type f -size +2M)
if [ -n "$LARGE_FILES" ]; then
    warn "Arquivos grandes encontrados (>2MB):"
    echo "$LARGE_FILES" | while read -r file; do
        size=$(du -sh "$file" | cut -f1)
        warn "  - $file ($size)"
    done
fi

# Otimizações pós-build
step "Aplicando otimizações..."

# Verificar se gzip está disponível
if command -v gzip &> /dev/null; then
    info "Criando versões comprimidas dos arquivos estáticos..."
    find "$BUILD_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) -exec gzip -9 -k {} \;
    log "Arquivos comprimidos criados"
fi

# Criar arquivo de informações do build
step "Criando metadados do build..."
cat > "$BUILD_DIR/build-info.json" << EOF
{
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "commitHash": "$(git rev-parse HEAD)",
  "commitShort": "$(git rev-parse --short HEAD)",
  "branch": "$(git branch --show-current)",
  "version": "$(grep '"version"' package.json | cut -d'"' -f4)",
  "buildSize": "$BUILD_SIZE",
  "fileCount": $FILE_COUNT,
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "aiFeatures": {
    "smartSearch": true,
    "aiInsights": true,
    "smartNotifications": true,
    "smartForms": true,
    "edgeFunctions": $([ "$SUPABASE_CLI_AVAILABLE" = true ] && echo "true" || echo "false")
  }
}
EOF

log "Metadados do build criados"

# Verificações finais
step "Executando verificações finais..."

# Verificar se index.html está bem formado
if command -v xmllint &> /dev/null; then
    xmllint --html --noout "$BUILD_DIR/index.html" 2>/dev/null && log "index.html válido" || warn "Problemas detectados no index.html"
fi

# Verificar se há console.log em produção (em arquivos JS)
if grep -r "console\.log" "$BUILD_DIR/assets" 2>/dev/null; then
    warn "console.log encontrado em arquivos de produção"
fi

# Verificar se há referências a localhost
if grep -r "localhost" "$BUILD_DIR" 2>/dev/null; then
    warn "Referências a localhost encontradas no build"
fi

# Preparar para deploy
step "Preparando para deploy..."

# Criar arquivo .nojekyll para GitHub Pages
echo "" > "$BUILD_DIR/.nojekyll"

# Criar arquivo CNAME se necessário (para domínio customizado)
# echo "seu-dominio.com" > "$BUILD_DIR/CNAME"

# Relatório final
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     ✅ BUILD CONCLUÍDO                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "🎉 Deploy preparado com sucesso!"
echo ""
info "📊 Estatísticas do Build:"
info "   • Tamanho: $BUILD_SIZE"
info "   • Arquivos: $FILE_COUNT"
info "   • Commit: $(git rev-parse --short HEAD)"
info "   • Branch: $(git branch --show-current)"
info "   • Build: $(date)"
echo ""

ai_log "🤖 Funcionalidades de IA incluídas:"
ai_log "   • Busca Inteligente Global"
ai_log "   • Dashboard de Insights com IA"
ai_log "   • Preenchimento Automático"
ai_log "   • Notificações Inteligentes"
ai_log "   • Edge Functions $([ "$SUPABASE_CLI_AVAILABLE" = true ] && echo "✅" || echo "⚠️")"
echo ""

info "🚀 Próximos passos:"
if [ -d ".git" ]; then
    info "   1. git add dist"
    info "   2. git commit -m 'Deploy: $(date +%Y%m%d-%H%M%S)'"
    info "   3. git push origin $(git branch --show-current)"
else
    info "   1. Upload da pasta 'dist' para seu servidor"
    info "   2. Configurar servidor web (Nginx/Apache)"
    info "   3. Configurar SSL/HTTPS"
fi

echo ""
info "🔗 URLs importantes:"
info "   • Produção: https://msribeiro2010.github.io/napje-painel-atalhos/"
info "   • GitHub Actions: https://github.com/msribeiro2010/napje-painel-atalhos/actions"
info "   • Supabase: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID"
echo ""

log "Script de deploy concluído com sucesso! 🎉"

# Opcional: Abrir URLs no navegador (descomente se desejar)
# if command -v open &> /dev/null; then
#     open "https://github.com/msribeiro2010/napje-painel-atalhos/actions"
# elif command -v xdg-open &> /dev/null; then
#     xdg-open "https://github.com/msribeiro2010/napje-painel-atalhos/actions"
# fi