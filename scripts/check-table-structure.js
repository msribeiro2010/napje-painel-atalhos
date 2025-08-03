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

console.log('🔍 Verificando Estrutura Real da Tabela Chamados...');

async function checkTableStructure() {
  try {
    console.log('\n📊 Método 1: Tentando SELECT * para ver colunas disponíveis...');
    
    // Tentar fazer um select simples para ver quais colunas existem
    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro no SELECT *:', error);
    } else {
      console.log('✅ SELECT * funcionou');
      console.log('📋 Dados retornados:', data);
    }
    
    console.log('\n📊 Método 2: Testando colunas individuais...');
    
    // Lista de colunas esperadas baseada no schema TypeScript
    const expectedColumns = [
      'id',
      'resumo', 
      'notas',
      'grau',
      'processos',
      'orgao_julgador',
      'perfil_usuario_afetado',
      'nome_usuario_afetado',
      'cpf_usuario_afetado',
      'chamado_origem',
      'created_at',
      'created_by',
      'descricao_gerada'
    ];
    
    const existingColumns = [];
    const missingColumns = [];
    
    for (const column of expectedColumns) {
      try {
        const { data: testData, error: testError } = await supabase
          .from('chamados')
          .select(column)
          .limit(1);
        
        if (testError) {
          console.log(`❌ Coluna '${column}': ${testError.message}`);
          missingColumns.push(column);
        } else {
          console.log(`✅ Coluna '${column}': OK`);
          existingColumns.push(column);
        }
      } catch (err) {
        console.log(`❌ Coluna '${column}': ${err.message}`);
        missingColumns.push(column);
      }
    }
    
    console.log('\n📋 Resumo da Estrutura:');
    console.log(`✅ Colunas existentes (${existingColumns.length}):`, existingColumns);
    console.log(`❌ Colunas ausentes (${missingColumns.length}):`, missingColumns);
    
    // Tentar inserir um registro simples apenas com colunas que existem
    if (existingColumns.length > 0) {
      console.log('\n🧪 Testando inserção com colunas existentes...');
      
      // Criar objeto apenas com colunas que existem
      const testRecord = {};
      
      if (existingColumns.includes('resumo')) {
        testRecord.resumo = 'Teste de conectividade';
      }
      
      if (existingColumns.includes('grau')) {
        testRecord.grau = 'Teste';
      }
      
      console.log('📝 Dados para inserção:', testRecord);
      
      const { data: insertData, error: insertError } = await supabase
        .from('chamados')
        .insert(testRecord)
        .select();
      
      if (insertError) {
        console.error('❌ Erro na inserção de teste:', insertError);
      } else {
        console.log('✅ Inserção de teste bem-sucedida!');
        console.log('📋 Registro inserido:', insertData);
        
        // Deletar o registro de teste
        if (insertData && insertData[0] && insertData[0].id) {
          const { error: deleteError } = await supabase
            .from('chamados')
            .delete()
            .eq('id', insertData[0].id);
          
          if (deleteError) {
            console.log('⚠️ Erro ao deletar registro de teste:', deleteError.message);
          } else {
            console.log('✅ Registro de teste deletado');
          }
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar verificação
checkTableStructure().then(() => {
  console.log('\n🏁 Verificação de estrutura concluída!');
}).catch(err => {
  console.error('❌ Erro fatal:', err);
});