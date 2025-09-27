import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function checkColumns() {
  console.log('🔍 Verificando colunas da tabela tb_processo_trf...\n');

  const pool = new Pool({
    host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
    database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
    user: process.env.PJE_DB1_USER || '',
    password: process.env.PJE_DB1_PASSWORD || '',
    port: 5432
  });

  try {
    // Verificar todas as colunas da tabela tb_processo_trf
    const columnsQuery = `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE
        table_name = 'tb_processo_trf'
      ORDER BY ordinal_position
      LIMIT 30;
    `;

    const columns = await pool.query(columnsQuery);
    console.log('📋 Primeiras 30 colunas de tb_processo_trf:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Buscar colunas que possam ser o ID do processo
    console.log('\n🔍 Colunas com "id" ou "processo" no nome:');
    const idQuery = `
      SELECT
        column_name,
        data_type
      FROM information_schema.columns
      WHERE
        table_name = 'tb_processo_trf'
        AND (column_name LIKE '%id%' OR column_name LIKE '%processo%')
      ORDER BY column_name;
    `;

    const idColumns = await pool.query(idQuery);
    idColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Testar uma query simples
    console.log('\n🧪 Testando query com primeiros registros:');
    const testQuery = `
      SELECT *
      FROM tb_processo_trf
      LIMIT 1;
    `;

    const test = await pool.query(testQuery);
    if (test.rows.length > 0) {
      const columns = Object.keys(test.rows[0]);
      console.log('  Colunas disponíveis:', columns.slice(0, 10).join(', '), '...');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkColumns();