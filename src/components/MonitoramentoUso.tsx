import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Wifi, HardDrive } from 'lucide-react';

interface UsageStats {
  requestCount: number;
  cacheHits: number;
  dataTransferred: number;
  lastReset: Date;
}

const MonitoramentoUso: React.FC = () => {
  const [stats, setStats] = useState<UsageStats>({
    requestCount: 0,
    cacheHits: 0,
    dataTransferred: 0,
    lastReset: new Date()
  });

  useEffect(() => {
    // Carregar estatísticas do localStorage
    const savedStats = localStorage.getItem('usage-stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setStats({
        ...parsed,
        lastReset: new Date(parsed.lastReset)
      });
    }
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cacheEfficiency = stats.requestCount > 0 
    ? Math.round((stats.cacheHits / stats.requestCount) * 100) 
    : 0;

  const resetStats = () => {
    const newStats = {
      requestCount: 0,
      cacheHits: 0,
      dataTransferred: 0,
      lastReset: new Date()
    };
    setStats(newStats);
    localStorage.setItem('usage-stats', JSON.stringify(newStats));
  };

  const daysSinceReset = Math.floor(
    (new Date().getTime() - stats.lastReset.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Monitoramento de Uso de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerta de Quota */}
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div className="text-sm text-orange-800">
            <strong>Atenção:</strong> Quota de egress excedida (15.43GB/5GB). 
            Período de carência até 30 de agosto de 2025.
          </div>
        </div>

        {/* Estatísticas de Requisições */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Wifi className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{stats.requestCount}</div>
            <div className="text-sm text-blue-700">Requisições Totais</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <HardDrive className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{stats.cacheHits}</div>
            <div className="text-sm text-green-700">Cache Hits</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {formatBytes(stats.dataTransferred)}
            </div>
            <div className="text-sm text-purple-700">Dados Transferidos</div>
          </div>
        </div>

        {/* Eficiência do Cache */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Eficiência do Cache</span>
            <Badge variant={cacheEfficiency >= 70 ? 'default' : cacheEfficiency >= 50 ? 'secondary' : 'destructive'}>
              {cacheEfficiency}%
            </Badge>
          </div>
          <Progress value={cacheEfficiency} className="h-2" />
          <div className="text-xs text-gray-600">
            {cacheEfficiency >= 70 ? 'Excelente' : cacheEfficiency >= 50 ? 'Bom' : 'Precisa melhorar'}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Último reset: {daysSinceReset} dia(s) atrás</span>
          <button 
            onClick={resetStats}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Resetar Estatísticas
          </button>
        </div>

        {/* Dicas de Otimização */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Dicas para Reduzir Uso:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Cache implementado para reduzir requisições</li>
            <li>• Queries otimizadas com campos específicos</li>
            <li>• Limites reduzidos nos resultados</li>
            <li>• Dados salvos localmente por 24h</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoramentoUso;