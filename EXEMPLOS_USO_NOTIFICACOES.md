# 🎯 Exemplos de Uso - Sistema de Notificações de Eventos

## 📖 Guia Prático de Implementação

### 1. **Uso Básico no Dashboard**

```tsx
import { SmartEventNotifications } from '@/components/SmartEventNotifications';

// Dashboard principal
function Dashboard() {
  return (
    <div className="dashboard">
      {/* Painel completo de notificações */}
      <SmartEventNotifications />
      
      {/* Outros componentes do dashboard */}
    </div>
  );
}
```

### 2. **Versão Compacta para Sidebars**

```tsx
import { SmartEventNotifications } from '@/components/SmartEventNotifications';

// Sidebar ou áreas menores
function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Versão compacta */}
      <SmartEventNotifications compact={true} />
    </aside>
  );
}
```

### 3. **Badge no Cabeçalho**

```tsx
import { EventNotificationBadge } from '@/components/EventNotificationBadge';

// Cabeçalho da aplicação
function Header() {
  return (
    <header className="flex items-center gap-4">
      <h1>Minha Aplicação</h1>
      
      {/* Badge compacto com popover */}
      <EventNotificationBadge />
      
      <UserMenu />
    </header>
  );
}
```

### 4. **Modal com Hook Personalizado**

```tsx
import { EventNotificationModal } from '@/components/EventNotificationModal';
import { useEventNotifications } from '@/hooks/useEventNotifications';

function App() {
  const { modalOpen, setModalOpen } = useEventNotifications();
  
  return (
    <div className="app">
      {/* Conteúdo da aplicação */}
      
      {/* Modal automático para eventos urgentes */}
      <EventNotificationModal 
        isOpen={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </div>
  );
}
```

### 5. **Configurações Integradas**

```tsx
import { EventNotificationSettings } from '@/components/EventNotificationSettings';

function SettingsPage() {
  return (
    <div className="settings-page">
      <h2>Configurações</h2>
      
      {/* Painel de configurações */}
      <EventNotificationSettings />
    </div>
  );
}
```

## 🎨 Customizações Avançadas

### 1. **Hook com Estatísticas**

```tsx
import { useEventNotifications } from '@/hooks/useEventNotifications';

function EventStats() {
  const { stats, allEvents } = useEventNotifications();
  
  return (
    <div className="stats-grid">
      <div>Urgentes: {stats.urgent}</div>
      <div>Hoje: {stats.today}</div>
      <div>Amanhã: {stats.tomorrow}</div>
      <div>Total: {stats.total}</div>
    </div>
  );
}
```

### 2. **Filtros Personalizados**

```tsx
import { useEventNotifications } from '@/hooks/useEventNotifications';

function CustomEventFilter() {
  const { allEvents, dismissEvent } = useEventNotifications();
  
  // Filtrar apenas aniversários
  const birthdays = allEvents.filter(event => 
    event.type === 'aniversario'
  );
  
  // Filtrar apenas eventos hoje
  const todayEvents = allEvents.filter(event => 
    event.daysUntil === 0
  );
  
  return (
    <div>
      {todayEvents.map(event => (
        <div key={event.id}>
          {event.title}
          <button onClick={() => dismissEvent(event.id)}>
            Dispensar
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. **Snooze Personalizado**

```tsx
import { useEventNotifications } from '@/hooks/useEventNotifications';

function CustomSnoozeControls() {
  const { snoozeNotifications } = useEventNotifications();
  
  return (
    <div className="snooze-controls">
      <button onClick={() => snoozeNotifications(5)}>
        5 min
      </button>
      <button onClick={() => snoozeNotifications(15)}>
        15 min
      </button>
      <button onClick={() => snoozeNotifications(60)}>
        1 hora
      </button>
    </div>
  );
}
```

## 🔧 Integração com Outros Sistemas

### 1. **Integração com React Query**

```tsx
import { useQuery } from '@tanstack/react-query';
import { useEventNotifications } from '@/hooks/useEventNotifications';

function IntegratedEvents() {
  const { allEvents } = useEventNotifications();
  
  // Buscar dados adicionais dos eventos
  const { data: eventDetails } = useQuery({
    queryKey: ['event-details', allEvents.map(e => e.id)],
    queryFn: async () => {
      // Buscar detalhes adicionais
      return fetchEventDetails(allEvents);
    },
    enabled: allEvents.length > 0
  });
  
  return (
    <div>
      {/* Renderizar eventos com detalhes */}
    </div>
  );
}
```

### 2. **Integração com Toast System**

```tsx
import { useToast } from '@/hooks/use-toast';
import { useEventNotifications } from '@/hooks/useEventNotifications';
import { useEffect } from 'react';

