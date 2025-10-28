#!/usr/bin/env node

/**
 * Comprehensive test for JSON parsing improvements
 * Tests various scenarios that could cause JSON parsing errors
 */

const API_BASE = 'http://localhost:3001/api/pje';

async function testEndpoint(testName, url, expectedStatus = 200) {
  console.log(`\n🧪 ${testName}`);
  console.log(`📡 URL: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);
    
    const responseText = await response.text();
    console.log(`📏 Response size: ${responseText.length} chars`);
    console.log(`📄 First 100 chars: ${responseText.substring(0, 100)}`);
    
    // Check if it's valid JSON
    try {
      const data = JSON.parse(responseText);
      console.log(`✅ Valid JSON: ${Array.isArray(data) ? `Array with ${data.length} items` : typeof data}`);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📝 First item keys: ${Object.keys(data[0]).join(', ')}`);
      }
      
      return { success: true, data, status: response.status };
    } catch (parseError) {
      console.log(`❌ JSON Parse Error: ${parseError.message}`);
      console.log(`📄 Last 100 chars: ${responseText.slice(-100)}`);
      
      // Check what type of content we got
      if (responseText.includes('<!DOCTYPE')) {
        console.log(`🔍 Content appears to be HTML`);
      } else if (responseText.includes('Error:')) {
        console.log(`🔍 Content appears to be error text`);
      } else if (responseText.includes('Cannot GET')) {
        console.log(`🔍 Content appears to be 404 error`);
      }
      
      return { success: false, error: parseError.message, status: response.status };
    }
  } catch (error) {
    console.log(`❌ Request Error: ${error.message}`);
    return { success: false, error: error.message, status: null };
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive JSON parsing tests...');
  console.log('=' .repeat(60));
  
  const tests = [
    // Normal cases
    ['Normal search', `${API_BASE}/servidores?grau=1&nome=MARIA`],
    ['Empty search', `${API_BASE}/servidores?grau=1&nome=`],
    ['CPF search', `${API_BASE}/servidores?grau=1&cpf=12345678901`],
    ['Matricula search', `${API_BASE}/servidores?grau=1&matricula=123456`],
    ['2nd degree search', `${API_BASE}/servidores?grau=2&nome=JOSE`],
    
    // Edge cases
    ['Special characters', `${API_BASE}/servidores?grau=1&nome=JOSÉ%20MARÍA`],
    ['Very short name', `${API_BASE}/servidores?grau=1&nome=A`],
    ['Numbers in name', `${API_BASE}/servidores?grau=1&nome=123`],
    ['Invalid grau', `${API_BASE}/servidores?grau=999&nome=TEST`],
    ['No parameters', `${API_BASE}/servidores`],
    
    // Stress tests
    ['Large limit', `${API_BASE}/servidores?grau=1&nome=A&limit=1000`],
    ['Multiple parameters', `${API_BASE}/servidores?grau=1&nome=MARIA&cpf=123&matricula=456`],
    
    // Invalid endpoints (should return proper JSON errors)
    ['Invalid endpoint', `${API_BASE}/invalid-endpoint`, 404],
    ['Debug endpoint', `${API_BASE}/test-json-debug?grau=1&nome=TEST`],
  ];
  
  const results = [];
  
  for (const [testName, url, expectedStatus] of tests) {
    const result = await testEndpoint(testName, url, expectedStatus);
    results.push({ testName, ...result });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful tests: ${successful.length}/${results.length}`);
  console.log(`❌ Failed tests: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failed.forEach(test => {
      console.log(`  - ${test.testName}: ${test.error}`);
    });
  }
  
  if (successful.length === results.length) {
    console.log('\n🎉 All tests passed! JSON parsing is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  
  console.log('\n🔍 Key findings:');
  console.log('- All responses should have Content-Type: application/json');
  console.log('- All responses should be valid JSON (arrays or objects)');
  console.log('- Error responses should be JSON objects with error/message fields');
  console.log('- No HTML or plain text responses should occur');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});