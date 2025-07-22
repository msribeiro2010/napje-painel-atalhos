-- =====================================================
-- INSERIR TODOS OS GRUPOS E ATALHOS DO SISTEMA NAPJe
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Limpar dados existentes (opcional - descomente se quiser recomeçar)
-- DELETE FROM shortcuts;
-- DELETE FROM shortcut_groups;

-- 1. Inserir todos os grupos usando CTE para evitar duplicatas
WITH grupos_para_inserir AS (
  SELECT * FROM (VALUES
    ('Presencial/Plantão/Férias', '📅', 1),
    ('Consulta CPF/OAB/CNPJ', '🔍', 2),
    ('Google Apps', '🌐', 3),
    ('Assyst-PJe', '🎧', 4),
    ('(0800) e Tawk.to', '📞', 5),
    ('Relatórios de Distribuição', '📄', 6),
    ('Contra-Cheque/SISAD...', '💰', 7),
    ('Requerimentos NAPJe', '📋', 8),
    ('PJe-Produção', '🏢', 9),
    ('PJe-Incidentes', '🐛', 10),
    ('PJe-Homologação', '✅', 11),
    ('PJe-Treino', '👤', 12),
    ('Sistemas Administrativos', '🏛️', 13),
    ('Acesso a Outros Sistemas', '🔒', 14),
    ('Utilitários', '❓', 15)
  ) AS t(title, icon, "order")
)
INSERT INTO shortcut_groups (title, icon, "order")
SELECT g.title, g.icon, g."order"
FROM grupos_para_inserir g
WHERE NOT EXISTS (
  SELECT 1 FROM shortcut_groups sg WHERE sg.title = g.title
);

-- 2. Inserir atalhos usando uma abordagem mais segura
-- Grupo: Presencial/Plantão/Férias
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Painel/Controle NAPJe',
  'https://script.google.com/a/macros/trt15.jus.br/s/AKfycbzucXdGYLOxqBol7ri-eyT3fzXuWMdqvgnVkRuVVlV7/dev',
  '📅',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Presencial/Plantão/Férias'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Painel/Controle NAPJe' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'GERENCIADOR DE FÉRIAS',
  'https://msribeiro2010.github.io/controle-ferias/',
  '📅',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Presencial/Plantão/Férias'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'GERENCIADOR DE FÉRIAS' AND s.group_id = sg.id
);

-- Grupo: Consulta CPF/OAB/CNPJ
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'CNPJ',
  'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp',
  '🏢',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Consulta CPF/OAB/CNPJ'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'CNPJ' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'CPF',
  'https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp',
  '👤',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Consulta CPF/OAB/CNPJ'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'CPF' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'OAB',
  'https://www2.oabsp.org.br/asp/consultaInscritos/consulta01.asp',
  '🏦',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = 'Consulta CPF/OAB/CNPJ'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'OAB' AND s.group_id = sg.id
);

-- Grupo: Google Apps
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Gmail',
  'https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F',
  '📧',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Google Apps'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Gmail' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Drive',
  'https://drive.google.com/drive/my-drive?hl=pt-br',
  '💾',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Google Apps'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Drive' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Sheets',
  'https://docs.google.com/spreadsheets/u/0/?tgif=d',
  '📊',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = 'Google Apps'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Sheets' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Docs',
  'https://docs.google.com/document/u/0/?tgif=d',
  '📝',
  sg.id,
  4
FROM shortcut_groups sg 
WHERE sg.title = 'Google Apps'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Docs' AND s.group_id = sg.id
);

-- Grupo: Assyst-PJe
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'AssystWeb',
  'https://centraldetic.trt15.jus.br/assystweb/application.do',
  '🎧',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Assyst-PJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'AssystWeb' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Assyst-Atribuidos p/mim',
  'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=423&queryProfileForm.columnProfileId=67',
  '👥',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Assyst-PJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Assyst-Atribuidos p/mim' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Assyst-Abertos',
  'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=996&queryProfileForm.columnProfileId=67',
  '📄',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = 'Assyst-PJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Assyst-Abertos' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Assyst-Consulta',
  'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch',
  '🔍',
  sg.id,
  4
FROM shortcut_groups sg 
WHERE sg.title = 'Assyst-PJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Assyst-Consulta' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'AssystNet',
  'https://chatbot.trt15.jus.br/lhc/home.php',
  '🤖',
  sg.id,
  5
FROM shortcut_groups sg 
WHERE sg.title = 'Assyst-PJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'AssystNet' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Banco de Conhecimento',
  'https://drive.google.com/file/d/1-6R-ZzSC3dSTGXh9NZLWeP25CY8MZ9DG/view?ths=true',
  '📄',
  sg.id,
  6
