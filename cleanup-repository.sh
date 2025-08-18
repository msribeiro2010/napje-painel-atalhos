#!/bin/bash

# Script para limpeza do repositório
# Remove arquivos temporários e desnecessários do controle de versão

set -e

echo "🧹 Iniciando limpeza do repositório..."
echo "=========================================="

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Aviso: Há mudanças não commitadas no repositório"
    echo "Deseja continuar? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada"
        exit 1
    fi
fi

echo "📋 Criando backup dos arquivos que serão removidos..."
mkdir -p .backup-cleanup

# Lista de arquivos para backup e remoção
FILES_TO_REMOVE=(
    ".last-deploy"
    "test-assuntos-local.cjs"
    "test-fallback.cjs"
    "test-important-memories.cjs"
    "test-insert-with-anon-key.cjs"
    "monitor-supabase-usage.cjs"
    "check-database-tables.cjs"
    "execute-sql-script.cjs"
    "populate-database.cjs"
    "create-sample-data-existing-columns.js"
    "create_weekly_notifications_table.sql"
    "disable-rls-and-insert.sql"
    "fix-chamados-final.sql"
    "fix-custom-events-complete.sql"
    "fix-custom-events-table.sql"
    "fix-important-memories.sql"
    "insert-all-shortcuts.sql"
    "insert-sample-chamados.sql"
    "insert-test-chamados.js"
    "populate-database.sql"
)

# Documentação para consolidação
DOC_FILES_TO_REMOVE=(
    "CHATBOT_SEARCH_IMPROVEMENTS_SUMMARY.md"
    "CORRECAO_CHATBOT_TRT15.md"
    "CORREÇÃO_NOTIFICAÇÕES_SEMANAIS.md"
    "DEPLOY_SUMMARY.md"
    "DEPLOY_SUMMARY_PRODUCTION.md"
    "IA_IMPLEMENTATION_SUMMARY.md"
    "IMPLEMENTACAO_ASSUNTOS_LOCAIS.md"
    "IMPROVEMENTS.md"
    "NOTIFICACOES_EVENTOS.md"
    "REMOCAO_MEMORIAS_IMPORTANTES.md"
    "RESUMO_SITUACAO_SUPABASE.md"
    "SECURITY_FIXES.md"
    "SECURITY_WORKFLOW_IMPROVEMENTS.md"
    "SOLUCAO_CALENDARIO_TRABALHO.md"
    "SOLUCAO_CHATBOT_MODO_OFFLINE.md"
    "SOLUCAO_CHATBOT_OFFLINE.md"
    "SOLUCAO_COMUNICACAO_IA.md"
    "SOLUCAO_EVENTOS_PERSONALIZADOS.md"
)

# Fazer backup dos arquivos
echo "💾 Fazendo backup dos arquivos..."
for file in "${FILES_TO_REMOVE[@]}" "${DOC_FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" ".backup-cleanup/" 2>/dev/null || true
        echo "  ✅ Backup: $file"
    fi
done

# Criar arquivo consolidado de documentação
echo "📚 Consolidando documentação..."
echo "# 📖 Histórico de Desenvolvimento" > DEVELOPMENT_HISTORY.md
echo "" >> DEVELOPMENT_HISTORY.md
echo "Este arquivo consolida toda a documentação de desenvolvimento e implementações realizadas no projeto." >> DEVELOPMENT_HISTORY.md
echo "" >> DEVELOPMENT_HISTORY.md
echo "## 📅 Gerado em: $(date)" >> DEVELOPMENT_HISTORY.md
echo "" >> DEVELOPMENT_HISTORY.md

# Consolidar arquivos de documentação
for file in "${DOC_FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        echo "" >> DEVELOPMENT_HISTORY.md
        echo "## 📄 $file" >> DEVELOPMENT_HISTORY.md
        echo "" >> DEVELOPMENT_HISTORY.md
        cat "$file" >> DEVELOPMENT_HISTORY.md
        echo "" >> DEVELOPMENT_HISTORY.md
        echo "---" >> DEVELOPMENT_HISTORY.md
        echo "" >> DEVELOPMENT_HISTORY.md
    fi
done

echo "✅ Documentação consolidada em DEVELOPMENT_HISTORY.md"

# Remover arquivos do Git
echo "🗑️  Removendo arquivos do controle de versão..."
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        git rm "$file" 2>/dev/null || true
        echo "  🗑️  Removido: $file"
    fi
done

for file in "${DOC_FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        git rm "$file" 2>/dev/null || true
        echo "  🗑️  Removido: $file"
    fi
done

# Adicionar arquivos atualizados
echo "📝 Adicionando arquivos atualizados..."
git add .gitignore
git add DEVELOPMENT_HISTORY.md
git add ARQUIVOS_PARA_EXCLUSAO.md

echo "📊 Estatísticas da limpeza:"
echo "  • Arquivos de script removidos: ${#FILES_TO_REMOVE[@]}"
echo "  • Arquivos de documentação consolidados: ${#DOC_FILES_TO_REMOVE[@]}"
echo "  • Backup criado em: .backup-cleanup/"
echo "  • Documentação consolidada: DEVELOPMENT_HISTORY.md"

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "🚀 Próximos passos:"
echo "  1. Revisar as mudanças: git status"
echo "  2. Fazer commit: git commit -m '🧹 Limpeza do repositório'"
echo "  3. Fazer push: git push"
echo ""
echo "💡 Dicas:"
echo "  • Backup dos arquivos em: .backup-cleanup/"
echo "  • Documentação consolidada em: DEVELOPMENT_HISTORY.md"
echo "  • .gitignore atualizado para evitar arquivos desnecessários"
echo ""
echo "⚠️  Lembre-se de testar o projeto após a limpeza!"