import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function checkTables() {
  console.log('🔍 Verificando tabelas do PJe relacionadas a processos e classes...\n');

  const pool = new Pool({
    host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
    database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
    user: process.env.PJE_DB1_USER || '',
    password: process.env.PJE_DB1_PASSWORD || '',
    port: 5432
  });

  try {
    // Verificar tabelas relacionadas a processo e classe
    const tablesQuery = `
      SELECT
        schemaname,
        tablename
      FROM pg_tables
      WHERE
        tablename LIKE '%processo%'
        OR tablename LIKE '%classe%'
      ORDER BY tablename;
    `;

    const tables = await pool.query(tablesQuery);
    console.log('📋 Tabelas encontradas com "processo" ou "classe":');
    tables.rows.forEach(row => {
      console.log(`  - ${row.schemaname}.${row.tablename}`);
    });

    // Verificar colunas da tabela tb_processo_trf
    console.log('\n📊 Estrutura da tabela tb_processo_trf:');
    const columnsQuery = `
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE
        table_name = 'tb_processo_trf'
        AND column_name LIKE '%classe%'
      ORDER BY ordinal_position;
    `;

    const columns = await pool.query(columnsQuery);
    if (columns.rows.length > 0) {
      console.log('  Colunas relacionadas a classe:');
      columns.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('  Nenhuma coluna com "classe" encontrada');
    }

    // Verificar se existe coluna id_classe_judicial diretamente na tb_processo_trf
    const checkDirectColumn = `
      SELECT
        column_name
      FROM information_schema.columns
      WHERE
        table_name = 'tb_processo_trf'
        AND column_name = 'id_classe_judicial';
    `;

    const directColumn = await pool.query(checkDirectColumn);
    if (directColumn.rows.length > 0) {
      console.log('\n✅ Campo id_classe_judicial encontrado diretamente em tb_processo_trf');
    }

    // Teste de query simples
    console.log('\n🧪 Testando query de distribuição simplificada...');
    const testQuery = `
      SELECT
        COUNT(*) as total
      FROM tb_processo_trf p
      INNER JOIN tb_orgao_julgador oj ON p.id_orgao_julgador = oj.id_orgao_julgador
      WHERE
        p.dt_autuacao::date = CURRENT_DATE
        AND p.id_processo_referencia IS NULL
      LIMIT 1;
    `;

    const testResult = await pool.query(testQuery);
    console.log(`  ✅ Query básica funcionou! Total de processos hoje: ${testResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();