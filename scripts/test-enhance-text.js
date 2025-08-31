// Script para testar a Edge Function enhance-text-with-ai
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testando Edge Function enhance-text-with-ai...');
console.log('');

// Verificar configuração
if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Configuração incompleta:');
  console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅' : '❌'}`);
  process.exit(1);
}

console.log('✅ Configuração Supabase: OK');
console.log('');

// Teste da Edge Function enhance-text-with-ai
try {
  console.log('🤖 Testando enhance-text-with-ai...');
  
  const testText = 'Erro ao Assinar';
  
  const response = await fetch(`${supabaseUrl}/functions/v1/enhance-text-with-ai`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: testText,
      type: 'descricao'
    })
  });
  
  console.log(`   Status: ${response.status}`);
  
  if (response.ok) {
    const data = await response.json();
    
    if (data.enhancedText) {
      console.log('✅ Edge Function: FUNCIONANDO');
      console.log('✅ OpenAI: Configurada corretamente');
      console.log('');
      console.log('📝 Texto original:');
      console.log(`   "${testText}"`);
      console.log('');
      console.log('🚀 Texto melhorado:');
      console.log(`   "${data.enhancedText}"`);
      console.log('');
      console.log('✅ Funcionalidade de IA: ATIVA');
    } else {
      console.log('❌ Resposta inválida da Edge Function');
      console.log('   Dados recebidos:', data);
    }
  } else {
    const errorData = await response.text();
    console.log('❌ Edge Function: ERRO');
    console.log(`   Status: ${response.status}`);
    console.log(`   Resposta: ${errorData}`);
    
    if (response.status === 404) {
      console.log('   Causa: Edge Function não existe ou não foi deployed');
    } else if (response.status === 401) {
      console.log('   Causa: Problema de autenticação');
    } else if (response.status === 500) {
      console.log('   Causa: Erro interno - verifique se OPENAI_API_KEY está configurada');
    }
  }
} catch (error) {
  console.log('❌ Erro ao testar Edge Function:');
  console.log(`   ${error.message}`);
}

console.log('');
console.log('📋 Status da Funcionalidade de IA:');
if (supabaseUrl && supabaseKey) {
  console.log('✅ Configuração Supabase: OK');
  console.log('🔑 Para ativar completamente:');
  console.log('   1. Configure OPENAI_API_KEY no Supabase Edge Functions');
  console.log('   2. Reinicie a Edge Function enhance-text-with-ai');
  console.log('   3. Configure VITE_AI_FEATURES_ENABLED=true no .env');
} else {
  console.log('❌ Configuração Supabase: INCOMPLETA');
}