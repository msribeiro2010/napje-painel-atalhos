import { Heart, Shield } from 'lucide-react';

export const DashboardFooter = () => {
  return (
    <div className="text-center space-y-4">
      {/* Informações principais */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium">© 2024 TRT15 - Núcleo de Apoio ao PJe</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full"></div>
        <span>Ferramenta de apoio para abertura de issues JIRA</span>
      </div>
      
      {/* Linha decorativa */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30"></div>
        <div className="p-2 bg-gradient-primary/10 rounded-full">
          <Heart className="h-3 w-3 text-primary" />
        </div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30"></div>
      </div>
      
      {/* Versão e status */}
      <div className="text-xs text-muted-foreground/70">
        <span>Versão 2.0 • Sistema Operacional</span>
      </div>
    </div>
  );
};