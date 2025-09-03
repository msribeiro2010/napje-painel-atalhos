import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, CalendarCheck, Search, Building, Headset, PersonStanding,
  DollarSign as Cash, FileText, Users, Globe, ChevronDown, ChevronUp,
  Star, Clock, Gift, Phone, Mail, Bot, Kanban, Shield,
  Database, Briefcase, HelpCircle as QuestionCircle, MessageSquare as ChatBubbleIcon, AlertTriangle as ExclamationTriangle,
  Building2, CheckCircle, Bug, Network as Diagram3, ExternalLink as BoxArrowUpRight, Landmark as Bank,
  User, UserPlus, FileBarChart as FileEarmarkText, Globe as Globe2, CreditCard as Bank2, GripVertical, Heart, Trash2,
  Square, CheckSquare, ExternalLink, Settings
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useShortcutsPreferences } from '@/hooks/useShortcutsPreferences';
import { AddShortcutDialog } from '@/components/atalhos/AddShortcutDialog';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Interface para os grupos
interface GroupButton {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Group {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  buttons: GroupButton[];
}

// Interface para dados do banco
interface ShortcutGroup {
  id: string;
  title: string;
  icon: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface Shortcut {
  id: string;
  title: string;
  url: string;
  icon: string;
  group_id: string;
  order: number;
  created_at: string;
  updated_at: string;
  group_title?: string;
}

// Mapeamento de ícones - converte string de emoji para componente React
const getIconComponent = (iconString: string): React.ComponentType<{ className?: string }> => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    '📅': Calendar,
    '✅': CalendarCheck,
    '🔍': Search,
    '🏢': Building,
    '🎧': Headset,
    '🚶': PersonStanding,
    '💰': Cash,
    '📄': FileText,
    '👥': Users,
    '🌐': Globe,
    '💯': CheckCircle,
    '🐛': Bug,
    '🌍': Globe2,
    '🔒': Shield,
    '📞': Phone,
    '📧': Mail,
    '🤖': Bot,
    '📁': Database,
    '💼': Briefcase,
    '❓': QuestionCircle,
    '💬': ChatBubbleIcon,
    '⚠️': ExclamationTriangle,
    '🏛️': Bank,
    '👤': User,
    '👤👤': UserPlus, // Usando ícone diferente para evitar conflito
    '📊': FileEarmarkText,
    '💳': Bank2,
    '🔗': Diagram3,
    '⚖️': Building2,
  };
  
  return iconMap[iconString] || Globe; // Default para Globe se ícone não encontrado
};

// Componente ShortcutButton reutilizável
const ShortcutButton = ({ 
  icon: Icon, 
  title, 
  url, 
  id,
  favorites,
  onToggleFavorite,
  onOpenUrl,
  multiSelectMode = false,
  isSelected = false,
  onToggleSelection,
}: { 
  icon: React.ComponentType<{ className?: string }>, 
  title: string, 
  url: string, 
  id: string,
  favorites: string[],
  onToggleFavorite: (id: string) => void,
  onOpenUrl: (url: string) => void,
  multiSelectMode?: boolean,
  isSelected?: boolean,
  onToggleSelection?: (id: string) => void
}) => {

  return (
  <div className="relative group animate-fade-in h-full">
    <Button
      variant="outline"
      className={`w-full h-28 p-5 flex flex-col items-center justify-center gap-3 
                 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                 dark:from-[#23201a] dark:via-[#2d2717] dark:to-[#181511]
                 hover:from-blue-100 hover:to-purple-100
                 dark:hover:from-[#2d2717] dark:hover:to-[#28231a]
                 border-2 hover:border-blue-300/80
                 dark:hover:border-[#bfae7c]/30
                 shadow-lg hover:shadow-2xl
                 transition-all duration-300 ease-out
                 hover:scale-105 hover:-translate-y-1
                 rounded-2xl group ${
                   isSelected 
                     ? 'border-green-400 dark:border-[#bfae7c] bg-green-50 dark:bg-[#bfae7c]/10' 
                     : 'border-blue-200/60 dark:border-[#3a3320]'
                 }`}
      onClick={() => multiSelectMode && onToggleSelection ? onToggleSelection(id) : onOpenUrl(url)}
    >
      <div className="flex flex-col items-center justify-center gap-2 h-full w-full">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 
                        dark:from-[#bfae7c] dark:to-[#7c6a3c]
                        group-hover:from-indigo-500 group-hover:to-purple-500
                        dark:group-hover:from-[#f8f5e4] dark:group-hover:to-[#bfae7c]
                        shadow-lg transition-all duration-300 flex-shrink-0">
          <Icon className="h-6 w-6 text-white dark:text-[#23201a] group-hover:text-yellow-200 dark:group-hover:text-[#23201a]" />
        </div>
        <span className="text-sm text-center leading-tight font-medium text-gray-800 dark:text-[#f8f5e4] group-hover:text-blue-900 dark:group-hover:text-[#bfae7c] transition-colors line-clamp-2 flex-1 flex items-center justify-center w-full">
          {title}
        </span>
      </div>
    </Button>
    {/* Botão de favorito com ícone de coração, sem estrela */}
    {/* Checkbox para seleção múltipla */}
    {multiSelectMode && (
      <Button
        variant="ghost"
        size="sm"
        className="absolute -top-2 -left-2 h-8 w-8 p-0 
                   transition-all duration-300 bg-white/95 dark:bg-[#23201a]/95 backdrop-blur-sm shadow-xl 
                   border border-blue-200 dark:border-[#bfae7c]/30 hover:border-blue-400 dark:hover:border-[#bfae7c]/50 rounded-full
                   hover:scale-110"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection?.(id);
        }}
      >
        {isSelected ? (
          <CheckSquare className="h-5 w-5 text-green-600 dark:text-[#bfae7c]" />
        ) : (
          <Square className="h-5 w-5 text-gray-400 dark:text-[#bfae7c]/60" />
        )}
      </Button>
    )}

    {/* Botão de favorito */}
    <Button
      variant="ghost"
      size="sm"
      className={`absolute -top-2 -right-2 h-8 w-8 p-0 transition-all duration-300 bg-white/95 dark:bg-[#23201a]/95 backdrop-blur-sm shadow-xl 
                 border border-pink-200 dark:border-[#bfae7c]/30 hover:border-pink-400 dark:hover:border-[#bfae7c]/50 rounded-full
                 hover:scale-110 ${
                   multiSelectMode ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
                 }`}
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(id);
      }}
    >
      <Heart 
        className={`h-5 w-5 transition-all duration-200 ${
          favorites.includes(id) 
            ? 'fill-pink-400 dark:fill-[#bfae7c] text-pink-400 dark:text-[#bfae7c] scale-110' 
            : 'text-gray-300 dark:text-[#bfae7c]/60 hover:text-pink-400 dark:hover:text-[#bfae7c]'
        }`}
      />
    </Button>


  </div>
);
};

