# 🔍 Configuração das Consultas PJe

## ⚠️ IMPORTANTE: Segurança

**NUNCA** coloque credenciais diretamente no código ou commite arquivos `.env` com senhas reais no repositório.

## 📋 Passo a Passo de Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# Configurações do Supabase (já existentes)
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase

# Configurações do PJe (NOVAS)
VITE_PJE_API_URL=http://localhost:3001/api/pje
PJE_DB1_HOST=pje-dbpr-a1-replica
PJE_DB1_DATABASE=pje_1grau
PJE_DB1_USER=msribeiro
PJE_DB1_PASSWORD=msrq1w2e3
PJE_DB2_HOST=pje-dbpr-a2-replica
PJE_DB2_DATABASE=pje_2grau
PJE_DB2_USER=msribeiro
PJE_DB2_PASSWORD=msrq1w2e3
```

### 3. Executar o Servidor Proxy

O servidor proxy é necessário para proteger as credenciais do banco e fazer as consultas PJe.

**Em um terminal separado**, execute:

```bash
# Para desenvolvimento (com auto-reload)
npm run pje:server:dev

# Ou para produção
npm run pje:server
```

O servidor vai rodar na porta 3001 por padrão.

### 4. Iniciar a Aplicação

Em outro terminal, execute:

```bash
npm run dev
```

### 5. Acessar a Nova Funcionalidade

1. Abra a aplicação em http://localhost:8080
2. Faça login
3. No Dashboard, clique no novo botão **"Consultas PJe"**
4. Ou acesse diretamente: http://localhost:8080/consultas-pje

## 🔧 Funcionalidades Disponíveis

### Pesquisa de Órgãos Julgadores
- Buscar por nome ou sigla
- Selecionar 1º ou 2º grau
- Visualizar ID, nome e sigla

### Pesquisa de Processos
- Buscar por número, ano ou órgão julgador
- Selecionar 1º ou 2º grau
- Visualizar informações completas do processo

### Pesquisa de Servidores
- Buscar por nome, CPF ou matrícula
- Selecionar 1º ou 2º grau
- Visualizar dados do servidor

## ⚠️ Troubleshooting

### Erro de Conexão
- Verifique se o servidor proxy está rodando (`npm run pje:server`)
- Confirme que as credenciais no `.env` estão corretas
- Verifique se você tem acesso às bases de dados do PJe

### Erro 500 nas Consultas
- Verifique os logs do servidor proxy no terminal
- Confirme que as tabelas existem nas bases de dados
- Verifique se o usuário tem permissões de leitura

### Nenhum Resultado Encontrado
- Verifique se os critérios de busca estão corretos
- Tente uma busca mais genérica primeiro
- Confirme que está selecionando o grau correto

## 🛡️ Segurança

1. **Nunca exponha o servidor proxy para a internet**
2. **Use sempre HTTPS em produção**
3. **Implemente autenticação adicional no servidor proxy**
4. **Monitore logs de acesso regularmente**
5. **Mantenha as credenciais seguras e rotacione periodicamente**

## 📝 Notas para Produção

Para deploy em produção:

1. Configure um servidor Node.js para o proxy
2. Use variáveis de ambiente do servidor (não `.env` local)
3. Configure HTTPS com certificado válido
4. Implemente rate limiting e autenticação
5. Configure logs e monitoramento
6. Use um gerenciador de processos como PM2

## 🔄 Atualizações Futuras

Possíveis melhorias:
- Cache de resultados frequentes
- Exportação de resultados (CSV/PDF)
- Histórico de pesquisas
- Favoritos/bookmarks
- Filtros avançados
- Dashboard com estatísticas