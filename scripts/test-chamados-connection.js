import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testando Conexão com Tabela Chamados...');
console.log('\n🔍 Verificando configuração:');
console.log('✅ VITE_SUPABASE_URL:', supabaseUrl);
console.log('✅ VITE_SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');

async function testChamadosTable() {
  try {
    console.log('\n📊 Testando acesso à tabela chamados...');
    
    // Teste 1: Verificar se a tabela existe e contar registros
    console.log('\n1️⃣ Contando registros na tabela...');
    const { data: countData, error: countError, count } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      return;
    }
    
    console.log(`✅ Total de registros na tabela: ${count}`);
    
    // Teste 2: Buscar todos os registros (limitado a 10)
    console.log('\n2️⃣ Buscando registros...');
    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao buscar registros:', error);
      return;
    }
    
    console.log(`✅ Registros encontrados: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Estrutura do primeiro registro:');
      const firstRecord = data[0];
      Object.keys(firstRecord).forEach(key => {
        console.log(`   ${key}: ${typeof firstRecord[key]} = ${firstRecord[key]}`);
      });
      
      console.log('\n📋 Últimos 3 chamados:');
      data.slice(0, 3).forEach((chamado, index) => {
        console.log(`   ${index + 1}. ID: ${chamado.id}`);
        console.log(`      Resumo: ${chamado.resumo || 'N/A'}`);
        console.log(`      Notas: ${chamado.notas || 'N/A'}`);
        console.log(`      Criado em: ${chamado.created_at}`);
        console.log(`      ---`);
      });
    } else {
      console.log('⚠️ Nenhum registro encontrado na tabela');
    }
    
    // Teste 3: Testar query específica usada no Dashboard
    console.log('\n3️⃣ Testando query específica do Dashboard...');
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('chamados')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (dashboardError) {
      console.error('❌ Erro na query do Dashboard:', dashboardError);
    } else {
      console.log(`✅ Query do Dashboard funcionando: ${dashboardData?.length || 0} registros`);
    }
    
    // Teste 4: Verificar permissões
    console.log('\n4️⃣ Testando permissões...');
    try {
      const { data: insertTest, error: insertError } = await supabase
        .from('chamados')
        .insert({
          resumo: 'Teste de conexão - DELETAR',
          notas: 'Este é um teste de conectividade'
        })
        .select()
        .single();
      
      if (insertError) {
        console.log('⚠️ Sem permissão de INSERT:', insertError.message);
      } else {
        console.log('✅ Permissão de INSERT: OK');
        
        // Deletar o registro de teste
        const { error: deleteError } = await supabase
          .from('chamados')
          .delete()
          .eq('id', insertTest.id);
        
        if (deleteError) {
          console.log('⚠️ Erro ao deletar registro de teste:', deleteError.message);
        } else {
          console.log('✅ Registro de teste deletado com sucesso');
        }
      }
    } catch (err) {
      console.log('⚠️ Erro no teste de permissões:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Erro geral no teste:', err);
  }
}

// Executar testes
testChamadosTable().then(() => {
  console.log('\n🏁 Teste concluído!');
}).catch(err => {
  console.error('❌ Erro fatal:', err);
});