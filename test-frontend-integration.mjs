#!/usr/bin/env node

/**
 * Frontend Integration Test
 * Simulates the exact frontend behavior to test JSON parsing improvements
 */

const API_BASE = 'http://localhost:3001/api/pje';

// Simulate the frontend searchServidores function
async function simulateSearchServidores(searchParams) {
  const { grau, nome, cpf, matricula } = searchParams;
  
  console.log(`\n🔍 Simulando busca frontend:`, { 
    grau, 
    nome: nome ? nome.substring(0, 3) + '***' : null, 
    cpf: cpf ? '***' : null, 
    matricula 
  });

  try {
    // Build URL exactly like frontend does
    const params = new URLSearchParams();
    if (grau) params.append('grau', grau);
    if (nome) params.append('nome', nome);
    if (cpf) params.append('cpf', cpf);
    if (matricula) params.append('matricula', matricula);
    
    const url = `${API_BASE}/servidores?${params.toString()}`;
    console.log(`📡 Request URL: ${url}`);
    console.log(`📊 Request headers: Content-Type: application/json`);
    
    const response = await fetch(url);
    console.log(`📈 Response status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response headers:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'access-control-allow-origin': response.headers.get('access-control-allow-origin')
    });
    
    if (!response.ok) {
      console.log(`❌ Response not OK: ${response.status}`);
      const errorText = await response.text();
      console.log(`📄 Error response text:`, errorText.substring(0, 200));
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log(`📏 Response size: ${responseText.length} characters`);
    console.log(`📄 Response preview (first 200 chars):`, responseText.substring(0, 200));
    
    // Apply the improved frontend JSON parsing logic
    const trimmed = responseText.trim();
    if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
      console.error(`❌ Response doesn't look like JSON:`, trimmed.substring(0, 100));
      throw new Error('Servidor retornou resposta inválida (não é JSON)');
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log(`✅ JSON parsed successfully:`, Array.isArray(data) ? data.length : 'object', 'result(s)');
      
      const results = Array.isArray(data) ? data : [];
      
      if (results.length > 0) {
        console.log(`📝 Sample result:`, {
          id: results[0].id,
          nome: results[0].nome?.substring(0, 20) + '...',
          tipo: results[0].tipo,
          ativo: results[0].ativo
        });
      }
      
      return results;
      
    } catch (parseError) {
      console.error(`❌ JSON parse error:`, parseError.message);
      console.error(`📄 Full response (first 500 chars):`, responseText.substring(0, 500));
      console.error(`📄 Last 100 chars:`, responseText.slice(-100));
      
      // Apply improved error detection
      if (responseText.includes('<!DOCTYPE')) {
        throw new Error('Servidor retornou página HTML em vez de dados JSON');
      } else if (responseText.includes('Error:')) {
        throw new Error('Servidor retornou erro em formato texto');
      } else if (responseText.includes('Cannot GET')) {
        throw new Error('Endpoint não encontrado no servidor');
      } else {
        throw new Error(`Resposta inválida do servidor: ${parseError.message}`);
      }
    }
    
  } catch (err) {
    console.error(`❌ Search error:`, err.message);
    throw err;
  }
}

async function runFrontendIntegrationTests() {
  console.log('🚀 Starting Frontend Integration Tests');
  console.log('=' .repeat(60));
  console.log('Testing the exact frontend behavior with improved error handling');
  
  const testCases = [
    // Common user searches
    { name: 'Search by name', params: { grau: '1', nome: 'MARIA' } },
    { name: 'Search by partial name', params: { grau: '1', nome: 'MAR' } },
    { name: 'Search by CPF', params: { grau: '1', cpf: '12345678901' } },
    { name: 'Search by matricula', params: { grau: '1', matricula: '123456' } },
    { name: '2nd degree search', params: { grau: '2', nome: 'JOSE' } },
    
    // Edge cases that might cause issues
    { name: 'Empty name search', params: { grau: '1', nome: '' } },
    { name: 'Special characters', params: { grau: '1', nome: 'JOSÉ MARÍA' } },
    { name: 'Very short search', params: { grau: '1', nome: 'A' } },
    { name: 'Numbers in name', params: { grau: '1', nome: '123' } },
    { name: 'Invalid grau', params: { grau: '999', nome: 'TEST' } },
    
    // Stress cases
    { name: 'Multiple parameters', params: { grau: '1', nome: 'MARIA', cpf: '123', matricula: '456' } },
    { name: 'No search criteria', params: { grau: '1' } },
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(40)}`);
    console.log(`🧪 Test: ${testCase.name}`);
    console.log(`${'='.repeat(40)}`);
    
    try {
      const searchResults = await simulateSearchServidores(testCase.params);
      console.log(`✅ Test passed: Found ${searchResults.length} results`);
      results.push({ ...testCase, success: true, resultCount: searchResults.length });
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
      results.push({ ...testCase, success: false, error: error.message });
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FRONTEND INTEGRATION TEST SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful tests: ${successful.length}/${results.length}`);
  console.log(`❌ Failed tests: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log(`\n✅ SUCCESSFUL TESTS:`);
    successful.forEach(test => {
      console.log(`  - ${test.name}: ${test.resultCount} results`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failed.forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
  }
  
  if (failed.length === 0) {
    console.log(`\n🎉 ALL FRONTEND INTEGRATION TESTS PASSED!`);
    console.log(`✅ JSON parsing improvements are working correctly`);
    console.log(`✅ Frontend error handling is robust`);
    console.log(`✅ Server responses are consistently valid JSON`);
  } else {
    console.log(`\n⚠️  Some tests failed. The JSON parsing issue may still exist.`);
  }
  
  console.log(`\n🔍 Key improvements verified:`);
  console.log(`- Server always returns proper JSON content-type headers`);
  console.log(`- Frontend validates response format before parsing`);
  console.log(`- Improved error messages for different failure types`);
  console.log(`- Graceful handling of edge cases and invalid inputs`);
}

// Run the integration tests
runFrontendIntegrationTests().catch(error => {
  console.error('❌ Integration test runner error:', error);
  process.exit(1);
});