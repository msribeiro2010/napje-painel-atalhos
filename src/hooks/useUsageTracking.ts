import { useCallback } from 'react';

interface UsageStats {
  requestCount: number;
  cacheHits: number;
  dataTransferred: number;
  lastReset: Date;
}

const STORAGE_KEY = 'usage-stats';

export const useUsageTracking = () => {
  const getStats = useCallback((): UsageStats => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastReset: new Date(parsed.lastReset)
      };
    }
    return {
      requestCount: 0,
      cacheHits: 0,
      dataTransferred: 0,
      lastReset: new Date()
    };
  }, []);

  const updateStats = useCallback((updates: Partial<UsageStats>) => {
    const current = getStats();
    const newStats = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  }, [getStats]);

  const trackRequest = useCallback((dataSize: number = 0) => {
    const current = getStats();
    updateStats({
      requestCount: current.requestCount + 1,
      dataTransferred: current.dataTransferred + dataSize
    });
  }, [getStats, updateStats]);

  const trackCacheHit = useCallback(() => {
    const current = getStats();
    updateStats({
      requestCount: current.requestCount + 1,
      cacheHits: current.cacheHits + 1
    });
  }, [getStats, updateStats]);

  const resetStats = useCallback(() => {
    const newStats = {
      requestCount: 0,
      cacheHits: 0,
      dataTransferred: 0,
      lastReset: new Date()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  }, []);

  const estimateDataSize = useCallback((data: any): number => {
    // Estimativa simples do tamanho dos dados em bytes
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }, []);

  return {
    getStats,
    trackRequest,
    trackCacheHit,
    resetStats,
    estimateDataSize
  };
};

export default useUsageTracking;