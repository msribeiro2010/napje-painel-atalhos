# Guia para Popular Tabelas do Banco de Dados

## Problema Identificado

As tabelas `assuntos`, `orgaos_julgadores_1grau` e `orgaos_julgadores_2grau` estão vazias, o que impede o funcionamento correto dos componentes de seleção no formulário de criação de chamados.

## Status Atual das Tabelas

- ✅ **chamados**: 5 registros (funcionando)
- ❌ **assuntos**: 0 registros (vazia)
- ❌ **orgaos_julgadores_1grau**: 0 registros (vazia)
- ❌ **orgaos_julgadores_2grau**: 0 registros (vazia)

## Solução

### Opção 1: Executar SQL no Painel do Supabase (Recomendado)

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá para o projeto: `zpufcvesenbhtmizmjiz`
3. Navegue até **SQL Editor**
4. Execute o conteúdo do arquivo `populate-database.sql` que está na raiz do projeto

### Opção 2: Configurar Chave de Serviço (Para Automação)

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie a **service_role key** (não a anon key)
3. Adicione no arquivo `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui
   ```
4. Execute o script:
   ```bash
   node execute-sql-script.cjs
   ```

## Dados que Serão Inseridos

### Assuntos (159 itens)
Resumos padrões extraídos de `src/constants/form-options.ts`, incluindo:
- Problemas de acesso
- Questões de certificado digital
- Erros de sistema
- Problemas de competência
- E muitos outros...

### Órgãos Julgadores de 1º Grau (188 itens)
Varas do Trabalho de diversas cidades, como:
- Vara do Trabalho de Campinas
- Vara do Trabalho de São Paulo
- Vara do Trabalho de Ribeirão Preto
- E muitas outras...

### Órgãos Julgadores de 2º Grau (2 itens)
- Corregedoria-Geral
- CCP DE 2º GRAU - Centro de Conciliação Pré Processual

## Verificação

Após executar qualquer uma das opções, execute:
```bash
node check-database-tables.cjs
```

O resultado esperado é:
- ✅ assuntos: 159 registros
- ✅ orgaos_julgadores_1grau: 188 registros
- ✅ orgaos_julgadores_2grau: 2 registros

## Impacto da Correção

Com as tabelas populadas, os seguintes componentes funcionarão corretamente:

1. **Campo Resumo**: Mostrará sugestões baseadas em dados históricos + resumos padrões
2. **Órgão Julgador (1º Grau)**: Permitirá busca e seleção de varas
3. **Órgão Julgador (2º Grau)**: Permitirá seleção de órgãos de 2º grau
4. **Componente AssuntoSearchSelect**: Funcionará com dados da base + fallback para resumos padrões

## Arquivos Relacionados

- `populate-database.sql` - Script SQL para execução manual
- `execute-sql-script.cjs` - Script Node.js para execução automática
- `check-database-tables.cjs` - Script para verificar o status das tabelas
- `src/constants/form-options.ts` - Fonte dos dados estáticos