// Componente SortableGroup
interface SortableGroupProps {
  group: Group;
  isFavorite: boolean;
  openGroups: Record<string, boolean>;
  favorites: string[];
  isAdmin: boolean;
  onToggleGroup: (groupId: string) => void;
  onToggleFavoriteGroup: (groupId: string) => void;
  onToggleFavoriteButton: (buttonId: string) => void;
  onOpenUrl: (url: string) => void;
  onAddShortcut: (groupId: string, groupTitle: string) => void;
  multiSelectMode?: boolean;
  selectedButtons?: string[];
  onToggleSelection?: (buttonId: string) => void;
}

// Refatoração visual dos grupos de atalhos
const SortableGroup = ({ 
  group, 
  openGroups, 
  favorites,
  isAdmin,
  onToggleGroup, 
  onToggleFavoriteButton, 
  onOpenUrl,
  onAddShortcut,
  multiSelectMode = false,
  selectedButtons = [],
  onToggleSelection
}: Omit<SortableGroupProps, 'isFavorite' | 'onToggleFavoriteGroup'>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`overflow-hidden transition-all duration-300 animate-fade-in
                  bg-[#f8f5e4] dark:bg-[#23201a] border border-[#e2d8b8] dark:border-[#3a3320] shadow-md
                  rounded-xl min-h-[80px] flex flex-col justify-between px-3 py-2 my-2 dark:text-[#f8f5e4]`}
    >
      <Collapsible
        open={openGroups[group.id] || false}
        onOpenChange={() => onToggleGroup(group.id)}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-[#f3ecd2] dark:hover:bg-[#2d2717] transition-all duration-300 group p-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#f3ecd2] dark:hover:bg-[#2d2717] rounded-lg transition-all duration-200 hover:scale-105"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-3 w-3 text-[#bfae7c] dark:text-[#bfae7c]" />
              </div>
              <div className="p-2 bg-[#f3ecd2] dark:bg-[#2d2717] rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <group.icon className="h-5 w-5 text-[#bfae7c] dark:text-[#bfae7c]" />
              </div>
              <span className="font-semibold text-[#7c6a3c] dark:text-[#bfae7c] text-base truncate max-w-[120px]">{group.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-[#f3ecd2] dark:bg-[#2d2717] text-[#bfae7c] dark:text-[#bfae7c] rounded-full px-2 py-0.5 text-xs font-medium">{group.buttons.length} atalhos</span>
              {isAdmin && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="ml-1 rounded-full w-7 h-7 flex items-center justify-center text-[#bfae7c] dark:text-[#f8f5e4] border-[#e2d8b8] dark:border-[#3a3320] hover:bg-[#f8f5e4] dark:bg-[#2d2717] dark:hover:bg-[#28231a]" 
                  title="Adicionar atalho" 
                  type="button" 
                  tabIndex={-1} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddShortcut(group.id, group.title);
                  }}
                >
                  +
                </Button>
              )}
              <div className="p-1 bg-[#f8f5e4] dark:bg-[#23201a] rounded-lg">
                {openGroups[group.id] ? (
                  <ChevronUp className="h-4 w-4 text-[#bfae7c] dark:text-[#bfae7c]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#bfae7c] dark:text-[#bfae7c]" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-accordion-down">
          <CardContent className="pt-0 pb-3 dark:bg-[#23201a]">
            <div className="grid grid-cols-1 gap-2">
              {group.buttons.map((button, index) => (
                <div 
                  key={button.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ShortcutButton
                    id={button.id}
                    icon={button.icon}
                    title={button.title}
                    url={button.url}
                    favorites={favorites}
                    onToggleFavorite={onToggleFavoriteButton}
                    onOpenUrl={onOpenUrl}
                    multiSelectMode={multiSelectMode}
                    isSelected={selectedButtons.includes(button.id)}
                    onToggleSelection={onToggleSelection}

                  />
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Componente SortableItem para favoritos
const SortableItem = ({ 
  button, 
  onToggleFavorite, 
  onOpenUrl, 
  className, 
  style,
  multiSelectMode = false,
  isSelected = false,
  onToggleSelection
}: { 
  button: GroupButton,
  onToggleFavorite: (id: string) => void,
  onOpenUrl: (url: string) => void,
  className?: string;
  style?: React.CSSProperties;
  multiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: button.id });
  const mergedStyle = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 99 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };



  return (
    <div ref={setNodeRef} style={mergedStyle} className={(className || '') + ' group relative'} {...attributes} {...listeners}>
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-blue-400 dark:border-[#bfae7c] bg-blue-50/20 dark:bg-[#bfae7c]/5 z-20 pointer-events-none flex items-center justify-center">
          <div className="bg-blue-500/20 dark:bg-[#bfae7c]/20 rounded-lg px-3 py-1">
            <span className="text-xs text-blue-600 dark:text-[#bfae7c] font-medium">Arrastando...</span>
          </div>
        </div>
      )}
      <Button
        variant="outline"
        className={`w-full h-28 p-5 flex flex-col items-center justify-center gap-3
                   bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50
                   dark:from-[#23201a] dark:via-[#2d2717] dark:to-[#181511]
                   hover:from-yellow-100 hover:to-orange-100
                   dark:hover:from-[#2d2717] dark:hover:to-[#28231a]
                   border-2 hover:border-yellow-400/60
                   dark:hover:border-[#bfae7c]/30
                   shadow-lg hover:shadow-2xl
                   transition-all duration-500 ease-out
                   ${isDragging ? '' : 'hover:scale-[1.03] hover:-translate-y-1'}
                   rounded-2xl relative overflow-hidden
                   text-center ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'} ${
                     isSelected 
                       ? 'border-green-400 dark:border-[#bfae7c] bg-green-50 dark:bg-[#bfae7c]/10' 
                       : isDragging 
                       ? 'border-blue-400 dark:border-[#bfae7c] shadow-2xl'
                       : 'border-yellow-300/40 dark:border-[#3a3320]'
                   }`}
        onClick={(e) => {
          e.stopPropagation();
          if (multiSelectMode && onToggleSelection) {
            onToggleSelection(button.id);
          } else {
            onOpenUrl(button.url);
          }
        }}
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 
                        dark:from-[#bfae7c] dark:via-[#7c6a3c] dark:to-[#5a4a2a]
                        group-hover:from-yellow-500 group-hover:to-orange-600
                        dark:group-hover:from-[#f8f5e4] dark:group-hover:to-[#bfae7c]
                        shadow-lg group-hover:shadow-xl transition-all duration-300 relative">
          <button.icon className="h-6 w-6 text-white dark:text-[#23201a] group-hover:text-yellow-200 dark:group-hover:text-[#23201a]" />
          {/* Handle para drag - só aparece no hover */}
          <div className="absolute -top-1 -right-1 bg-white dark:bg-[#23201a] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
            <GripVertical className="h-3 w-3 text-gray-500 dark:text-[#bfae7c]" />
          </div>
        </div>
        <span className="text-sm font-medium text-gray-800 dark:text-[#f8f5e4] 
                       group-hover:text-amber-900 dark:group-hover:text-[#bfae7c] 
                       transition-colors duration-300 line-clamp-2 leading-tight w-full">
          {button.title}
        </span>

      </Button>
      
      {/* Checkbox para seleção múltipla */}
      {multiSelectMode && !isDragging && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-2 -left-2 h-8 w-8 p-0 
                     transition-all duration-300 bg-white/95 dark:bg-[#23201a]/95 backdrop-blur-sm shadow-xl 
                     border border-blue-200 dark:border-[#bfae7c]/30 hover:border-blue-400 dark:hover:border-[#bfae7c]/50 rounded-full
                     hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection?.(button.id);
          }}
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-green-600 dark:text-[#bfae7c]" />
          ) : (
            <Square className="h-5 w-5 text-gray-400 dark:text-[#bfae7c]/60" />
          )}
        </Button>
      )}
      
      {/* Action button: only appears on card hover and never during drag */}
      {!isDragging && (
        <Button
          variant="ghost"
          size="sm"
          className={`absolute -top-3 -right-3 h-8 w-8 p-0 transition-all duration-300 bg-gradient-to-br from-red-500 to-pink-600 
                     hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl 
                     border-2 border-white rounded-full z-10
                     hover:scale-110 transform-gpu cursor-pointer ${
                       multiSelectMode ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
                     }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(button.id);
          }}
          title="Remover dos Favoritos"
        >
          <Trash2 className="h-5 w-5 text-white transition-all duration-200" />
        </Button>
      )}
    </div>
  );
};

// Adicionar área de drop para favoritos com melhorias visuais
const FavoriteDropZone = ({ children, isOver }: { children: React.ReactNode, isOver: boolean }) => (
  <div className={`transition-all duration-300 rounded-2xl relative ${
    isOver 
      ? 'ring-4 ring-pink-300 dark:ring-[#bfae7c] bg-pink-50/60 dark:bg-[#bfae7c]/10 scale-[1.02] shadow-2xl' 
      : ''
  }`}>
    {isOver && (
      <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl border-2 border-dashed border-pink-400 dark:border-[#bfae7c] bg-gradient-to-br from-pink-100/80 to-yellow-100/80 dark:from-[#bfae7c]/20 dark:to-[#7c6a3c]/20 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-[#23201a]/90 rounded-xl px-4 py-2 shadow-lg border border-pink-200 dark:border-[#bfae7c]/30">
          <div className="flex items-center gap-2 text-pink-600 dark:text-[#bfae7c] font-medium">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-sm">Solte aqui para adicionar aos favoritos</span>
          </div>
        </div>
      </div>
    )}
    {children}
  </div>
);

const Atalhos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [addShortcutDialog, setAddShortcutDialog] = useState<{ open: boolean; groupId: string; groupTitle: string }>({
    open: false,
    groupId: '',
    groupTitle: ''
  });
  // Estados para seleção múltipla
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState<string[]>([]);
  const [openingUrls, setOpeningUrls] = useState(false);
  const [openingProgress, setOpeningProgress] = useState({ current: 0, total: 0 });
  

  
  // Funções para seleção múltipla - definidas antes dos hooks
  const toggleButtonSelection = (buttonId: string) => {
    console.log(`🔄 Toggle seleção do botão: ${buttonId}`);
    setSelectedButtons(prev => {
      const isSelected = prev.includes(buttonId);
      let newSelection;
      
      if (isSelected) {
        // Remover o botão da seleção
        newSelection = prev.filter(id => id !== buttonId);
        console.log(`  ❌ Removido da seleção: ${buttonId}`);
      } else {
        // Adicionar o botão à seleção, evitando duplicatas
        newSelection = [...new Set([...prev, buttonId])];
        console.log(`  ✅ Adicionado à seleção: ${buttonId}`);
      }
      
      console.log(`  📊 Seleção atual: ${newSelection.length} botões:`, newSelection);
      return newSelection;
    });
  };

  const deselectAll = () => {
    setSelectedButtons([]);
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (multiSelectMode) {
      setSelectedButtons([]);
    }
  };
  
  const { preferences, loading: preferencesLoading, updateGroupOrder, toggleFavoriteGroup, toggleFavoriteButton, updateFavoriteButtonsOrder } = useShortcutsPreferences();
  const queryClient = useQueryClient();

  // Buscar profile do usuário para verificar se é admin
  const { data: profile, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, status')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Erro ao buscar profile:', error);
        return null;
      }
      return data;
    }
  });

  const isAdmin = profile?.is_admin && profile?.status === 'aprovado';

  // Buscar grupos do banco de dados
  const { data: dbGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['shortcut-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shortcut_groups')
        .select('*')
        .order('order', { ascending: true });
      if (error) throw error;
      return data as ShortcutGroup[];
    },
    enabled: !userLoading && !!profile // Só busca quando o usuário estiver carregado
  });

  // Buscar atalhos do banco de dados
  const { data: dbShortcuts, isLoading: shortcutsLoading } = useQuery({
    queryKey: ['shortcuts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shortcuts')
        .select(`
          *,
          shortcut_groups!inner(title)
        `)
        .order('order', { ascending: true });
      if (error) throw error;
      return data.map(item => ({
        ...item,
        group_title: item.shortcut_groups?.title
      })) as Shortcut[];
    },
    enabled: !userLoading && !!profile // Só busca quando o usuário estiver carregado
  });

  // Carregar favoritos salvos das preferências
  useEffect(() => {
    if (!preferencesLoading && preferences.favoriteButtons) {
      setFavorites(preferences.favoriteButtons);
    }
  }, [preferences.favoriteButtons, preferencesLoading]);



  // Transformar dados do banco em formato esperado pelos componentes
  const groups: Group[] = useMemo(() => {
    if (!dbGroups || !dbShortcuts) return [];
    
    return dbGroups.map(group => ({
      id: group.id,
      title: group.title,
      icon: getIconComponent(group.icon),
      buttons: dbShortcuts
        .filter(shortcut => shortcut.group_id === group.id)
        .map(shortcut => ({
          id: shortcut.id,
          title: shortcut.title,
          url: shortcut.url,
          icon: getIconComponent(shortcut.icon)
        }))
    }));
  }, [dbGroups, dbShortcuts]);

  // Função para abrir URLs selecionadas - versão corrigida
  const openSelectedUrls = async () => {
    console.log('=== INICIANDO ABERTURA DE URLs SELECIONADAS ===');
    console.log('Botões selecionados (IDs):', selectedButtons);
    
    // Verificar se há duplicatas nos IDs selecionados
    const uniqueSelectedIds = [...new Set(selectedButtons)];
    console.log('Total de IDs únicos selecionados:', uniqueSelectedIds.length);
    console.log('Total de IDs na lista original:', selectedButtons.length);
    
    if (uniqueSelectedIds.length !== selectedButtons.length) {
      console.warn('⚠️ ATENÇÃO: Duplicatas detectadas nos botões selecionados!');
      console.warn('IDs duplicados encontrados:', selectedButtons.filter((id, index) => selectedButtons.indexOf(id) !== index));
    }
    
    setOpeningUrls(true);
    setOpeningProgress({ current: 0, total: 0 });
    
    // Criar um mapa único de botões baseado nos IDs selecionados
    const buttonMap = new Map<string, GroupButton>();
    
    // Mapear botões de todas as fontes possíveis
    console.log('📋 Mapeando botões de todas as fontes...');
    
    // 1. Botões dos grupos regulares
    groups.forEach((group, groupIndex) => {
      console.log(`  Grupo ${groupIndex}: ${group.title} com ${group.buttons.length} botões`);
      group.buttons.forEach(button => {
        if (!buttonMap.has(button.id)) { // Evitar duplicatas
          buttonMap.set(button.id, button);
        }
      });
    });
    
    // 2. Botões dos resultados de busca (se houver busca ativa)
    if (searchQuery && searchResults.length > 0) {
      console.log(`  Resultados de busca: ${searchResults.length} botões`);
      searchResults.forEach(button => {
        if (!buttonMap.has(button.id)) {
          buttonMap.set(button.id, button);
        }
      });
    }
    
    // 3. Botões favoritos (caso estejam sendo exibidos)
    if (favoriteButtons.length > 0) {
      console.log(`  Botões favoritos: ${favoriteButtons.length} botões`);
      favoriteButtons.forEach(button => {
        if (!buttonMap.has(button.id)) {
          buttonMap.set(button.id, button);
        }
      });
    }
    
    console.log(`📋 Total de botões únicos mapeados: ${buttonMap.size}`);
    console.log('📋 IDs de botões mapeados:', Array.from(buttonMap.keys()));
    
    // Agora, filtrar apenas os botões que foram selecionados (usando IDs únicos)
    const allButtons: GroupButton[] = [];
    console.log('🎯 Filtrando botões selecionados únicos...');
    
    uniqueSelectedIds.forEach((selectedId, index) => {
      console.log(`  Buscando botão ${index + 1}: ${selectedId}`);
      const button = buttonMap.get(selectedId);
      if (button) {
        allButtons.push(button);
        console.log(`    ✅ Encontrado: ${button.title} - ${button.url}`);
      } else {
        console.log(`    ❌ Botão não encontrado: ${selectedId}`);
      }
    });
    
    console.log('🔍 VERIFICAÇÃO FINAL:');
    console.log(`  IDs únicos selecionados: ${uniqueSelectedIds.length}`);
    console.log(`  Botões encontrados: ${allButtons.length}`);
    console.log(`  Botões que serão abertos:`, allButtons.map(b => ({ id: b.id, title: b.title, url: b.url })));
    
    if (allButtons.length === 0) {
      console.log('❌ Nenhum botão válido selecionado');
      setOpeningUrls(false);
      return;
    }
    
    if (allButtons.length !== uniqueSelectedIds.length) {
      console.warn(`⚠️ AVISO: Quantidade divergente - Únicos selecionados: ${uniqueSelectedIds.length}, Encontrados: ${allButtons.length}`);
    }
     
    setOpeningProgress({ current: 0, total: allButtons.length });
    
    // Verificar se há muitas abas para abrir
    if (allButtons.length > 10) {
      const confirmed = window.confirm(
        `Você está prestes a abrir ${allButtons.length} abas. Deseja continuar?\n\nNota: Alguns navegadores podem bloquear pop-ups. Se isso acontecer, permita pop-ups para este site.`
      );
      if (!confirmed) {
        console.log('❌ Usuário cancelou a abertura de múltiplas abas');
        setOpeningUrls(false);
        return;
      }
    }

    let successCount = 0;
    let failCount = 0;
    const failedUrls: string[] = [];

    // Função auxiliar para tentar abrir uma URL com múltiplos métodos
    const tryOpenUrl = async (url: string, title: string): Promise<boolean> => {
      try {
        // Método 1: window.open padrão
        const newTab = window.open(url, '_blank', 'noopener,noreferrer');
        
        if (newTab && !newTab.closed) {
          // Aguardar um pouco para verificar se a aba foi realmente aberta
          await new Promise(resolve => setTimeout(resolve, 50));
          if (!newTab.closed) {
            return true;
          }
        }
        
        console.warn(`⚠️ window.open foi bloqueado, tentando método alternativo...`);
        
        // Método 2: Criar link e simular clique com interação do usuário
        return new Promise((resolve) => {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.position = 'absolute';
          link.style.left = '-9999px';
          link.style.visibility = 'hidden';
          link.style.pointerEvents = 'auto';
          
          document.body.appendChild(link);
          
          // Simular clique com evento mais robusto
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 1,
            button: 0,
            buttons: 1
          });
          
          // Tentar múltiplas formas de ativação
          try {
            link.click(); // Método direto
            link.dispatchEvent(clickEvent); // Evento simulado
          } catch (e) {
            console.warn('Erro ao simular clique:', e);
          }
          
          // Limpar após um tempo maior
          setTimeout(() => {
            try {
              if (document.body.contains(link)) {
                document.body.removeChild(link);
              }
            } catch (e) {
              console.warn('Erro ao remover link:', e);
            }
            resolve(true); // Assumir sucesso para método alternativo
          }, 200);
        });
        
      } catch (error) {
        console.error(`❌ Erro ao abrir URL:`, error);
        return false;
      }
    };

    try {
      // Abrir todas as URLs sequencialmente com delay maior
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        setOpeningProgress({ current: i + 1, total: allButtons.length });
        
        if (!button?.url) {
          console.error(`❌ Botão ${i + 1} não tem URL válida:`, button);
          failCount++;
          failedUrls.push(`${button?.title || 'Desconhecido'} (URL inválida)`);
          continue;
        }

        console.log(`🔄 Abrindo URL ${i + 1}/${allButtons.length}: ${button.title} - ${button.url}`);
        
        const success = await tryOpenUrl(button.url, button.title);
        
        if (success) {
          console.log(`✅ URL ${i + 1} aberta com sucesso:`, button.url);
          successCount++;
        } else {
          console.error(`❌ Falha ao abrir URL ${i + 1}:`, button.url);
          failCount++;
          failedUrls.push(`${button.title} (${button.url})`);
        }
        
        // Delay maior entre aberturas para evitar bloqueio de pop-ups (500ms)
        if (i < allButtons.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

    } catch (error) {
      console.error('❌ Erro geral na abertura de URLs:', error);
    }

    console.log('=== RESULTADO FINAL ===');
    console.log(`✅ URLs abertas com sucesso: ${successCount}`);
    console.log(`❌ URLs que falharam: ${failCount}`);
    console.log(`📊 Total processado: ${successCount + failCount}/${allButtons.length}`);

    // Mostrar feedback ao usuário
    if (failCount > 0) {
      const message = `Abertura concluída!\n\n✅ ${successCount} URLs abertas com sucesso\n❌ ${failCount} URLs falharam\n\n${failCount > 0 ? 'URLs que falharam:\n' + failedUrls.slice(0, 5).join('\n') + (failedUrls.length > 5 ? '\n... e mais ' + (failedUrls.length - 5) + ' URLs' : '') : ''}`;
      
      if (failCount === allButtons.length) {
        alert(`❌ Nenhuma URL pôde ser aberta.\n\nIsso pode acontecer se:\n• O navegador está bloqueando pop-ups\n• As URLs são inválidas\n• Há restrições de segurança\n\nTente permitir pop-ups para este site ou abrir as URLs individualmente.`);
      } else {
        alert(message);
      }
    } else if (successCount > 0) {
      console.log(`🎉 Todas as ${successCount} URLs foram abertas com sucesso!`);
    }

    // Limpar seleção
    setSelectedButtons([]);
    setMultiSelectMode(false);
    setOpeningUrls(false);
    setOpeningProgress({ current: 0, total: 0 });
    console.log('🧹 Seleção limpa e modo multi-seleção desativado');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };


  // Função para abrir URL simples
  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openAddShortcutDialog = (groupId: string, groupTitle: string) => {
    setAddShortcutDialog({
      open: true,
      groupId,
      groupTitle
    });
  };

  const closeAddShortcutDialog = () => {
    setAddShortcutDialog({
      open: false,
      groupId: '',
      groupTitle: ''
    });
  };

  // Aplicar a ordem personalizada dos grupos
  const orderedGroups = useMemo(() => {
    if (!preferences.groupOrder || preferences.groupOrder.length === 0) {
      return groups;
    }
    
    const orderedIds = preferences.groupOrder;
    const orderedGroupsArray = orderedIds
      .map(id => groups.find(group => group.id === id))
      .filter(Boolean) as Group[];
    
    // Adicionar grupos que não estão na ordem personalizada
    const remainingGroups = groups.filter(group => !orderedIds.includes(group.id));
    
    return [...orderedGroupsArray, ...remainingGroups];
  }, [groups, preferences.groupOrder]);

  // Filtrar grupos baseado na busca
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return orderedGroups;
    
    return orderedGroups.filter(group => 
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.buttons.some(button => 
        button.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [orderedGroups, searchTerm]);

  // Buscar atalhos individuais que correspondem ao termo de busca
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    
    const results: GroupButton[] = [];
    groups.forEach(group => {
      group.buttons.forEach(button => {
        if (button.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(button);
        }
      });
    });
    return results;
  }, [groups, searchTerm]);

  // Função para adicionar todos os resultados da busca aos favoritos
  const addAllSearchResultsToFavorites = () => {
    if (searchResults.length === 0) return;
    
    const newFavoriteIds = searchResults.map(button => button.id);
    const alreadyFavorites = newFavoriteIds.filter(id => favorites.includes(id));
    const toBeAdded = newFavoriteIds.filter(id => !favorites.includes(id));
    const uniqueFavorites = [...new Set([...favorites, ...newFavoriteIds])];
    
    console.log('Adicionando todos os resultados da busca aos favoritos:', {
      searchResultsCount: searchResults.length,
      alreadyFavoritesCount: alreadyFavorites.length,
      toBeAddedCount: toBeAdded.length,
      previousFavoritesCount: favorites.length,
      newFavoritesCount: uniqueFavorites.length
    });
    
    if (toBeAdded.length === 0) {
      // Todos os resultados já são favoritos
      console.log('Todos os resultados da busca já são favoritos');
      return;
    }
    
    setFavorites(uniqueFavorites);
    updateFavoriteButtonsOrder(uniqueFavorites);
  };

  // Calcular quantos resultados da busca já são favoritos
  const searchResultsFavoriteStatus = useMemo(() => {
    if (searchResults.length === 0) return { alreadyFavorites: 0, toBeAdded: 0, allAreFavorites: false };
    
    const alreadyFavorites = searchResults.filter(button => favorites.includes(button.id)).length;
    const toBeAdded = searchResults.length - alreadyFavorites;
    const allAreFavorites = toBeAdded === 0;
    
    return { alreadyFavorites, toBeAdded, allAreFavorites };
  }, [searchResults, favorites]);

  // Criar array de botões favoritos
  const favoriteButtons = useMemo(() => {
    const allButtons: GroupButton[] = [];
    groups.forEach(group => {
      group.buttons.forEach(button => {
        if (favorites.includes(button.id)) {
          allButtons.push(button);
        }
      });
    });
    return allButtons;
  }, [groups, favorites]);

  // Estado para feedback visual de drop
  const [isOverFavorites, setIsOverFavorites] = useState(false);

  // Adicionar useDroppable para favoritos
  const { setNodeRef: setFavoritesDropRef } = useDroppable({ id: 'favorites-dropzone' });

  // Função para lidar com drag and drop entre grupos e favoritos
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag end:', { active: active.id, over: over?.id, favorites });
    
    // Drag de botão para favoritos (prioridade)
    if (over && over.id === 'favorites-dropzone') {
      const activeId = active.id.toString();
      if (!favorites.includes(activeId)) {
        // Encontrar o nome do botão para o toast
        let buttonName = 'Botão';
        groups.forEach(group => {
          const button = group.buttons.find(b => b.id === activeId);
          if (button) {
            buttonName = button.title;
          }
        });
        
        setFavorites([...favorites, activeId]);
        updateFavoriteButtonsOrder([...favorites, activeId]);
        
        // Toast de feedback
        console.log(`✨ "${buttonName}" adicionado aos favoritos!`);
      }
      setIsOverFavorites(false);
      return;
    }
    
    // Drag de reordenação de favoritos
    if (over && active.id !== over.id && favorites.includes(active.id.toString())) {
      console.log('Tentando reordenar favoritos');
      const activeId = active.id.toString();
      const overId = over.id.toString();
      const activeIndex = favorites.findIndex(id => id === activeId);
      const overIndex = favorites.findIndex(id => id === overId);
      console.log('Índices:', { activeIndex, overIndex });
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrder = arrayMove(favorites, activeIndex, overIndex);
        console.log('Nova ordem:', newOrder);
        setFavorites(newOrder);
        updateFavoriteButtonsOrder(newOrder);
      }
      return;
    }
    
    // Drag de grupos (mantém funcionalidade existente)
    if (over && active.id !== over.id && filteredGroups.some(g => g.id === active.id)) {
      const activeIndex = orderedGroups.findIndex(group => group.id === active.id);
      const overIndex = orderedGroups.findIndex(group => group.id === over.id);
      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrder = arrayMove(orderedGroups, activeIndex, overIndex);
        const newOrderIds = newOrder.map(group => group.id);
        updateGroupOrder(newOrderIds);
      }
      return;
    }
    
    setIsOverFavorites(false);
  };

  // Função para lidar com drag over na área de favoritos
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over && over.id === 'favorites-dropzone') {
      setIsOverFavorites(true);
    } else {
      setIsOverFavorites(false);
    }
  };



  const toggleShowOnlyFavorites = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
    if (!showOnlyFavorites) {
      // Quando mostrar apenas favoritos, fechar todos os grupos normais
      setOpenGroups({});
    }
  };

  const collapseAllGroups = () => {
    setOpenGroups({});
  };

  const expandAllGroups = () => {
    const allOpen: Record<string, boolean> = {};
    filteredGroups.forEach(group => {
      allOpen[group.id] = true;
    });
    setOpenGroups(allOpen);
  };

  const isLoading = preferencesLoading || groupsLoading || shortcutsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600">Carregando atalhos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ordena os botões favoritos conforme a ordem do array de ids 'favorites'
  const favoriteButtonsOrdered = favorites
    .map(id => favoriteButtons.find(btn => btn.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f8f5e4] dark:bg-[#23201a] p-2 dark:text-[#bfae7c]">
      {/* Background decorative elements with pastel tones */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-pastel-purple rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-pastel-pink rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-pastel-blue rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-20 left-20 w-60 h-60 bg-gradient-pastel-green rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-pastel-orange rounded-full blur-3xl opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <PageHeader title="Atalhos PJe" />
        
        {/* Controles de Accordion */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-[#23201a]/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-blue-100 dark:border-[#3a3320]">
            <Button
              onClick={expandAllGroups}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-success/10 dark:bg-[#2d2717] border-success/20 dark:border-[#bfae7c]/30 text-success dark:text-[#bfae7c] hover:bg-success/20 dark:hover:bg-[#28231a] hover:border-success/40 dark:hover:border-[#bfae7c]/50"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Expandir Todos
            </Button>
            <Button
              onClick={collapseAllGroups}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-destructive/10 dark:bg-[#2d2717] border-destructive/20 dark:border-[#bfae7c]/30 text-destructive dark:text-[#bfae7c] hover:bg-destructive/20 dark:hover:bg-[#28231a] hover:border-destructive/40 dark:hover:border-[#bfae7c]/50"
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Colapsar Todos
            </Button>
            <Button
              onClick={toggleShowOnlyFavorites}
              variant="outline"
              size="sm"
              className={`h-8 px-3 text-xs ${
                showOnlyFavorites 
                  ? 'bg-warning dark:bg-[#bfae7c]/20 text-warning-foreground dark:text-[#f8f5e4] border-warning dark:border-[#bfae7c]/40' 
                  : 'bg-muted dark:bg-[#2d2717] text-muted-foreground dark:text-[#bfae7c] border-border dark:border-[#3a3320] hover:bg-accent dark:hover:bg-[#28231a] hover:text-accent-foreground dark:hover:text-[#f8f5e4]'
              }`}
            >
              <Star className={`h-4 w-4 mr-1 ${showOnlyFavorites ? 'fill-warning-foreground dark:fill-[#f8f5e4] text-warning-foreground dark:text-[#f8f5e4]' : ''}`} />
              {showOnlyFavorites ? 'Mostrar Todos' : 'Só Favoritos'}
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-[#bfae7c] h-5 w-5" />
            <Input
              placeholder="Buscar atalhos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg border-2 border-primary/20 dark:border-[#bfae7c]/30 focus:border-primary/40 dark:focus:border-[#bfae7c]/50 bg-white/80 dark:bg-[#23201a]/80 backdrop-blur-sm shadow-lg rounded-xl dark:text-[#f8f5e4] dark:placeholder-[#bfae7c]"
            />
          </div>
        </div>

        {/* Controles globais de seleção múltipla */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-[#23201a]/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-blue-100 dark:border-[#3a3320]">
            {multiSelectMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Selecionar todos os botões visíveis
                    const allVisibleButtons: string[] = [];
                    if (showOnlyFavorites) {
                      allVisibleButtons.push(...favorites);
                    } else {
                      filteredGroups.forEach(group => {
                        group.buttons.forEach(button => {
                          allVisibleButtons.push(button.id);
                        });
                      });
                      if (searchTerm) {
                        searchResults.forEach(button => {
                          if (!allVisibleButtons.includes(button.id)) {
                            allVisibleButtons.push(button.id);
                          }
                        });
                      }
                    }
                    setSelectedButtons(allVisibleButtons);
                  }}
                  className="h-8 px-3 text-xs bg-blue-50 dark:bg-[#2d2717] border-blue-200 dark:border-[#bfae7c]/30 text-blue-700 dark:text-[#bfae7c] hover:bg-blue-100 dark:hover:bg-[#28231a]"
                >
                  Selecionar Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  className="h-8 px-3 text-xs bg-gray-50 dark:bg-[#2d2717] border-gray-200 dark:border-[#bfae7c]/30 text-gray-700 dark:text-[#bfae7c] hover:bg-gray-100 dark:hover:bg-[#28231a]"
                >
                  Limpar
                </Button>
                {selectedButtons.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      console.log('Botão "Abrir Selecionados" clicado');
                      console.log('Botões selecionados:', selectedButtons);
                      openSelectedUrls();
                    }}
                    disabled={openingUrls}
                    className={`h-8 px-3 text-xs text-white ${
                      openingUrls 
                        ? 'bg-blue-600 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 animate-pulse'
                    }`}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {openingUrls 
                      ? `Abrindo ${openingProgress.current}/${openingProgress.total}...` 
                      : `Abrir ${selectedButtons.length} Selecionado${selectedButtons.length > 1 ? 's' : ''}`
                    }
                  </Button>
                )}
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={toggleMultiSelectMode}
              className={`h-8 px-3 text-xs ${
                multiSelectMode 
                  ? 'bg-orange-50 dark:bg-[#bfae7c]/20 text-orange-700 dark:text-[#f8f5e4] border-orange-200 dark:border-[#bfae7c]/40' 
                  : 'bg-blue-50 dark:bg-[#2d2717] text-blue-700 dark:text-[#bfae7c] border-blue-200 dark:border-[#bfae7c]/30 hover:bg-blue-100 dark:hover:bg-[#28231a]'
              }`}
            >
              {multiSelectMode ? `Cancelar (${selectedButtons.length} selecionados)` : 'Seleção Múltipla'}
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Seção de Resultados de Busca - mostra quando há termo de busca */}
          {searchTerm && searchResults.length > 0 && (
            <Card className="mb-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-[#23201a] dark:via-[#2d2717] dark:to-[#181511] border-2 border-green-200 dark:border-[#3a3320] shadow-xl animate-fade-in">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-[#2d2717] dark:to-[#28231a]">
                <CardTitle className="flex items-center justify-between text-green-900 dark:text-[#f8f5e4]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-[#bfae7c] dark:to-[#7c6a3c] rounded-lg shadow-lg">
                      <Search className="h-6 w-6 text-white dark:text-[#23201a]" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Resultados da Busca</span>
                      <p className="text-sm text-green-700 dark:text-[#bfae7c] font-normal">
                         {searchResults.length} atalho{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''} para "{searchTerm}"
                         {searchResultsFavoriteStatus.alreadyFavorites > 0 && (
                           <span className="ml-2 text-pink-600 dark:text-[#bfae7c]">
                             • {searchResultsFavoriteStatus.alreadyFavorites} já {searchResultsFavoriteStatus.alreadyFavorites === 1 ? 'é favorito' : 'são favoritos'}
                           </span>
                         )}
                       </p>
                    </div>
                  </div>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={addAllSearchResultsToFavorites}
                     disabled={searchResultsFavoriteStatus.allAreFavorites}
                     className={`transition-all duration-200 shadow-md hover:shadow-lg ${
                       searchResultsFavoriteStatus.allAreFavorites
                         ? 'bg-gray-100 dark:bg-[#2d2717] border-gray-300 dark:border-[#bfae7c]/20 text-gray-500 dark:text-[#bfae7c]/50 cursor-not-allowed'
                         : 'bg-pink-50 dark:bg-[#2d2717] border-pink-200 dark:border-[#bfae7c]/30 text-pink-700 dark:text-[#bfae7c] hover:bg-pink-100 dark:hover:bg-[#28231a]'
                     }`}
                     title={searchResultsFavoriteStatus.allAreFavorites 
                       ? 'Todos os resultados já são favoritos' 
                       : `Adicionar ${searchResultsFavoriteStatus.toBeAdded} atalho${searchResultsFavoriteStatus.toBeAdded > 1 ? 's' : ''} aos favoritos`
                     }
                   >
                     <Heart className={`h-4 w-4 mr-2 ${
                       searchResultsFavoriteStatus.allAreFavorites 
                         ? 'fill-gray-400 dark:fill-[#bfae7c]/50' 
                         : 'fill-pink-400 dark:fill-[#bfae7c]'
                     }`} />
                     {searchResultsFavoriteStatus.allAreFavorites 
                       ? 'Todos já são Favoritos'
                       : `Adicionar ${searchResultsFavoriteStatus.toBeAdded} aos Favoritos`
                     }
                   </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {searchResults.map((button, index) => (
                    <div 
                      key={button.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ShortcutButton
                        id={button.id}
                        icon={button.icon}
                        title={button.title}
                        url={button.url}
                        favorites={favorites}
                        onToggleFavorite={toggleFavoriteButton}
                        onOpenUrl={openUrl}
                        multiSelectMode={multiSelectMode}
                        isSelected={selectedButtons.includes(button.id)}
                        onToggleSelection={toggleButtonSelection}

                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DndContext único para gerenciar todos os drags */}
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            {/* Seção de Favoritos - só mostra se tiver favoritos OU se estiver no modo "só favoritos" */}
            {(favoriteButtons.length > 0 || showOnlyFavorites) && (
              <div ref={setFavoritesDropRef}>
                <FavoriteDropZone isOver={isOverFavorites}>
                                  <Card className="mb-8 bg-gradient-card dark:bg-[#23201a] border-2 border-border dark:border-[#3a3320] shadow-xl animate-fade-in">
                  <CardHeader className="pb-4 bg-gradient-accent dark:bg-[#2d2717]">
                    <CardTitle className="flex items-center justify-between text-foreground dark:text-[#f8f5e4]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-[#bfae7c] dark:to-[#7c6a3c] rounded-lg shadow-lg">
                          <Star className="h-6 w-6 fill-white dark:fill-[#23201a] text-white dark:text-[#23201a]" />
                        </div>
                        <div>
                          <span className="text-xl font-bold">Favoritos</span>
                          <p className="text-sm text-muted-foreground dark:text-[#bfae7c] font-normal">
                            {favoriteButtons.length > 0 
                              ? `${favoriteButtons.length} atalhos preferidos • Arraste para reordenar` 
                              : 'Arraste atalhos aqui para adicionar aos favoritos'}
                          </p>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                    {favoriteButtons.length > 0 && (
                      <CardContent className="pt-6">
                        <SortableContext 
                          items={favorites}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                            {favoriteButtonsOrdered.map((button, index) => (
                              <SortableItem
                              key={button.id}
                              button={button}
                              onToggleFavorite={toggleFavoriteButton}
                              onOpenUrl={openUrl}
                              className="animate-fade-in"
                              style={{ animationDelay: `${index * 100}ms` }}
                              multiSelectMode={multiSelectMode}
                              isSelected={selectedButtons.includes(button.id)}
                              onToggleSelection={toggleButtonSelection}

                            />
                            ))}
                          </div>
                        </SortableContext>
                      </CardContent>
                    )}
                  </Card>
                </FavoriteDropZone>
              </div>
            )}

            {/* Grupos de Atalhos - esconde se estiver no modo "só favoritos" */}
            {!showOnlyFavorites && (
              <>
                {filteredGroups.length === 0 ? (
                  <Card className="dark:bg-[#23201a] dark:border-[#3a3320]">
                    <CardContent className="p-12 text-center dark:bg-[#23201a]">
                      <Search className="h-16 w-16 text-muted-foreground dark:text-[#bfae7c] mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-muted-foreground dark:text-[#f8f5e4] mb-2">
                        Nenhum resultado encontrado
                      </h3>
                      <p className="text-muted-foreground dark:text-[#bfae7c]">
                        Tente ajustar os termos da sua busca
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <SortableContext 
                    items={filteredGroups}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredGroups.map((group) => (
                        <SortableGroup 
                          key={group.id} 
                          group={group}
                          openGroups={openGroups}
                          favorites={favorites}
                          isAdmin={isAdmin || false}
                          onToggleGroup={toggleGroup}
                          onToggleFavoriteButton={toggleFavoriteButton}
                          onOpenUrl={openUrl}
                          onAddShortcut={openAddShortcutDialog}
                          multiSelectMode={multiSelectMode}
                          selectedButtons={selectedButtons}
                          onToggleSelection={toggleButtonSelection}

                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </>
            )}
          </DndContext>
        </div>

        {/* Dialog para adicionar atalho */}
        <AddShortcutDialog
          isOpen={addShortcutDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              closeAddShortcutDialog();
            }
          }}
          groupId={addShortcutDialog.groupId}
          groupTitle={addShortcutDialog.groupTitle}
        />



        {/* Footer */}
        <footer className="mt-8 text-center text-sm bg-[#f8f5e4] dark:bg-[#181511] border-t border-[#e2d8b8] dark:border-t-[#3a3320] py-4 dark:text-[#bfae7c]">
          <p className="text-sm text-muted-foreground dark:text-[#bfae7c] mb-2">
            © 2025 TRT15 - Núcleo de Apoio ao PJe | Central de Atalhos
          </p>
          <p className="text-sm text-muted-foreground dark:text-[#bfae7c]">
            Desenvolvido por{' '}
            <a 
              href="https://msribeiro2010.github.io/marcelo-s-ribeiro-stellar-ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary dark:text-[#f8f5e4] hover:underline font-medium"
            >
              msribeiro
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Atalhos;
