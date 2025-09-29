// Simulating the exact frontend request to identify JSON parsing issues

async function testFrontendSimulation() {
    console.log('🧪 Simulando requisições exatas do frontend...\n');
    
    const PJE_API_URL = 'http://localhost:3001/api/pje';
    
    // Test cases that might cause issues
    const testCases = [
        // Normal case
        { grau: '1', nome: 'tes', description: 'Busca normal' },
        // Empty search
        { grau: '1', nome: '', description: 'Busca vazia' },
        // Special characters
        { grau: '1', nome: 'josé', description: 'Busca com acentos' },
        // Very short search
        { grau: '1', nome: 'a', description: 'Busca muito curta' },
        // Numbers
        { grau: '1', nome: '123', description: 'Busca com números' },
        // CPF search
        { grau: '1', cpf: '12345678901', description: 'Busca por CPF' },
        // Matricula search
        { grau: '1', matricula: '123456', description: 'Busca por matrícula' },
        // Invalid grau
        { grau: '3', nome: 'test', description: 'Grau inválido' },
    ];
    
    for (const testCase of testCases) {
        console.log(`\n🔍 Testando: ${testCase.description}`);
        console.log(`   Parâmetros: ${JSON.stringify(testCase)}`);
        
        try {
            const params = new URLSearchParams();
            Object.entries(testCase).forEach(([key, value]) => {
                if (key !== 'description' && value) {
                    params.append(key, value);
                }
            });
            
            const url = `${PJE_API_URL}/servidores?${params}`;
            console.log(`   URL: ${url}`);
            
            const response = await fetch(url);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`   ❌ Erro: ${errorText.substring(0, 200)}`);
                continue;
            }
            
            const responseText = await response.text();
            console.log(`   Tamanho da resposta: ${responseText.length} caracteres`);
            
            // Check if response looks like JSON
            const trimmed = responseText.trim();
            if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
                console.log(`   ⚠️  Resposta não parece ser JSON: ${trimmed.substring(0, 100)}`);
                continue;
            }
            
            try {
                const data = JSON.parse(responseText);
                console.log(`   ✅ JSON válido: ${Array.isArray(data) ? data.length : 'objeto'} resultado(s)`);
                
                // Check for any suspicious content in the data
                if (Array.isArray(data) && data.length > 0) {
                    const firstItem = data[0];
                    if (typeof firstItem === 'string' && firstItem.includes('<')) {
                        console.log(`   ⚠️  Primeiro item contém HTML: ${firstItem.substring(0, 100)}`);
                    }
                }
            } catch (parseError) {
                console.log(`   ❌ Erro de parse JSON: ${parseError.message}`);
                console.log(`   📄 Primeiros 300 chars: ${responseText.substring(0, 300)}`);
                console.log(`   📄 Últimos 100 chars: ${responseText.slice(-100)}`);
                
                // Check for common non-JSON responses
                if (responseText.includes('<!DOCTYPE')) {
                    console.log(`   🔍 Detectado HTML na resposta`);
                } else if (responseText.includes('Error:')) {
                    console.log(`   🔍 Detectado erro na resposta`);
                } else if (responseText.includes('Cannot GET')) {
                    console.log(`   🔍 Detectado erro 404 na resposta`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Erro na requisição: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🏁 Teste concluído!');
}

testFrontendSimulation();