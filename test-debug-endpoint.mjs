// Test script for the debug endpoint
console.log('🧪 Testando endpoint de debug JSON...\n');

try {
  const response = await fetch('http://localhost:3001/api/pje/test-json-debug?grau=1&nome=TESTE_AUTOMATICO_DEBUG');
  
  console.log('📊 Status da resposta:', response.status);
  console.log('📊 Headers da resposta:');
  for (const [key, value] of response.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  console.log('\n📄 Tentando obter texto bruto...');
  const rawText = await response.text();
  console.log('📄 Tamanho do texto:', rawText.length, 'caracteres');
  console.log('📄 Primeiros 200 caracteres:', rawText.substring(0, 200));
  
  console.log('\n🔍 Tentando fazer parse do JSON...');
  try {
    const jsonData = JSON.parse(rawText);
    console.log('✅ JSON parseado com sucesso!');
    console.log('📊 Estrutura do JSON:');
    console.log('  - debug:', typeof jsonData.debug);
    console.log('  - data:', Array.isArray(jsonData.data) ? `array com ${jsonData.data.length} itens` : typeof jsonData.data);
    console.log('  - test_json_string:', typeof jsonData.test_json_string);
    console.log('  - test_special_chars:', typeof jsonData.test_special_chars);
    
    if (jsonData.debug) {
      console.log('\n🔍 Informações de debug:');
      console.log('  - timestamp:', jsonData.debug.timestamp);
      console.log('  - query_params:', JSON.stringify(jsonData.debug.query_params));
      console.log('  - raw_count:', jsonData.debug.raw_count);
    }
    
  } catch (parseError) {
    console.error('❌ Erro ao fazer parse do JSON:', parseError.message);
    console.log('📄 Texto completo da resposta:');
    console.log(rawText);
  }
  
} catch (error) {
  console.error('❌ Erro na requisição:', error.message);
}