function CustomToastNotifications() {
  const { urgentEvents } = useEventNotifications();
  const { toast } = useToast();
  
  useEffect(() => {
    urgentEvents.forEach(event => {
      if (event.daysUntil === 0) {
        toast({
          title: `🎉 ${event.title}`,
          description: 'Evento acontecendo hoje!',
          duration: 10000,
        });
      }
    });
  }, [urgentEvents, toast]);
  
  return null; // Componente silencioso
}
```

## 🎪 Casos de Uso Específicos

### 1. **Para Recursos Humanos**

```tsx
// Focar em aniversários de funcionários
function HRNotifications() {
  const { allEvents } = useEventNotifications();
  
  const employeeBirthdays = allEvents.filter(event => 
    event.type === 'aniversario' && event.daysUntil <= 3
  );
  
  return (
    <div className="hr-notifications">
      <h3>🎂 Aniversários da Semana</h3>
      {employeeBirthdays.map(birthday => (
        <div key={birthday.id} className="birthday-card">
          <span>{birthday.title}</span>
          <button>Enviar Parabéns</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. **Para Gestão de Projetos**

```tsx
// Focar em feriados que afetam cronogramas
function ProjectManagementNotifications() {
  const { allEvents } = useEventNotifications();
  
  const upcomingHolidays = allEvents.filter(event => 
    event.type === 'feriado' && event.daysUntil <= 7
  );
  
  return (
    <div className="project-notifications">
      <h3>📅 Feriados que Afetam Cronograma</h3>
      {upcomingHolidays.map(holiday => (
        <div key={holiday.id} className="holiday-alert">
          <span>{holiday.title}</span>
          <span>Em {holiday.daysUntil} dias</span>
          <button>Ajustar Cronograma</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. **Para Dashboard Executivo**

```tsx
// Resumo executivo dos eventos
function ExecutiveDashboard() {
  const { stats, urgentEvents } = useEventNotifications();
  
  return (
    <div className="executive-summary">
      <div className="metrics">
        <div className="metric">
          <h4>Eventos Urgentes</h4>
          <span className={stats.urgent > 0 ? 'urgent' : 'normal'}>
            {stats.urgent}
          </span>
        </div>
        
        <div className="metric">
          <h4>Esta Semana</h4>
          <span>{stats.thisWeek}</span>
        </div>
      </div>
      
      {stats.urgent > 0 && (
        <div className="urgent-summary">
          <h4>⚠️ Ação Necessária</h4>
          <ul>
            {urgentEvents.map(event => (
              <li key={event.id}>
                {event.title} - {event.daysUntil === 0 ? 'HOJE' : 'AMANHÃ'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## 📱 Responsividade e Mobile

### 1. **Adaptação para Mobile**

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

function ResponsiveNotifications() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <>
      {isMobile ? (
        <EventNotificationBadge />
      ) : (
        <SmartEventNotifications />
      )}
    </>
  );
}
```

### 2. **Progressive Web App (PWA)**

```tsx
// Integração com notificações nativas
function PWANotifications() {
  const { urgentEvents } = useEventNotifications();
  
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      urgentEvents.forEach(event => {
        if (event.daysUntil === 0) {
          new Notification(`🎉 ${event.title}`, {
            body: 'Evento acontecendo hoje!',
            icon: '/favicon.ico',
            tag: event.id
          });
        }
      });
    }
  }, [urgentEvents]);
  
  return null;
}
```

## 🎛️ Configurações Avançadas

### 1. **Configurações por Tipo de Usuário**

```tsx
function RoleBasedNotifications() {
  const { user } = useAuth();
  const { updateSettings } = useEventNotifications();
  
  useEffect(() => {
    if (user?.role === 'admin') {
      updateSettings({
        showModalForUrgent: true,
        showToastsForAll: true,
        snoozeTime: 15 // Admins têm snooze menor
      });
    } else {
      updateSettings({
        showModalForUrgent: true,
        showToastsForAll: false,
        snoozeTime: 60 // Usuários normais têm snooze maior
      });
    }
  }, [user, updateSettings]);
  
  return null;
}
```

### 2. **Configurações por Horário**

```tsx
function TimeBasedNotifications() {
  const { updateSettings } = useEventNotifications();
  
  useEffect(() => {
    const hour = new Date().getHours();
    
    // Reduzir notificações fora do horário comercial
    if (hour < 8 || hour > 18) {
      updateSettings({
        showModalForUrgent: false,
        showToastsForAll: false
      });
    } else {
      updateSettings({
        showModalForUrgent: true,
        showToastsForAll: true
      });
    }
  }, [updateSettings]);
  
  return null;
}
```

---

## 🚀 Dicas de Performance

1. **Lazy Loading**: Componentes só renderizam quando há eventos
2. **Memoização**: Use React.memo para componentes que não mudam frequentemente
3. **Debounce**: Para configurações que mudam frequentemente
4. **Local Storage**: Configurações persistem entre sessões

## 🎨 Personalização de Temas

```css
/* CSS personalizado para temas */
.notification-urgent {
  --urgent-color: #ef4444;
  --urgent-bg: linear-gradient(45deg, #ef4444, #f97316);
}

.notification-birthday {
  --birthday-color: #ec4899;
  --birthday-bg: linear-gradient(45deg, #ec4899, #ef4444);
}

.notification-holiday {
  --holiday-color: #3b82f6;
  --holiday-bg: linear-gradient(45deg, #10b981, #3b82f6);
}
```

*Este sistema fornece uma base sólida e extensível para notificações de eventos, permitindo personalização completa conforme suas necessidades específicas.*
