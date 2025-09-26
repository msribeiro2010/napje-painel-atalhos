import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexão
const pool = new Pool({
  host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
  database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
  user: process.env.PJE_DB1_USER || 'msribeiro',
  password: process.env.PJE_DB1_PASSWORD || 'msrq1w2e3',
  port: 5432,
  max: 10,
  connectionTimeoutMillis: 5000,
});

console.log('\n🔍 Descobrindo tabelas de USUÁRIOS/SERVIDORES no PJe...\n');

async function discoverTables() {
  try {
    // Busca por tabelas relacionadas a usuários, servidores, pessoas
    const query = `
      SELECT DISTINCT
        t.table_schema,
        t.table_name,
        obj_description(c.oid, 'pg_class') as table_comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      WHERE (
        LOWER(t.table_name) LIKE '%usuario%' 
        OR LOWER(t.table_name) LIKE '%servidor%'
        OR LOWER(t.table_name) LIKE '%magistrado%'
        OR LOWER(t.table_name) LIKE '%pessoa_usuario%'
        OR LOWER(t.table_name) LIKE '%usuario_sistema%'
        OR LOWER(t.table_name) LIKE '%funcionario%'
        OR LOWER(t.table_name) LIKE '%tb_usuario%'
      )
      AND t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY t.table_schema, t.table_name
    `;

    const result = await pool.query(query);

    console.log(`📊 Encontradas ${result.rows.length} tabelas relacionadas a usuários/servidores:\n`);
    
    // Agrupar por schema
    const schemas = {};
    result.rows.forEach(row => {
      if (!schemas[row.table_schema]) {
        schemas[row.table_schema] = [];
      }
      schemas[row.table_schema].push(row.table_name);
    });

    for (const schema in schemas) {
      console.log(`\n📁 Schema: ${schema}`);
      for (const table of schemas[schema]) {
        console.log(`   • ${table}`);
        
        // Descobrir colunas da tabela
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position
          LIMIT 15
        `;
        
        const columnsResult = await pool.query(columnsQuery, [schema, table]);
        
        // Mostrar colunas relevantes
        const relevantColumns = columnsResult.rows.filter(col => 
          col.column_name.toLowerCase().includes('nome') ||
          col.column_name.toLowerCase().includes('cpf') ||
          col.column_name.toLowerCase().includes('matricula') ||
          col.column_name.toLowerCase().includes('email') ||
          col.column_name.toLowerCase().includes('login') ||
          col.column_name.toLowerCase().includes('usuario') ||
          col.column_name.toLowerCase().includes('id_pessoa') ||
          col.column_name.toLowerCase().includes('id_usuario')
        );
        
        if (relevantColumns.length > 0) {
          console.log('     📋 Colunas relevantes:');
          relevantColumns.forEach(col => {
            console.log(`        - ${col.column_name} (${col.data_type})`);
          });
          
          // Verificar se tem dados
          const countQuery = `SELECT COUNT(*) as total FROM ${schema}.${table} LIMIT 1`;
          try {
            const countResult = await pool.query(countQuery);
            console.log(`     📈 Total de registros: ${countResult.rows[0].total}`);
            
            // Se tiver dados, mostrar um exemplo
            if (countResult.rows[0].total > 0) {
              const sampleQuery = `
                SELECT * FROM ${schema}.${table} 
                WHERE 1=1
                ${relevantColumns.some(c => c.column_name.toLowerCase().includes('nome')) ? 
                  "AND " + relevantColumns.find(c => c.column_name.toLowerCase().includes('nome')).column_name + " IS NOT NULL" : ''}
                LIMIT 2
              `;
              const sampleResult = await pool.query(sampleQuery);
              console.log('     📄 Exemplo de dados:', JSON.stringify(sampleResult.rows[0], null, 2).substring(0, 200) + '...');
            }
          } catch (err) {
            console.log(`     ⚠️  Erro ao contar registros: ${err.message}`);
          }
        }
      }
    }

    // Agora buscar especificamente pela tabela tb_usuario_sistema que deve existir
    console.log('\n\n🎯 Buscando tabela tb_usuario_sistema especificamente...\n');
    
    const usuarioSistemaQuery = `
      SELECT 
        c.column_name,
        c.data_type,
        c.character_maximum_length,
        c.is_nullable
      FROM information_schema.columns c
      WHERE c.table_name = 'tb_usuario_sistema'
      ORDER BY c.ordinal_position
    `;
    
    const usuarioSistemaResult = await pool.query(usuarioSistemaQuery);
    
    if (usuarioSistemaResult.rows.length > 0) {
      console.log('✅ Tabela tb_usuario_sistema encontrada!');
      console.log('\n📋 Estrutura da tabela:');
      usuarioSistemaResult.rows.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type})`);
      });
      
      // Buscar alguns registros de exemplo
      const exemplosQuery = `
        SELECT * FROM pje.tb_usuario_sistema
        WHERE ds_login IS NOT NULL
        LIMIT 5
      `;
      
      try {
        const exemplosResult = await pool.query(exemplosQuery);
        console.log(`\n📊 Exemplos de usuários (${exemplosResult.rows.length} registros):`);
        exemplosResult.rows.forEach(user => {
          console.log(`   • Login: ${user.ds_login}, Nome: ${user.ds_nome || 'N/A'}`);
        });
      } catch (err) {
        console.log(`⚠️  Erro ao buscar exemplos: ${err.message}`);
      }
    }

    // Buscar também pela tabela tb_pessoa que pode ter informações complementares
    console.log('\n\n🎯 Buscando tabela tb_pessoa...\n');
    
    const pessoaQuery = `
      SELECT 
        c.column_name,
        c.data_type
      FROM information_schema.columns c
      WHERE c.table_name = 'tb_pessoa'
        AND c.table_schema = 'pje'
      ORDER BY c.ordinal_position
      LIMIT 20
    `;
    
    const pessoaResult = await pool.query(pessoaQuery);
    
    if (pessoaResult.rows.length > 0) {
      console.log('✅ Tabela pje.tb_pessoa encontrada!');
      console.log('\n📋 Colunas principais:');
      pessoaResult.rows.slice(0, 10).forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao descobrir tabelas:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ Descoberta concluída!\n');
  }
}

discoverTables();