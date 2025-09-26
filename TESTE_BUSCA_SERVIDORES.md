# Teste da Funcionalidade de Busca de Servidores

## Funcionalidade Implementada ✅

A busca de servidores agora possui as seguintes funcionalidades:

### 1. **Busca com Autocomplete**
- Ao digitar o nome do servidor, aparecem sugestões em tempo real
- Digite pelo menos 2 caracteres para ativar as sugestões
- As sugestões são buscadas diretamente do banco de dados PJe

### 2. **Dados Reais do Banco**
- Os dados agora vêm da tabela `pje.tb_usuario_login` do banco PJe
- Inclui informações como: Nome, CPF, Matrícula, Email, Tipo (Servidor/Magistrado/Usuário), Lotação

### 3. **Funcionalidades de Busca**
- **Por Nome**: Digite parte do nome e veja sugestões instantâneas
- **Por CPF**: Busca pelo CPF do servidor
- **Por Matrícula**: Busca pela matrícula

## Como Testar

1. **Acesse a aba "Servidores"** na página de Consultas PJe

2. **Digite um nome para ver as sugestões**:
   - Exemplos: "marc", "joão", "maria"
   - As sugestões aparecem automaticamente após digitar 2 caracteres
   - Clique em uma sugestão para selecioná-la

3. **A busca é executada automaticamente** após selecionar uma sugestão

## Endpoints da API

### Buscar Sugestões (Autocomplete)
```
GET /api/pje/servidores/sugestoes?grau=1&termo=marc&limit=10
```

### Buscar Servidores Completo
```
GET /api/pje/servidores?grau=1&nome=marcelo&cpf=&matricula=&limit=30
```

## Estrutura do Banco de Dados

A busca utiliza as seguintes tabelas do PJe:
- `pje.tb_usuario_login` - Tabela principal com todos os usuários
- `pje.tb_pessoa_servidor` - Informações complementares de servidores
- `pje.tb_pessoa_magistrado` - Informações de magistrados
- `pje.tb_usuario_localizacao` - Lotação dos usuários
- `pje.tb_orgao_julgador` - Órgãos julgadores para lotação

## Melhorias Implementadas

1. **Performance**: Uso de debounce para evitar muitas requisições
2. **UX**: Interface intuitiva com sugestões em dropdown
3. **Dados Reais**: Conexão direta com o banco PJe
4. **Feedback Visual**: Indicador de carregamento durante busca
5. **Informações Completas**: Exibe tipo de usuário, lotação e status