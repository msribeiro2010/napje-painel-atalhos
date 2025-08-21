#!/usr/bin/env node

console.log('🔧 Corrigindo Autenticação do Supabase - ChatBot TRT15\n');

import fs from 'fs';
import path from 'path';

// Informações do projeto Supabase
const PROJECT_ID = 'zpufcvesenbhtmizmjiz';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

console.log('📋 DIAGNÓSTICO DO PROBLEMA');
console.log('==========================');
console.log('❌ Status atual: JWT Inválido (401 Unauthorized)');
console.log('❌ Causa: Chave de autenticação expirada ou incorreta');
console.log('❌ Resultado: ChatBot em "Modo Offline"\n');

console.log('🎯 PROBLEMAS IDENTIFICADOS:');
console.log('1. ❌ JWT Token inválido ou expirado');
console.log('2. ❌ OPENAI_API_KEY não configurada nas Edge Functions');
console.log('3. ❌ Falha na autenticação com Supabase\n');

console.log('🔑 SOLUÇÕES NECESSÁRIAS:');
console.log('=======================');

// Verificar arquivo .env atual
const envFile = path.join(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  console.log('✅ Arquivo .env encontrado');
  
  // Extrair chave atual
  const currentKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  if (currentKey) {
    console.log(`📄 Chave atual: ${currentKey[1].substring(0, 30)}...`);
  }
} else {
  console.log('❌ Arquivo .env não encontrado');
}

console.log('\n🚀 PASSO A PASSO PARA CORRIGIR:');
console.log('===============================');

console.log('\n📝 ETAPA 1: Obter Nova Chave Supabase');
console.log('1. Acesse: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz');
console.log('2. Vá em "Settings" > "API"');
console.log('3. Na seção "Project API keys", copie:');
console.log('   - URL: https://zpufcvesenbhtmizmjiz.supabase.co');
console.log('   - anon public: (copie a chave completa)');

console.log('\n📝 ETAPA 2: Atualizar Arquivo .env');
console.log('Substitua no arquivo .env:');
console.log('VITE_SUPABASE_URL=https://zpufcvesenbhtmizmjiz.supabase.co');
console.log('VITE_SUPABASE_ANON_KEY=SUA_NOVA_CHAVE_ANON_AQUI');

console.log('\n📝 ETAPA 3: Configurar OpenAI nas Edge Functions');
console.log('1. No mesmo dashboard do Supabase');
console.log('2. Vá em "Edge Functions" > "Settings"');
console.log('3. Na seção "Environment Variables", adicione:');
console.log('   Nome: OPENAI_API_KEY');
console.log('   Valor: sk-... (sua chave OpenAI)');
console.log('4. Clique em "Save"');
console.log('5. Vá para "Functions" e reinicie "chat-assistant"');

console.log('\n📝 ETAPA 4: Testar Conexão');
console.log('Execute: npm run test-ai-connection');

console.log('\n💡 CAUSA RAIZ DO PROBLEMA:');
console.log('==========================');
console.log('❗ NÃO é problema de limites no Supabase');
console.log('❗ É problema de AUTENTICAÇÃO (JWT expirado)');
console.log('❗ A chave anon do Supabase precisa ser atualizada');

console.log('\n🔗 LINKS ÚTEIS:');
console.log('================');
console.log(`📊 Dashboard Supabase: https://supabase.com/dashboard/project/${PROJECT_ID}`);
console.log(`🔧 Configurações API: https://supabase.com/dashboard/project/${PROJECT_ID}/settings/api`);
console.log(`⚡ Edge Functions: https://supabase.com/dashboard/project/${PROJECT_ID}/functions`);
console.log(`🌐 App Produção: https://msribeiro2010.github.io/napje-painel-atalhos/`);

console.log('\n⏱️ TEMPO ESTIMADO: 5-10 minutos');
console.log('🎯 RESULTADO ESPERADO: ChatBot funcionando online com IA');

console.log('\n📞 PRÓXIMOS PASSOS:');
console.log('===================');
console.log('1. 🔑 Obter nova chave anon do Supabase');
console.log('2. ✏️ Atualizar .env com nova chave');
console.log('3. 🤖 Configurar OPENAI_API_KEY');
console.log('4. 🧪 Testar conexão');
console.log('5. 🚀 Deploy/rebuild se necessário');

console.log('\n✅ SUCESSO = ChatBot sai do "Modo Offline" e funciona com IA completa!');