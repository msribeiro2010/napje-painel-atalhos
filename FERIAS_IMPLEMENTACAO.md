# 🌴 Sistema de Gestão de Férias - Guia de Implementação

## 📋 Visão Geral

Sistema completo para cadastro, visualização e alertas de períodos de férias com integração ao calendário de trabalho.

---

## 🎯 Funcionalidades Implementadas

### ✅ 1. Estrutura de Banco de Dados
- ✅ Tabela `vacation_periods` - Períodos de férias
- ✅ Tabela `vacation_balance` - Saldo de dias disponíveis
- ✅ Tabela `vacation_alerts` - Sistema de alertas automáticos
- ✅ Triggers automáticos para atualização de saldo
- ✅ Triggers para criação de alertas
- ✅ View de estatísticas
- ✅ RLS (Row Level Security) configurado

### ✅ 2. Tipos TypeScript
- ✅ Interfaces completas em `src/types/vacation.ts`
- ✅ Labels e configurações de UI
- ✅ Funções auxiliares (cálculo de dias, etc)

### ✅ 3. Hook de Gestão
- ✅ `useVacations` em `src/hooks/useVacations.ts`
- ✅ CRUD completo de férias
- ✅ Gestão de alertas
- ✅ Estatísticas e relatórios

### ✅ 4. Componentes de Interface
- ✅ `VacationDialog.tsx` - Modal para cadastrar períodos de férias
  - Seleção de datas (início e fim)
  - Seleção de tipo (regular, recesso, licença, abono)
  - Validação de saldo disponível
  - Preview de dias totais
  - Campo de observações
- ✅ `VacationCard.tsx` - Card visual para exibir férias
  - Ícone tropical (🌴 palmeira)
  - Versão compacta para calendário
  - Versão completa para listas
  - Contador de dias restantes
  - Tooltips informativos
  - Ações de editar/excluir
- ✅ `VacationBalance.tsx` - Painel de saldo de férias
  - Total, usado e disponível
  - Barra de progresso colorida
  - Estatísticas adicionais
  - Alertas de saldo
  - Versões compacta e completa
- ✅ `VacationAlerts.tsx` - Sistema de notificações
  - Sino com badge de contagem
  - Popover com lista de alertas
  - Marcar como lido
  - Dispensar alertas
  - 6 tipos de alertas (30d, 7d, 1d antes, começa hoje, termina hoje, terminou ontem)

### ✅ 5. Integração com Calendário
- ✅ Ícone tropical (🌴) substituindo guarda-chuva (☔)
- ✅ Botão "Cadastrar Férias" no header
- ✅ Componente de alertas no header
- ✅ Hook useVacations integrado
- ✅ VacationDialog conectado

---

## 🚀 Próximos Passos para Implementação

### Passo 1: Executar o Schema no Supabase

```bash
# Acesse o Supabase SQL Editor
# Cole o conteúdo de FERIAS_SCHEMA.sql
# Execute o script
```

### Passo 2: Criar Componentes de Interface

Preciso criar os seguintes componentes:

#### 2.1. Dialog de Cadastro de Férias
**Arquivo**: `src/components/vacation/VacationDialog.tsx`

**Funcionalidades**:
- Seleção de data inicial e final (DatePicker)
- Seleção de tipo (regular, recesso, licença, abono)
- Campo de observações
- Validação de conflitos de data
- Preview de dias úteis
- Botão de salvar

#### 2.2. Card de Férias no Calendário
**Arquivo**: `src/components/vacation/VacationCard.tsx`

**Funcionalidades**:
- Ícone moderno (🌴 Palmeira, ☀️ Sol, 🏖️ Praia)
- Cor de acordo com o tipo
- Tooltip com informações detalhadas
- Contador de dias restantes
- Botões de edição e exclusão

#### 2.3. Lista de Férias
**Arquivo**: `src/components/vacation/VacationList.tsx`

**Funcionalidades**:
- Lista todas as férias (passadas, atuais, futuras)
- Filtros por status e tipo
- Card para cada período
- Ações rápidas (editar, excluir, aprovar)

#### 2.4. Painel de Saldo
**Arquivo**: `src/components/vacation/VacationBalance.tsx`

**Funcionalidades**:
- Exibe total de dias
- Dias utilizados
- Dias disponíveis
- Progresso visual (barra)
- Data de expiração

#### 2.5. Sistema de Alertas
**Arquivo**: `src/components/vacation/VacationAlerts.tsx`

