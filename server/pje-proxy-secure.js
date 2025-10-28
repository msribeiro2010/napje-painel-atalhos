import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// Configurar CORS restritivo para produção
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Cliente Supabase para validação de sessão
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware de autenticação
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.substring(7);

  try {
    // Validar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar se o usuário tem permissão para acessar PJe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('can_access_pje, is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (!profile.can_access_pje && !profile.is_admin)) {
      return res.status(403).json({ error: 'Sem permissão para acessar dados do PJe' });
    }

    req.user = user;
    req.userProfile = profile;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro ao validar autenticação' });
  }
}

// Rate limiting simples (use express-rate-limit em produção)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requisições
const RATE_WINDOW = 60000; // 1 minuto

function rateLimit(req, res, next) {
  const userId = req.user?.id || req.ip;
  const now = Date.now();
  
  if (!requestCounts.has(userId)) {
    requestCounts.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }
  
  const userRequests = requestCounts.get(userId);
  
  if (now > userRequests.resetTime) {
    userRequests.count = 1;
    userRequests.resetTime = now + RATE_WINDOW;
    return next();
  }
  
  if (userRequests.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  }
  
  userRequests.count++;
  next();
}

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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log de auditoria
async function logAccess(userId, endpoint, params) {
  try {
    await supabase.from('pje_access_logs').insert({
      user_id: userId,
      endpoint,
      params,
      accessed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}

// Aplicar middlewares de segurança em todas as rotas
app.use('/api/pje/*', authenticateUser, rateLimit);

// Endpoint para buscar OJs (PROTEGIDO)
app.get('/api/pje/orgaos-julgadores', async (req, res) => {
  const { grau, search } = req.query;
  
  // Log de acesso
  logAccess(req.user.id, 'orgaos-julgadores', { grau, search });
  
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

// Endpoint para buscar processos (PROTEGIDO)
app.get('/api/pje/processos', async (req, res) => {
  const { grau, numero, ano, oj } = req.query;
  
  // Log de acesso
  logAccess(req.user.id, 'processos', { grau, numero, ano, oj });
  
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

// Endpoint para buscar servidores (PROTEGIDO)
app.get('/api/pje/servidores', async (req, res) => {
  const { grau, nome, cpf, matricula } = req.query;
  
  // Log de acesso  
  logAccess(req.user.id, 'servidores', { grau, nome: nome ? '***' : null, cpf: cpf ? '***' : null, matricula });
  
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

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'PJe Proxy Server - API Segura',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/pje/*'
    },
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PJE_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`PJe proxy server (SEGURO) rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});