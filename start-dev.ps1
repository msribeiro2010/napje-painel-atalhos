# Script para iniciar desenvolvimento local com servidor PJe
# Execute este script para iniciar tanto o servidor proxy quanto a aplicação

Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor Green
Write-Host ""

# Verificar se o Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

Write-Host "🔧 Configuração detectada:" -ForegroundColor Cyan
Write-Host "   - Arquivo .env.local criado para desenvolvimento" -ForegroundColor Gray
Write-Host "   - PJe API: http://localhost:3001/api/pje" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor proxy PJe em background
Write-Host "🗄️ Iniciando servidor proxy PJe..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; node server/pje-proxy-simple.mjs" -WindowStyle Minimized

# Aguardar um pouco para o servidor iniciar
Start-Sleep -Seconds 3

# Verificar se o servidor proxy está rodando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Servidor proxy PJe iniciado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Servidor proxy pode estar iniciando... Continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Iniciando aplicação React..." -ForegroundColor Blue
Write-Host "   - Aplicação: http://localhost:5173" -ForegroundColor Gray
Write-Host "   - Servidor PJe: http://localhost:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Para parar: Ctrl+C neste terminal e feche a janela do servidor proxy" -ForegroundColor Yellow
Write-Host ""

# Iniciar aplicação React
npm run dev