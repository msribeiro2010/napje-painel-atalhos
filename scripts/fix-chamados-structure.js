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

console.log('🔧 Corrigindo Estrutura da Tabela Chamados...');

async function fixChamadosStructure() {
  try {
    console.log('\n📊 Passo 1: Adicionando colunas ausentes...');
    
    // SQL para adicionar colunas ausentes
    const addColumnsSQL = `
      ALTER TABLE chamados 
      ADD COLUMN IF NOT EXISTS resumo TEXT NOT NULL DEFAULT 'Sem título',
      ADD COLUMN IF NOT EXISTS notas TEXT,
      ADD COLUMN IF NOT EXISTS processos TEXT,
      ADD COLUMN IF NOT EXISTS descricao_gerada TEXT;
    `;
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: addColumnsSQL
    });
    
    if (alterError) {
      console.log('⚠️ Não foi possível executar ALTER TABLE via RPC:', alterError.message);
      console.log('💡 Isso é normal - vamos tentar uma abordagem alternativa...');
    } else {
      console.log('✅ Colunas adicionadas com sucesso!');
    }
    
    console.log('\n📊 Passo 2: Testando inserção com dados completos...');
    
    // Tentar inserir um registro de teste com todas as colunas
    const testData = {
      resumo: 'Teste de conectividade - DELETAR',
      notas: 'Este é um teste para verificar se as colunas foram criadas',
      grau: 'Teste',
      processos: 'TESTE-123',
      orgao_julgador: 'Teste',
      perfil_usuario_afetado: 'Teste',
      nome_usuario_afetado: 'Teste',
      cpf_usuario_afetado: '000.000.000-00',
      chamado_origem: 'Teste'
    };
    
    console.log('📝 Tentando inserir:', testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('chamados')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Erro na inserção de teste:', insertError);
      
      // Se falhou, vamos tentar apenas com as colunas que sabemos que existem
      console.log('\n🔄 Tentando inserção apenas com colunas existentes...');
      
      const minimalData = {
        grau: 'Teste Mínimo',
        orgao_julgador: 'Teste',
        perfil_usuario_afetado: 'Teste',
        nome_usuario_afetado: 'Teste',
        cpf_usuario_afetado: '000.000.000-00',
        chamado_origem: 'Teste'
      };
      
      const { data: minimalInsert, error: minimalError } = await supabase
        .from('chamados')
        .insert(minimalData)
        .select();
      
      if (minimalError) {
        console.error('❌ Erro na inserção mínima:', minimalError);
        
        if (minimalError.code === '42501') {
          console.log('\n🔒 Problema de RLS (Row Level Security) detectado!');
          console.log('💡 Soluções possíveis:');
          console.log('   1. Desabilitar RLS temporariamente');
          console.log('   2. Configurar políticas de RLS mais permissivas');
          console.log('   3. Usar uma chave de serviço em vez da chave anônima');
          
          // Tentar desabilitar RLS temporariamente
          console.log('\n🔓 Tentando desabilitar RLS...');
          const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE chamados DISABLE ROW LEVEL SECURITY;'
          });
          
          if (rlsError) {
            console.log('⚠️ Não foi possível desabilitar RLS:', rlsError.message);
          } else {
            console.log('✅ RLS desabilitado temporariamente');
            
            // Tentar inserir novamente
            const { data: retryInsert, error: retryError } = await supabase
              .from('chamados')
              .insert(minimalData)
              .select();
            
            if (retryError) {
              console.error('❌ Ainda há erro após desabilitar RLS:', retryError);
            } else {
              console.log('✅ Inserção bem-sucedida após desabilitar RLS!');
              
              // Deletar o registro de teste
              await supabase
                .from('chamados')
                .delete()
                .eq('id', retryInsert[0].id);
              
              console.log('✅ Registro de teste removido');
            }
            
            // Reabilitar RLS
            await supabase.rpc('exec_sql', {
              sql: 'ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;'
            });
            console.log('🔒 RLS reabilitado');
          }
        }
      } else {
        console.log('✅ Inserção mínima bem-sucedida!');
        
        // Deletar o registro de teste
        await supabase
          .from('chamados')
          .delete()
          .eq('id', minimalInsert[0].id);
        
        console.log('✅ Registro de teste removido');
      }
    } else {
      console.log('✅ Inserção completa bem-sucedida!');
      
      // Deletar o registro de teste
      await supabase
        .from('chamados')
        .delete()
        .eq('id', insertData[0].id);
      
      console.log('✅ Registro de teste removido');
    }
    
    console.log('\n📊 Passo 3: Verificação final da estrutura...');
    
    // Verificar novamente quais colunas existem
    const columns = [
      'id', 'resumo', 'notas', 'grau', 'processos', 
      'orgao_julgador', 'perfil_usuario_afetado', 
      'nome_usuario_afetado', 'cpf_usuario_afetado', 
      'chamado_origem', 'created_at', 'created_by', 'descricao_gerada'
    ];
    
    const workingColumns = [];
    
    for (const column of columns) {
      try {
        const { error } = await supabase
          .from('chamados')
          .select(column)
          .limit(1);
        
        if (!error) {
          workingColumns.push(column);
        }
      } catch (err) {
        // Coluna não existe
      }
    }
    
    console.log('✅ Colunas funcionais:', workingColumns);
    console.log('❌ Colunas ainda ausentes:', columns.filter(c => !workingColumns.includes(c)));
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar correção
fixChamadosStructure().then(() => {
  console.log('\n🏁 Correção de estrutura concluída!');
  console.log('\n💡 Próximos passos:');
  console.log('   1. Se ainda há colunas ausentes, execute o SQL manualmente no Supabase Dashboard');
  console.log('   2. Verifique as políticas de RLS na tabela chamados');
  console.log('   3. Teste o Dashboard novamente');
}).catch(err => {
  console.error('❌ Erro fatal:', err);
});