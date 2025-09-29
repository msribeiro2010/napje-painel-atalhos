import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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
      console.log(`   🔄 Tentando conectar...`);
      const result = await pool.query('SELECT NOW() as time, current_database() as db');
      console.log(`   ✅ Conexão estabelecida!`);
      console.log(`   📅 Hora do servidor: ${result.rows[0].time}`);
      console.log(`   🗄️  Database: ${result.rows[0].db}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);

      // Diagnóstico do erro
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.log(`   ⚠️  Host não encontrado. Verifique:`);
        console.log(`      - Se o host "${config.host}" está correto`);
        console.log(`      - Se você está na rede correta (VPN, intranet, etc.)`);
        console.log(`      - Se o servidor está acessível via ping ou nslookup`);
      } else if (error.message.includes('password authentication failed')) {
        console.log(`   ⚠️  Senha incorreta. Verifique as credenciais no .env`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`   ⚠️  Conexão recusada. O servidor pode estar:`);
        console.log(`      - Fora do ar`);
        console.log(`      - Bloqueando conexões externas`);
        console.log(`      - Em porta diferente de 5432`);
      } else if (error.message.includes('timeout')) {
        console.log(`   ⚠️  Timeout. Possíveis causas:`);
        console.log(`      - Servidor inacessível`);
        console.log(`      - Firewall bloqueando a conexão`);
        console.log(`      - Rede lenta ou instável`);
      }
    } finally {
      await pool.end();
    }
  }

  console.log('\n\n📝 Diagnóstico de Rede:');
  console.log('================================');
  console.log('Vamos verificar a conectividade com os hosts...\n');
}

// Executar testes
testConnections().catch(console.error);