**Funcionalidades**:
- Exibe alertas pendentes
- Toast notifications automáticas
- Badge de contador
- Marcar como lido

### Passo 3: Integrar com o Calendário

**Arquivo a modificar**: `src/pages/Calendario.tsx`

**Mudanças necessárias**:

1. Importar o hook:
```typescript
import { useVacations } from '@/hooks/useVacations';
```

2. Adicionar no componente:
```typescript
const {
  vacations,
  getVacationForDate,
  isDateInVacation,
  showPendingAlerts,
} = useVacations();

// Exibir alertas ao carregar
useEffect(() => {
  showPendingAlerts();
}, []);
```

3. Atualizar o `calendarLabels`:
```typescript
const calendarLabels = {
  presencial: { label: 'Presencial', color: '#f5e7c4', icon: <Building2 className="h-5 w-5 text-[#8b7355]" /> },
  ferias: {
    label: 'Férias',
    color: 'bg-gradient-to-br from-amber-400 to-orange-500',
    icon: <Palmtree className="h-5 w-5 text-white" />, // ou Sun
  },
  remoto: { label: 'Remoto', color: '#e6f7ff', icon: <Coffee className="h-5 w-5 text-[#5ba3d4]" /> },
  plantao: { label: 'Plantão', color: '#e6ffe6', icon: <HardHat className="h-5 w-5 text-[#2e7d32]" /> },
  folga: { label: 'Folga', color: '#e0e0e0', icon: <Umbrella className="h-5 w-5 text-[#424242]" /> },
  none: { label: '', color: '#fff', icon: null },
};
```

4. Adicionar overlay de férias nos dias:
```typescript
// Na renderização de cada dia
{isDateInVacation(day) && (
  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-lg pointer-events-none">
    <span className="absolute top-1 right-1 text-lg">🌴</span>
  </div>
)}
```

5. Adicionar botão para cadastrar férias:
```tsx
<Button onClick={() => setVacationDialogOpen(true)}>
  <Palmtree className="mr-2 h-4 w-4" />
  Cadastrar Férias
</Button>
```

### Passo 4: Implementar Alertas Automáticos

**Arquivo**: `src/hooks/useVacationAlerts.ts`

**Funcionalidades**:
- Verificar alertas pendentes a cada minuto
- Exibir toast notifications
- Sons opcionais
- Persistir notificações lidas

---

## 🎨 Especificações Visuais

### Ícones Recomendados
- **Férias Regulares**: 🌴 Palmeira ou ☀️ Sol
- **Recesso**: 🏖️ Praia
- **Licença**: 🏥 Hospital
- **Abono**: 💰 Dinheiro

### Paleta de Cores

```css
/* Férias Regulares */
.vacation-regular {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  /* Amarelo/Laranja quente */
}

/* Recesso */
.vacation-recesso {
  background: linear-gradient(135deg, #60A5FA, #3B82F6);
  /* Azul céu */
}

/* Licença */
.vacation-licenca {
  background: linear-gradient(135deg, #A78BFA, #8B5CF6);
  /* Roxo */
}

/* Abono */
.vacation-abono {
  background: linear-gradient(135deg, #34D399, #10B981);
  /* Verde */
}
```

### Componentes Visuais

#### Card de Férias no Calendário
```tsx
<div className="relative p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg">
  <div className="flex items-center justify-between">
    <span className="text-2xl">🌴</span>
    <span className="text-white text-xs font-semibold">
      {daysRemaining} dias
    </span>
  </div>
  <p className="text-white text-xs mt-1 font-medium">
    Férias
  </p>
</div>
```

#### Badge de Status
```tsx
<span className={`
  px-2 py-1 rounded-full text-xs font-medium
  ${vacationStatusLabels[status].color}
`}>
  {vacationStatusLabels[status].label}
</span>
```

---

## 📊 Exemplos de Uso

### Cadastrar Férias
```typescript
const { createVacation } = useVacations();

createVacation({
  start_date: '2025-10-29',
  end_date: '2025-11-17',
  type: 'regular',
  notes: 'Viagem para praia',
});
```

### Verificar Férias de um Dia
```typescript
const vacation = getVacationForDate('2025-10-29');
if (vacation) {
  console.log(`Em férias: ${vacation.type}`);
}
```

### Exibir Alertas
```typescript
useEffect(() => {
  showPendingAlerts();
}, []);
```

---

## 🎯 Alertas e Notificações

### Tipos de Alertas

