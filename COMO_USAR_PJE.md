# 📚 Como Usar o Sistema PJe - Guia Completo

## 🎯 Visão Geral
O sistema PJe permite consultar informações de processos judiciais, órgãos julgadores e servidores. O sistema está dividido em duas partes principais:

1. **Interface de Busca** - Para realizar consultas
2. **Página de Configuração** - Para configurar e testar conexões

---

## 🔍 Como Realizar Buscas

### 1. Buscar Órgãos Julgadores (OJs)

Na aba **"Órgãos Julgadores"**:

- **Campo "Cidade"**: Digite o nome da cidade (ex: "Campinas", "São Paulo")
- **NÃO coloque SQL aqui!** Este campo é apenas para o nome da cidade
- Clique em **"Buscar"**

**Exemplos válidos:**
- ✅ `Campinas`
- ✅ `São Paulo` 
- ✅ `Ribeirão Preto`
- ❌ `select * from...` (NÃO use SQL aqui!)

### 2. Buscar Processos

Na aba **"Processos"**:

- **Número**: Digite o número do processo (apenas números)
- **Ano**: Digite o ano do processo
- **Órgão Julgador**: Selecione ou digite o ID do OJ
- Clique em **"Buscar"**

### 3. Buscar Servidores

Na aba **"Servidores"**:

- **Nome**: Digite parte do nome do servidor
- **CPF**: Digite o CPF (apenas números)
- **Matrícula**: Digite a matrícula
- Clique em **"Buscar"**

---

## ⚙️ Página de Configuração PJe

### Para que serve?

A página de configuração (`/configuracao-pje`) serve para:

1. **Testar Conexões**: Verificar se o sistema está conectado aos bancos
2. **Descobrir Tabelas**: Identificar as tabelas disponíveis
3. **Configurar Queries**: Customizar queries SQL (apenas para administradores)

### Como testar a conexão:

1. Acesse a página de **Configuração PJe** no menu
2. Clique em **"Testar 1º Grau"** ou **"Testar 2º Grau"**
3. O sistema mostrará:
   - ✅ Conexão OK - se estiver funcionando
   - ❌ Erro - se houver problemas
   - Lista de tabelas disponíveis

### Campos de Query Customizada:

⚠️ **ATENÇÃO**: Os campos de "Query Customizada" são para **administradores técnicos** configurarem SQL personalizado. 

**Usuários normais NÃO devem:**
- Colocar SQL nos campos de busca
- Alterar as queries customizadas
- Usar comandos SQL diretamente

---

## 🚨 Problemas Comuns e Soluções

### "Erro ao buscar" ou "500 Internal Server Error"

**Causa**: Problema na conexão com o banco ou query incorreta

**Solução**:
1. Vá para Configuração PJe
2. Teste a conexão do grau desejado
3. Se falhar, entre em contato com o suporte

### "0 resultados encontrados" ao buscar por cidade

**Possíveis causas**:
- Nome da cidade digitado incorretamente
- Cidade não tem órgãos julgadores cadastrados
- Você colocou SQL ao invés do nome da cidade

**Solução**:
- Digite apenas o nome da cidade (ex: "Campinas")
- Tente variações do nome (com/sem acentos)
- NÃO use comandos SQL

### "Unexpected token" ou erro de JSON

**Causa**: O servidor não está rodando ou há erro na resposta

**Solução**:
1. Verifique se o servidor está ativo
2. Teste a conexão na página de configuração
3. Reinicie o servidor se necessário

---

## 📋 Resumo Rápido

### ✅ FAÇA:
- Digite apenas **nomes de cidades** no campo de cidade
- Use apenas **números** nos campos de CPF e número de processo
- Teste a conexão quando houver problemas
- Use a interface de busca normalmente

### ❌ NÃO FAÇA:
- NÃO coloque SQL nos campos de busca
- NÃO altere queries customizadas sem conhecimento técnico
- NÃO use comandos de banco diretamente na interface

---

## 🆘 Precisa de Ajuda?

Se continuar com problemas:

1. **Teste a conexão** na página de configuração
2. **Verifique o servidor** está rodando (`npm run pje:server`)
3. **Consulte os logs** do servidor para erros específicos
4. **Entre em contato** com o suporte técnico

---

## 🔧 Para Desenvolvedores

### Estrutura das Tabelas

**Tabelas principais utilizadas:**
- `pje.tb_orgao_julgador` - Órgãos julgadores
- `pje.tb_localizacao` - Localizações
- `pje.tb_endereco` - Endereços com cidades
- `eg_pje.tb_processos_judiciais` - Processos

### Comandos Úteis

```bash
# Iniciar o servidor PJe
npm run pje:server

# Descobrir tabelas disponíveis
npm run pje:discover

# Testar conexão via curl
curl http://localhost:3001/api/pje/test-connection?grau=1
```

### Endpoints da API

- `GET /api/pje/orgaos-julgadores?grau=1&cidade=Campinas`
- `GET /api/pje/processos?grau=1&numero=XXX&ano=2024`
- `GET /api/pje/servidores?grau=1&cpf=12345678900`
- `GET /api/pje/test-connection?grau=1`
- `GET /health`