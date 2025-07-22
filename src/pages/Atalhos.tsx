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
  User, UserPlus, FileBarChart as FileEarmarkText, Globe as Globe2, CreditCard as Bank2, GripVertical, Heart
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useShortcutsPreferences } from '@/hooks/useShortcutsPreferences';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  icon: any;
}

interface Group {
  id: string;
  title: string;
  icon: any;
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
const getIconComponent = (iconString: string) => {
  const iconMap: Record<string, any> = {
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
  onOpenUrl
}: { 
  icon: any, 
  title: string, 
  url: string, 
  id: string,
  favorites: string[],
  onToggleFavorite: (id: string) => void,
  onOpenUrl: (url: string) => void
}) => (
  <div className="relative group animate-fade-in h-full">
    <Button
      variant="outline"
      className="w-full h-28 p-5 flex flex-col items-center justify-center gap-3 
                 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 hover:from-blue-100 hover:to-purple-100
                 border-2 border-blue-200/60 hover:border-blue-300/80
                 shadow-lg hover:shadow-2xl
                 transition-all duration-300 ease-out
                 hover:scale-105 hover:-translate-y-1
                 rounded-2xl group"
      onClick={() => onOpenUrl(url)}
    >
      <div className="flex flex-col items-center justify-center gap-2 h-full w-full">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 
                        group-hover:from-indigo-500 group-hover:to-purple-500
                        shadow-lg transition-all duration-300 flex-shrink-0">
          <Icon className="h-6 w-6 text-white group-hover:text-yellow-200" />
        </div>
        <span className="text-base text-center leading-tight font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors line-clamp-2 flex-1 flex items-center justify-center w-full">
          {title}
        </span>
      </div>
    </Button>
    {/* Botão de favorito com ícone de coração, sem estrela */}
    <Button
      variant="ghost"
      size="sm"
      className="absolute -top-2 -right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 
                 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-xl 
                 border border-pink-200 hover:border-pink-400 rounded-full
                 hover:scale-110"
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(id);
      }}
    >
      <Heart 
        className={`h-5 w-5 transition-all duration-200 ${
          favorites.includes(id) 
            ? 'fill-pink-400 text-pink-400 scale-110' 
            : 'text-gray-300 hover:text-pink-400'
        }`}
      />
    </Button>
  </div>
);

// Componente SortableGroup
interface SortableGroupProps {
  group: Group;
  isFavorite: boolean;
  openGroups: Record<string, boolean>;
  favorites: string[];
  onToggleGroup: (groupId: string) => void;
  onToggleFavoriteGroup: (groupId: string) => void;
  onToggleFavoriteButton: (buttonId: string) => void;
  onOpenUrl: (url: string) => void;
}

