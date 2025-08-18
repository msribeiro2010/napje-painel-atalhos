// Script para popular a tabela de usuários com dados de teste
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Função para gerar CPF válido
function gerarCPFValido() {
  const cpf = [];
  
  // Gera os 9 primeiros dígitos
  for (let i = 0; i < 9; i++) {
    cpf[i] = Math.floor(Math.random() * 10);
  }
  
  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += cpf[i] * (10 - i);
  }
  let resto = soma % 11;
  cpf[9] = resto < 2 ? 0 : 11 - resto;
  
  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += cpf[i] * (11 - i);
  }
  resto = soma % 11;
  cpf[10] = resto < 2 ? 0 : 11 - resto;
  
  return cpf.join('');
}

// Função para formatar CPF
function formatarCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Dados de usuários de teste
const usuariosTest = [
  {
    nome_completo: 'João Silva Santos',
    perfil: 'Advogado'
  },
  {
    nome_completo: 'Maria Oliveira Costa',
    perfil: 'Procurador'
  },
  {
    nome_completo: 'Pedro Almeida Souza',
    perfil: 'Servidor'
  },
  {
    nome_completo: 'Ana Paula Ferreira',
    perfil: 'Assessor'
  },
  {
    nome_completo: 'Carlos Eduardo Lima',
    perfil: 'Magistrado'
  },
  {
    nome_completo: 'Fernanda Rodrigues',
    perfil: 'Advogado'
  },
  {
    nome_completo: 'Roberto Carlos Mendes',
    perfil: 'Procurador'
  },
  {
    nome_completo: 'Juliana Santos Silva',
    perfil: 'Servidor'
  },
  {
    nome_completo: 'Marcos Antonio Pereira',
    perfil: 'Assessor'
  },
  {
    nome_completo: 'Luciana Barbosa',
    perfil: 'Advogado'
  }
];

async function popularUsuarios() {
  try {
    console.log('Verificando usuários existentes...');
    
    // Verificar quantos usuários já existem
    const { count, error: countError } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Erro ao contar usuários:', countError);
      return;
    }
    
    console.log(`Usuários existentes: ${count}`);
    
    // Limitar a 50 usuários total para respeitar o plano
    const maxUsuarios = 50;
    const usuariosParaAdicionar = Math.min(usuariosTest.length, maxUsuarios - count);
    
    if (usuariosParaAdicionar <= 0) {
      console.log('Limite de usuários atingido. Não é possível adicionar mais usuários.');
      return;
    }
    
    console.log(`Adicionando ${usuariosParaAdicionar} usuários...`);
    
    // Preparar dados com CPFs válidos
    const usuariosParaInserir = usuariosTest.slice(0, usuariosParaAdicionar).map(usuario => ({
      ...usuario,
      cpf: formatarCPF(gerarCPFValido())
    }));
    
    // Inserir usuários
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuariosParaInserir)
      .select();
    
    if (error) {
      console.error('Erro ao inserir usuários:', error);
      return;
    }
    
    console.log(`✅ ${data.length} usuários inseridos com sucesso!`);
    console.log('Usuários adicionados:');
    data.forEach(usuario => {
      console.log(`- ${usuario.nome_completo} (${usuario.cpf}) - ${usuario.perfil}`);
    });
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o script
popularUsuarios();