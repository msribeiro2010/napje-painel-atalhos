import { AniversariantesSection } from "@/components/AniversariantesSection";
import { FeriadosSection } from "@/components/FeriadosSection";
import { Calendar } from "lucide-react";

interface EventsPanelsProps {
  className?: string;
}

export const EventsPanels = ({ className = "" }: EventsPanelsProps) => {
  const aniversariantesPanel = <AniversariantesSection />;
  const feriadosPanel = <FeriadosSection />;
  
  // Se ambos os painéis retornarem null, não renderiza nada
  if (!aniversariantesPanel && !feriadosPanel) {
    return null;
  }
  
  // Se apenas um painel tem conteúdo, usa layout de coluna única
  const hasAniversariantes = aniversariantesPanel !== null;
  const hasFeriados = feriadosPanel !== null;

  return (
    <div className={`mb-8 ${className}`}>
      {/* Título da seção */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-8 bg-gradient-primary rounded-full"></div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Eventos & Calendário</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
      </div>

      {/* Layout adaptativo baseado no conteúdo */}
      {hasAniversariantes && !hasFeriados && (
        <div className="max-w-lg mx-auto">
          {aniversariantesPanel}
        </div>
      )}
      
      {!hasAniversariantes && hasFeriados && (
        <div className="max-w-lg mx-auto">
          {feriadosPanel}
        </div>
      )}
      
      {hasAniversariantes && hasFeriados && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aniversariantesPanel}
          {feriadosPanel}
        </div>
      )}
      
      {/* Gradiente decorativo */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
    </div>
  );
};