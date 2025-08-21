# 🔔 Sistema de Notificações Inteligentes para Eventos do Calendário

Este documento descreve o novo sistema de notificações para eventos do calendário, implementado com funcionalidades modernas e interativas.

## 📋 Funcionalidades Implementadas

### 1. **SmartEventNotifications** - Painel Principal
- **Localização**: Dashboard principal
- **Características**:
  - Design responsivo com gradientes dinâmicos
  - Diferenciação visual para eventos urgentes (hoje/amanhã)
  - Animações suaves para melhor UX
  - Botão de acesso rápido ao calendário
  - Dicas inteligentes baseadas na proximidade dos eventos
  - Modo compacto disponível

### 2. **EventNotificationModal** - Modal Interativo
- **Características**:
  - Popup automático para eventos urgentes
  - Sistema de snooze (15min, 30min, 1h, 2h, 4h, 8h)
  - Navegação entre múltiplos eventos urgentes
  - Mensagens personalizadas por tipo de evento
  - Gradientes temáticos (aniversários em rosa, feriados em azul/verde)
  - Animações específicas (bounce para aniversários, pulse para feriados)

### 3. **EventNotificationBadge** - Notificação Compacta
- **Localização**: Cabeçalho do dashboard
- **Características**:
  - Badge com contador de eventos
  - Animação de sino para eventos urgentes
  - Popover com resumo dos próximos 5 eventos
  - Acesso rápido ao calendário

### 4. **EventNotificationSettings** - Configurações
- **Características**:
  - Controle de modalais para eventos urgentes
  - Configuração de toasts para todos os eventos
  - Ajuste do tempo de snooze padrão
  - Estatísticas de eventos (urgentes, hoje, amanhã, total)
  - Sistema de eventos dispensados com opção de restaurar

### 5. **useEventNotifications** - Hook Personalizado
- **Funcionalidades**:
  - Gerenciamento de estado das notificações
  - Persistência de configurações no localStorage
  - Controle de eventos dispensados
  - Sistema de snooze inteligente
  - Estatísticas detalhadas

## 🎨 Design e Animações

### Animações CSS Personalizadas
- **animate-ring**: Sino balançando para eventos urgentes
- **animate-float**: Flutuação suave para ícones
- **animate-glow**: Brilho pulsante para destaques
- **animate-shake**: Tremulação para alertas
- **animate-slide-in-up**: Entrada suave dos cards de eventos
- **animate-scale-in**: Zoom suave para elementos

### Cores e Gradientes
- **Eventos Urgentes**: Laranja/vermelho com efeitos de pulsação
- **Aniversários**: Rosa/vermelho com tema festivo
- **Feriados**: Verde/azul com tema de descanso
- **Eventos Futuros**: Azul/roxo com tema profissional

## 🚀 Como Usar

### 1. Configurar Notificações
1. No dashboard, clique em "Configurar Notificações"
2. Ajuste as preferências:
   - Ativar/desativar modal para eventos urgentes
   - Controlar toasts para todos os eventos
   - Definir tempo de snooze padrão
3. As configurações são salvas automaticamente

### 2. Visualizar Eventos
- **Dashboard**: Painel principal com todos os eventos próximos
- **Cabeçalho**: Badge compacto com contador
- **Modal**: Popup automático para eventos urgentes

### 3. Gerenciar Notificações
- **Snooze**: Adiar notificações por tempo determinado
- **Dispensar**: Remover eventos específicos das notificações
- **Restaurar**: Reativar eventos dispensados

## 📊 Tipos de Eventos

### Feriados
- **Hoje**: 🏖️ com animação de pulse
- **Amanhã**: 📅 com destaque laranja
- **Futuros**: ⭐ com tema azul

### Aniversários
- **Hoje**: 🎉 com animação de bounce
- **Amanhã**: 🎂 com destaque especial
- **Futuros**: 🎈 com tema rosa

## 🔧 Configurações Técnicas

### localStorage
- `event-notification-settings`: Configurações do usuário
- `calendar-marks`: Marcações do calendário

### Hooks Utilizados
- `useUpcomingEvents`: Busca eventos próximos
- `useEventNotifications`: Gerencia notificações
- `useToast`: Exibe toasts do sistema

## 💡 Dicas de Implementação

### Para Desenvolvedores
1. **Extensibilidade**: Fácil adicionar novos tipos de eventos
2. **Personalização**: Cores e animações facilmente ajustáveis
3. **Performance**: Componentes otimizados com lazy loading
4. **Acessibilidade**: Suporte a leitores de tela

### Melhorias Futuras Sugeridas
- Integração com notificações do navegador
- Sistema de lembretes por email
- Calendário integrado no modal
- Exportação de eventos para outros calendários
- Sincronização com Google Calendar/Outlook

## 🎯 Benefícios

1. **Produtividade**: Nunca mais esqueça eventos importantes
2. **UX Moderna**: Interface intuitiva e visualmente atraente
3. **Flexibilidade**: Configurações personalizáveis
4. **Performance**: Otimizado para não impactar o sistema
5. **Integração**: Perfeitamente integrado ao sistema existente

## 📱 Responsividade

- **Desktop**: Experiência completa com todos os recursos
- **Tablet**: Layout adaptado com funcionalidades principais
- **Mobile**: Interface compacta com acesso essencial

---

*Sistema desenvolvido para o Painel JIRA - Núcleo de Apoio ao PJe - TRT15*
