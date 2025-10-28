// Script para testar conexões com os bancos PostgreSQL do PJe
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Configurações dos bancos (tentaremos sem SSL primeiro)
const db1Config = {
  host: process.env.PJE_DB1_HOST,
  database: process.env.PJE_DB1_DATABASE,
  user: process.env.PJE_DB1_USER,
  password: process.env.PJE_DB1_PASSWORD,
  port: 5432,
  ssl: false, // Começar sem SSL
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
};

const db2Config = {
  host: process.env.PJE_DB2_HOST,
  database: process.env.PJE_DB2_DATABASE,
  user: process.env.PJE_DB2_USER,
  password: process.env.PJE_DB2_PASSWORD,
  port: 5432,
  ssl: false, // Começar sem SSL
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
};

console.log('🔍 Testando conexões com bancos PostgreSQL do PJe...\n');

// Função para testar uma conexão
async function testDatabase(config, name) {
  console.log(`📊 Testando ${name}...`);
  console.log(`📍 Host: ${config.host}`);
  console.log(`🗄️ Database: ${config.database}`);
  console.log(`👤 User: ${config.user}`);
  console.log(`🔑 Password: ${config.password ? '***configurada***' : '❌ NÃO CONFIGURADA'}\n`);

  // Verificar se todas as credenciais estão configuradas
  if (!config.host || !config.database || !config.user || !config.password) {
    console.error(`❌ ${name}: Credenciais incompletas!`);
    console.log('📋 Variáveis necessárias:');
    console.log(`   - PJE_DB${name.includes('1º') ? '1' : '2'}_HOST`);
    console.log(`   - PJE_DB${name.includes('1º') ? '1' : '2'}_DATABASE`);
    console.log(`   - PJE_DB${name.includes('1º') ? '1' : '2'}_USER`);
    console.log(`   - PJE_DB${name.includes('1º') ? '1' : '2'}_PASSWORD\n`);
    return false;
  }

  const client = new Client(config);

  try {
    console.log(`🔄 Conectando ao ${name}...`);
    await client.connect();
    console.log(`✅ ${name}: Conexão estabelecida com sucesso!`);

    // Teste básico de consulta
    console.log(`🔍 Testando consulta básica no ${name}...`);
    const result = await client.query('SELECT version(), current_database(), current_user');
    
    console.log(`📊 ${name} - Informações do banco:`);
    console.log(`   - Versão PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    console.log(`   - Database atual: ${result.rows[0].current_database}`);
    console.log(`   - Usuário atual: ${result.rows[0].current_user}`);

    // Teste de permissões - listar tabelas
    console.log(`🔍 Verificando permissões de leitura no ${name}...`);
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      LIMIT 10
    `);
    
    console.log(`📋 ${name} - Tabelas acessíveis (primeiras 10):`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Teste de performance
    console.log(`⏱️ Testando performance de consulta no ${name}...`);
    const startTime = Date.now();
    await client.query('SELECT 1');
    const endTime = Date.now();
    console.log(`⚡ ${name} - Tempo de resposta: ${endTime - startTime}ms`);

    console.log(`✅ ${name}: Todos os testes passaram!\n`);
    return true;

  } catch (error) {
    console.error(`❌ ${name}: Erro na conexão!`);
    console.error(`   Erro: ${error.message}`);
    
    // Diagnósticos específicos
    if (error.code === 'ECONNREFUSED') {
      console.log(`🔧 ${name} - Possíveis soluções:`);
      console.log('   1. Verifique se o host está correto');
      console.log('   2. Confirme se a porta 5432 está aberta');
      console.log('   3. Verifique se o servidor está rodando');
    } else if (error.code === 'ENOTFOUND') {
      console.log(`🔧 ${name} - Possíveis soluções:`);
      console.log('   1. Verifique se o hostname está correto');
      console.log('   2. Confirme se há conectividade de rede');
      console.log('   3. Teste com nslookup ou ping');
    } else if (error.message.includes('authentication')) {
      console.log(`🔧 ${name} - Possíveis soluções:`);
      console.log('   1. Verifique usuário e senha');
      console.log('   2. Confirme se o usuário existe no banco');
      console.log('   3. Verifique se o usuário tem permissões');
    } else if (error.message.includes('timeout')) {
      console.log(`🔧 ${name} - Possíveis soluções:`);
      console.log('   1. Aumente o timeout de conexão');
      console.log('   2. Verifique a latência de rede');
      console.log('   3. Confirme se não há firewall bloqueando');
    }
    
    console.log('');
    return false;

  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignorar erros ao fechar conexão
    }
  }
}

// Função principal
async function testAllDatabases() {
  console.log('🚀 Iniciando testes de conexão...\n');
  
  const results = {
    db1: false,
    db2: false
  };

  // Testar banco 1º grau
  results.db1 = await testDatabase(db1Config, 'Banco 1º Grau');
  
  // Testar banco 2º grau
  results.db2 = await testDatabase(db2Config, 'Banco 2º Grau');

  // Resumo final
  console.log('📊 RESUMO DOS TESTES:');
  console.log('═══════════════════════════════════════');
  console.log(`Banco 1º Grau: ${results.db1 ? '✅ SUCESSO' : '❌ FALHOU'}`);
  console.log(`Banco 2º Grau: ${results.db2 ? '✅ SUCESSO' : '❌ FALHOU'}`);
  console.log('═══════════════════════════════════════');

  if (results.db1 && results.db2) {
    console.log('🎉 Todos os bancos estão funcionando corretamente!');
    console.log('✅ Pronto para deploy na Vercel!');
  } else {
    console.log('⚠️ Alguns bancos falharam nos testes.');
    console.log('🔧 Corrija os problemas antes do deploy.');
  }

  return results.db1 && results.db2;
}

// Executar testes
testAllDatabases()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
  });