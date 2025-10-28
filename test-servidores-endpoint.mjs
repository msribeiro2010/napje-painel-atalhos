// Using built-in fetch (Node.js 18+)

async function testServidoresEndpoint() {
    console.log('🧪 Testando endpoint real de servidores...');
    
    try {
        // Test with a search that should return results
        const response = await fetch('http://localhost:3001/api/pje/servidores?grau=1&nome=tes');
        
        console.log(`📊 Status da resposta: ${response.status}`);
        console.log('📊 Headers da resposta:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        console.log('\n📄 Tentando obter texto bruto...');
        const text = await response.text();
        console.log(`📄 Tamanho do texto: ${text.length} caracteres`);
        console.log(`📄 Primeiros 500 caracteres: ${text.substring(0, 500)}`);
        
        console.log('\n🔍 Tentando fazer parse do JSON...');
        try {
            const jsonData = JSON.parse(text);
            console.log('✅ JSON parseado com sucesso!');
            console.log(`📊 Estrutura do JSON:`);
            console.log(`  - Tipo: ${Array.isArray(jsonData) ? 'array' : typeof jsonData}`);
            if (Array.isArray(jsonData)) {
                console.log(`  - Quantidade de itens: ${jsonData.length}`);
                if (jsonData.length > 0) {
                    console.log(`  - Primeiro item: ${JSON.stringify(jsonData[0], null, 2)}`);
                }
            } else {
                console.log(`  - Chaves: ${Object.keys(jsonData)}`);
            }
        } catch (parseError) {
            console.log(`❌ Erro ao fazer parse do JSON: ${parseError.message}`);
            console.log('📄 Texto completo da resposta:');
            console.log(text);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

testServidoresEndpoint();