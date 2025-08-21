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

// Teste da Edge Function chat-assistant
if (supabaseUrl && supabaseKey && supabaseKey !== 'SUBSTITUIR_PELA_CHAVE_REAL_DO_SUPABASE') {
  console.log('\n🤖 Testando Edge Function chat-assistant...');
  
  try {
    const testResponse = await fetch(`${supabaseUrl}/functions/v1/chat-assistant`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'teste de conectividade',
        conversationHistory: []
      })
    });
    
    console.log(`   Status da Edge Function: ${testResponse.status}`);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      if (data.success) {
        console.log('✅ ChatBot Edge Function: FUNCIONANDO');
        console.log('✅ OpenAI: Configurada corretamente');
        console.log('✅ ChatBot: MODO ONLINE');
      } else {
        console.log('❌ ChatBot Edge Function: ERRO');
        console.log(`   Erro: ${data.error || 'Erro desconhecido'}`);
        if (data.error && data.error.includes('OpenAI')) {
          console.log('🔑 Solução: Configure OPENAI_API_KEY no Supabase Edge Functions');
        }
      }
    } else {
      console.log('❌ Edge Function: Não acessível');
      if (testResponse.status === 404) {
        console.log('   Causa: Edge Function não existe ou não foi deployed');
      } else if (testResponse.status === 401) {
        console.log('   Causa: Problema de autenticação');
      }
    }
  } catch (error) {
    console.log('❌ Erro ao testar Edge Function:');
    console.log(`   ${error.message}`);
  }
}

console.log('\n📋 Status do ChatBot:');
if (supabaseUrl && supabaseKey && supabaseKey !== 'SUBSTITUIR_PELA_CHAVE_REAL_DO_SUPABASE') {
  console.log('✅ Configuração Supabase: OK');
  console.log('⏳ OpenAI: Testando...');
  console.log('🌐 URL Produção: https://msribeiro2010.github.io/napje-painel-atalhos/');
} else {
  console.log('❌ Configuração Supabase: INCOMPLETA');
}

console.log('\n📋 Próximos passos para ativar MODO ONLINE:');
console.log('1. ✅ Variáveis Supabase configuradas');
console.log('2. 🔑 Configure OPENAI_API_KEY no Supabase Edge Functions:');
console.log('   → https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz');
console.log('   → Edge Functions > Settings > Environment Variables');
console.log('   → Nome: OPENAI_API_KEY');
console.log('   → Valor: sk-... (sua chave OpenAI)');
console.log('3. 🔄 Reinicie a Edge Function chat-assistant');
console.log('4. 🧪 Teste o ChatBot na produção');

console.log('\n📖 Guia completo: CONFIGURAR_OPENAI_CHATBOT_ONLINE.md');