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

const cpfTeste = '37014228854'; // CPF do Nathany

console.log('\n🔍 Buscando informações do usuário com CPF:', cpfTeste);

async function discoverUserDetails() {
  try {
    // 1. Buscar o usuário na tb_usuario_login
    console.log('\n1️⃣ Buscando na tb_usuario_login...');
    const userQuery = `
      SELECT 
        id_usuario,
        ds_nome,
        ds_login,
        ds_email,
        in_ativo
      FROM pje.tb_usuario_login
      WHERE ds_login = $1
      LIMIT 1
    `;
    
    const userResult = await pool.query(userQuery, [cpfTeste]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Usuário encontrado:');
    console.log('  ID:', user.id_usuario);
    console.log('  Nome:', user.ds_nome);
    console.log('  Login:', user.ds_login);
    console.log('  Email:', user.ds_email || 'Não informado');
    console.log('  Ativo:', user.in_ativo);
    
    // 2. Verificar se é servidor
    console.log('\n2️⃣ Verificando se é servidor (tb_pessoa_servidor)...');
    const servidorQuery = `
      SELECT * FROM pje.tb_pessoa_servidor WHERE id = $1
    `;
    const servidorResult = await pool.query(servidorQuery, [user.id_usuario]);
    
    if (servidorResult.rows.length > 0) {
      console.log('✅ É um servidor!');
      console.log('  Dados:', servidorResult.rows[0]);
    } else {
      console.log('❌ Não encontrado em tb_pessoa_servidor');
    }
    
    // 3. Verificar se é magistrado
    console.log('\n3️⃣ Verificando se é magistrado (tb_pessoa_magistrado)...');
    const magistradoQuery = `
      SELECT * FROM pje.tb_pessoa_magistrado WHERE id = $1
    `;
    const magistradoResult = await pool.query(magistradoQuery, [user.id_usuario]);
    
    if (magistradoResult.rows.length > 0) {
      console.log('✅ É um magistrado!');
      console.log('  Dados:', magistradoResult.rows[0]);
    } else {
      console.log('❌ Não encontrado em tb_pessoa_magistrado');
    }
    
    // 4. Buscar papéis do usuário
    console.log('\n4️⃣ Buscando papéis do usuário (tb_usuario_papel)...');
    const papeisQuery = `
      SELECT 
        up.id_papel,
        p.ds_papel,
        p.cd_papel
      FROM pje.tb_usuario_papel up
      LEFT JOIN pje.tb_papel p ON up.id_papel = p.id_papel
      WHERE up.id_usuario = $1
      LIMIT 10
    `;
    const papeisResult = await pool.query(papeisQuery, [user.id_usuario]);
    
    if (papeisResult.rows.length > 0) {
      console.log(`✅ ${papeisResult.rows.length} papel(éis) encontrado(s):`);
      papeisResult.rows.forEach(papel => {
        console.log(`  - ${papel.ds_papel || papel.cd_papel || 'ID: ' + papel.id_papel}`);
      });
    } else {
      console.log('❌ Nenhum papel encontrado');
    }
    
    // 5. Buscar localização/lotação
    console.log('\n5️⃣ Buscando localização/lotação (tb_usuario_localizacao)...');
    const localizacaoQuery = `
      SELECT 
        ul.id_localizacao,
        ul.in_responsavel_localizacao,
        ul.id_papel,
        p.ds_papel,
        l.ds_localizacao,
        l.sg_localizacao,
        l.cd_localizacao,
        oj.ds_orgao_julgador,
        oj.nr_vara
      FROM pje.tb_usuario_localizacao ul
      LEFT JOIN pje.tb_localizacao l ON ul.id_localizacao = l.id_localizacao
      LEFT JOIN pje.tb_orgao_julgador oj ON l.id_localizacao = oj.id_orgao_julgador
      LEFT JOIN pje.tb_papel p ON ul.id_papel = p.id_papel
      WHERE ul.id_usuario = $1
      LIMIT 10
    `;
    const localizacaoResult = await pool.query(localizacaoQuery, [user.id_usuario]);
    
    if (localizacaoResult.rows.length > 0) {
      console.log(`✅ ${localizacaoResult.rows.length} localização(ões) encontrada(s):`);
      localizacaoResult.rows.forEach(loc => {
        console.log(`  - Localização: ${loc.ds_localizacao || loc.sg_localizacao || 'ID: ' + loc.id_localizacao}`);
        if (loc.ds_orgao_julgador) {
          console.log(`    Órgão Julgador: ${loc.ds_orgao_julgador}`);
        }
        if (loc.ds_papel) {
          console.log(`    Papel: ${loc.ds_papel}`);
        }
        console.log(`    Responsável: ${loc.in_responsavel_localizacao === 'S' ? 'Sim' : 'Não'}`);
      });
    } else {
      console.log('❌ Nenhuma localização encontrada');
    }
    
    // 6. Verificar na tabela tb_pessoa
    console.log('\n6️⃣ Buscando na tb_pessoa...');
    const pessoaQuery = `
      SELECT 
        p.id_pessoa,
        p.in_tipo_pessoa,
        tp.ds_tipo_pessoa,
        pf.nm_pessoa,
        pf.nr_cpf,
        pf.ds_email,
        pf.nr_telefone
      FROM pje.tb_pessoa p
      LEFT JOIN pje.tb_tipo_pessoa tp ON p.id_tipo_pessoa = tp.id_tipo_pessoa
      LEFT JOIN pje.tb_pessoa_fisica pf ON p.id_pessoa = pf.id_pessoa_fisica
      WHERE pf.nr_cpf = $1
        OR p.id_pessoa = $2
      LIMIT 5
    `;
    const pessoaResult = await pool.query(pessoaQuery, [cpfTeste, user.id_usuario]);
    
    if (pessoaResult.rows.length > 0) {
      console.log(`✅ ${pessoaResult.rows.length} pessoa(s) encontrada(s):`);
      pessoaResult.rows.forEach(pessoa => {
        console.log(`  - ID: ${pessoa.id_pessoa}`);
        console.log(`    Nome: ${pessoa.nm_pessoa || 'N/A'}`);
        console.log(`    Tipo: ${pessoa.ds_tipo_pessoa || pessoa.in_tipo_pessoa || 'N/A'}`);
        console.log(`    CPF: ${pessoa.nr_cpf || 'N/A'}`);
        console.log(`    Email: ${pessoa.ds_email || 'N/A'}`);
      });
    } else {
      console.log('❌ Não encontrado na tb_pessoa');
    }
    
    // 7. Buscar estrutura/setor
    console.log('\n7️⃣ Buscando estrutura/setor organizacional...');
    const estruturaQuery = `
      SELECT DISTINCT
        e.id_estrutura,
        e.ds_estrutura,
        e.sg_estrutura,
        e.id_estrutura_pai,
        ep.ds_estrutura as estrutura_pai
      FROM pje.tb_usuario_localizacao ul
      LEFT JOIN pje.tb_estrutura e ON ul.id_estrutura = e.id_estrutura
      LEFT JOIN pje.tb_estrutura ep ON e.id_estrutura_pai = ep.id_estrutura
      WHERE ul.id_usuario = $1
        AND e.id_estrutura IS NOT NULL
      LIMIT 5
    `;
    const estruturaResult = await pool.query(estruturaQuery, [user.id_usuario]);
    
    if (estruturaResult.rows.length > 0) {
      console.log(`✅ ${estruturaResult.rows.length} estrutura(s) encontrada(s):`);
      estruturaResult.rows.forEach(est => {
        console.log(`  - ${est.ds_estrutura || est.sg_estrutura}`);
        if (est.estrutura_pai) {
          console.log(`    Estrutura Superior: ${est.estrutura_pai}`);
        }
      });
    } else {
      console.log('❌ Nenhuma estrutura organizacional encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ Análise concluída!\n');
  }
}

discoverUserDetails();