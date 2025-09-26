import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração dos pools de conexão
const pje1grauPool = new pg.Pool({
  host: process.env.PJE_DB1_HOST,
  database: process.env.PJE_DB1_DATABASE,
  user: process.env.PJE_DB1_USER,
  password: process.env.PJE_DB1_PASSWORD,
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const pje2grauPool = new pg.Pool({
  host: process.env.PJE_DB2_HOST,
  database: process.env.PJE_DB2_DATABASE,
  user: process.env.PJE_DB2_USER,
  password: process.env.PJE_DB2_PASSWORD,
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Endpoint para buscar OJs
app.get('/api/pje/orgaos-julgadores', async (req, res) => {
  const { grau, search } = req.query;
  
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
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar OJs:', error);
    res.status(500).json({ error: 'Erro ao buscar órgãos julgadores' });
  }
});

// Endpoint para buscar processos
app.get('/api/pje/processos', async (req, res) => {
  const { grau, numero, ano, oj } = req.query;
  
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
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    res.status(500).json({ error: 'Erro ao buscar processos' });
  }
});

// Endpoint para buscar servidores
app.get('/api/pje/servidores', async (req, res) => {
  const { grau, nome, cpf, matricula } = req.query;
  
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
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar servidores:', error);
    res.status(500).json({ error: 'Erro ao buscar servidores' });
  }
});

const PORT = process.env.PJE_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`PJe proxy server rodando na porta ${PORT}`);
});