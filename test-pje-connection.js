const pg = require('pg');
require('dotenv').config();

const { Pool } = pg;

async function testConnections() {
  console.log('🔍 Testando conexões PostgreSQL...\n');

  // Configurações dos bancos
  const configs = {
    pje1grau: {
      name: 'PJe 1º Grau',
      host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
      database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
      user: process.env.PJE_DB1_USER || '',
      password: process.env.PJE_DB1_PASSWORD || '',
      port: 5432
    },
    pje2grau: {
      name: 'PJe 2º Grau',
      host: process.env.PJE_DB2_HOST || 'pje-dbpr-a2-replica',
      database: process.env.PJE_DB2_DATABASE || 'pje_2grau',
      user: process.env.PJE_DB2_USER || '',
      password: process.env.PJE_DB2_PASSWORD || '',
      port: 5432
    },
    supabase: {
      name: 'Supabase',
      host: process.env.VITE_SUPABASE_URL ? process.env.VITE_SUPABASE_URL.replace('https://', '').replace('.supabase.co', '.supabase.co') : '',
      database: 'postgres',
      user: 'postgres',
      password: process.env.VITE_SUPABASE_ANON_KEY || '',
      port: 5432
    }
  };

  // Testar cada conexão
  for (const [key, config] of Object.entries(configs)) {
    console.log(`\n📊 Testando ${config.name}:`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user ? '***' + config.user.slice(-3) : '(não configurado)'}`);

    if (!config.user || !config.password) {
      console.log(`   ❌ Credenciais não configuradas no .env`);
      continue;
    }

    const pool = new Pool({
      ...config,
      connectionTimeoutMillis: 5000,
      max: 1
    });

    try {
      const result = await pool.query('SELECT NOW() as time, current_database() as db');
      console.log(`   ✅ Conexão estabelecida!`);
      console.log(`   📅 Hora do servidor: ${result.rows[0].time}`);
      console.log(`   🗄️  Database: ${result.rows[0].db}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);

      // Diagnóstico do erro
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.log(`   ⚠️  Host não encontrado. Verifique se está na rede correta.`);
      } else if (error.message.includes('password authentication failed')) {
        console.log(`   ⚠️  Senha incorreta. Verifique as credenciais no .env`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`   ⚠️  Conexão recusada. O servidor pode estar fora do ar.`);
      } else if (error.message.includes('timeout')) {
        console.log(`   ⚠️  Timeout. Servidor pode estar inacessível ou lento.`);
      }
    } finally {
      await pool.end();
    }
  }

  console.log('\n\n📝 Resumo das Configurações:');
  console.log('================================');
  console.log('Para corrigir as conexões, edite o arquivo .env com:');
  console.log('\n# Banco PJe 1º Grau');
  console.log('PJE_DB1_HOST=seu-host-aqui');
  console.log('PJE_DB1_DATABASE=pje_1grau');
  console.log('PJE_DB1_USER=seu-usuario');
  console.log('PJE_DB1_PASSWORD=sua-senha');
  console.log('\n# Banco PJe 2º Grau');
  console.log('PJE_DB2_HOST=seu-host-aqui');
  console.log('PJE_DB2_DATABASE=pje_2grau');
  console.log('PJE_DB2_USER=seu-usuario');
  console.log('PJE_DB2_PASSWORD=sua-senha');
  console.log('\n# Supabase');
  console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anonima');
  console.log('================================\n');
}

testConnections().catch(console.error);