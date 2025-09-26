const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração dos pools de conexão
const pje1grauPool = new Pool({
  host: process.env.PJE_DB1_HOST || 'pje-dbpr-a1-replica',
  database: process.env.PJE_DB1_DATABASE || 'pje_1grau',
  user: process.env.PJE_DB1_USER || 'msribeiro',
  password: process.env.PJE_DB1_PASSWORD || 'msrq1w2e3',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const pje2grauPool = new Pool({
  host: process.env.PJE_DB2_HOST || 'pje-dbpr-a2-replica',
  database: process.env.PJE_DB2_DATABASE || 'pje_2grau',
  user: process.env.PJE_DB2_USER || 'msribeiro',
  password: process.env.PJE_DB2_PASSWORD || 'msrq1w2e3',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teste de conexão
pje1grauPool.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar no PJe 1º Grau:', err.message);
  } else {
    console.log('✅ Conectado ao PJe 1º Grau');
  }
});

pje2grauPool.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar no PJe 2º Grau:', err.message);
  } else {
    console.log('✅ Conectado ao PJe 2º Grau');
  }
});

// Endpoint para buscar OJs
app.get('/api/pje/orgaos-julgadores', async (req, res) => {
  const { grau, search } = req.query;
  console.log('📝 Buscando OJs:', { grau, search });
  
  try {
    const pool = grau === '2' ? pje2grauPool : pje1grauPool;
    
    const query = `
      SELECT DISTINCT 
        id_orgao_julgador as id,
        ds_orgao_julgador as nome,
        sg_orgao_julgador as sigla
      FROM orgao_julgador
      WHERE ativo = true
        AND (
          LOWER(ds_orgao_julgador) LIKE LOWER($1) OR
          LOWER(sg_orgao_julgador) LIKE LOWER($1)
        )
      ORDER BY ds_orgao_julgador
      LIMIT 50
    `;
    
    const result = await pool.query(query, [`%${search || ''}%`]);
    console.log(`✅ Encontrados ${result.rows.length} OJs`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar OJs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para buscar processos
app.get('/api/pje/processos', async (req, res) => {
  const { grau, numero, ano, oj } = req.query;
  console.log('📝 Buscando processos:', { grau, numero, ano, oj });
  
  try {
    const pool = grau === '2' ? pje2grauPool : pje1grauPool;
    
    let query = `
      SELECT 
        p.nr_processo as numero,
        p.ano,
        p.ds_classe as classe,
        p.dt_autuacao as data_autuacao,
        oj.ds_orgao_julgador as orgao_julgador
      FROM processo p
      LEFT JOIN orgao_julgador oj ON p.id_orgao_julgador = oj.id_orgao_julgador
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (numero) {
      query += ` AND p.nr_processo = $${paramCount++}`;
      params.push(numero);
    }
    
    if (ano) {
      query += ` AND p.ano = $${paramCount++}`;
      params.push(ano);
    }
    
    if (oj) {
      query += ` AND p.id_orgao_julgador = $${paramCount++}`;
      params.push(oj);
    }
    
    query += ' ORDER BY p.dt_autuacao DESC LIMIT 100';
    
    const result = await pool.query(query, params);
    console.log(`✅ Encontrados ${result.rows.length} processos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar processos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para buscar servidores
app.get('/api/pje/servidores', async (req, res) => {
  const { grau, nome, cpf, matricula } = req.query;
  console.log('📝 Buscando servidores:', { grau, nome: nome ? '***' : null, cpf: cpf ? '***' : null, matricula });
  
  try {
    const pool = grau === '2' ? pje2grauPool : pje1grauPool;
    
    let query = `
      SELECT 
        id_usuario as id,
        nm_usuario as nome,
        nr_cpf_cnpj as cpf,
        ds_login as matricula,
        ds_email as email
      FROM usuario_login
      WHERE in_ativo = 'S'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (nome) {
      query += ` AND LOWER(nm_usuario) LIKE LOWER($${paramCount++})`;
      params.push(`%${nome}%`);
    }
    
    if (cpf) {
      query += ` AND nr_cpf_cnpj = $${paramCount++}`;
      params.push(cpf.replace(/\D/g, ''));
    }
    
    if (matricula) {
      query += ` AND LOWER(ds_login) LIKE LOWER($${paramCount++})`;
      params.push(`%${matricula}%`);
    }
    
    query += ' ORDER BY nm_usuario LIMIT 50';
    
    const result = await pool.query(query, params);
    console.log(`✅ Encontrados ${result.rows.length} servidores`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar servidores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    databases: {
      pje1grau: pje1grauPool._clients.length > 0 ? 'connected' : 'disconnected',
      pje2grau: pje2grauPool._clients.length > 0 ? 'connected' : 'disconnected'
    }
  });
});

const PORT = process.env.PJE_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor PJe rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log('\n📊 Endpoints disponíveis:');
  console.log('  GET /api/pje/orgaos-julgadores');
  console.log('  GET /api/pje/processos');
  console.log('  GET /api/pje/servidores\n');
});