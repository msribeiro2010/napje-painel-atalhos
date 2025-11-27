// Script para testar a funcionalidade de distribuição
console.log('🔍 Testando funcionalidade de distribuição...');

// Simular o que o componente React faz
const testDistribuicao = async () => {
  try {
    // Verificar variáveis de ambiente (simulando import.meta.env)
    console.log('🔧 Verificando configuração...');
    
    const apiUrl = 'http://localhost:3001/api/pje';
    console.log('🔧 API URL:', apiUrl);
    
    const grau = '1';
    const data = '2025-09-28';
    const url = `${apiUrl}/distribuicao-diaria?grau=${grau}&data=${data}`;
    
    console.log('🚀 Fazendo requisição para:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000)
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log('📊 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Resposta não é JSON:', text.substring(0, 500));
      throw new Error('Resposta inválida do servidor');
    }
    
    const json = await response.json();
    console.log('✅ Dados recebidos:', json);
    
    if (json.success) {
      console.log(`✅ Sucesso! ${json.total_geral} processos em ${json.total_ojs} OJs`);
      return json;
    } else {
      throw new Error(json.error || 'Erro na resposta');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    
    if (error.name === 'AbortError') {
      console.error('❌ Timeout na requisição');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('❌ Erro de rede - servidor pode estar offline');
    } else {
      console.error('❌ Erro específico:', error.message);
    }
    
    throw error;
  }
};

// Executar o teste
testDistribuicao()
  .then(result => {
    console.log('🎉 Teste concluído com sucesso!');
    console.log('📊 Resultado:', result);
  })
  .catch(error => {
    console.error('💥 Teste falhou:', error.message);
  });