// Refatoração visual dos grupos de atalhos
const SortableGroup = ({ 
  group, 
  openGroups, 
  favorites, 
  onToggleGroup, 
  onToggleFavoriteButton, 
  onOpenUrl 
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
                  bg-[#f8f5e4] dark:bg-[#23201a] border border-[#e2d8b8] dark:border-[#3a3320] shadow-sm
                  rounded-xl min-h-[80px] flex flex-col justify-between px-3 py-2 my-2`}
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
              <Button size="icon" variant="outline" className="ml-1 rounded-full w-7 h-7 flex items-center justify-center text-[#bfae7c] dark:text-[#bfae7c] border-[#e2d8b8] dark:border-[#3a3320] hover:bg-[#f8f5e4] dark:hover:bg-[#2d2717]" title="Adicionar atalho" type="button" tabIndex={-1} onClick={e => e.stopPropagation()}>
                +
              </Button>
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
  style 
}: { 
  button: GroupButton,
  onToggleFavorite: (id: string) => void,
  onOpenUrl: (url: string) => void,
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: button.id });
  const mergedStyle = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 99 : undefined,
  };
  return (
    <div ref={setNodeRef} style={mergedStyle} className={(className || '') + ' group relative'} {...attributes} {...listeners}>
      <Button
        variant="outline"
        className="w-full h-28 p-5 flex flex-col items-center justify-center gap-3 
                   bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 
                   hover:from-yellow-100 hover:to-orange-100
                   border-2 border-yellow-300/40 hover:border-yellow-400/60
                   shadow-lg hover:shadow-2xl
                   transition-all duration-500 ease-out
                   hover:scale-[1.03] hover:-translate-y-1
                   rounded-2xl relative overflow-hidden
                   text-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onOpenUrl(button.url);
        }}
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 
                        group-hover:from-yellow-500 group-hover:to-orange-600
                        shadow-lg group-hover:shadow-xl transition-all duration-300 ">
          <button.icon className="h-6 w-6 text-white group-hover:text-yellow-200" />
        </div>
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100 
                       group-hover:text-amber-900 dark:group-hover:text-amber-100 
                       transition-colors duration-300 line-clamp-2 leading-tight w-full">
          {button.title}
        </span>
      </Button>
      {/* Botão de ação: só aparece no hover do card e nunca durante o drag */}
      {!isDragging && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-3 -right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 
                     transition-all duration-300 bg-gradient-to-br from-red-500 to-pink-600 
                     hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl 
                     border-2 border-white rounded-full z-10
                     hover:scale-110 transform-gpu cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(button.id);
          }}
          title="Remover dos Favoritos"
        >
          <Heart className="h-5 w-5 fill-white text-white transition-all duration-200" />
        </Button>
      )}
    </div>
  );
};

// Adicionar área de drop para favoritos
const FavoriteDropZone = ({ children, isOver }: { children: React.ReactNode, isOver: boolean }) => (
  <div className={`transition-all duration-300 rounded-2xl ${isOver ? 'ring-4 ring-pink-300 bg-pink-50/60' : ''}`}>
    {children}
  </div>
);

const Atalhos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const { preferences, loading: preferencesLoading, updateGroupOrder, toggleFavoriteGroup, toggleFavoriteButton, updateFavoriteButtonsOrder } = useShortcutsPreferences();
  const queryClient = useQueryClient();

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
    }
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
    }
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


  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
  }, [preferences.groupOrder]);

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
  }, [searchTerm]);

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
  }, [favorites]);

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
      if (!favorites.includes(active.id)) {
        setFavorites([...favorites, active.id]);
        updateFavoriteButtonsOrder([...favorites, active.id]);
      }
      setIsOverFavorites(false);
      return;
    }
    
    // Drag de reordenação de favoritos
    if (over && active.id !== over.id && favorites.includes(active.id)) {
      console.log('Tentando reordenar favoritos');
      const activeIndex = favorites.findIndex(id => id === active.id);
      const overIndex = favorites.findIndex(id => id === over.id);
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
  const handleDragOver = (event: any) => {
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
        <PageHeader title="Atalhos NAPJe" />
        
        {/* Controles de Accordion */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-blue-100">
            <Button
              onClick={expandAllGroups}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-success/10 border-success/20 text-success hover:bg-success/20 hover:border-success/40"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Expandir Todos
            </Button>
            <Button
              onClick={collapseAllGroups}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20 hover:border-destructive/40"
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
                  ? 'bg-warning text-warning-foreground border-warning' 
                  : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Star className={`h-4 w-4 mr-1 ${showOnlyFavorites ? 'fill-warning-foreground text-warning-foreground' : ''}`} />
              {showOnlyFavorites ? 'Mostrar Todos' : 'Só Favoritos'}
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar atalhos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg border-2 border-primary/20 focus:border-primary/40 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Seção de Resultados de Busca - mostra quando há termo de busca */}
          {searchTerm && searchResults.length > 0 && (
            <Card className="mb-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-xl animate-fade-in">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-100 to-emerald-100">
                <CardTitle className="flex items-center gap-3 text-green-900">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Resultados da Busca</span>
                    <p className="text-sm text-green-700 font-normal">
                      {searchResults.length} atalho{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''} para "{searchTerm}"
                    </p>
                  </div>
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
                  <Card className="mb-8 bg-gradient-card border-2 border-border shadow-xl animate-fade-in">
                    <CardHeader className="pb-4 bg-gradient-accent">
                      <CardTitle className="flex items-center gap-3 text-foreground">
                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-lg">
                          <Star className="h-6 w-6 fill-white text-white" />
                        </div>
                        <div>
                          <span className="text-xl font-bold">Favoritos</span>
                          <p className="text-sm text-muted-foreground font-normal">
                            {favoriteButtons.length > 0 ? 'Seus atalhos preferidos' : 'Nenhum favorito selecionado'}
                          </p>
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
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                        Nenhum resultado encontrado
                      </h3>
                      <p className="text-muted-foreground">
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
                          isFavorite={preferences.favoriteGroups?.includes(group.id) || false}
                          openGroups={openGroups}
                          favorites={favorites}
                          onToggleGroup={toggleGroup}
                          onToggleFavoriteGroup={toggleFavoriteGroup}
                          onToggleFavoriteButton={toggleFavoriteButton}
                          onOpenUrl={openUrl}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </>
            )}
          </DndContext>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Card className="bg-white/60 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                © 2025 TRT15 - Núcleo de Apoio ao PJe | Central de Atalhos
              </p>
              <p className="text-sm text-muted-foreground">
                Desenvolvido por{' '}
                <a 
                  href="https://msribeiro2010.github.io/marcelo-s-ribeiro-stellar-ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  msribeiro
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Atalhos;