FROM shortcut_groups sg 
WHERE sg.title = 'Assyst-PJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Banco de Conhecimento' AND s.group_id = sg.id
);

-- Grupo: (0800) e Tawk.to
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  '(0800)Registros/Atend.',
  'https://script.google.com/a/macros/trt15.jus.br/s/AKfycbyZc3lywRgqNftHWdbBkCTYWEChxDk5OI6ijUD3XlsUBWgGulwzJIJpfdim-XRJ_NQ8/exec',
  '📄',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = '(0800) e Tawk.to'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = '(0800)Registros/Atend.' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Planilha/Atend.Telefônicos',
  'https://docs.google.com/spreadsheets/d/10_eaPcU5vmbOZBjvCKajOhvwssh_GkvaVjoKSeeSgcA/edit?gid=1098454302#gid=1098454302',
  '📄',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = '(0800) e Tawk.to'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Planilha/Atend.Telefônicos' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe-Suporte',
  'https://trt15.jus.br/pje/suporte-ao-pje',
  '🎧',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = '(0800) e Tawk.to'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe-Suporte' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Tawk.to',
  'https://dashboard.tawk.to/login',
  '🤖',
  sg.id,
  4
FROM shortcut_groups sg 
WHERE sg.title = '(0800) e Tawk.to'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Tawk.to' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'E-mails Diários',
  'https://docs.google.com/spreadsheets/d/1g7pme1VNFhffy2zdbCyRfvdpNFqLjRku8hObrOwqXNY/edit?pli=1&gid=1693944372#gid=1693944372',
  '📧',
  sg.id,
  5
FROM shortcut_groups sg 
WHERE sg.title = '(0800) e Tawk.to'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'E-mails Diários' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Emails Dinâmicos',
  'https://docs.google.com/spreadsheets/d/1NXxxSjHc04X919BT741lZ1H0Bqs0kHrFVc8nuWFjqNY/edit?gid=1824743735',
  '📧',
  sg.id,
  6
FROM shortcut_groups sg 
WHERE sg.title = '(0800) e Tawk.to'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Emails Dinâmicos' AND s.group_id = sg.id
);

-- Grupo: Relatórios de Distribuição
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Relatórios de Distribuição',
  'https://trt15.jus.br/intranet/sec-geral-judiciaria/relatorio-distribuicao',
  '📄',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Relatórios de Distribuição'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Relatórios de Distribuição' AND s.group_id = sg.id
);

-- Grupo: Contra-Cheque/SISAD...
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Contracheque',
  'https://autoatendimento.trt15.jus.br/consultainformacoesfuncionais/contracheque',
  '💰',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Contra-Cheque/SISAD...'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Contracheque' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Requerimentos',
  'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/selecaorequerimentosel?fwPlc=fazerrequerimentoman',
  '📄',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Contra-Cheque/SISAD...'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Requerimentos' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'SISAD',
  'https://sisad.jt.jus.br/portal-nacional',
  '👤',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = 'Contra-Cheque/SISAD...'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'SISAD' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'SIGEP/ARTEMIS/SIGS',
  'https://sisad.jt.jus.br/portal-programa/1',
  '👥',
  sg.id,
  4
FROM shortcut_groups sg 
WHERE sg.title = 'Contra-Cheque/SISAD...'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'SIGEP/ARTEMIS/SIGS' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'SIGEO/DIÁRIAS',
  'https://portal.sigeo.jt.jus.br/portal/0',
  '💰',
  sg.id,
  5
FROM shortcut_groups sg 
WHERE sg.title = 'Contra-Cheque/SISAD...'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'SIGEO/DIÁRIAS' AND s.group_id = sg.id
);

-- Grupo: Requerimentos NAPJe
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Averbação Trabalho no Plantão',
  'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/fazerrequerimentoman?chPlc=89',
  '📋',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Requerimentos NAPJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Averbação Trabalho no Plantão' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Solicitar Folga',
  'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/fazerrequerimentoman?chPlc=30411',
  '📅',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Requerimentos NAPJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Solicitar Folga' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Requerimento de Férias',
  'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/feriasperiodoman?chPlc=157',
  '📋',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = 'Requerimentos NAPJe'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Requerimento de Férias' AND s.group_id = sg.id
);

-- Grupo: PJe-Produção
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 1º Grau - Produção',
  'https://pje.trt15.jus.br/primeirograu/login.seam',
  '🏢',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Produção'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 1º Grau - Produção' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 2º Grau - Produção',
  'https://pje.trt15.jus.br/segundograu/login.seam',
  '🏢',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Produção'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 2º Grau - Produção' AND s.group_id = sg.id
);

-- Grupo: PJe-Incidentes
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 1º Grau - Incidentes',
  'https://pje-incidentes.trt15.jus.br/primeirograu/login.seam',
  '🐛',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Incidentes'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 1º Grau - Incidentes' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 2º Grau - Incidentes',
  'https://pje-incidentes.trt15.jus.br/segundograu/login.seam',
  '🐛',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Incidentes'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 2º Grau - Incidentes' AND s.group_id = sg.id
);

-- Grupo: PJe-Homologação
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 1º Grau - Homolog.',
  'https://pje-homologacao.trt15.jus.br/primeirograu/login.seam',
  '✅',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Homologação'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 1º Grau - Homolog.' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 2º Grau - Homolog.',
  'https://pje-homologacao.trt15.jus.br/segundograu/login.seam',
  '✅',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Homologação'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 2º Grau - Homolog.' AND s.group_id = sg.id
);

-- Grupo: PJe-Treino
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 1º Grau - Treino',
  'https://pje-treino.trt15.jus.br/primeirograu/login.seam',
  '👤',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Treino'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 1º Grau - Treino' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'PJe 2º Grau - Treino',
  'https://pje-treino.trt15.jus.br/segundograu/login.seam',
  '👤',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'PJe-Treino'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'PJe 2º Grau - Treino' AND s.group_id = sg.id
);

-- Grupo: Sistemas Administrativos
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'SEI',
  'https://sei.trt15.jus.br/sei/',
  '📄',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Sistemas Administrativos'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'SEI' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Compras',
  'https://compras.trt15.jus.br/',
  '🏦',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Sistemas Administrativos'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Compras' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Portal Corporativo',
  'https://corporativo.trt15.jus.br/',
  '🌍',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = 'Sistemas Administrativos'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Portal Corporativo' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Intranet',
  'https://intranet.trt15.jus.br/',
  '🌐',
  sg.id,
  4
FROM shortcut_groups sg 
WHERE sg.title = 'Sistemas Administrativos'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Intranet' AND s.group_id = sg.id
);

-- Grupo: Acesso a Outros Sistemas
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Citrix',
  'https://ctxvirtualdesktop.trt15.jus.br/',
  '🔒',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Acesso a Outros Sistemas'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Citrix' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Terminal Server',
  'https://ts.trt15.jus.br/ts',
  '🔒',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Acesso a Outros Sistemas'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Terminal Server' AND s.group_id = sg.id
);

-- Grupo: Utilitários
INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'Calculadora Trabalhista',
  'https://www3.tst.jus.br/Ssind/Calculo',
  '💰',
  sg.id,
  1
FROM shortcut_groups sg 
WHERE sg.title = 'Utilitários'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'Calculadora Trabalhista' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'CAGED',
  'https://caged.mte.gov.br/portalcaged/paginas/home/home.xhtml',
  '📋',
  sg.id,
  2
FROM shortcut_groups sg 
WHERE sg.title = 'Utilitários'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'CAGED' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'RAIS',
  'https://www.rais.gov.br/sitio/index.jsf',
  '📋',
  sg.id,
  3
FROM shortcut_groups sg 
WHERE sg.title = 'Utilitários'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'RAIS' AND s.group_id = sg.id
);

INSERT INTO shortcuts (title, url, icon, group_id, "order")
SELECT 
  'CNIS',
  'https://www3.dataprev.gov.br/CNIS/',
  '📋',
  sg.id,
  4
FROM shortcut_groups sg 
WHERE sg.title = 'Utilitários'
AND NOT EXISTS (
  SELECT 1 FROM shortcuts s WHERE s.title = 'CNIS' AND s.group_id = sg.id
);

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Verificar quantos grupos foram inseridos
SELECT 'Grupos inseridos:' as info, COUNT(*) as total FROM shortcut_groups;

-- Verificar quantos atalhos foram inseridos
SELECT 'Atalhos inseridos:' as info, COUNT(*) as total FROM shortcuts;

-- Listar todos os grupos com seus atalhos
SELECT 
  sg.title as grupo,
  sg.icon as icone_grupo,
  COUNT(s.id) as total_atalhos
FROM shortcut_groups sg
LEFT JOIN shortcuts s ON sg.id = s.group_id
GROUP BY sg.id, sg.title, sg.icon
ORDER BY sg."order"; 