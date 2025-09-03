import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { ModernGrid, ModernGridItem } from '@/components/layout/ModernGrid';
import { Sparkles } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import type { DashboardAction } from '@/types/dashboard';

interface DashboardActionsProps {
  actions: DashboardAction[];
  favorites?: string[];
  onToggleFavorite?: (actionId: string) => void;
}

// Componente para botão draggable
const DraggableActionButton = ({ action, index }: { action: DashboardAction; index: number }) => {
  const actionId = `action-${action.title.toLowerCase().replace(/\s+/g, '-')}`;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: actionId,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Cores minimalistas com melhor contraste
  const colorVariants = [
    {
      bg: 'from-slate-500/70 to-slate-600/70',
      hover: 'hover:from-slate-600/80 hover:to-slate-700/80',
      ring: 'focus:ring-slate-300/30'
    },
    {
      bg: 'from-blue-500/65 to-blue-600/65',
      hover: 'hover:from-blue-600/75 hover:to-blue-700/75',
      ring: 'focus:ring-blue-300/25'
    },
    {
      bg: 'from-emerald-500/65 to-emerald-600/65',
      hover: 'hover:from-emerald-600/75 hover:to-emerald-700/75',
      ring: 'focus:ring-emerald-300/25'
    },
    {
      bg: 'from-amber-500/65 to-amber-600/65',
      hover: 'hover:from-amber-600/75 hover:to-amber-700/75',
      ring: 'focus:ring-amber-300/25'
    },
    {
      bg: 'from-rose-500/65 to-rose-600/65',
      hover: 'hover:from-rose-600/75 hover:to-rose-700/75',
      ring: 'focus:ring-rose-300/25'
    },
    {
      bg: 'from-violet-500/65 to-violet-600/65',
      hover: 'hover:from-violet-600/75 hover:to-violet-700/75',
      ring: 'focus:ring-violet-300/25'
    }
  ];
  
  const colorVariant = colorVariants[index % colorVariants.length];

  return (
    <ModernGridItem>
      <button
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`relative group h-full w-full bg-gradient-to-br ${colorVariant.bg} ${colorVariant.hover} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] focus:outline-none focus:ring-2 ${colorVariant.ring} ${
          isDragging ? 'opacity-50 scale-105 shadow-2xl z-50' : ''
        }`}
        onClick={(e) => {
          if (!isDragging) {
            console.log('Button clicked:', action.title);
            e.preventDefault();
            e.stopPropagation();
            if (action.onClick) {
              action.onClick();
            }
          }
        }}
        aria-label={action.title}
      >
        <div className="flex flex-col items-center text-center space-y-3 h-full justify-center">
          {/* Ícone */}
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-102 shadow-sm">
            <action.icon className="h-7 w-7 text-white drop-shadow-sm" />
          </div>
          
          {/* Título */}
          <h3 className="font-bold text-sm text-gray-100 group-hover:text-white transition-colors duration-300 leading-tight px-2 drop-shadow-sm">
            {action.title}
          </h3>
          
          {/* Efeito de brilho aprimorado */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/3 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl"></div>
        </div>
        
        {/* Indicador de drag */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full mt-1"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full mt-1"></div>
        </div>
      </button>
    </ModernGridItem>
  );
};

export const DashboardActions = ({ actions, favorites = [], onToggleFavorite }: DashboardActionsProps) => {
  return (
    <ModernCard variant="glass" className="mb-8">
      <div className="p-6">
        {/* Header da seção */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-slate-400/60 to-blue-400/60 rounded-2xl shadow-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Ações Rápidas</h2>
            <p className="text-sm text-gray-500 mt-1">Acesso direto às principais funcionalidades</p>
          </div>
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent flex-1"></div>
        </div>
        
        {/* Grid de ações */}
        <ModernGrid cols={6} gap="md">
          {actions.map((action, index) => 
            action.customComponent ? (
              <ModernGridItem key={action.title}>
                {action.customComponent}
              </ModernGridItem>
            ) : (
              <DraggableActionButton key={action.title} action={action} index={index} />
            )
          )}
        </ModernGrid>
      </div>
    </ModernCard>
  );
};