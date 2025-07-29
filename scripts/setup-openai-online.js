#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔑 Setup OpenAI para ChatBot TRT15 - Modo Online\n');

console.log('📋 DIAGNÓSTICO ATUAL:');
console.log('❌ ChatBot em "Modo Offline"');
console.log('❌ Chave Supabase com problema (401 Invalid API key)');
console.log('❌ OpenAI não configurada');

console.log('\n🎯 OBJETIVO:');
console.log('✅ Colocar ChatBot em "Modo Online" com IA completa');

console.log('\n🔧 SOLUÇÕES IDENTIFICADAS:');

console.log('\n1. 🔑 PROBLEMA: Chave Supabase Inválida');
console.log('   Causa: A chave no .env pode estar expirada ou incorreta');
console.log('   Solução:');
console.log('   → Obter nova chave anon em: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz/settings/api');
console.log('   → Copiar "anon public" key');
console.log('   → Atualizar VITE_SUPABASE_ANON_KEY no arquivo .env');

console.log('\n2. 🚀 CONFIGURAR OPENAI (Principal):');
console.log('   → Acesse: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz');
console.log('   → Menu: Edge Functions');
console.log('   → Aba: Settings');
console.log('   → Environment Variables');
console.log('   → Add new variable:');
console.log('     Nome: OPENAI_API_KEY');
console.log('     Valor: sk-... (sua chave OpenAI)');

console.log('\n3. ✨ OBTER CHAVE OPENAI:');
console.log('   → https://platform.openai.com/api-keys');
console.log('   → Create new secret key');
console.log('   → Nome: TRT15-ChatBot');
console.log('   → Copiar chave (sk-...)');

console.log('\n🔄 PASSO A PASSO COMPLETO:');

console.log('\nETAPA 1: Configurar OpenAI (PRINCIPAL)');
console.log('1.1. Acesse https://platform.openai.com/api-keys');
console.log('1.2. Login na sua conta OpenAI');
console.log('1.3. Clique "Create new secret key"');
console.log('1.4. Nome: "TRT15-ChatBot-Production"');
console.log('1.5. Copie a chave (formato: sk-...)');
console.log('1.6. GUARDE EM LOCAL SEGURO (não será mostrada novamente)');

console.log('\nETAPA 2: Configurar no Supabase');
console.log('2.1. Acesse https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz');
console.log('2.2. Menu lateral: "Edge Functions"');
console.log('2.3. Aba: "Settings"');
console.log('2.4. Seção: "Environment Variables"');
console.log('2.5. Clique: "Add new variable"');
console.log('2.6. Name: OPENAI_API_KEY');
console.log('2.7. Value: sk-... (cole sua chave)');
console.log('2.8. Clique "Save"');

console.log('\nETAPA 3: Reiniciar Edge Function');
console.log('3.1. Aba: "Functions"');
console.log('3.2. Localize: "chat-assistant"');
console.log('3.3. Menu ⋯: "Restart" ou "Redeploy"');
console.log('3.4. Aguarde 2-3 minutos');

console.log('\nETAPA 4: Verificar Funcionamento');
console.log('4.1. Acesse: https://msribeiro2010.github.io/napje-painel-atalhos/');
console.log('4.2. Abra o ChatBot');
console.log('4.3. Verifique se saiu do "Modo Offline"');
console.log('4.4. Teste enviando uma mensagem');

console.log('\n🎯 RESULTADOS ESPERADOS:');
console.log('✅ Badge muda de "Modo Offline" para "Inteligente"');
console.log('✅ Respostas personalizadas da IA');
console.log('✅ Sistema de busca funcionando');
console.log('✅ Acesso à base de conhecimento');

console.log('\n💰 CUSTOS:');
console.log('📊 Modelo: GPT-4o-mini (econômico)');
console.log('💵 Custo: ~$0.001 por conversa');
console.log('📈 Estimativa: 50 conversas/dia = $1.50/mês');
console.log('🎛️ Controle: Modo "Base Interna" usa 0 créditos');

console.log('\n🔐 SEGURANÇA:');
console.log('✅ Chave armazenada como variável de ambiente');
console.log('✅ Não exposta no código');
console.log('✅ Criptografada no Supabase');
console.log('✅ Rate limiting ativo');

console.log('\n🆘 TROUBLESHOOTING:');
console.log('❓ Ainda em Modo Offline?');
console.log('  → Limpar cache do navegador');
console.log('  → Aguardar 5 minutos após configurar');
console.log('  → Verificar console do navegador (F12)');
console.log('  → Executar: node scripts/test-ai-connection.js');

console.log('\n❓ Erro "Invalid API key"?');
console.log('  → Verificar formato da chave (sk-...)');
console.log('  → Confirmar que não expirou');
console.log('  → Verificar créditos na conta OpenAI');

console.log('\n❓ Erro de Rate Limit?');
console.log('  → Aguardar alguns minutos');
console.log('  → Usar modo "Base Interna" temporariamente');

console.log('\n📞 SUPORTE:');
console.log('📖 Documentação: CONFIGURAR_OPENAI_CHATBOT_ONLINE.md');
console.log('🧪 Teste: node scripts/test-ai-connection.js');
console.log('🌐 Supabase: https://supabase.com/dashboard/project/zpufcvesenbhtmizmjiz');
console.log('🔑 OpenAI: https://platform.openai.com/api-keys');

console.log('\n✅ CHECKLIST RÁPIDO:');
console.log('□ Chave OpenAI obtida (sk-...)');
console.log('□ Configurada no Supabase Edge Functions');
console.log('□ Edge Function reiniciada');
console.log('□ ChatBot testado');
console.log('□ Saiu do Modo Offline');

console.log('\n🚀 PRIORIDADE MÁXIMA:');
console.log('🎯 Configure a OPENAI_API_KEY no Supabase Edge Functions');
console.log('🎯 Isso resolverá o problema do "Modo Offline"');

console.log('\n💡 DICA:');
console.log('Enquanto não configurar OpenAI, o ChatBot continuará');
console.log('funcionando em "Modo Offline" com respostas locais.');
console.log('Isso é um recurso de segurança implementado!');

console.log('\n🎉 Após configurar corretamente:');
console.log('O ChatBot TRT15 estará ONLINE com IA completa! 🚀');