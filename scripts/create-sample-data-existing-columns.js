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

console.log('📝 Criando Dados de Exemplo com Colunas Existentes...');

// Dados usando apenas as colunas que existem na tabela
const chamadosExistentes = [
  {
    grau: 'Primeiro Grau - Problema PJe',
    orgao_julgador: 'Vara Cível de Maceió',
    perfil_usuario_afetado: 'Advogado',
    nome_usuario_afetado: 'João Silva Santos',
    cpf_usuario_afetado: '123.456.789-00',
    chamado_origem: 'Telefone'
  },
  {
    grau: 'Segundo Grau - Erro Petição',
    orgao_julgador: 'Tribunal de Justiça de Alagoas',
    perfil_usuario_afetado: 'Servidor',
    nome_usuario_afetado: 'Maria Oliveira Costa',
    cpf_usuario_afetado: '987.654.321-00',
    chamado_origem: 'E-mail'
  },
  {
    grau: 'Primeiro Grau - Lentidão Sistema',
    orgao_julgador: 'Vara Criminal de Arapiraca',
    perfil_usuario_afetado: 'Magistrado',
    nome_usuario_afetado: 'Dr. Carlos Eduardo Lima',
    cpf_usuario_afetado: '555.666.777-88',
    chamado_origem: 'Presencial'
  },
  {
    grau: 'Segundo Grau - Certificado Digital',
    orgao_julgador: 'Câmara Cível do TJAL',
    perfil_usuario_afetado: 'Advogado',
    nome_usuario_afetado: 'Ana Paula Ferreira',
    cpf_usuario_afetado: '111.222.333-44',
    chamado_origem: 'Chat'
  },
  {
    grau: 'Primeiro Grau - Erro Anexos',
    orgao_julgador: 'Vara da Fazenda Pública',
    perfil_usuario_afetado: 'Procurador',
    nome_usuario_afetado: 'Roberto Almeida Souza',
    cpf_usuario_afetado: '777.888.999-00',
    chamado_origem: 'Sistema'
  }
];

async function createSampleData() {
  try {
    console.log('\n🔒 Verificando políticas de RLS...');
    
    // Primeiro, vamos tentar inserir um registro simples para testar RLS
    console.log('\n🧪 Testando inserção individual...');
    
    for (let i = 0; i < chamadosExistentes.length; i++) {
      const chamado = chamadosExistentes[i];
      console.log(`\n📝 Inserindo chamado ${i + 1}/${chamadosExistentes.length}...`);
      console.log(`   Grau: ${chamado.grau}`);
      console.log(`   Órgão: ${chamado.orgao_julgador}`);
      
      const { data, error } = await supabase
        .from('chamados')
        .insert(chamado)
        .select();
      
      if (error) {
        console.error(`❌ Erro ao inserir chamado ${i + 1}:`, error);
        
        if (error.code === '42501') {
          console.log('🔒 Erro de RLS detectado. Parando inserções.');
          console.log('\n💡 Para resolver este problema:');
          console.log('   1. Acesse o Supabase Dashboard');
          console.log('   2. Vá para Authentication > Policies');
          console.log('   3. Configure políticas mais permissivas para a tabela "chamados"');
          console.log('   4. Ou desabilite RLS temporariamente para desenvolvimento');
          break;
        }
      } else {
        console.log(`✅ Chamado ${i + 1} inserido com sucesso!`);
        console.log(`   ID: ${data[0].id}`);
      }
      
      // Pequena pausa entre inserções
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Verificando dados inseridos...');
    const { data: verificacao, error: errorVerificacao } = await supabase
      .from('chamados')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (errorVerificacao) {
      console.error('❌ Erro ao verificar dados:', errorVerificacao);
    } else {
      console.log(`✅ Total de chamados na tabela: ${verificacao.length}`);
      
      if (verificacao.length > 0) {
        console.log('\n📋 Chamados encontrados:');
        verificacao.forEach((chamado, index) => {
          console.log(`   ${index + 1}. ${chamado.grau}`);
          console.log(`      ID: ${chamado.id}`);
          console.log(`      Órgão: ${chamado.orgao_julgador}`);
          console.log(`      Usuário: ${chamado.nome_usuario_afetado}`);
          console.log(`      Criado: ${new Date(chamado.created_at).toLocaleString('pt-BR')}`);
          console.log(`      ---`);
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar criação de dados
createSampleData().then(() => {
  console.log('\n🏁 Processo concluído!');
  console.log('\n📋 Resumo do problema encontrado:');
  console.log('   ❌ Colunas ausentes: resumo, notas, processos, descricao_gerada');
  console.log('   🔒 RLS (Row Level Security) muito restritivo');
  console.log('\n💡 Soluções recomendadas:');
  console.log('   1. Execute o SQL do arquivo fix-chamados-table.sql no Supabase Dashboard');
  console.log('   2. Configure políticas de RLS mais permissivas');
  console.log('   3. Atualize o código para usar apenas colunas existentes temporariamente');
}).catch(err => {
  console.error('❌ Erro fatal:', err);
});