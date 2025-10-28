// Script simples para testar a funcionalidade de distribuição
// Cole este código no console do navegador em http://localhost:8082

console.log('🔍 Testando funcionalidade de distribuição...');

// Verificar se estamos no ambiente correto
console.log('📍 URL atual:', window.location.href);

// Verificar variáveis de ambiente do Vite
console.log('🌍 Variáveis de ambiente:');
console.log('- VITE_PJE_API_URL:', import.meta.env.VITE_PJE_API_URL);
console.log('- MODE:', import.meta.env.MODE);
console.log('- DEV:', import.meta.env.DEV);

// Testar a requisição
const apiUrl = import.meta.env.VITE_PJE_API_URL || 'http://localhost:3001/api/pje';
const testUrl = `${apiUrl}/distribuicao-diaria?grau=1&data=2025-09-28`;

console.log('🚀 Testando requisição para:', testUrl);

fetch(testUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('✅ Resposta recebida:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    url: response.url
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
})
.then(data => {
  console.log('📊 Dados recebidos:', data);
  console.log('🎉 Teste concluído com sucesso!');
})
.catch(error => {
  console.error('❌ Erro na requisição:', error);
  console.error('📋 Detalhes do erro:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
});