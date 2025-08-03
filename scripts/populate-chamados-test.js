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

console.log('🧪 Populando Tabela Chamados com Dados de Teste...');

// Dados de teste para inserir
const chamadosTest = [
  {
    resumo: 'Problema de acesso ao sistema PJe',
    notas: 'Usuário não consegue acessar o sistema PJe após atualização do navegador. Erro de certificado digital.',
    grau: 'Primeiro Grau',
    processos: '1234567-89.2024.8.02.0001',
    orgao_julgador: 'Vara Cível de Maceió',
    perfil_usuario_afetado: 'Advogado',
    nome_usuario_afetado: 'João Silva Santos',
    cpf_usuario_afetado: '123.456.789-00',
    chamado_origem: 'Telefone'
  },
  {
    resumo: 'Erro na petição inicial',
    notas: 'Sistema apresenta erro ao tentar protocolar petição inicial. Mensagem: "Documento não pode ser processado".',
    grau: 'Segundo Grau',
    processos: '9876543-21.2024.8.02.0002',
    orgao_julgador: 'Tribunal de Justiça de Alagoas',
    perfil_usuario_afetado: 'Servidor',
    nome_usuario_afetado: 'Maria Oliveira Costa',
    cpf_usuario_afetado: '987.654.321-00',
    chamado_origem: 'E-mail'
  },
  {
    resumo: 'Lentidão no carregamento de processos',
    notas: 'Sistema muito lento para carregar lista de processos. Timeout frequente nas consultas.',
    grau: 'Primeiro Grau',
    processos: '5555555-55.2024.8.02.0003',
    orgao_julgador: 'Vara Criminal de Arapiraca',
    perfil_usuario_afetado: 'Magistrado',
    nome_usuario_afetado: 'Dr. Carlos Eduardo Lima',
    cpf_usuario_afetado: '555.666.777-88',
    chamado_origem: 'Presencial'
  },
  {
    resumo: 'Certificado digital não reconhecido',
    notas: 'Sistema não reconhece certificado digital válido. Usuário já tentou reinstalar o certificado.',
    grau: 'Segundo Grau',
    processos: '1111111-11.2024.8.02.0004',
    orgao_julgador: 'Câmara Cível do TJAL',
    perfil_usuario_afetado: 'Advogado',
    nome_usuario_afetado: 'Ana Paula Ferreira',
    cpf_usuario_afetado: '111.222.333-44',
    chamado_origem: 'Chat'
  },
  {
    resumo: 'Erro ao anexar documentos',
    notas: 'Não é possível anexar documentos PDF ao processo. Sistema retorna erro 500.',
    grau: 'Primeiro Grau',
    processos: '7777777-77.2024.8.02.0005',
    orgao_julgador: 'Vara da Fazenda Pública',
    perfil_usuario_afetado: 'Procurador',
    nome_usuario_afetado: 'Roberto Almeida Souza',
    cpf_usuario_afetado: '777.888.999-00',
    chamado_origem: 'Sistema'
  }
];

async function populateChamados() {
  try {
    console.log('\n📊 Verificando estado atual da tabela...');
    
    // Verificar quantos registros existem
    const { count: currentCount } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📋 Registros atuais na tabela: ${currentCount}`);
    
    if (currentCount > 0) {
      console.log('⚠️ A tabela já contém dados. Deseja continuar? (y/N)');
      // Para este script, vamos continuar automaticamente
      console.log('✅ Continuando com a inserção...');
    }
    
    console.log('\n📝 Inserindo dados de teste...');
    
    // Inserir dados de teste
    const { data, error } = await supabase
      .from('chamados')
      .insert(chamadosTest)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir dados:', error);
      return;
    }
    
    console.log(`✅ ${data.length} chamados inseridos com sucesso!`);
    
    // Verificar se os dados foram inseridos corretamente
    console.log('\n🔍 Verificando dados inseridos...');
    const { data: verificacao, error: errorVerificacao } = await supabase
      .from('chamados')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (errorVerificacao) {
      console.error('❌ Erro ao verificar dados:', errorVerificacao);
      return;
    }
    
    console.log(`✅ Verificação concluída: ${verificacao.length} registros encontrados`);
    
    console.log('\n📋 Últimos chamados inseridos:');
    verificacao.forEach((chamado, index) => {
      console.log(`   ${index + 1}. ${chamado.resumo}`);
      console.log(`      ID: ${chamado.id}`);
      console.log(`      Órgão: ${chamado.orgao_julgador}`);
      console.log(`      Criado: ${new Date(chamado.created_at).toLocaleString('pt-BR')}`);
      console.log(`      ---`);
    });
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar população
populateChamados().then(() => {
  console.log('\n🏁 População de dados concluída!');
  console.log('\n💡 Agora você pode testar o Dashboard para ver se os chamados aparecem.');
}).catch(err => {
  console.error('❌ Erro fatal:', err);
});