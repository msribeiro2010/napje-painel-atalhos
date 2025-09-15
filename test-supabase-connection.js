// Script para testar conexão com Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão com Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NÃO DEFINIDA');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Credenciais do Supabase não configuradas!');
  console.log('\n📋 Para corrigir:');
  console.log('1. Configure VITE_SUPABASE_URL com a URL real do seu projeto');
  console.log('2. Configure VITE_SUPABASE_ANON_KEY com a chave anônima real');
  console.log('3. Essas informações estão disponíveis no painel do Supabase > Settings > API');
  process.exit(1);
}

if (supabaseUrl.includes('exemplo') || supabaseKey.includes('exemplo')) {
  console.error('❌ ERRO: Credenciais ainda estão com valores de exemplo!');
  console.log('\n📋 Para corrigir:');
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá em Settings > API');
  console.log('4. Copie a URL e a chave anônima para o arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testando conexão básica...');
    
    // Teste 1: Verificar se consegue conectar
    const { data: healthCheck, error: healthError } = await supabase
      .from('user_custom_events')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('❌ Erro na conexão:', healthError.message);
      
      if (healthError.message.includes('relation "user_custom_events" does not exist')) {
        console.log('\n📋 PROBLEMA: Tabela user_custom_events não existe!');
        console.log('Soluções:');
        console.log('1. Execute as migrações do Supabase');
        console.log('2. Crie a tabela manualmente no painel do Supabase');
      } else if (healthError.message.includes('Invalid API key')) {
        console.log('\n📋 PROBLEMA: Chave de API inválida!');
        console.log('Verifique se a VITE_SUPABASE_ANON_KEY está correta');
      } else if (healthError.message.includes('Project not found')) {
        console.log('\n📋 PROBLEMA: Projeto não encontrado!');
        console.log('Verifique se a VITE_SUPABASE_URL está correta');
      }
      
      return false;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📊 Tabela user_custom_events encontrada (${healthCheck?.count || 0} registros)`);
    
    // Teste 2: Verificar estrutura da tabela
    console.log('\n🔄 Verificando estrutura da tabela...');
    const { data: sampleData, error: structureError } = await supabase
      .from('user_custom_events')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError.message);
      return false;
    }
    
    console.log('✅ Estrutura da tabela verificada!');
    
    // Teste 3: Verificar autenticação
    console.log('\n🔄 Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ Usuário não autenticado (normal para teste)');
    } else if (user) {
      console.log('✅ Usuário autenticado:', user.email);
    } else {
      console.log('ℹ️ Nenhum usuário autenticado');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Faça login na aplicação');
    console.log('2. Tente criar um evento personalizado');
    console.log('3. Verifique os logs do console para mais detalhes');
  } else {
    console.log('\n❌ Teste de conexão falhou!');
    console.log('Corrija os problemas identificados acima antes de continuar.');
  }
  process.exit(success ? 0 : 1);
});