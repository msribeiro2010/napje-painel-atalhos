#!/bin/bash

# 🚀 Script de Deploy Automático
# Painel JIRA - NAPJe TRT15

set -e

echo "🚀 Iniciando processo de deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar Node.js e npm
info "Verificando ambiente..."
node --version || error "Node.js não encontrado"
npm --version || error "npm não encontrado"

# Instalar dependências
log "Instalando dependências..."
npm ci || error "Falha ao instalar dependências"

# Verificar TypeScript
log "Verificando TypeScript..."
npx tsc --noEmit || error "Erros de TypeScript encontrados"

# Build do projeto
log "Construindo projeto para produção..."
npm run build || error "Falha no build do projeto"

# Verificar se o build foi gerado
if [ ! -d "dist" ]; then
    error "Pasta 'dist' não foi gerada"
fi

log "Build gerado com sucesso!"

# Mostrar tamanho do build
build_size=$(du -sh dist | cut -f1)
info "Tamanho do build: $build_size"

log "🎉 Build completado com sucesso!"
info "Para fazer deploy, execute: git push origin main"
info "Monitoramento: https://github.com/msribeiro2010/napje-painel-atalhos/actions"
info "URL de Produção: https://msribeiro2010.github.io/napje-painel-atalhos/"

echo ""
log "Script de build finalizado!"
