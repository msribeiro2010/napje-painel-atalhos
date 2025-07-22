import { useState, useMemo, useEffect } from 'react';
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
  User, UserPlus, FileBarChart as FileEarmarkText, Globe as Globe2, CreditCard as Bank2, GripVertical, Heart, Trash2
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
                  bg-white/90 backdrop-blur-sm 
                  hover:shadow-xl shadow-md 
                  border border-gray-200
                  rounded-2xl min-h-[160px] flex flex-col justify-between`}
    >
      <Collapsible
        open={openGroups[group.id] || false}
        onOpenChange={() => onToggleGroup(group.id)}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-all duration-300 group p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-blue-600" />
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <group.icon className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">{group.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold">{group.buttons.length} atalhos</span>
              <Button size="icon" variant="outline" className="ml-2 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 border-blue-200 hover:bg-blue-50" title="Adicionar atalho" type="button" tabIndex={-1} onClick={e => e.stopPropagation()}>
                +
              </Button>
              <div className="p-2 bg-gray-100 rounded-lg">
                {openGroups[group.id] ? (
                  <ChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-accordion-down">
          <CardContent className="pt-0 pb-6">
            <div className="grid grid-cols-1 gap-4">
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
  // Função para excluir o favorito
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(button.id); // Remove dos favoritos
  };
  return (
    <div ref={setNodeRef} style={mergedStyle} className={className + ' group'} {...attributes} {...listeners}>
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
      {/* Botão de desfavoritar com coração */}
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
      {/* Botão de excluir atalho dos favoritos */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -top-3 -left-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 
                   transition-all duration-300 bg-gradient-to-br from-gray-400 to-gray-600 
                   hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl 
                   border-2 border-white rounded-full z-10
                   hover:scale-110 transform-gpu cursor-pointer"
        onClick={handleDelete}
        title="Excluir atalho dos Favoritos"
      >
        <Trash2 className="h-5 w-5 text-white transition-all duration-200" />
      </Button>
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
  const { preferences, loading, updateGroupOrder, toggleFavoriteGroup, toggleFavoriteButton, updateFavoriteButtonsOrder } = useShortcutsPreferences();

  // Carregar favoritos salvos das preferências
  useEffect(() => {
    if (!loading && preferences.favoriteButtons) {
      setFavorites(preferences.favoriteButtons);
    }
  }, [preferences.favoriteButtons, loading]);

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

  const groups: Group[] = [
    {
      id: 'planilha-presencial',
      title: 'Presencial/Plantão/Férias',
      icon: CalendarCheck,
      buttons: [
        {
          id: 'painel-controle',
          title: 'Painel/Controle NAPJe',
          url: 'https://script.google.com/a/macros/trt15.jus.br/s/AKfycbzucXdGYLOxqBol7ri-eyT3fzXuWMdqvgnVkRuVVlV7/dev',
          icon: Calendar
        },
        {
          id: 'gerenciador-ferias',
          title: 'GERENCIADOR DE FÉRIAS',
          url: 'https://msribeiro2010.github.io/controle-ferias/',
          icon: CalendarCheck
        }
      ]
    },
    {
      id: 'consulta-documentos',
      title: 'Consulta CPF/OAB/CNPJ',
      icon: Search,
      buttons: [
        {
          id: 'cnpj',
          title: 'CNPJ',
          url: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp',
          icon: Building
        },
        {
          id: 'cpf',
          title: 'CPF',
          url: 'https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp',
          icon: User
        },
        {
          id: 'oab',
          title: 'OAB',
          url: 'https://www2.oabsp.org.br/asp/consultaInscritos/consulta01.asp',
          icon: Bank
        }
      ]
    },
    {
      id: 'google-apps',
      title: 'Google Apps',
      icon: Globe,
      buttons: [
        {
          id: 'gmail',
          title: 'Gmail',
          url: 'https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F',
          icon: Mail
        },
        {
          id: 'drive',
          title: 'Drive',
          url: 'https://drive.google.com/drive/my-drive?hl=pt-br',
          icon: Database
        },
        {
          id: 'sheets',
          title: 'Sheets',
          url: 'https://docs.google.com/spreadsheets/u/0/?tgif=d',
          icon: FileText
        },
        {
          id: 'docs',
          title: 'Docs',
          url: 'https://docs.google.com/document/u/0/?tgif=d',
          icon: FileText
        }
      ]
    },
    {
      id: 'assyst-pje',
      title: 'Assyst-PJe',
      icon: Headset,
      buttons: [
        {
          id: 'assystweb',
          title: 'AssystWeb',
          url: 'https://centraldetic.trt15.jus.br/assystweb/application.do',
          icon: Headset
        },
        {
          id: 'assyst-atribuidos',
          title: 'Assyst-Atribuidos p/mim',
          url: 'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=423&queryProfileForm.columnProfileId=67',
          icon: Users
        },
        {
          id: 'assyst-abertos',
          title: 'Assyst-Abertos',
          url: 'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch%2FEventSearchDelegatingDispatchAction.do?dispatch=loadQuery&showInMonitor=true&context=select&queryProfileForm.queryProfileId=996&queryProfileForm.columnProfileId=67',
          icon: FileText
        },
        {
          id: 'assyst-consulta',
          title: 'Assyst-Consulta',
          url: 'https://assyst.trt15.jus.br/assystweb/application.do#eventsearch',
          icon: Search
        },
        {
          id: 'assystnet',
          title: 'AssystNet',
          url: 'https://chatbot.trt15.jus.br/lhc/home.php',
          icon: Bot
        },
        {
          id: 'banco-conhecimento',
          title: 'Banco de Conhecimento',
          url: 'https://drive.google.com/file/d/1-6R-ZzSC3dSTGXh9NZLWeP25CY8MZ9DG/view?ths=true',
          icon: FileText
        }
      ]
    },
    {
      id: 'atendimento-externo',
      title: '(0800) e Tawk.to',
      icon: Phone,
      buttons: [
        {
          id: 'registros-atend',
          title: '(0800)Registros/Atend.',
          url: 'https://script.google.com/a/macros/trt15.jus.br/s/AKfycbyZc3lywRgqNftHWdbBkCTYWEChxDk5OI6ijUD3XlsUBWgGulwzJIJpfdim-XRJ_NQ8/exec',
          icon: FileText
        },
        {
          id: 'planilha-atend',
          title: 'Planilha/Atend.Telefônicos',
          url: 'https://docs.google.com/spreadsheets/d/10_eaPcU5vmbOZBjvCKajOhvwssh_GkvaVjoKSeeSgcA/edit?gid=1098454302#gid=1098454302',
          icon: FileText
        },
        {
          id: 'pje-suporte',
          title: 'PJe-Suporte',
          url: 'https://trt15.jus.br/pje/suporte-ao-pje',
          icon: Headset
        },
        {
          id: 'tawk-to',
          title: 'Tawk.to',
          url: 'https://dashboard.tawk.to/login',
          icon: Bot
        },
        {
          id: 'emails-diarios',
          title: 'E-mails Diários',
          url: 'https://docs.google.com/spreadsheets/d/1g7pme1VNFhffy2zdbCyRfvdpNFqLjRku8hObrOwqXNY/edit?pli=1&gid=1693944372#gid=1693944372',
          icon: Mail
        },
        {
          id: 'emails-dinamicos',
          title: 'Emails Dinâmicos',
          url: 'https://docs.google.com/spreadsheets/d/1NXxxSjHc04X919BT741lZ1H0Bqs0kHrFVc8nuWFjqNY/edit?gid=1824743735',
          icon: Mail
        }
      ]
    },
    {
      id: 'info-funcionais',
      title: 'Relatórios de Distribuição',
      icon: FileText,
      buttons: [
        {
          id: 'relatorios-distribuicao',
          title: 'Relatórios de Distribuição',
          url: 'https://trt15.jus.br/intranet/sec-geral-judiciaria/relatorio-distribuicao',
          icon: FileText
        }
      ]
    },
    {
      id: 'info-holerite',
      title: 'Contra-Cheque/SISAD...',
      icon: Cash,
      buttons: [
        {
          id: 'contracheque',
          title: 'Contracheque',
          url: 'https://autoatendimento.trt15.jus.br/consultainformacoesfuncionais/contracheque',
          icon: Cash
        },
        {
          id: 'requerimentos',
          title: 'Requerimentos',
          url: 'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/selecaorequerimentosel?fwPlc=fazerrequerimentoman',
          icon: FileText
        },
        {
          id: 'sisad',
          title: 'SISAD',
          url: 'https://sisad.jt.jus.br/portal-nacional',
          icon: User
        },
        {
          id: 'sigep',
          title: 'SIGEP/ARTEMIS/SIGS',
          url: 'https://sisad.jt.jus.br/portal-programa/1',
          icon: Users
        },
        {
          id: 'sigeo',
          title: 'SIGEO/DIÁRIAS',
          url: 'https://portal.sigeo.jt.jus.br/portal/0',
          icon: Cash
        }
      ]
    },
    {
      id: 'trabalho-plantao',
      title: 'Requerimentos NAPJe',
      icon: CalendarCheck,
      buttons: [
        {
          id: 'averbacao-plantao',
          title: 'Averbação Trabalho no Plantão',
          url: 'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/fazerrequerimentoman?chPlc=89',
          icon: CalendarCheck
        },
        {
          id: 'solicitar-folga',
          title: 'Solicitar Folga',
          url: 'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/fazerrequerimentoman?chPlc=30411',
          icon: Calendar
        },
        {
          id: 'requerimento-ferias',
          title: 'Requerimento de Férias',
          url: 'https://autoatendimento.trt15.jus.br/autoatendimentoexterno/f/t/feriasperiodoman?chPlc=157',
          icon: CalendarCheck
        }
      ]
    },
    {
      id: 'pje-producao',
      title: 'PJe-Produção',
      icon: Building2,
      buttons: [
        {
          id: 'pje-1-grau-prod',
          title: 'PJe 1º Grau - Produção',
          url: 'https://pje.trt15.jus.br/primeirograu/login.seam',
          icon: Building2
        },
        {
          id: 'pje-2-grau-prod',
          title: 'PJe 2º Grau - Produção',
          url: 'https://pje.trt15.jus.br/segundograu/login.seam',
          icon: Building2
        }
      ]
    },
    {
      id: 'pje-incidentes',
      title: 'PJe-Incidentes',
      icon: Bug,
      buttons: [
        {
          id: 'pje-1-grau-inc',
          title: 'PJe 1º Grau - Incidentes',
          url: 'https://pje-incidentes.trt15.jus.br/primeirograu/login.seam',
          icon: Bug
        },
        {
          id: 'pje-2-grau-inc',
          title: 'PJe 2º Grau - Incidentes',
          url: 'https://pje-incidentes.trt15.jus.br/segundograu/login.seam',
          icon: Bug
        }
      ]
    },
    {
      id: 'pje-homologacao',
      title: 'PJe-Homologação',
      icon: CheckCircle,
      buttons: [
        {
          id: 'pje-1-grau-hom',
          title: 'PJe 1º Grau - Homolog.',
          url: 'https://pje-homologacao.trt15.jus.br/primeirograu/login.seam',
          icon: CheckCircle
        },
        {
          id: 'pje-2-grau-hom',
          title: 'PJe 2º Grau - Homolog.',
          url: 'https://pje-homologacao.trt15.jus.br/segundograu/login.seam',
          icon: CheckCircle
        }
      ]
    },
    {
      id: 'pje-treino',
      title: 'PJe-Treino',
      icon: PersonStanding,
      buttons: [
        {
          id: 'pje-1-grau-treino',
          title: 'PJe 1º Grau - Treino',
          url: 'https://pje-treino.trt15.jus.br/primeirograu/login.seam',
          icon: PersonStanding
        },
        {
          id: 'pje-2-grau-treino',
          title: 'PJe 2º Grau - Treino',
          url: 'https://pje-treino.trt15.jus.br/segundograu/login.seam',
          icon: PersonStanding
        }
      ]
    },
    {
      id: 'sistemas-administrativos',
      title: 'Sistemas Administrativos',
      icon: Diagram3,
      buttons: [
        {
          id: 'sei',
          title: 'SEI',
          url: 'https://sei.trt15.jus.br/sei/',
          icon: FileText
        },
        {
          id: 'compras',
          title: 'Compras',
          url: 'https://compras.trt15.jus.br/',
          icon: Bank2
        },
        {
          id: 'portal-corporativo',
          title: 'Portal Corporativo',
          url: 'https://corporativo.trt15.jus.br/',
          icon: Globe2
        },
        {
          id: 'intranet',
          title: 'Intranet',
          url: 'https://intranet.trt15.jus.br/',
          icon: Globe
        }
      ]
    },
    {
      id: 'acesso-outros',
      title: 'Acesso a Outros Sistemas',
      icon: Shield,
      buttons: [
        {
          id: 'citrix',
          title: 'Citrix',
          url: 'https://ctxvirtualdesktop.trt15.jus.br/',
          icon: Shield
        },
        {
          id: 'terminal-server',
          title: 'Terminal Server',
          url: 'https://ts.trt15.jus.br/ts',
          icon: Shield
        }
      ]
    },
    {
      id: 'utilitarios',
      title: 'Utilitários',
      icon: QuestionCircle,
      buttons: [
        {
          id: 'calculadora-trabalhista',
          title: 'Calculadora Trabalhista',
          url: 'https://www3.tst.jus.br/Ssind/Calculo',
          icon: Cash
        },
        {
          id: 'caged',
          title: 'CAGED',
          url: 'https://caged.mte.gov.br/portalcaged/paginas/home/home.xhtml',
          icon: FileEarmarkText
        },
        {
          id: 'rais',
          title: 'RAIS',
          url: 'https://www.rais.gov.br/sitio/index.jsf',
          icon: FileEarmarkText
        },
        {
          id: 'cnis',
          title: 'CNIS',
          url: 'https://www3.dataprev.gov.br/CNIS/',
          icon: FileEarmarkText
        }
      ]
    }
  ];

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

  if (loading) {
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
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
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