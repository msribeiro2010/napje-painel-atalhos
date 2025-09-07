import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';
import { BarChart3, Activity, Users, Database, Server, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminMetrics = () => {
  const { user } = useAuth();

  return (
    <ModernLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 space-y-8 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-lg shadow-sm border border-gray-200/50 backdrop-blur-sm relative overflow-hidden">
        {/* Efeito de textura de jornal */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_25%_25%,#000_1px,transparent_1px),radial-gradient(circle_at_75%_75%,#000_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Métricas do Sistema</h1>
            <p className="text-muted-foreground mt-2">
              Monitoramento e performance do sistema em tempo real
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Clock className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <ModernGrid cols={2} gap="lg">
          {/* Painel de Métricas de Performance */}
          <ModernGridItem>
            <ModernCard variant="glass">
              <ModernCardHeader
                title="Métricas de Performance"
                description="Indicadores de desempenho do sistema"
                icon={<BarChart3 className="h-5 w-5 text-white" />}
              />
              <ModernCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div>
                      <span className="text-sm text-muted-foreground">Tempo de Resposta</span>
                      <p className="text-xs text-muted-foreground/70">Média das últimas 24h</p>
                    </div>
                    <span className="text-lg font-semibold text-green-600">200ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div>
                      <span className="text-sm text-muted-foreground">Taxa de Erro</span>
                      <p className="text-xs text-muted-foreground/70">Erros por requisição</p>
                    </div>
                    <span className="text-lg font-semibold text-green-600">0.01%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div>
                      <span className="text-sm text-muted-foreground">Satisfação do Usuário</span>
                      <p className="text-xs text-muted-foreground/70">Baseado em feedback</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-lg font-semibold text-green-600">98.5%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div>
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <p className="text-xs text-muted-foreground/70">Disponibilidade do sistema</p>
                    </div>
                    <span className="text-lg font-semibold text-green-600">99.9%</span>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </ModernGridItem>

          {/* Painel de Status do Sistema */}
          <ModernGridItem>
            <ModernCard variant="glass">
              <ModernCardHeader
                title="Status do Sistema"
                description="Monitoramento em tempo real"
                icon={<Activity className="h-5 w-5 text-white" />}
              />
              <ModernCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <span className="text-sm text-muted-foreground">Usuários Ativos</span>
                        <p className="text-xs text-muted-foreground/70">Conectados agora</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-lg font-semibold text-purple-600">12</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-orange-500" />
                      <div>
                        <span className="text-sm text-muted-foreground">Chamados Abertos</span>
                        <p className="text-xs text-muted-foreground/70">Aguardando resolução</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-orange-600">8</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div className="flex items-center gap-3">
                      <Server className="h-4 w-4 text-green-500" />
                      <div>
                        <span className="text-sm text-muted-foreground">Status do Servidor</span>
                        <p className="text-xs text-muted-foreground/70">Saúde geral</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-lg font-semibold text-green-600">Online</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-blue-500" />
                      <div>
                        <span className="text-sm text-muted-foreground">Banco de Dados</span>
                        <p className="text-xs text-muted-foreground/70">Conexões ativas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-lg font-semibold text-blue-600">5/20</span>
                    </div>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </ModernGridItem>
        </ModernGrid>

        {/* Gráficos e Estatísticas Detalhadas */}
        <ModernCard variant="glass">
          <ModernCardHeader
            title="Estatísticas Detalhadas"
            description="Análise completa do sistema nas últimas 24 horas"
            icon={<BarChart3 className="h-5 w-5 text-white" />}
          />
          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-muted-foreground">Requisições</div>
              </div>
              <div className="text-center p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl font-bold text-green-600">98.2%</div>
                <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
              </div>
              <div className="text-center p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl font-bold text-purple-600">156ms</div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
              <div className="text-center p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="text-2xl font-bold text-orange-600">23</div>
                <div className="text-sm text-muted-foreground">Chamados Resolvidos</div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        </div>
      </div>
    </ModernLayout>
  );
};

export default AdminMetrics;