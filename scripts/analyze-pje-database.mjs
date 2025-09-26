import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração da conexão
const pool = new Pool({
  host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
  database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
  user: process.env.PJE_DB1_USER || 'msribeiro',
  password: process.env.PJE_DB1_PASSWORD || 'msrq1w2e3',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function discoverTables() {
  console.log('🔍 ANÁLISE COMPLETA DO BANCO DE DADOS PJe\n');
  console.log('=' .repeat(80));
  
  try {
    // 1. Descobrir todas as tabelas principais
    console.log('\n📊 PRINCIPAIS TABELAS IDENTIFICADAS:\n');
    
    const tablesQuery = `
      SELECT 
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema IN ('pje', 'eg_pje', 'client', 'jbpm')
        AND table_type IN ('BASE TABLE', 'VIEW')
        AND (
          table_name LIKE '%processo%'
          OR table_name LIKE '%audiencia%'
          OR table_name LIKE '%tarefa%'
          OR table_name LIKE '%task%'
          OR table_name LIKE '%servidor%'
          OR table_name LIKE '%usuario%'
          OR table_name LIKE '%pessoa%'
          OR table_name LIKE '%orgao%'
          OR table_name LIKE '%distribuicao%'
          OR table_name LIKE '%movimento%'
          OR table_name LIKE '%documento%'
          OR table_name LIKE '%parte%'
        )
      ORDER BY table_schema, table_name
      LIMIT 100
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    
    // Agrupar por schema
    const tablesBySchema = {};
    tablesResult.rows.forEach(row => {
      if (!tablesBySchema[row.table_schema]) {
        tablesBySchema[row.table_schema] = [];
      }
      tablesBySchema[row.table_schema].push(row.table_name);
    });
    
    for (const schema in tablesBySchema) {
      console.log(`\n📁 Schema: ${schema}`);
      console.log('-'.repeat(40));
      tablesBySchema[schema].forEach(table => {
        console.log(`  • ${table}`);
      });
    }
    
    // 2. Analisar tabelas críticas para nossas consultas
    console.log('\n\n🔑 ANÁLISE DE TABELAS CRÍTICAS:\n');
    console.log('=' .repeat(80));
    
    // Tabela de Processos
    console.log('\n1️⃣ PROCESSOS (tb_processo_trf)');
    const processoColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'pje' 
        AND table_name = 'tb_processo_trf'
      ORDER BY ordinal_position
      LIMIT 20
    `);
    console.log('Principais colunas:');
    processoColumns.rows.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });
    
    // Tabela de Audiências
    console.log('\n2️⃣ AUDIÊNCIAS');
    const audienciasTables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%audiencia%'
      LIMIT 5
    `);
    console.log('Tabelas de audiência encontradas:');
    audienciasTables.rows.forEach(t => {
      console.log(`  • ${t.table_schema}.${t.table_name}`);
    });
    
    // Tabela de Tarefas
    console.log('\n3️⃣ TAREFAS (jbpm_taskinstance)');
    const tarefaColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'jbpm_taskinstance'
      ORDER BY ordinal_position
      LIMIT 15
    `);
    console.log('Principais colunas:');
    tarefaColumns.rows.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });
    
    // Tabela de Distribuição
    console.log('\n4️⃣ DISTRIBUIÇÃO');
    const distribuicaoTables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%distribuic%'
      LIMIT 5
    `);
    console.log('Tabelas de distribuição encontradas:');
    distribuicaoTables.rows.forEach(t => {
      console.log(`  • ${t.table_schema}.${t.table_name}`);
    });
    
    // Tabela de Servidores/Usuários
    console.log('\n5️⃣ SERVIDORES/USUÁRIOS');
    const usuarioTables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE (table_name LIKE '%usuario%' OR table_name LIKE '%servidor%')
        AND table_schema IN ('pje', 'client')
      LIMIT 10
    `);
    console.log('Tabelas de usuários/servidores:');
    usuarioTables.rows.forEach(t => {
      console.log(`  • ${t.table_schema}.${t.table_name}`);
    });
    
    // 3. Verificar relacionamentos
    console.log('\n\n🔗 RELACIONAMENTOS IDENTIFICADOS:\n');
    console.log('=' .repeat(80));
    
    const foreignKeys = await pool.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema IN ('pje', 'eg_pje')
        AND tc.table_name IN ('tb_processo_trf', 'tb_processo_parte', 'tb_audiencia', 'tb_processo_tarefa')
      LIMIT 20
    `);
    
    console.log('\nChaves estrangeiras principais:');
    foreignKeys.rows.forEach(fk => {
      console.log(`  • ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // 4. Queries de exemplo
    console.log('\n\n📝 QUERIES DE EXEMPLO:\n');
    console.log('=' .repeat(80));
    
    // Processos distribuídos hoje
    console.log('\n✅ Processos distribuídos hoje:');
    const processosHoje = await pool.query(`
      SELECT COUNT(*) as total
      FROM pje.tb_processo_trf
      WHERE DATE(dt_autuacao) = CURRENT_DATE
    `);
    console.log(`  Total: ${processosHoje.rows[0]?.total || 0} processos`);
    
    // Processos por tarefa
    console.log('\n✅ Top 5 tarefas ativas:');
    const tarefasAtivas = await pool.query(`
      SELECT 
        ti.name_ as tarefa,
        COUNT(*) as total
      FROM jbpm_taskinstance ti
      WHERE ti.end_ IS NULL
        AND ti.isopen_ = 'true'
      GROUP BY ti.name_
      ORDER BY total DESC
      LIMIT 5
    `);
    tarefasAtivas.rows.forEach(t => {
      console.log(`  • ${t.tarefa}: ${t.total} processos`);
    });
    
    // Órgãos com mais processos
    console.log('\n✅ Top 5 órgãos com mais processos:');
    const orgaosTop = await pool.query(`
      SELECT 
        oj.ds_orgao_julgador,
        COUNT(p.id_processo_trf) as total
      FROM pje.tb_processo_trf p
      LEFT JOIN pje.tb_orgao_julgador oj ON p.id_orgao_julgador = oj.id_orgao_julgador
      WHERE oj.ds_orgao_julgador IS NOT NULL
      GROUP BY oj.ds_orgao_julgador
      ORDER BY total DESC
      LIMIT 5
    `);
    orgaosTop.rows.forEach(o => {
      console.log(`  • ${o.ds_orgao_julgador}: ${o.total} processos`);
    });
    
    console.log('\n' + '=' .repeat(80));
    console.log('✅ Análise concluída com sucesso!\n');
    
  } catch (error) {
    console.error('❌ Erro na análise:', error);
  } finally {
    await pool.end();
  }
}

// Executar análise
discoverTables();