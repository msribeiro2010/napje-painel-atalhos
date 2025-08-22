import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineData {
  chamados: any[];
  usuarios: any[];
  feriados: any[];
  orgaosJulgadores: any[];
  lastSync: Date;
}

const OFFLINE_STORAGE_KEY = 'offline-data';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);

  useEffect(() => {
    // Carregar dados offline do localStorage
    const savedData = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setOfflineData({
        ...parsed,
        lastSync: new Date(parsed.lastSync)
      });
    }

    // Listeners para mudanças de conectividade
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada! Sincronizando dados...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Modo offline ativado. Usando dados locais.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = (type: keyof Omit<OfflineData, 'lastSync'>, data: any[]) => {
    const current = offlineData || {
      chamados: [],
      usuarios: [],
      feriados: [],
      orgaosJulgadores: [],
      lastSync: new Date()
    };

    const updated = {
      ...current,
      [type]: data,
      lastSync: new Date()
    };

    setOfflineData(updated);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
  };

  const getOfflineData = (type: keyof Omit<OfflineData, 'lastSync'>): any[] => {
    return offlineData?.[type] || [];
  };

  const clearOfflineData = () => {
    setOfflineData(null);
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
  };

  const isDataStale = (): boolean => {
    if (!offlineData?.lastSync) return true;
    return Date.now() - offlineData.lastSync.getTime() > SYNC_INTERVAL;
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return {
        status: 'online' as const,
        message: 'Conectado',
        color: 'green'
      };
    } else {
      return {
        status: 'offline' as const,
        message: 'Modo Offline',
        color: 'orange'
      };
    }
  };

  const shouldUseOfflineData = (forceOffline = false): boolean => {
    return !isOnline || forceOffline;
  };

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    getOfflineData,
    clearOfflineData,
    isDataStale,
    getConnectionStatus,
    shouldUseOfflineData
  };
};

export default useOfflineMode;