import { Heart, Shield, Sparkles, Zap } from 'lucide-react';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';

export const DashboardFooter = () => {
  return (
    <ModernCard variant="glass" className="mt-12">
      <ModernCardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Informações principais */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">© 2025 TRT15 - Núcleo de Apoio ao PJe</span>
            </div>
            <div className="hidden sm:block w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Ferramenta inteligente de apoio ao PJe</span>
            </div>
          </div>
          
          {/* Linha decorativa */}
          <div className="flex items-center justify-center gap-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/30"></div>
            <div className="p-3 bg-gradient-primary rounded-2xl shadow-soft">
              <Heart className="h-4 w-4 text-white animate-pulse" />
            </div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/30"></div>
          </div>
          
          {/* Versão e status */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Versão 2.0</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistema Operacional</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span>Mar-IA</span>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};