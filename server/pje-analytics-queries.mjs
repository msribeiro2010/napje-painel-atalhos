/**
 * QUERIES ANALÍTICAS AVANÇADAS PARA O PJe
 * Desenvolvido como Analista de Big Data e DBA
 * 
 * Este módulo contém queries otimizadas para extrair insights valiosos
 * do banco de dados do PJe, com foco em performance e precisão.
 */

export const PJeAnalyticsQueries = {
  
  // ==========================================
  // 1. PROCESSOS DISTRIBUÍDOS
  // ==========================================
  
  /**
   * Processos distribuídos hoje
   */
  processosDistribuidosHoje: `
    SELECT 
      p.id_processo_trf,
      CONCAT(LPAD(p.nr_sequencia::text, 7, '0'), '-', LPAD(p.nr_digito_verificador::text, 2, '0'), '.', p.nr_ano, '.5.15.', LPAD(p.nr_identificacao_orgao_justica::text, 4, '0')) as numero_processo,
      p.dt_autuacao,
      oj.ds_orgao_julgador,
      oj.nr_vara,
      cj.ds_classe_judicial,
      'Normal' as prioridade,
      p.vl_causa
    FROM pje.tb_processo_trf p
    LEFT JOIN pje.tb_orgao_julgador oj ON p.id_orgao_julgador = oj.id_orgao_julgador
    LEFT JOIN pje.tb_classe_judicial cj ON p.id_classe_judicial = cj.id_classe_judicial
    WHERE DATE(p.dt_autuacao) = CURRENT_DATE
    ORDER BY p.dt_autuacao DESC
  `,
  
  /**
   * Processos distribuídos em período específico
   */
  processosDistribuidosPeriodo: `
    SELECT 
      DATE(p.dt_autuacao) as data_distribuicao,
      COUNT(*) as total_processos,
      0 as processos_prioritarios,
      0 as processos_segredo,
      AVG(p.vl_causa) as valor_medio_causa,
      SUM(p.vl_causa) as valor_total_causa
    FROM pje.tb_processo_trf p
    WHERE p.dt_autuacao BETWEEN $1 AND $2
    GROUP BY DATE(p.dt_autuacao)
    ORDER BY data_distribuicao DESC
  `,
  
  /**
   * Distribuição por órgão julgador
   */
  distribuicaoPorOrgao: `
    WITH distribuicao_diaria AS (
      SELECT 
        oj.id_orgao_julgador,
        oj.ds_orgao_julgador,
        oj.nr_vara,
        DATE(p.dt_autuacao) as data_dist,
        COUNT(*) as qtd_processos,
        AVG(p.vl_causa) as valor_medio
      FROM pje.tb_processo_trf p
      JOIN pje.tb_orgao_julgador oj ON p.id_orgao_julgador = oj.id_orgao_julgador
      WHERE p.dt_autuacao >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY oj.id_orgao_julgador, oj.ds_orgao_julgador, oj.nr_vara, DATE(p.dt_autuacao)
    )
    SELECT 
      ds_orgao_julgador,
      nr_vara,
      COUNT(DISTINCT data_dist) as dias_com_distribuicao,
      SUM(qtd_processos) as total_processos_mes,
      AVG(qtd_processos) as media_diaria,
      MAX(qtd_processos) as pico_distribuicao,
      AVG(valor_medio) as ticket_medio
    FROM distribuicao_diaria
    GROUP BY ds_orgao_julgador, nr_vara
    ORDER BY total_processos_mes DESC
  `,
  
  // ==========================================
  // 2. PROCESSOS POR TAREFA
  // ==========================================
  
  /**
   * Processos em determinada tarefa
   */
  processosPorTarefa: `
    SELECT 
      ti.name_ as nome_tarefa,
      ti.actorid_ as responsavel,
      pr.nr_processo as numero_processo,
      oj.ds_orgao_julgador,
      ti.create_ as data_inicio_tarefa,
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ti.create_)) as dias_na_tarefa,
      CASE 
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ti.create_)) > 30 THEN 'Crítico'
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ti.create_)) > 15 THEN 'Atenção'
        ELSE 'Normal'
      END as status_prazo
    FROM jbpm_taskinstance ti
    JOIN tb_processo_instance procxins ON ti.procinst_ = procxins.id_proc_inst
    JOIN tb_processo pr ON procxins.id_processo = pr.id_processo
    JOIN pje.tb_processo_trf ptrf ON pr.id_processo = ptrf.id_processo_trf
    JOIN pje.tb_orgao_julgador oj ON ptrf.id_orgao_julgador = oj.id_orgao_julgador
    WHERE ti.end_ IS NULL 
      AND ti.isopen_ = 'true'
      AND LOWER(ti.name_) LIKE LOWER($1)
    ORDER BY dias_na_tarefa DESC
  `,
  
  /**
   * Análise de gargalos por tarefa
   */
  analiseGargalosTarefas: `
    SELECT 
      ti.name_ as tarefa,
      COUNT(*) as processos_parados,
      AVG(EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ti.create_))) as media_dias_parado,
      MAX(EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ti.create_))) as max_dias_parado,
      MIN(EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ti.create_))) as min_dias_parado,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(DAY FROM (CURRENT_TIMESTAMP - ti.create_))) as mediana_dias,
      COUNT(DISTINCT ti.actorid_) as qtd_responsaveis
    FROM jbpm_taskinstance ti
    WHERE ti.end_ IS NULL 
      AND ti.isopen_ = 'true'
    GROUP BY ti.name_
    HAVING COUNT(*) > 10
    ORDER BY processos_parados DESC
  `,
  
  /**
   * Produtividade por tarefa e usuário
   */
  produtividadeTarefas: `
    WITH tarefas_concluidas AS (
      SELECT 
        ti.name_ as tarefa,
        ti.actorid_ as usuario,
        DATE(ti.end_) as data_conclusao,
        COUNT(*) as tarefas_concluidas,
        AVG(EXTRACT(EPOCH FROM (ti.end_ - ti.create_))/3600) as tempo_medio_horas
      FROM jbpm_taskinstance ti
      WHERE ti.end_ IS NOT NULL
        AND ti.end_ >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY ti.name_, ti.actorid_, DATE(ti.end_)
    )
    SELECT 
      tarefa,
      usuario,
      SUM(tarefas_concluidas) as total_concluidas_semana,
      AVG(tarefas_concluidas) as media_diaria,
      AVG(tempo_medio_horas) as tempo_medio_conclusao_horas,
      MIN(data_conclusao) as primeira_atividade,
      MAX(data_conclusao) as ultima_atividade
    FROM tarefas_concluidas
    GROUP BY tarefa, usuario
    ORDER BY total_concluidas_semana DESC
  `,
  
  // ==========================================
  // 3. SERVIDORES POR ÓRGÃO JULGADOR
  // ==========================================
  
  /**
   * Servidores alocados em determinado OJ
   */
  servidoresPorOJ: `
    SELECT DISTINCT
      ps.id_pessoa_servidor,
      p.nm_pessoa as nome_servidor,
      ps.nr_matricula as matricula,
      pf.nr_cpf as cpf,
      ul.ds_login as login,
      ul.ds_email as email,
      oj.ds_orgao_julgador,
      ojc.ds_nome_cargo as cargo,
      CASE 
        WHEN ul.in_ativo = 'S' THEN 'Ativo'
        ELSE 'Inativo'
      END as status
    FROM pje.tb_pessoa_servidor ps
    JOIN pje.tb_pessoa p ON ps.id_pessoa_servidor = p.id_pessoa
    LEFT JOIN pje.tb_pessoa_fisica pf ON p.id_pessoa = pf.id_pessoa_fisica
    LEFT JOIN pje.tb_usuario_login ul ON p.id_pessoa = ul.id_usuario
    JOIN pje.tb_orgao_julgador_cargo ojc ON ojc.id_pessoa = p.id_pessoa
    JOIN pje.tb_orgao_julgador oj ON ojc.id_orgao_julgador = oj.id_orgao_julgador
    WHERE oj.id_orgao_julgador = $1
      OR LOWER(oj.ds_orgao_julgador) LIKE LOWER($2)
    ORDER BY p.nm_pessoa
  `,
  
  /**
   * Distribuição de servidores por OJ
   */
  distribuicaoServidores: `
    SELECT 
      oj.ds_orgao_julgador,
      oj.nr_vara,
      COUNT(DISTINCT ojc.id_pessoa) as total_servidores,
      COUNT(DISTINCT CASE WHEN ojc.ds_nome_cargo LIKE '%Juiz%' THEN ojc.id_pessoa END) as magistrados,
      COUNT(DISTINCT CASE WHEN ojc.ds_nome_cargo LIKE '%Diretor%' THEN ojc.id_pessoa END) as diretores,
      COUNT(DISTINCT CASE WHEN ojc.ds_nome_cargo LIKE '%Assistente%' THEN ojc.id_pessoa END) as assistentes,
      COUNT(DISTINCT CASE WHEN ojc.ds_nome_cargo NOT LIKE '%Juiz%' 
                           AND ojc.ds_nome_cargo NOT LIKE '%Diretor%'
                           AND ojc.ds_nome_cargo NOT LIKE '%Assistente%' THEN ojc.id_pessoa END) as outros
    FROM pje.tb_orgao_julgador oj
    LEFT JOIN pje.tb_orgao_julgador_cargo ojc ON oj.id_orgao_julgador = ojc.id_orgao_julgador
    WHERE oj.in_ativo = 'S'
    GROUP BY oj.ds_orgao_julgador, oj.nr_vara
    ORDER BY oj.nr_vara
  `,
  
  // ==========================================
  // 4. AUDIÊNCIAS
  // ==========================================
  
  /**
   * Audiências do dia por OJ
   */
  audienciasDoDia: `
    SELECT 
      pa.id_processo_audiencia,
      CONCAT(LPAD(ptrf.nr_sequencia::text, 7, '0'), '-', LPAD(ptrf.nr_digito_verificador::text, 2, '0'), '.', ptrf.nr_ano, '.5.15.', LPAD(ptrf.nr_identificacao_orgao_justica::text, 4, '0')) as numero_processo,
      oj.ds_orgao_julgador,
      oj.nr_vara,
      sa.ds_sala as sala_audiencia,
      pa.dt_inicio as horario_inicio,
      pa.dt_fim as horario_fim,
      ta.ds_tipo_audiencia as tipo_audiencia,
      pm.nm_pessoa as magistrado_responsavel
    FROM pje.tb_processo_audiencia pa
    JOIN pje.tb_processo_trf ptrf ON pa.id_processo_trf = ptrf.id_processo_trf
    JOIN pje.tb_orgao_julgador oj ON ptrf.id_orgao_julgador = oj.id_orgao_julgador
    LEFT JOIN pje.tb_sala_audiencia sa ON pa.id_sala_audiencia = sa.id_sala_audiencia
    LEFT JOIN pje.tb_tipo_audiencia ta ON pa.id_tipo_audiencia = ta.id_tipo_audiencia
    LEFT JOIN pje.tb_pessoa_magistrado pmag ON pa.id_magistrado = pmag.id_pessoa_magistrado
    LEFT JOIN pje.tb_pessoa pm ON pmag.id_pessoa_magistrado = pm.id_pessoa
    WHERE DATE(pa.dt_inicio) = $1
      AND ($2::integer IS NULL OR oj.id_orgao_julgador = $2)
    ORDER BY oj.nr_vara, pa.dt_inicio
  `,
  
  /**
   * Estatísticas de audiências
   */
  estatisticasAudiencias: `
    WITH audiencias_periodo AS (
      SELECT 
        DATE(pa.dt_inicio) as data_audiencia,
        oj.id_orgao_julgador,
        oj.ds_orgao_julgador,
        ta.ds_tipo_audiencia,
        COUNT(*) as qtd
      FROM pje.tb_processo_audiencia pa
      JOIN pje.tb_processo_trf ptrf ON pa.id_processo_trf = ptrf.id_processo_trf
      JOIN pje.tb_orgao_julgador oj ON ptrf.id_orgao_julgador = oj.id_orgao_julgador
      LEFT JOIN pje.tb_tipo_audiencia ta ON pa.id_tipo_audiencia = ta.id_tipo_audiencia
      WHERE pa.dt_inicio BETWEEN $1 AND $2
      GROUP BY DATE(pa.dt_inicio), oj.id_orgao_julgador, oj.ds_orgao_julgador, ta.ds_tipo_audiencia
    )
    SELECT 
      ds_orgao_julgador,
      COUNT(DISTINCT data_audiencia) as dias_com_audiencia,
      SUM(qtd) as total_audiencias,
      STRING_AGG(DISTINCT ds_tipo_audiencia, ', ') as tipos_audiencia
    FROM audiencias_periodo
    GROUP BY ds_orgao_julgador
    ORDER BY total_audiencias DESC
  `,
  
  // ==========================================
  // 5. INDICADORES GERENCIAIS
  // ==========================================
  
  /**
   * Dashboard executivo - Dados reais agregados
   */
  dashboardExecutivo: `
    WITH metricas AS (
      SELECT 
        COUNT(CASE WHEN DATE(p.dt_autuacao) = CURRENT_DATE THEN 1 END) as processos_hoje,
        COUNT(CASE WHEN p.dt_autuacao >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as processos_mes,
        AVG(p.vl_causa) as valor_medio_causa,
        SUM(CASE WHEN p.dt_autuacao >= DATE_TRUNC('month', CURRENT_DATE) THEN p.vl_causa ELSE 0 END) as valor_total_causa
      FROM pje.tb_processo_trf p
      WHERE p.dt_autuacao >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    ),
    tarefas AS (
      SELECT 
        COUNT(CASE WHEN ti.end_ IS NULL THEN 1 END) as tarefas_abertas,
        COUNT(CASE WHEN DATE(ti.end_) = CURRENT_DATE THEN 1 END) as tarefas_concluidas_hoje
      FROM jbpm_taskinstance ti
      WHERE ti.create_ >= CURRENT_DATE - INTERVAL '30 days'
    ),
    audiencias AS (
      SELECT 
        COUNT(*) as audiencias_hoje
      FROM pje.tb_processo_audiencia pa
      WHERE DATE(pa.dt_inicio) = CURRENT_DATE
    )
    SELECT 
      COALESCE(m.processos_hoje, 0) as processos_hoje,
      COALESCE(m.processos_mes, 0) as processos_mes,
      COALESCE(t.tarefas_abertas, 0) as tarefas_abertas,
      COALESCE(t.tarefas_concluidas_hoje, 0) as tarefas_concluidas_hoje,
      COALESCE(a.audiencias_hoje, 0) as audiencias_hoje,
      COALESCE(m.valor_medio_causa, 0) as valor_medio_causa,
      COALESCE(m.valor_total_causa, 0) as valor_total_causa,
      COALESCE(CASE 
        WHEN EXTRACT(DAY FROM CURRENT_DATE) > 0 
        THEN m.processos_mes / EXTRACT(DAY FROM CURRENT_DATE) 
        ELSE 0 
      END, 0) as media_processos_dia
    FROM metricas m, tarefas t, audiencias a
  `,
  
  /**
   * Ranking de produtividade por OJ
   */
  rankingProdutividade: `
    WITH metricas_oj AS (
      SELECT 
        oj.id_orgao_julgador,
        oj.ds_orgao_julgador,
        oj.nr_vara,
        
        -- Processos
        COUNT(DISTINCT p.id_processo_trf) as total_processos,
        COUNT(DISTINCT CASE WHEN p.dt_autuacao >= CURRENT_DATE - INTERVAL '30 days' THEN p.id_processo_trf END) as processos_mes,
        
        -- Audiências
        COUNT(DISTINCT pa.id_processo_audiencia) as total_audiencias_marcadas,
        COUNT(DISTINCT CASE WHEN pa.in_status_audiencia = 'R' THEN pa.id_processo_audiencia END) as audiencias_realizadas,
        
        -- Servidores
        COUNT(DISTINCT ojc.id_pessoa) as total_servidores
        
      FROM pje.tb_orgao_julgador oj
      LEFT JOIN pje.tb_processo_trf p ON oj.id_orgao_julgador = p.id_orgao_julgador
      LEFT JOIN pje.tb_processo_audiencia pa ON p.id_processo_trf = pa.id_processo_trf
      LEFT JOIN pje.tb_orgao_julgador_cargo ojc ON oj.id_orgao_julgador = ojc.id_orgao_julgador
      WHERE oj.in_ativo = 'S'
      GROUP BY oj.id_orgao_julgador, oj.ds_orgao_julgador, oj.nr_vara
    )
    SELECT 
      ds_orgao_julgador,
      nr_vara,
      total_processos,
      processos_mes,
      total_servidores,
      CASE 
        WHEN total_servidores > 0 THEN ROUND(total_processos::numeric / total_servidores, 2)
        ELSE 0 
      END as processos_por_servidor,
      CASE 
        WHEN total_servidores > 0 THEN ROUND(processos_mes::numeric / total_servidores, 2)
        ELSE 0 
      END as processos_mes_por_servidor,
      audiencias_realizadas,
      CASE 
        WHEN total_audiencias_marcadas > 0 THEN ROUND(100.0 * audiencias_realizadas / total_audiencias_marcadas, 2)
        ELSE 0 
      END as taxa_realizacao_audiencias,
      RANK() OVER (ORDER BY processos_mes DESC) as ranking_distribuicao,
      RANK() OVER (ORDER BY CASE WHEN total_servidores > 0 THEN processos_mes::numeric / total_servidores ELSE 0 END DESC) as ranking_produtividade
    FROM metricas_oj
    WHERE total_processos > 0
    ORDER BY ranking_produtividade
  `
};

export default PJeAnalyticsQueries;