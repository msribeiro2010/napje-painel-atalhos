#!/usr/bin/env node

// Script para debugar o problema do chatbot
console.log('🐛 Debug ChatBot - Teste de Comunicação\n');

import { createClient } from '@supabase/supabase-js';

// Usando as mesmas configurações que o frontend
const SUPABASE_URL = 'https://zpufcvesenbhtmizmjiz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdWZjdmVzZW5iaHRtaXptaml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDY5ODMsImV4cCI6MjA2NTA4Mjk4M30.aD0E3fkuTjaYnHRdWpYjCk_hPK-sKhVT2VdIfXy3Hy8';

console.log('🔧 Configurações:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   KEY: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

// Criar cliente Supabase igual ao frontend
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});

console.log('\n🤖 Testando supabase.functions.invoke...');

try {
  const { data, error } = await supabase.functions.invoke('chat-assistant', {
    body: {
      message: 'teste de debug',
      conversationHistory: [],
      enableWebSearch: false,
      searchMode: 'auto'
    }
  });

  console.log('\n📤 Requisição enviada:');
  console.log('   Método: supabase.functions.invoke');
  console.log('   Função: chat-assistant');
  console.log('   Body:', {
    message: 'teste de debug',
    conversationHistory: [],
    enableWebSearch: false,
    searchMode: 'auto'
  });

  console.log('\n📥 Resposta recebida:');
  
  if (error) {
    console.log('❌ ERRO:', error);
    console.log('   Tipo:', typeof error);
    console.log('   Mensagem:', error.message || 'N/A');
    console.log('   Status:', error.status || 'N/A');
    console.log('   Details:', error.details || 'N/A');
  } else {
    console.log('✅ Sem erro no retorno');
  }

  if (data) {
    console.log('📊 DATA:', data);
    console.log('   Tipo:', typeof data);
    console.log('   Success:', data.success);
    console.log('   Response:', data.response ? data.response.substring(0, 100) + '...' : 'N/A');
    console.log('   Error:', data.error || 'N/A');
  } else {
    console.log('❌ DATA é null/undefined');
  }

  // Verificar se é o mesmo comportamento do frontend
  if (error) {
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('❌ O frontend cairia no CATCH e exibiria "Modo Offline"');
    console.log('🔍 Erro detectado na comunicação com Supabase Functions');
  } else if (!data) {
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('❌ O frontend cairia no CATCH (data é null)');
    console.log('🔍 Edge Function retornou dados vazios');
  } else if (!data.success) {
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('❌ O frontend cairia no CATCH (data.success = false)');
    console.log('🔍 Edge Function retornou erro:', data.error);
  } else {
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('✅ O frontend deveria funcionar normalmente');
    console.log('✅ Comunicação OK, resposta válida recebida');
  }

} catch (error) {
  console.log('\n❌ EXCEPTION capturada:');
  console.log('   Tipo:', typeof error);
  console.log('   Mensagem:', error.message);
  console.log('   Stack:', error.stack);
  
  console.log('\n💡 DIAGNÓSTICO:');
  console.log('❌ O frontend cairia no CATCH e exibiria "Modo Offline"');
  console.log('🔍 Exception durante a chamada do supabase.functions.invoke');
}

console.log('\n🎯 CONCLUSÃO:');
console.log('Se este script mostra sucesso mas o frontend ainda está em "Modo Offline",');
console.log('o problema pode estar em:');
console.log('1. Versão diferente da biblioteca @supabase/supabase-js');
console.log('2. Configurações diferentes no frontend');
console.log('3. Problemas de CORS ou cache no navegador');
console.log('4. Estado de autenticação no frontend');