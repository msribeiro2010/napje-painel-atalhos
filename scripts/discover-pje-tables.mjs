import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração dos pools de conexão
const pje1grauPool = new Pool({
  host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
  database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
  user: process.env.PJE_DB1_USER || 'msribeiro',
  password: process.env.PJE_DB1_PASSWORD || 'msrq1w2e3',
  port: 5432,
  connectionTimeoutMillis: 5000,
});

const pje2grauPool = new Pool({
  host: process.env.PJE_DB2_HOST || 'pje-dbpr-a2-replica',
  database: process.env.PJE_DB2_DATABASE || 'pje_2grau',
  user: process.env.PJE_DB2_USER || 'msribeiro',
  password: process.env.PJE_DB2_PASSWORD || 'msrq1w2e3',
  port: 5432,
  connectionTimeoutMillis: 5000,
});

async function discoverTables(pool, grau) {
  console.log(`\n🔍 Descobrindo tabelas do PJe ${grau}º Grau...`);
  
  try {
    // Buscar todas as tabelas públicas
    const tablesQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
      LIMIT 200;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    
    console.log(`\n📊 Encontradas ${tablesResult.rows.length} tabelas:\n`);
    
    // Filtrar tabelas relevantes
    const relevantKeywords = [
      'orgao', 'julgador', 'oj',
      'municipio', 'cidade', 'localidade',
      'processo', 'proc',
      'usuario', 'servidor', 'pessoa',
      'vara', 'tribunal', 'justica'
    ];
    
    const relevantTables = tablesResult.rows.filter(table => {
      const tableName = table.tablename.toLowerCase();
      return relevantKeywords.some(keyword => tableName.includes(keyword));
    });
    
    console.log('📌 Tabelas relevantes encontradas:');
    console.log('================================');
    
    for (const table of relevantTables) {
      console.log(`\n📁 ${table.schemaname}.${table.tablename}`);
      
      // Buscar colunas da tabela
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
        LIMIT 15;
      `;
      
      const columnsResult = await pool.query(columnsQuery, [table.schemaname, table.tablename]);
      
      console.log('   Colunas:');
      columnsResult.rows.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const nullable = col.is_nullable === 'YES' ? '?' : '';
        console.log(`    - ${col.column_name}: ${type}${nullable}`);
      });
      
      // Contar registros
      try {
        const countQuery = `SELECT COUNT(*) as total FROM ${table.schemaname}.${table.tablename} LIMIT 1`;
        const countResult = await pool.query(countQuery);
        console.log(`   Total de registros: ${countResult.rows[0].total}`);
      } catch (err) {
        console.log(`   Total de registros: (erro ao contar)`);
      }
    }
    
    // Buscar views também
    console.log('\n\n📊 Views disponíveis:');
    console.log('====================');
    
    const viewsQuery = `
      SELECT 
        schemaname,
        viewname
      FROM pg_views
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        AND (
          LOWER(viewname) LIKE '%orgao%' OR
          LOWER(viewname) LIKE '%julgador%' OR
          LOWER(viewname) LIKE '%municipio%' OR
          LOWER(viewname) LIKE '%processo%' OR
          LOWER(viewname) LIKE '%usuario%' OR
          LOWER(viewname) LIKE '%servidor%'
        )
      ORDER BY schemaname, viewname
      LIMIT 50;
    `;
    
    const viewsResult = await pool.query(viewsQuery);
    
    viewsResult.rows.forEach(view => {
      console.log(`  - ${view.schemaname}.${view.viewname}`);
    });
    
  } catch (error) {
    console.error(`❌ Erro ao descobrir tabelas:`, error.message);
  }
}

async function main() {
  console.log('🚀 Script de Descoberta de Tabelas PJe\n');
  console.log('=======================================');
  
  // Testar 1º Grau
  try {
    await discoverTables(pje1grauPool, 1);
  } catch (err) {
    console.error('❌ Erro no 1º Grau:', err.message);
  }
  
  // Testar 2º Grau
  try {
    await discoverTables(pje2grauPool, 2);
  } catch (err) {
    console.error('❌ Erro no 2º Grau:', err.message);
  }
  
  // Fechar conexões
  await pje1grauPool.end();
  await pje2grauPool.end();
  
  console.log('\n✅ Descoberta concluída!');
  process.exit(0);
}

main();