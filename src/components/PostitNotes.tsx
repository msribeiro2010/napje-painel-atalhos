import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical, X, Plus, Edit3, Save, XCircle, StickyNote, Sparkles, Trash2, Palette, Maximize2, Minimize2, Move, Grid3X3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type PostitNote = Tables<'postit_notes'>;

interface SortablePostitProps {
  note: PostitNote;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onEnhance: (id: string, text: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onColorChange: (id: string, color: string) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

const SortablePostit = ({
  note,
  onEdit,
  onDelete,
  onEnhance,
  onPositionChange,
  onColorChange,
  onSizeChange,
  isDragging,
  onDragStart,
  onDragEnd
}: SortablePostitProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [localDragging, setLocalDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'width' | 'height' | 'both' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);
  const lastMouseEvent = useRef<MouseEvent | null>(null);

  // Tamanhos padrão e expandidos
  const defaultSize = { width: 288, height: 208 }; // w-72 h-52
  const expandedSize = { width: 400, height: 300 };
  const maxSize = { width: 600, height: 500 };
  const minSize = { width: 200, height: 150 };

  const currentSize = note.size || defaultSize;

  // Paleta de cores disponíveis
  const colorOptions = [
    { name: 'yellow', label: 'Amarelo', class: 'bg-yellow-400 hover:bg-yellow-500' },
    { name: 'pink', label: 'Rosa', class: 'bg-pink-400 hover:bg-pink-500' },
    { name: 'blue', label: 'Azul', class: 'bg-blue-400 hover:bg-blue-500' },
    { name: 'green', label: 'Verde', class: 'bg-green-400 hover:bg-green-500' },
    { name: 'purple', label: 'Roxo', class: 'bg-purple-400 hover:bg-purple-500' },
    { name: 'orange', label: 'Laranja', class: 'bg-orange-400 hover:bg-orange-500' },
    { name: 'red', label: 'Vermelho', class: 'bg-red-400 hover:bg-red-500' },
    { name: 'teal', label: 'Verde-azulado', class: 'bg-teal-400 hover:bg-teal-500' },
  ];

  const style = {
    position: 'absolute' as const,
    left: localDragging ? dragPosition.x : (note.position?.x || 0),
    top: localDragging ? dragPosition.y : (note.position?.y || 0),
    width: currentSize.width,
    height: currentSize.height,
    cursor: localDragging ? 'grabbing' : 'grab',
    zIndex: localDragging || isResizing ? 1000 : 'auto',
    transform: localDragging ? 'scale(1.05) rotate(2deg)' : 'scale(1) rotate(0deg)',
    transition: localDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    
    // Não iniciar arrasto se clicou em botões ou controles
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('[data-no-drag]')) {
      return;
    }
    
    e.preventDefault();
    setLocalDragging(true);
    onDragStart(note.id);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDragPosition({
      x: note.position?.x || 0,
      y: note.position?.y || 0
    });
  }, [isEditing, note.id, note.position, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!localDragging) return;
    lastMouseEvent.current = e;
    if (animationFrame.current === null) {
      animationFrame.current = requestAnimationFrame(() => {
        if (!lastMouseEvent.current) return;
        const event = lastMouseEvent.current;
        const newX = event.clientX - dragOffset.x;
        const newY = event.clientY - dragOffset.y;
        const maxX = window.innerWidth - currentSize.width;
        const maxY = window.innerHeight - currentSize.height;
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        setDragPosition({ x: clampedX, y: clampedY });
        animationFrame.current = null;
      });
    }
  }, [localDragging, dragOffset, currentSize.width, currentSize.height]);

  const handleMouseUp = useCallback(() => {
    if (localDragging) {
      onPositionChange(note.id, dragPosition);
      setLocalDragging(false);
      onDragEnd();
    }
    setIsResizing(false);
    setResizeDirection(null);
  }, [localDragging, note.id, dragPosition, onPositionChange, onDragEnd]);

  // Função para redimensionar
  const handleResizeStart = (e: React.MouseEvent, direction: 'width' | 'height' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: currentSize.width,
      height: currentSize.height
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;

    e.preventDefault();
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    
    if (resizeDirection === 'width' || resizeDirection === 'both') {
      newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX));
    }
    
    if (resizeDirection === 'height' || resizeDirection === 'both') {
      newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY));
    }
    
    // Verificar se não sai da tela
    const maxX = window.innerWidth - (note.position?.x || 0);
    const maxY = window.innerHeight - (note.position?.y || 0);
    
    newWidth = Math.min(newWidth, maxX);
    newHeight = Math.min(newHeight, maxY);
    
    onSizeChange(note.id, { width: newWidth, height: newHeight });
  };

  useEffect(() => {
    if (localDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [localDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(note.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(note.text);
    setIsEditing(false);
  };

  const handleEnhance = async () => {
    if (!editText.trim()) return;
    setIsEnhancing(true);
    try {
      await onEnhance(note.id, editText.trim());
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete(note.id);
  };

  const handleColorChange = (color: string) => {
    onColorChange(note.id, color);
    setShowColorPalette(false);
  };

  const toggleExpand = () => {
    const newSize = isExpanded ? defaultSize : expandedSize;
    onSizeChange(note.id, newSize);
    setIsExpanded(!isExpanded);
  };

  // Paleta de cores papiro moderna e profissional
  const colorClasses = {
    yellow: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100/50',
    pink: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 shadow-rose-100/50',
    blue: 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 shadow-blue-100/50',
    green: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-emerald-100/50',
    purple: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-purple-100/50',
    orange: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-orange-100/50',
    red: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-100/50',
    teal: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-teal-100/50'
  };

  // Cores de texto complementares para cada cor de fundo
  const textColorClasses = {
    yellow: 'text-amber-800 dark:text-amber-200',
    pink: 'text-rose-800 dark:text-rose-200',
    blue: 'text-blue-800 dark:text-blue-200',
    green: 'text-emerald-800 dark:text-emerald-200',
    purple: 'text-purple-800 dark:text-purple-200',
    orange: 'text-orange-800 dark:text-orange-200',
    red: 'text-red-800 dark:text-red-200',
    teal: 'text-teal-800 dark:text-teal-200'
  };

  const colorKey = note.color as keyof typeof colorClasses;
  const currentColorClass = colorClasses[colorKey] || colorClasses.yellow;
  const currentTextColor = textColorClasses[colorKey] || textColorClasses.yellow;

  return (
    <Card
      style={style}
      className={`
        transition-all duration-300 ease-out relative overflow-hidden
        ${currentColorClass}
        dark:bg-[#2d2717] dark:border-[#3a3320] dark:shadow-[#bfae7c]/10
        ${localDragging ? 'opacity-90 shadow-2xl' : 'hover:shadow-lg hover:-translate-y-1'}
        ${isResizing ? 'opacity-90 shadow-xl' : ''}
        border-2 backdrop-blur-sm group
        shadow-md hover:shadow-xl
        ${localDragging ? 'z-50' : ''}
      `}
      onMouseDown={handleMouseDown}
      onClick={() => !isEditing && !localDragging && !isResizing && setIsEditing(true)}
    >
      {/* Textura de papiro sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none" />
      
      {/* Indicador de arrasto */}
      {localDragging && (
        <div className="absolute inset-0 bg-[#bfae7c]/10 border-2 border-dashed border-[#bfae7c]/30 rounded-lg pointer-events-none" />
      )}
      
      <CardContent className="p-5 h-full flex flex-col relative z-10">
        {/* Header com controles */}
        <div className="flex items-center justify-between mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs opacity-60 bg-[#f3ecd2] dark:bg-[#23201a] text-[#bfae7c] dark:text-[#bfae7c]">
              {note.color}
            </Badge>
            <Badge variant="outline" className="text-xs opacity-60 border-[#e2d8b8] dark:border-[#3a3320] text-[#bfae7c] dark:text-[#bfae7c]">
              {currentSize.width}x{currentSize.height}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Botão Expandir/Contrair */}
            <Button
              size="sm"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                toggleExpand();
              }}
              className="h-7 w-7 p-0 rounded-full hover:bg-[#f3ecd2] dark:hover:bg-[#28231a] hover:text-[#7c6a3c] dark:hover:text-[#f8f5e4] transition-all duration-200"
              data-no-drag
              title={isExpanded ? 'Contrair' : 'Expandir'}
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>

            {/* Paleta de Cores */}
            <Popover open={showColorPalette} onOpenChange={setShowColorPalette}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => e.stopPropagation()}
                  className="h-7 w-7 p-0 rounded-full hover:bg-[#f3ecd2] dark:hover:bg-[#28231a] hover:text-[#7c6a3c] dark:hover:text-[#f8f5e4] transition-all duration-200"
                  data-no-drag
                >
                  <Palette className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-[#f8f5e4] dark:bg-[#2d2717] border-[#e2d8b8] dark:border-[#3a3320]">
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <Button
                      key={color.name}
                      size="sm"
                      onClick={() => handleColorChange(color.name)}
                      className={`h-8 w-8 p-0 rounded-full ${color.class} transition-all duration-200 ${
                        note.color === color.name ? 'ring-2 ring-[#bfae7c] dark:ring-[#bfae7c]' : ''
                      }`}
                      title={color.label}
                      data-no-drag
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Botão de Excluir com Confirmação */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => e.stopPropagation()}
                  className="h-7 w-7 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                  data-no-drag
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#f8f5e4] dark:bg-[#2d2717] border-[#e2d8b8] dark:border-[#3a3320]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#7c6a3c] dark:text-[#f8f5e4]">
                    Excluir Nota
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[#bfae7c] dark:text-[#bfae7c]">
                    Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#e2d8b8] dark:border-[#3a3320] text-[#7c6a3c] dark:text-[#f8f5e4] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a]">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Conteúdo da nota */}
        <div className="flex-1 flex flex-col -mt-2">
          {isEditing ? (
            <div className="flex flex-col h-full space-y-3">
              <Textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className={`
                  flex-1 text-sm resize-none bg-transparent border-none p-0 focus:ring-0 
                  ${currentTextColor} placeholder-[#bfae7c] dark:placeholder-[#bfae7c] 
                  overflow-y-auto scrollbar-thin scrollbar-thumb-[#bfae7c]/30 scrollbar-track-transparent
                `}
                placeholder="Digite sua nota..."
                autoFocus
                onClick={e => e.stopPropagation()}
                data-no-drag
                style={{ minHeight: '100px' }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    handleEnhance();
                  }}
                  disabled={isEnhancing || !editText.trim()}
                  className="flex-1 h-8 text-xs bg-[#bfae7c] hover:bg-[#7c6a3c] text-[#f8f5e4] shadow-sm"
                  data-no-drag
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isEnhancing ? 'Melhorando...' : 'IA'}
                </Button>
                <Button
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  data-no-drag
                >
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={e => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="flex-1 h-8 text-xs hover:bg-[#f3ecd2] dark:hover:bg-[#28231a] border-[#e2d8b8] dark:border-[#3a3320] text-[#7c6a3c] dark:text-[#f8f5e4]"
                  data-no-drag
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden cursor-text">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#bfae7c]/30 scrollbar-track-transparent pr-2">
                <p className={`
                  text-sm leading-relaxed ${currentTextColor} whitespace-pre-wrap break-words
                  ${!note.text || note.text.trim() === '' ? 'italic opacity-60' : ''}
                `}>
                  {note.text && note.text.trim() !== '' ? note.text : 'Clique para adicionar uma nota...'}
                </p>
              </div>
              
              {/* Indicador de edição */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-50 transition-opacity">
                <Edit3 className="h-3 w-3 text-[#bfae7c] dark:text-[#bfae7c]" />
              </div>
            </div>
          )}
        </div>

        {/* Controles de redimensionamento */}
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
             onMouseDown={e => handleResizeStart(e, 'both')}
             data-no-drag>
          <div className="w-full h-full bg-[#bfae7c]/20 rounded-tl-md"></div>
        </div>
        
        {/* Controle de redimensionamento lateral */}
        <div className="absolute top-0 right-0 w-2 h-full cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity"
             onMouseDown={e => handleResizeStart(e, 'width')}
             data-no-drag>
          <div className="w-full h-full bg-[#bfae7c]/10"></div>
        </div>
        
        {/* Controle de redimensionamento vertical */}
        <div className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity"
             onMouseDown={e => handleResizeStart(e, 'height')}
             data-no-drag>
          <div className="w-full h-full bg-[#bfae7c]/10"></div>
        </div>
      </CardContent>
    </Card>
  );
};

const PostitNotes = () => {
  const [notes, setNotes] = useState<PostitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('postit_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Converter o tipo Json para o formato esperado com fallbacks
      const notesWithParsedData = (data || []).map(note => ({
        ...note,
        position: typeof note.position === 'string' ? JSON.parse(note.position) : note.position as {
          x: number;
          y: number;
        },
        size: note.size ? (typeof note.size === 'string' ? JSON.parse(note.size) : note.size) as {
          width: number;
          height: number;
        } : { width: 288, height: 208 } // Fallback para notas antigas
      }));
      
      setNotes(notesWithParsedData);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  // Função para organizar notas em grid automático
  const organizeNotesInGrid = async () => {
    const noteWidth = 288;
    const noteHeight = 208;
    const padding = 20;
    const containerPadding = 24; // p-6 = 24px
    
    // Calcular quantas notas cabem por linha
    const availableWidth = window.innerWidth - (containerPadding * 2);
    const notesPerRow = Math.floor(availableWidth / (noteWidth + padding));
    
    const organizedNotes = notes.map((note, index) => {
      // Calcular posição no grid
      const row = Math.floor(index / notesPerRow);
      const col = index % notesPerRow;
      
      const x = containerPadding + (col * (noteWidth + padding));
      const y = containerPadding + (row * (noteHeight + padding)) + 100; // +100 para dar espaço ao header
      
      return {
        ...note,
        position: { x, y }
      };
    });

    // Atualizar posições no banco de dados
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Atualizar todas as notas com suas novas posições
      for (const note of organizedNotes) {
        await supabase
          .from('postit_notes')
          .update({ position: note.position })
          .eq('id', note.id);
      }

      setNotes(organizedNotes);
      toast.success('Notas organizadas em grid!');
    } catch (error) {
      console.error('Erro ao organizar notas:', error);
      toast.error('Erro ao organizar notas');
    }
  };

  // Função para encontrar uma posição livre para nova nota
  const findFreePosition = (): { x: number; y: number } => {
    const noteWidth = 288; // w-72
    const noteHeight = 208; // h-52
    const padding = 20;
    const containerPadding = 24;
    const maxAttempts = 50;

    // Primeiro, tentar encontrar uma posição no grid
    const availableWidth = window.innerWidth - (containerPadding * 2);
    const notesPerRow = Math.floor(availableWidth / (noteWidth + padding));
    const totalRows = Math.ceil(notes.length / notesPerRow);
    
    // Tentar posição no final do grid
    const gridRow = totalRows;
    const gridCol = notes.length % notesPerRow;
    const gridX = containerPadding + (gridCol * (noteWidth + padding));
    const gridY = containerPadding + (gridRow * (noteHeight + padding)) + 100;
    
    // Verificar se a posição do grid está livre
    const isGridPositionFree = !notes.some(note => {
      const noteX = note.position?.x || 0;
      const noteY = note.position?.y || 0;
      const noteW = note.size?.width || noteWidth;
      const noteH = note.size?.height || noteHeight;
      
      return (
        gridX < noteX + noteW + padding &&
        gridX + noteWidth + padding > noteX &&
        gridY < noteY + noteH + padding &&
        gridY + noteHeight + padding > noteY
      );
    });

    if (isGridPositionFree) {
      return { x: gridX, y: gridY };
    }

    // Se não encontrar posição no grid, tentar posições aleatórias
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.random() * (window.innerWidth - noteWidth - 100) + 50;
      const y = Math.random() * (window.innerHeight - noteHeight - 100) + 50;

      const isFree = !notes.some(note => {
        const noteX = note.position?.x || 0;
        const noteY = note.position?.y || 0;
        const noteW = note.size?.width || noteWidth;
        const noteH = note.size?.height || noteHeight;
        
        return (
          x < noteX + noteW + padding &&
          x + noteWidth + padding > noteX &&
          y < noteY + noteH + padding &&
          y + noteHeight + padding > noteY
        );
      });

      if (isFree) {
        return { x, y };
      }
    }

    // Posição padrão
    return { x: 50, y: 150 };
  };

  const addNote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Paleta de cores papiro mais refinada
      const colors = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange', 'red', 'teal'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // Encontrar posição livre
      const position = findFreePosition();
      const size = { width: 288, height: 208 };

      const newNote = {
        text: '',
        position,
        size,
        color: randomColor,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('postit_notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;

      const noteWithParsedData = {
        ...data,
        position: typeof data.position === 'string' ? JSON.parse(data.position) : data.position as {
          x: number;
          y: number;
        },
        size: data.size ? (typeof data.size === 'string' ? JSON.parse(data.size) : data.size) as {
          width: number;
          height: number;
        } : { width: 288, height: 208 } // Fallback para compatibilidade
      };
      setNotes([...notes, noteWithParsedData]);
      toast.success('Nova nota adicionada');
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast.error('Erro ao adicionar nota');
    }
  };

  const updateNote = async (id: string, text: string) => {
    try {
      const { error } = await supabase
        .from('postit_notes')
        .update({ text })
        .eq('id', id);

      if (error) throw error;
      setNotes(notes.map(note => note.id === id ? { ...note, text } : note));
      toast.success('Nota atualizada');
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      toast.error('Erro ao atualizar nota');
    }
  };

  const updateNotePosition = async (id: string, position: { x: number; y: number }) => {
    try {
      const { error } = await supabase
        .from('postit_notes')
        .update({ position })
        .eq('id', id);

      if (error) throw error;
      setNotes(notes.map(note => note.id === id ? { ...note, position } : note));
    } catch (error) {
      console.error('Erro ao atualizar posição da nota:', error);
    }
  };

  const updateNoteSize = async (id: string, size: { width: number; height: number }) => {
    try {
      const { error } = await supabase
        .from('postit_notes')
        .update({ size })
        .eq('id', id);

      if (error) throw error;
      setNotes(notes.map(note => note.id === id ? { ...note, size } : note));
    } catch (error) {
      console.error('Erro ao atualizar tamanho da nota:', error);
    }
  };

  const updateNoteColor = async (id: string, color: string) => {
    try {
      const { error } = await supabase
        .from('postit_notes')
        .update({ color })
        .eq('id', id);

      if (error) throw error;
      setNotes(notes.map(note => note.id === id ? { ...note, color } : note));
      toast.success('Cor da nota alterada');
    } catch (error) {
      console.error('Erro ao alterar cor da nota:', error);
      toast.error('Erro ao alterar cor da nota');
    }
  };

  const enhanceNote = async (id: string, text: string) => {
    try {
      // Chamar a edge function para melhorar o texto
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-text-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          text,
          type: 'nota'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao melhorar texto');
      }

      const { enhancedText } = await response.json();
      
      if (enhancedText) {
        await updateNote(id, enhancedText);
        toast.success('Nota melhorada com IA!');
      }
    } catch (error) {
      console.error('Erro ao melhorar nota:', error);
      toast.error('Erro ao melhorar nota com IA');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('postit_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
      toast.success('Nota removida');
    } catch (error) {
      console.error('Erro ao remover nota:', error);
      toast.error('Erro ao remover nota');
    }
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 bg-[#f8f5e4] dark:bg-[#23201a] min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#bfae7c] dark:border-[#bfae7c]"></div>
          <p className="text-sm text-[#bfae7c] dark:text-[#bfae7c] font-medium">Carregando suas notas...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col bg-[#f8f5e4] dark:bg-[#23201a] min-h-screen p-6 relative overflow-hidden"
    >
      {/* Header moderno */}
      <div className="flex items-center justify-between mb-8 z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-[#f3ecd2] to-[#e2d8b8] dark:from-[#2d2717] dark:to-[#3a3320] rounded-xl shadow-sm">
            <StickyNote className="h-6 w-6 text-[#7c6a3c] dark:text-[#f8f5e4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#7c6a3c] dark:text-[#f8f5e4]">Minhas Notas</h1>
            <p className="text-sm text-[#bfae7c] dark:text-[#bfae7c]">
              {notes.length === 0 ? 'Organize suas ideias' : `${notes.length} nota${notes.length !== 1 ? 's' : ''} criada${notes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão Organizar */}
          {notes.length > 1 && (
            <Button 
              onClick={organizeNotesInGrid} 
              variant="outline"
              className="border-[#e2d8b8] dark:border-[#3a3320] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a] text-[#7c6a3c] dark:text-[#f8f5e4] shadow-sm"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Organizar
            </Button>
          )}

          <Button 
            onClick={addNote} 
            className="bg-[#bfae7c] hover:bg-[#7c6a3c] text-[#f8f5e4] shadow-md hover:shadow-xl transition-all duration-300 px-6 z-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Nota
          </Button>
        </div>
      </div>

      {/* Área de notas com posicionamento livre */}
      <div className="flex-1 relative overflow-hidden">
        {notes.length === 0 ? (
          <Card className="p-16 text-center bg-[#f8f5e4] dark:bg-[#2d2717] border-2 border-dashed border-[#e2d8b8] dark:border-[#3a3320] backdrop-blur-sm">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#bfae7c] to-[#7c6a3c] rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                <StickyNote className="h-10 w-10 text-[#f8f5e4]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#7c6a3c] dark:text-[#f8f5e4] mb-3">
                  Suas primeiras notas começam aqui
                </h3>
                <p className="text-[#bfae7c] dark:text-[#bfae7c] max-w-md mx-auto leading-relaxed">
                  Organize seus pensamentos, ideias e lembretes importantes em notas visuais e práticas.
                </p>
              </div>
              <Button 
                onClick={addNote}
                variant="outline" 
                className="mt-4 border-[#e2d8b8] dark:border-[#3a3320] hover:bg-[#f3ecd2] dark:hover:bg-[#28231a] text-[#7c6a3c] dark:text-[#f8f5e4]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira nota
              </Button>
            </div>
          </Card>
        ) : (
          <div className="w-full h-full relative">
            {notes.map(note => (
              <SortablePostit
                key={note.id}
                note={note}
                onEdit={updateNote}
                onDelete={deleteNote}
                onEnhance={enhanceNote}
                onPositionChange={updateNotePosition}
                onColorChange={updateNoteColor}
                onSizeChange={updateNoteSize}
                isDragging={draggingId === note.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostitNotes;