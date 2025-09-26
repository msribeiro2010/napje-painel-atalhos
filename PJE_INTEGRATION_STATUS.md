# Status da Integração PJe

## ✅ Correções Implementadas

### 1. Erro de Coluna `id_orgao_julgador`
**Problema**: A coluna `id_orgao_julgador` não existe na tabela `eg_pje.tb_processos_judiciais`
**Solução**: Alterado para usar `num_vara` que existe na estrutura da tabela

### 2. Erro de Coluna `data_autuacao`
**Problema**: A coluna `data_autuacao` não existe diretamente na tabela de processos
**Solução**: Usar `phc.dta_ocorrencia` da tabela `tb_processos_hist_classe`

### 3. Query de Tarefa Atual
**Problema**: Query original não funcionava com a estrutura do banco
**Solução**: Atualizada com base no exemplo fornecido pelo usuário, usando tabelas JBPM:
- `jbpm_taskinstance` para tarefas
- `tb_processo_instance` para relacionar com processos

## 📊 Estrutura de Tabelas Descoberta

### Tabela `eg_pje.tb_processos_judiciais`
Colunas principais:
- `id_processo` - ID do processo
- `numero_unico` - Número CNJ completo
- `num_proc` - Número do processo
- `ano_proc` - Ano do processo  
- `num_vara` - Número da vara (usado no lugar de id_orgao_julgador)
- `num_tribunal` - Número do tribunal
- `cod_municipio_ibge_origem` - Código IBGE do município
- `in_prioridade` - Indicador de prioridade
- `in_segredo_justica` - Indicador de segredo de justiça

## 🔍 Funcionalidades Implementadas

### 1. Busca de Órgãos Julgadores
- Por cidade (ex: "Campinas")
- Retorna todos os OJs da cidade especificada
- Extrai a cidade do nome do órgão julgador

### 2. Busca de Processos
- Aceita formato CNJ completo: `0010715-11.2022.5.15.0092`
- Extrai automaticamente:
  - Número sequencial
  - Ano
  - Órgão de origem (vara)
- Busca também por número parcial

### 3. Detalhes do Processo
- Dados básicos do processo
- Lista de partes organizadas por polo (Ativo/Passivo/Terceiros)
- Tarefa atual do processo (usando tabelas JBPM)

### 4. Busca de Servidores
- Por nome, CPF ou matrícula
- Atualmente usando dados simulados (tabelas de usuários ainda não mapeadas)

## 🛠️ Endpoints da API

### Servidor Proxy
**URL Base**: `http://localhost:3001`

### Endpoints Disponíveis:
- `GET /api/pje/orgaos-julgadores?grau=1&cidade=Campinas`
- `GET /api/pje/processos?grau=1&numero=0010715-11.2022.5.15.0092`
- `GET /api/pje/processo-detalhes?grau=1&idProcesso=123`
- `GET /api/pje/servidores?grau=1&nome=João`
- `GET /api/pje/test-connection?grau=1`
- `POST /api/pje/discover-table` (para descobrir estrutura de tabelas)

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
npm run pje:server
```

### 2. Testar Conexão
```bash
curl http://localhost:3001/api/pje/test-connection?grau=1
```

### 3. Buscar OJs por Cidade
```bash
curl "http://localhost:3001/api/pje/orgaos-julgadores?grau=1&cidade=Campinas"
```

### 4. Buscar Processo
```bash
# Com número CNJ completo
curl "http://localhost:3001/api/pje/processos?grau=1&numero=0010715-11.2022.5.15.0092"

# Com parâmetros separados
curl "http://localhost:3001/api/pje/processos?grau=1&numero=10715&ano=2022&oj=92"
```

## ⚠️ Observações Importantes

1. **Dados de Teste**: O ambiente de teste pode ter tabelas vazias ou dados limitados
2. **Servidores**: Funcionalidade de busca de servidores usa dados simulados
3. **Performance**: Queries limitadas a 100 resultados para evitar sobrecarga
4. **Segurança**: Credenciais do banco nunca são expostas ao frontend

## 📝 Próximos Passos

1. [ ] Mapear corretamente tabelas de usuários/servidores
2. [ ] Implementar cache para queries frequentes
3. [ ] Adicionar paginação para resultados grandes
4. [ ] Melhorar tratamento de erros com mensagens mais claras
5. [ ] Adicionar validação de formato CNJ no frontend

## 🔐 Segurança

- Servidor proxy protege credenciais do banco
- Validação de entrada em todos os endpoints
- Queries parametrizadas para prevenir SQL injection
- CORS configurado para aceitar apenas origens autorizadas