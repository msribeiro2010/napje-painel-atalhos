#!/usr/bin/env node

/**
 * Script de validação completa do setup do Supabase
 * Verifica configurações, conectividade e funcionalidades
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Validação Completa do Setup do Supabase');
console.log('=' .repeat(50));

// 1. Verificar arquivo .env
console.log('\n📁 1. Verificando arquivo .env...');

if (!fs.existsSync('.env')) {
  console.log('❌ Arquivo .env não encontrado!');
  console.log('💡 Crie o arquivo .env baseado no .env.example');
  process.exit(1);
}

console.log('✅ Arquivo .env encontrado');

// 2. Verificar variáveis de ambiente
console.log('\n🔑 2. Verificando variáveis de ambiente...');

const requiredVars = {
  'VITE_SUPABASE_URL': supabaseUrl,
  'VITE_SUPABASE_ANON_KEY': supabaseAnonKey,
  'SUPABASE_SERVICE_ROLE_KEY': supabaseServiceKey
};

let missingVars = [];
let exampleVars = [];

for (const [varName, value] of Object.entries(requiredVars)) {
  if (!value) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: não definida`);
  } else if (value.includes('your-') || value.includes('example') || value === 'https://xxxxxxxxxxx.supabase.co') {
    exampleVars.push(varName);
    console.log(`⚠️  ${varName}: contém valor de exemplo`);
  } else {
    console.log(`✅ ${varName}: configurada`);
  }
}

if (missingVars.length > 0) {
  console.log('\n❌ Variáveis de ambiente faltando:', missingVars.join(', '));
  console.log('📖 Consulte GUIA_CONFIGURACAO_SUPABASE.md para instruções');
  process.exit(1);
}

if (exampleVars.length > 0) {
  console.log('\n⚠️  Variáveis com valores de exemplo:', exampleVars.join(', '));
  console.log('📖 Substitua pelos valores reais do seu projeto Supabase');
  console.log('📖 Consulte GUIA_CONFIGURACAO_SUPABASE.md para instruções');
  process.exit(1);
}

// 3. Testar conectividade básica
console.log('\n🌐 3. Testando conectividade básica...');

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Testar se a URL é válida
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error('URL do Supabase inválida');
  }
  
  console.log('✅ Cliente Supabase criado com sucesso');
  console.log(`📡 Conectando a: ${supabaseUrl}`);
  
} catch (error) {
  console.log('❌ Erro ao criar cliente Supabase:', error.message);
  process.exit(1);
}

// 4. Testar autenticação
console.log('\n🔐 4. Testando autenticação...');

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Tentar obter usuário atual (deve retornar null se não autenticado)
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error && error.message !== 'Invalid JWT') {
    throw error;
  }
  
  console.log('✅ Sistema de autenticação acessível');
  console.log(`👤 Usuário atual: ${user ? user.email : 'não autenticado'}`);
  
} catch (error) {
  console.log('❌ Erro no sistema de autenticação:', error.message);
  console.log('💡 Verifique se a chave anon está correta');
}

// 5. Testar acesso à tabela (com chave de serviço)
console.log('\n📋 5. Testando acesso à tabela user_custom_events...');

try {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  // Tentar acessar a tabela
  const { data, error } = await supabaseAdmin
    .from('user_custom_events')
    .select('id')
    .limit(1);
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('❌ Tabela user_custom_events não existe');
      console.log('💡 Execute: node setup-supabase-database.js');
    } else {
      throw error;
    }
  } else {
    console.log('✅ Tabela user_custom_events acessível');
    console.log(`📊 Registros encontrados: ${data.length}`);
  }
  
} catch (error) {
  console.log('❌ Erro ao acessar tabela:', error.message);
  console.log('💡 Verifique se a chave service_role está correta');
}

// 6. Testar políticas RLS
console.log('\n🔒 6. Testando políticas RLS...');

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Tentar acessar a tabela sem autenticação (deve falhar)
  const { data, error } = await supabase
    .from('user_custom_events')
    .select('id')
    .limit(1);
  
  if (error) {
    if (error.code === 'PGRST301' || error.message.includes('RLS')) {
      console.log('✅ Políticas RLS ativas (acesso negado sem autenticação)');
    } else if (error.code === 'PGRST116') {
      console.log('⚠️  Tabela não existe - execute setup-supabase-database.js');
    } else {
      console.log('⚠️  Erro inesperado:', error.message);
    }
  } else {
    console.log('⚠️  RLS pode não estar configurado corretamente (acesso permitido sem auth)');
  }
  
} catch (error) {
  console.log('❌ Erro ao testar RLS:', error.message);
}

// 7. Verificar estrutura do projeto
console.log('\n📁 7. Verificando estrutura do projeto...');

const requiredFiles = [
  'src/hooks/useCustomEvents.ts',
  'src/components/CustomEventDialog.tsx',
  'src/integrations/supabase/client.ts',
  'package.json'
];

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} não encontrado`);
  }
}

// 8. Resumo final
console.log('\n📊 Resumo da Validação');
console.log('=' .repeat(30));

if (missingVars.length === 0 && exampleVars.length === 0) {
  console.log('✅ Configuração básica: OK');
  console.log('✅ Variáveis de ambiente: OK');
  console.log('\n🎉 Setup validado com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Se a tabela não existe: node setup-supabase-database.js');
  console.log('2. Reiniciar servidor: npm run dev');
  console.log('3. Testar funcionalidade na aplicação');
} else {
  console.log('❌ Configuração incompleta');
  console.log('📖 Consulte GUIA_CONFIGURACAO_SUPABASE.md para instruções completas');
}

console.log('\n🔗 Recursos úteis:');
console.log('- Painel Supabase: https://app.supabase.com');
console.log('- Documentação: https://supabase.com/docs');
console.log('- Guia local: ./GUIA_CONFIGURACAO_SUPABASE.md');