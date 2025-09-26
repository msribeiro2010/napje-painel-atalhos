import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
  database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
  user: process.env.PJE_DB1_USER || 'msribeiro',
  password: process.env.PJE_DB1_PASSWORD || 'msrq1w2e3',
  port: 5432,
  connectionTimeoutMillis: 5000,
});

const cpfTeste = '41317621883'; // CPF sem formatação

console.log('\n🔍 Testando busca de processos para CPF:', cpfTeste);

async function testarBuscaCPF() {
  try {
    // 1. Verificar se existem tabelas de pessoa física
    console.log('\n1️⃣ Verificando tabelas de pessoa...');
    const tabelasQuery = `
      SELECT 
        table_schema,
        table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%pessoa%'
        AND table_schema IN ('pje', 'eg_pje')
      ORDER BY table_schema, table_name
      LIMIT 20
    `;
    
    const tabelasResult = await pool.query(tabelasQuery);
    console.log('Tabelas encontradas:');
    tabelasResult.rows.forEach(t => {
      console.log(`  - ${t.table_schema}.${t.table_name}`);
    });
    
    // 2. Verificar estrutura da tb_pessoa_fisica
    console.log('\n2️⃣ Verificando estrutura da tb_pessoa_fisica...');
    const estruturaQuery = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'tb_pessoa_fisica'
        AND table_schema = 'pje'
        AND (
          column_name LIKE '%cpf%' OR 
          column_name LIKE '%documento%' OR
          column_name LIKE '%pessoa%'
        )
      ORDER BY ordinal_position
    `;
    
    const estruturaResult = await pool.query(estruturaQuery);
    console.log('Colunas relevantes em tb_pessoa_fisica:');
    estruturaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // 3. Buscar pessoa com o CPF
    console.log('\n3️⃣ Buscando pessoa com CPF...');
    const pessoaQuery = `
      SELECT 
        pf.*
      FROM pje.tb_pessoa_fisica pf
      WHERE pf.nr_cpf = $1
         OR pf.nr_cpf = $2
         OR pf.nr_cpf LIKE $3
      LIMIT 5
    `;
    
    const pessoaResult = await pool.query(pessoaQuery, [
      cpfTeste,
      cpfTeste.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
      `%${cpfTeste.substring(0, 6)}%`
    ]);
    
    if (pessoaResult.rows.length > 0) {
      console.log(`✅ ${pessoaResult.rows.length} pessoa(s) encontrada(s):`);
      pessoaResult.rows.forEach(p => {
        console.log(`  ID: ${p.id_pessoa_fisica}, Nome: ${p.nm_pessoa}, CPF: ${p.nr_cpf}`);
      });
      
      // 4. Buscar processos da pessoa
      console.log('\n4️⃣ Buscando processos da pessoa...');
      const processosQuery = `
        SELECT 
          pt.id_processo_trf,
          pt.nr_sequencia,
          pt.nr_ano,
          pp.id_tipo_parte,
          pp.in_situacao,
          pp.in_parte_principal
        FROM pje.tb_processo_parte pp
        INNER JOIN pje.tb_processo_trf pt ON pp.id_processo_trf = pt.id_processo_trf
        WHERE pp.id_pessoa = $1
        LIMIT 10
      `;
      
      const processosResult = await pool.query(processosQuery, [pessoaResult.rows[0].id_pessoa_fisica]);
      
      if (processosResult.rows.length > 0) {
        console.log(`✅ ${processosResult.rows.length} processo(s) encontrado(s):`);
        processosResult.rows.forEach(p => {
          console.log(`  - Processo: ${p.nr_sequencia}/${p.nr_ano}, Situação: ${p.in_situacao}`);
        });
      } else {
        console.log('❌ Nenhum processo encontrado para esta pessoa');
      }
    } else {
      console.log('❌ Pessoa não encontrada com este CPF');
      
      // Tentar buscar de outra forma
      console.log('\n5️⃣ Tentando busca alternativa...');
      const buscaAlternativaQuery = `
        SELECT 
          COUNT(*) as total
        FROM pje.tb_pessoa_fisica
        WHERE LENGTH(nr_cpf) > 0
      `;
      
      const totalResult = await pool.query(buscaAlternativaQuery);
      console.log(`Total de pessoas físicas no banco: ${totalResult.rows[0].total}`);
      
      // Mostrar exemplos de CPFs
      const exemplosQuery = `
        SELECT 
          nr_cpf,
          nm_pessoa
        FROM pje.tb_pessoa_fisica
        WHERE nr_cpf IS NOT NULL
          AND LENGTH(nr_cpf) > 0
        ORDER BY RANDOM()
        LIMIT 5
      `;
      
      const exemplosResult = await pool.query(exemplosQuery);
      console.log('\nExemplos de CPFs no banco:');
      exemplosResult.rows.forEach(ex => {
        console.log(`  - CPF: ${ex.nr_cpf} (${ex.nr_cpf.length} caracteres), Nome: ${ex.nm_pessoa}`);
      });
    }
    
    // 6. Verificar tabela de partes
    console.log('\n6️⃣ Verificando estrutura da tb_processo_parte...');
    const parteQuery = `
      SELECT 
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name = 'tb_processo_parte'
        AND table_schema = 'pje'
        AND column_name LIKE '%pessoa%'
      ORDER BY ordinal_position
    `;
    
    const parteResult = await pool.query(parteQuery);
    console.log('Colunas de pessoa em tb_processo_parte:');
    parteResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ Teste concluído!\n');
  }
}

testarBuscaCPF();