| Quando | Tipo | Mensagem |
|--------|------|----------|
| 30 dias antes | `30_days_before` | "📅 Suas férias se aproximam! Começam em 30 dias." |
| 7 dias antes | `7_days_before` | "⏰ Faltam apenas 7 dias para suas férias!" |
| 1 dia antes | `1_day_before` | "🎊 Amanhã começam suas férias!" |
| Dia de início | `starts_today` | "🌴 Boas férias! Aproveite!" |
| Último dia | `ends_today` | "⏳ Último dia de férias." |
| Dia seguinte | `ended_yesterday` | "👋 Bem-vindo de volta!" |

### Exemplo de Toast
```typescript
toast.info('🌴 Boas Férias!', {
  description: 'Hoje começam suas férias. Aproveite cada momento!',
  duration: 8000,
});
```

---

## 📈 Relatórios e Estatísticas

### Dados Disponíveis
- Total de férias tiradas
- Dias totais utilizados
- Férias planejadas
- Férias em andamento
- Próxima data de férias

### View de Estatísticas
```sql
SELECT * FROM vacation_statistics WHERE user_id = 'uuid';
```

---

## ✅ Checklist de Implementação

### Backend (Supabase)
- [ ] Executar `FERIAS_SCHEMA.sql`
- [ ] Verificar tabelas criadas
- [ ] Testar triggers
- [ ] Verificar RLS policies

### Frontend - Hooks e Tipos
- [x] Criar tipos em `vacation.ts`
- [x] Criar hook `useVacations.ts`
- [ ] Testar CRUD de férias
- [ ] Testar sistema de alertas

### Frontend - Componentes
- [x] Criar `VacationDialog.tsx`
- [x] Criar `VacationCard.tsx`
- [x] Criar `VacationBalance.tsx`
- [x] Criar `VacationAlerts.tsx`
- [ ] Criar `VacationList.tsx` (opcional - pode usar VacationCard)

### Integração
- [x] Integrar com `Calendario.tsx`
- [x] Atualizar ícones (🌴 palmeira)
- [x] Adicionar botão "Cadastrar Férias"
- [x] Adicionar componente de alertas no header
- [ ] Adicionar overlay visual nos dias de férias
- [ ] Testar navegação
- [x] Implementar sistema de alertas

### Testes
- [ ] Cadastrar férias de teste
- [ ] Verificar visualização no calendário
- [ ] Testar conflitos de data
- [ ] Verificar alertas
- [ ] Testar edição e exclusão

---

## 🎨 Melhorias Visuais Sugeridas

### 1. Animações
```css
@keyframes vacation-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.vacation-card {
  animation: vacation-pulse 2s ease-in-out infinite;
}
```

### 2. Gradientes Dinâmicos
```typescript
const getVacationGradient = (daysRemaining: number) => {
  if (daysRemaining <= 3) return 'from-orange-500 to-red-500';
  if (daysRemaining <= 7) return 'from-yellow-400 to-orange-500';
  return 'from-amber-400 to-orange-500';
};
```

### 3. Contador de Dias
```tsx
<div className="text-center">
  <p className="text-4xl font-bold text-amber-600">
    {daysRemaining}
  </p>
  <p className="text-sm text-slate-600">
    dias restantes
  </p>
</div>
```

---

## 📱 Responsividade

### Mobile
- Cards em lista vertical
- Botões maiores para toque
- Dialogs em tela cheia

### Desktop
- Grid de cards
- Sidebar com filtros
- Tooltips detalhados

---

## 🔒 Segurança

- ✅ RLS habilitado
- ✅ Usuários veem apenas suas férias
- ✅ Validação de conflitos
- ✅ Audit trail (created_at, updated_at)

---

## 🚀 Deploy

### Checklist
1. [ ] Executar migrations no Supabase de produção
2. [ ] Testar RLS policies
3. [ ] Fazer deploy do frontend
4. [ ] Testar alertas em produção
5. [ ] Monitorar erros

---

## 📞 Próximos Passos

1. **Execute o schema no Supabase**
2. **Teste o hook `useVacations`**
3. **Crie os componentes visuais**
4. **Integre com o calendário**
5. **Implemente os alertas**
6. **Teste o sistema completo**

---

Qualquer dúvida, consulte os arquivos criados:
- `FERIAS_SCHEMA.sql` - Schema do banco
- `src/types/vacation.ts` - Tipos TypeScript
- `src/hooks/useVacations.ts` - Hook principal
