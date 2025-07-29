import { EventNotificationSettings } from '@/components/EventNotificationSettings';

const NotificationSettings = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Configurações de Notificações
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações de notificações de eventos do sistema
        </p>
      </div>
      
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-soft">
        <EventNotificationSettings />
      </div>
    </div>
  );
};

export default NotificationSettings;