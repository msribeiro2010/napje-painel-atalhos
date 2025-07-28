#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🧪 Testando Conexão com IA...\n');

// Verificar arquivo .env
const envFile = path.join(process.cwd(), '.env');
if (!fs.existsSync(envFile)) {
  console.log('❌ Arquivo .env não encontrado!');
  console.log('📝 Crie o arquivo .env seguindo o guia SOLUCAO_COMUNICACAO_IA.md');
  process.exit(1);
}

// Ler variáveis de ambiente
const envContent = fs.readFileSync(envFile, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

console.log('🔍 Verificando configuração:');

// Verificar VITE_SUPABASE_URL
const supabaseUrl = envVars.VITE_SUPABASE_URL;
if (!supabaseUrl || supabaseUrl === 'SUBSTITUIR_PELA_CHAVE_REAL_DO_SUPABASE') {
  console.log('❌ VITE_SUPABASE_URL não configurada corretamente');
} else {
  console.log('✅ VITE_SUPABASE_URL configurada');
  console.log(`   URL: ${supabaseUrl}`);
}

// Verificar VITE_SUPABASE_ANON_KEY
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
if (!supabaseKey || supabaseKey === 'SUBSTITUIR_PELA_CHAVE_REAL_DO_SUPABASE') {
  console.log('❌ VITE_SUPABASE_ANON_KEY não configurada corretamente');
  console.log('🔑 Obtenha a chave em: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz');
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY configurada');
  console.log(`   Chave: ${supabaseKey.substring(0, 20)}...`);
}

// Teste de conectividade básica
if (supabaseUrl && supabaseKey && supabaseKey !== 'SUBSTITUIR_PELA_CHAVE_REAL_DO_SUPABASE') {
  console.log('\n🌐 Testando conectividade com Supabase...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Conectividade com Supabase: OK');
    } else {
      console.log('❌ Conectividade com Supabase: FALHOU');
      console.log(`   Status: ${response.status}`);
      const text = await response.text();
      console.log(`   Resposta: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log('❌ Erro ao testar conectividade:');
    console.log(`   ${error.message}`);
  }
}

console.log('\n📋 Próximos passos:');
console.log('1. Configure as variáveis corretas no arquivo .env');
console.log('2. Configure OPENAI_API_KEY no Supabase Edge Functions');
console.log('3. Reinicie o servidor de desenvolvimento');
console.log('4. Teste a funcionalidade "Gerar Assyst com IA"');

console.log('\n📖 Guia completo: SOLUCAO_COMUNICACAO_IA.md');