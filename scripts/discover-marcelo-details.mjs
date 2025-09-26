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

const cpfTeste = '53036140697'; // CPF do Marcelo

console.log('\n🔍 Buscando informações do Marcelo com CPF:', cpfTeste);

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
         OR ds_nome LIKE '%MARCELO%SILVA%RIBEIRO%'
      LIMIT 5
    `;
    
    const userResult = await pool.query(userQuery, [cpfTeste]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado com CPF, buscando por email...');
      
      const emailQuery = `
        SELECT 
          id_usuario,
          ds_nome,
          ds_login,
          ds_email,
          in_ativo
        FROM pje.tb_usuario_login
        WHERE ds_email LIKE '%msribeiro%'
           OR ds_nome LIKE '%MARCELO%RIBEIRO%'
        LIMIT 10
      `;
      
      const emailResult = await pool.query(emailQuery);
      
      if (emailResult.rows.length > 0) {
        console.log(`✅ ${emailResult.rows.length} usuário(s) encontrado(s) por email/nome:`);
        emailResult.rows.forEach(user => {
          console.log(`  - ID: ${user.id_usuario}, Nome: ${user.ds_nome}, Email: ${user.ds_email || 'N/A'}`);
        });
      }
      
      return;
    }
    
    console.log(`✅ ${userResult.rows.length} usuário(s) encontrado(s):`);
    
    for (const user of userResult.rows) {
      console.log('\n📋 Usuário:');
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
        console.log('  Matrícula:', servidorResult.rows[0].nr_matricula);
        console.log('  Data Posse:', servidorResult.rows[0].dt_posse);
      } else {
        console.log('❌ Não encontrado em tb_pessoa_servidor');
      }
      
      // 3. Buscar localização/lotação
      console.log('\n3️⃣ Buscando localização/lotação...');
      
      // Buscar na tb_localizacao
      const localizacaoQuery = `
        SELECT 
          ul.id_localizacao,
          ul.in_responsavel_localizacao,
          l.ds_localizacao,
          l.sg_localizacao,
          l.cd_localizacao,
          l.in_ativo as loc_ativa
        FROM pje.tb_usuario_localizacao ul
        LEFT JOIN pje.tb_localizacao l ON ul.id_localizacao = l.id_localizacao
        WHERE ul.id_usuario = $1
        ORDER BY ul.in_responsavel_localizacao DESC, ul.in_favorita DESC
        LIMIT 10
      `;
      const localizacaoResult = await pool.query(localizacaoQuery, [user.id_usuario]);
      
      if (localizacaoResult.rows.length > 0) {
        console.log(`✅ ${localizacaoResult.rows.length} localização(ões) encontrada(s):`);
        localizacaoResult.rows.forEach(loc => {
          console.log(`  - ${loc.ds_localizacao || loc.sg_localizacao || 'ID: ' + loc.id_localizacao}`);
          console.log(`    Código: ${loc.cd_localizacao || 'N/A'}`);
          console.log(`    Responsável: ${loc.in_responsavel_localizacao === 'S' ? 'Sim' : 'Não'}`);
          console.log(`    Ativa: ${loc.loc_ativa === 'S' ? 'Sim' : 'Não'}`);
        });
      } else {
        console.log('❌ Nenhuma localização encontrada');
      }
      
      // Buscar especificamente o NAPJE
      console.log('\n4️⃣ Buscando NAPJE especificamente...');
      const napjeQuery = `
        SELECT 
          l.id_localizacao,
          l.ds_localizacao,
          l.sg_localizacao,
          l.cd_localizacao
        FROM pje.tb_localizacao l
        WHERE UPPER(l.ds_localizacao) LIKE '%NAPJE%'
           OR UPPER(l.ds_localizacao) LIKE '%NUCLEO%APOIO%PJE%'
           OR UPPER(l.ds_localizacao) LIKE '%PJE%'
           OR UPPER(l.sg_localizacao) LIKE '%NAPJE%'
        LIMIT 10
      `;
      const napjeResult = await pool.query(napjeQuery);
      
      if (napjeResult.rows.length > 0) {
        console.log(`✅ ${napjeResult.rows.length} localização(ões) do NAPJE encontrada(s):`);
        napjeResult.rows.forEach(loc => {
          console.log(`  - ID: ${loc.id_localizacao}`);
          console.log(`    Nome: ${loc.ds_localizacao}`);
          console.log(`    Sigla: ${loc.sg_localizacao || 'N/A'}`);
          console.log(`    Código: ${loc.cd_localizacao || 'N/A'}`);
        });
      } else {
        console.log('❌ NAPJE não encontrado');
      }
      
      // Buscar usuários com email @trt15
      console.log('\n5️⃣ Verificando outros servidores TRT15...');
      const trtQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN ps.id IS NOT NULL THEN 1 END) as servidores,
          COUNT(CASE WHEN pm.id IS NOT NULL THEN 1 END) as magistrados
        FROM pje.tb_usuario_login ul
        LEFT JOIN pje.tb_pessoa_servidor ps ON ps.id = ul.id_usuario
        LEFT JOIN pje.tb_pessoa_magistrado pm ON pm.id = ul.id_usuario
        WHERE ul.ds_email LIKE '%@trt15%'
      `;
      const trtResult = await pool.query(trtQuery);
      
      console.log('📊 Estatísticas de usuários @trt15:');
      console.log(`  Total: ${trtResult.rows[0].total}`);
      console.log(`  Servidores: ${trtResult.rows[0].servidores}`);
      console.log(`  Magistrados: ${trtResult.rows[0].magistrados}`);
      console.log(`  Outros: ${trtResult.rows[0].total - trtResult.rows[0].servidores - trtResult.rows[0].magistrados}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ Análise concluída!\n');
  }
}

discoverUserDetails();