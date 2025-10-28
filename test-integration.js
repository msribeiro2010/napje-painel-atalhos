#!/usr/bin/env node

/**
 * Script de teste para verificar a integração entre Vercel frontend e Railway API
 */

import fetch from 'node-fetch';

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://YOUR_RAILWAY_APP_NAME.up.railway.app';
const TEST_DATE = '2024-01-15'; // Data de teste

async function testRailwayAPI() {
    console.log('🧪 Testando integração Railway API...\n');
    
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testando Health Check...');
        const healthResponse = await fetch(`${RAILWAY_URL}/health`);
        const healthData = await healthResponse.json();
        
        if (healthResponse.ok) {
            console.log('✅ Health Check OK:', healthData);
        } else {
            console.log('❌ Health Check Failed:', healthData);
            return;
        }
        
        // Test 2: PJe Connection Test
        console.log('\n2️⃣ Testando conexão PJe...');
        const connectionResponse = await fetch(`${RAILWAY_URL}/api/pje/test-connection`);
        const connectionData = await connectionResponse.json();
        
        if (connectionResponse.ok) {
            console.log('✅ Conexão PJe OK:', connectionData);
        } else {
            console.log('❌ Conexão PJe Failed:', connectionData);
        }
        
        // Test 3: Daily Distribution Endpoint
        console.log('\n3️⃣ Testando endpoint de distribuição diária...');
        const distributionUrl = `${RAILWAY_URL}/api/pje/distribuicao-diaria?grau=1&data=${TEST_DATE}`;
        const distributionResponse = await fetch(distributionUrl);
        
        if (distributionResponse.ok) {
            const distributionData = await distributionResponse.json();
            console.log('✅ Distribuição diária OK');
            console.log(`📊 Total de processos: ${distributionData.total || 0}`);
            console.log(`🏛️ Órgãos julgadores: ${distributionData.distribuicao?.length || 0}`);
        } else {
            const errorData = await distributionResponse.text();
            console.log('❌ Distribuição diária Failed:', errorData);
        }
        
        // Test 4: CORS Headers
        console.log('\n4️⃣ Testando CORS headers...');
        const corsResponse = await fetch(`${RAILWAY_URL}/api/pje/distribuicao-diaria?grau=1&data=${TEST_DATE}`, {
            method: 'OPTIONS'
        });
        
        const corsHeaders = corsResponse.headers;
        console.log('🔗 CORS Headers:');
        console.log('  Access-Control-Allow-Origin:', corsHeaders.get('access-control-allow-origin'));
        console.log('  Access-Control-Allow-Methods:', corsHeaders.get('access-control-allow-methods'));
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    }
}

async function testVercelIntegration() {
    console.log('\n🌐 Testando integração Vercel...\n');
    
    // Simular requisição do frontend
    const frontendConfig = {
        VITE_PJE_API_URL: `${RAILWAY_URL}/api/pje`
    };
    
    console.log('📋 Configuração do frontend:');
    console.log('  VITE_PJE_API_URL:', frontendConfig.VITE_PJE_API_URL);
    
    try {
        const testUrl = `${frontendConfig.VITE_PJE_API_URL}/distribuicao-diaria?grau=1&data=${TEST_DATE}`;
        console.log('\n🔍 Testando URL do frontend:', testUrl);
        
        const response = await fetch(testUrl);
        
        if (response.ok) {
            console.log('✅ Integração Vercel ↔ Railway funcionando!');
        } else {
            console.log('❌ Problema na integração:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.error('❌ Erro na integração:', error.message);
    }
}

// Executar testes
async function runTests() {
    console.log('🚀 Iniciando testes de integração...\n');
    console.log('🎯 Railway URL:', RAILWAY_URL);
    console.log('📅 Data de teste:', TEST_DATE);
    console.log('=' .repeat(50));
    
    await testRailwayAPI();
    await testVercelIntegration();
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Testes concluídos!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configure as variáveis de ambiente no Railway');
    console.log('2. Atualize VITE_PJE_API_URL no Vercel');
    console.log('3. Faça deploy das alterações');
}

// Verificar se foi chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}

export { testRailwayAPI, testVercelIntegration };