// Script para testar a funcionalidade de distribuição no frontend
console.log('🔍 Testando funcionalidade de distribuição no frontend...');

// Função para testar a API diretamente
async function testarAPIDistribuicao() {
  try {
    console.log('🚀 Testando API de distribuição...');
    
    const apiUrl = 'http://localhost:3001/api/pje';
    const url = `${apiUrl}/distribuicao-diaria?grau=1&data=2025-09-28`;
    
    console.log('📍 URL da requisição:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    
    if (data.success) {
      console.log('🎉 API funcionando corretamente!');
      console.log(`📊 Total de processos: ${data.data.total_geral}`);
      console.log(`📊 Total de OJs: ${data.data.total_ojs}`);
      console.log(`📊 Distribuições encontradas: ${data.data.distribuicoes.length}`);
    } else {
      console.error('❌ API retornou erro:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
}

// Função para testar as variáveis de ambiente
function testarVariaveisAmbiente() {
  console.log('🔧 Verificando variáveis de ambiente...');
  
  // Simular como o React acessa as variáveis
  const apiUrl = import.meta?.env?.VITE_PJE_API_URL || 'VARIÁVEL NÃO ENCONTRADA';
  
  console.log('📍 VITE_PJE_API_URL:', apiUrl);
  console.log('📍 Todas as variáveis VITE:', Object.keys(import.meta?.env || {}).filter(key => key.startsWith('VITE_')));
  
  if (!apiUrl || apiUrl === 'VARIÁVEL NÃO ENCONTRADA' || apiUrl.trim() === '') {
    console.error('❌ VITE_PJE_API_URL não está configurada!');
    return false;
  }
  
  console.log('✅ Variável de ambiente configurada corretamente');
  return true;
}

// Função para simular o clique no botão de buscar distribuição
async function simularBuscaDistribuicao() {
  try {
    console.log('🖱️ Simulando busca de distribuição...');
    
    // Procurar pelo botão de buscar distribuição
    const botoes = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent.toLowerCase().includes('buscar') && 
      btn.textContent.toLowerCase().includes('distribuição')
    );
    
    if (botoes.length === 0) {
      console.error('❌ Botão de buscar distribuição não encontrado');
      return;
    }
    
    const botao = botoes[0];
    console.log('✅ Botão encontrado:', botao.textContent);
    
    // Verificar se o botão está habilitado
    if (botao.disabled) {
      console.warn('⚠️ Botão está desabilitado');
      return;
    }
    
    // Simular clique
    console.log('🖱️ Clicando no botão...');
    botao.click();
    
    console.log('✅ Clique simulado com sucesso');
    
    // Aguardar e verificar resultados
    setTimeout(() => {
      console.log('🔍 Verificando resultados...');
      
      // Procurar por mensagens de toast/erro
      const toasts = document.querySelectorAll('[role="alert"], .toast, .notification, .alert');
      if (toasts.length > 0) {
        console.log('📢 Mensagens encontradas:');
        toasts.forEach((toast, index) => {
          console.log(`  ${index + 1}. ${toast.textContent.trim()}`);
        });
      }
      
      // Procurar por dados de distribuição
      const resultados = document.querySelector('[data-testid*="distribuicao"], .distribuicao-result');
      if (resultados) {
        console.log('📊 Resultados encontrados:', resultados.textContent.trim().substring(0, 200));
      } else {
        console.log('❌ Nenhum resultado encontrado');
      }
      
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro ao simular busca:', error);
  }
}

// Executar testes
console.log('🚀 Iniciando testes...');

// 1. Testar variáveis de ambiente
const varOk = testarVariaveisAmbiente();

// 2. Testar API diretamente
testarAPIDistribuicao();

// 3. Aguardar um pouco e simular busca no frontend (se as variáveis estiverem ok)
if (varOk) {
  setTimeout(() => {
    simularBuscaDistribuicao();
  }, 2000);
}

// Disponibilizar funções para uso manual
window.testarAPIDistribuicao = testarAPIDistribuicao;
window.testarVariaveisAmbiente = testarVariaveisAmbiente;
window.simularBuscaDistribuicao = simularBuscaDistribuicao;

console.log('📋 Script carregado. Funções disponíveis:');
console.log('  - testarAPIDistribuicao()');
console.log('  - testarVariaveisAmbiente()');
console.log('  - simularBuscaDistribuicao()');