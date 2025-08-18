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

async function insertTestChamados() {
  console.log('🚀 Inserindo dados de teste na tabela chamados...');
  
  // Dados de teste usando a estrutura correta da tabela
  const testData = [
    {
      titulo: 'Problema no sistema PJe - Login não funciona',
      descricao: 'Usuário não consegue fazer login no sistema PJe. Aparece mensagem de erro "Credenciais inválidas" mesmo com dados corretos.',
      grau: 'Primeiro Grau',
      orgao_julgador: 'Vara Cível de São Paulo',
      perfil_usuario_afetado: 'Advogado',
      nome_usuario_afetado: 'João Silva',
      cpf_usuario_afetado: '123.456.789-00',
      chamado_origem: 'Sistema PJe',
      numero_processo: '1001234-56.2024.8.26.0100',
      tipo: 'Técnico',
      status: 'Aberto',
      prioridade: 3
    },
    {
      titulo: 'Erro ao anexar documentos',
      descricao: 'Sistema apresenta erro ao tentar anexar documentos PDF. Mensagem: "Formato de arquivo não suportado".',
      grau: 'Segundo Grau',
      orgao_julgador: 'Tribunal de Justiça do Rio de Janeiro',
      perfil_usuario_afetado: 'Servidor',
      nome_usuario_afetado: 'Maria Santos',
      cpf_usuario_afetado: '987.654.321-00',
      chamado_origem: 'Sistema Interno',
      numero_processo: '2002345-67.2024.8.19.0001',
      tipo: 'Funcional',
      status: 'Em Andamento',
      prioridade: 2
    },
    {
      titulo: 'Lentidão no carregamento de processos',
      descricao: 'Sistema muito lento para carregar a lista de processos. Demora mais de 5 minutos para exibir os dados.',
      grau: 'Primeiro Grau',
      orgao_julgador: 'Vara Criminal de Brasília',
      perfil_usuario_afetado: 'Magistrado',
      nome_usuario_afetado: 'Dr. Carlos Oliveira',
      cpf_usuario_afetado: '456.789.123-00',
      chamado_origem: 'Portal do Usuário',
      numero_processo: '3003456-78.2024.8.07.0001',
      tipo: 'Performance',
      status: 'Aberto',
      prioridade: 4
    }
  ];

  try {
    console.log('📝 Tentando inserir dados...');
    
    const { data, error } = await supabase
      .from('chamados')
      .insert(testData)
      .select();

    if (error) {
      console.error('❌ Erro ao inserir dados:', error);
      
      if (error.message.includes('row-level security')) {
        console.log('\n🔒 PROBLEMA DE RLS DETECTADO!');
        console.log('Para resolver:');
        console.log('1. Acesse o Supabase Dashboard');
        console.log('2. Vá para Authentication > Policies');
        console.log('3. Desabilite temporariamente o RLS na tabela chamados');
        console.log('4. Ou execute: ALTER TABLE chamados DISABLE ROW LEVEL SECURITY;');
      }
    } else {
      console.log('✅ Dados inseridos com sucesso!');
      console.log(`📊 ${data?.length || 0} registros criados`);
      
      data?.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.titulo}`);
      });
    }

    // Verificar dados existentes
    console.log('\n🔍 Verificando dados na tabela...');
    const { data: existingData, error: selectError } = await supabase
      .from('chamados')
      .select('id, titulo, grau, orgao_julgador, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (selectError) {
      console.error('❌ Erro ao buscar dados:', selectError);
    } else {
      console.log(`📋 Total de registros: ${existingData?.length || 0}`);
      if (existingData && existingData.length > 0) {
        console.log('\n📄 Registros encontrados:');
        existingData.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.titulo} (${item.status})`);
        });
      }
    }

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar
insertTestChamados().then(() => {
  console.log('\n🎯 Script concluído!');
  console.log('💡 Agora teste o dashboard para ver se os chamados aparecem.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});