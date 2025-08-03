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

async function createSampleData() {
  console.log('🚀 Criando dados de teste para a tabela chamados...');
  console.log('📋 Usando apenas colunas existentes na tabela');
  
  // Dados de teste usando apenas colunas que existem (sem created_by que requer UUID)
  const sampleData = [
    {
      grau: 'Primeiro Grau',
      orgao_julgador: 'Vara Cível de São Paulo',
      perfil_usuario_afetado: 'Advogado',
      nome_usuario_afetado: 'João Silva',
      cpf_usuario_afetado: '123.456.789-00',
      chamado_origem: 'Sistema PJe'
    },
    {
      grau: 'Segundo Grau',
      orgao_julgador: 'Tribunal de Justiça do Rio de Janeiro',
      perfil_usuario_afetado: 'Servidor',
      nome_usuario_afetado: 'Maria Santos',
      cpf_usuario_afetado: '987.654.321-00',
      chamado_origem: 'Sistema Interno'
    },
    {
      grau: 'Primeiro Grau',
      orgao_julgador: 'Vara Criminal de Brasília',
      perfil_usuario_afetado: 'Magistrado',
      nome_usuario_afetado: 'Dr. Carlos Oliveira',
      cpf_usuario_afetado: '456.789.123-00',
      chamado_origem: 'Portal do Usuário'
    }
  ];

  try {
    console.log('📝 Tentando inserir dados de teste...');
    
    const { data, error } = await supabase
      .from('chamados')
      .insert(sampleData)
      .select();

    if (error) {
      console.error('❌ Erro ao inserir dados:', error);
      
      if (error.message.includes('row-level security')) {
        console.log('🔒 Problema de RLS detectado. Tentando inserção mínima...');
        
        // Tentar inserir apenas um registro mínimo
        const minimalData = {
          grau: 'Teste',
          orgao_julgador: 'Órgão Teste'
        };
        
        const { data: minData, error: minError } = await supabase
          .from('chamados')
          .insert(minimalData)
          .select();
          
        if (minError) {
          console.error('❌ Erro na inserção mínima:', minError);
          console.log('\n🔧 SOLUÇÕES NECESSÁRIAS:');
          console.log('1. Acesse o Supabase Dashboard');
          console.log('2. Vá para Authentication > Policies');
          console.log('3. Desabilite temporariamente o RLS na tabela chamados ou crie uma política permissiva');
          console.log('4. Execute este script novamente');
        } else {
          console.log('✅ Inserção mínima bem-sucedida:', minData);
        }
      }
    } else {
      console.log('✅ Dados inseridos com sucesso!');
      console.log('📊 Registros criados:', data?.length || 0);
      data?.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.grau} - ${item.orgao_julgador}`);
      });
    }

    // Verificar dados existentes
    console.log('\n🔍 Verificando dados na tabela...');
    const { data: existingData, error: selectError } = await supabase
      .from('chamados')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (selectError) {
      console.error('❌ Erro ao buscar dados:', selectError);
    } else {
      console.log(`📋 Total de registros encontrados: ${existingData?.length || 0}`);
      if (existingData && existingData.length > 0) {
        console.log('\n📄 Últimos registros:');
        existingData.forEach((item, index) => {
          console.log(`   ${index + 1}. ID: ${item.id} | Grau: ${item.grau} | Órgão: ${item.orgao_julgador}`);
        });
      }
    }

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar
createSampleData().then(() => {
  console.log('\n🎯 Script concluído!');
  console.log('💡 Agora teste o dashboard para ver se os chamados aparecem.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});