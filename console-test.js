// Script para copiar e colar no console do navegador
// Teste da funcionalidade de distribuição

(async () => {
  console.log('🔍 Testando funcionalidade de distribuição...');
  
  try {
    const apiUrl = 'http://localhost:3001/api/pje';
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
      console.error(`❌ Erro HTTP ${response.status}: ${response.statusText}`);
      const errorText = await response.text();
      console.error('❌ Resposta de erro:', errorText);
      return;
    }
    
    const contentType = response.headers.get('content-type');
    console.log('📊 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Resposta não é JSON:', text.substring(0, 500));
      return;
    }
    
    const responseData = await response.json();
    console.log('✅ Dados recebidos:', responseData);
    
    if (responseData.success) {
      console.log(`✅ Sucesso! ${responseData.total_geral} processos em ${responseData.total_ojs} OJs`);
    } else {
      console.error('❌ Erro na resposta:', responseData.error);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    
    if (error.name === 'AbortError') {
      console.error('❌ Timeout na requisição (30s)');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('❌ Falha na conexão - verifique se o servidor está rodando');
    } else {
      console.error('❌ Erro inesperado:', error.message);
    }
  }
})();