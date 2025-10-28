// Test script to simulate frontend request to PJe API
// Using built-in fetch (Node.js 18+)

const PJE_API_URL = 'http://localhost:3001/api/pje';

async function testServidoresRequest() {
  console.log('🧪 Testing servidores request...');
  
  try {
    const params = new URLSearchParams({
      grau: '1',
      nome: 'test'
    });
    
    const url = `${PJE_API_URL}/servidores?${params}`;
    console.log('📡 Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response Text (first 200 chars):', responseText.substring(0, 200));
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      console.log('📊 Data type:', typeof jsonData);
      console.log('📊 Data length:', Array.isArray(jsonData) ? jsonData.length : 'Not an array');
    } catch (jsonError) {
      console.log('❌ JSON parsing failed:', jsonError.message);
      console.log('🔍 Full response text:', responseText);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

// Run the test
testServidoresRequest();