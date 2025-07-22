import { AniversariantesSection } from "@/components/AniversariantesSection";
import { FeriadosSection } from "@/components/FeriadosSection";

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
  
  if (hasAniversariantes && !hasFeriados) {
    return (
      <div className={`max-w-md mx-auto mb-8 ${className}`}>
        {aniversariantesPanel}
      </div>
    );
  }
  
  if (!hasAniversariantes && hasFeriados) {
    return (
      <div className={`max-w-md mx-auto mb-8 ${className}`}>
        {feriadosPanel}
      </div>
    );
  }
  
  // Se ambos têm conteúdo, usa layout de duas colunas
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${className}`}>
      {aniversariantesPanel}
      {feriadosPanel}
    </div>
  );
};