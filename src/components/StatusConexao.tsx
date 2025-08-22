import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useOfflineMode } from '@/hooks/useOfflineMode';

const StatusConexao: React.FC = () => {
  const { getConnectionStatus, offlineData, isDataStale } = useOfflineMode();
  const { status, message, color } = getConnectionStatus();

  const formatLastSync = () => {
    if (!offlineData?.lastSync) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - offlineData.lastSync.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={status === 'online' ? 'default' : 'secondary'}
        className={`flex items-center gap-1 ${
          status === 'online' 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-orange-100 text-orange-800 border-orange-200'
        }`}
      >
        {status === 'online' ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {message}
      </Badge>
      
      {offlineData && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Sync: {formatLastSync()}</span>
          {isDataStale() && (
            <Badge variant="outline" className="text-xs py-0 px-1">
              Desatualizado
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusConexao;