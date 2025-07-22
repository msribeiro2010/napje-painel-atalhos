import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { GripVertical, X, Plus, Edit3, Save, XCircle, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
type PostitNote = Tables<'postit_notes'>;
interface SortablePostitProps {
  note: PostitNote;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}
const SortablePostit = ({
  note,
  onEdit,
  onDelete
}: SortablePostitProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: note.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto'
  };
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
  // Paleta de cores papiro moderna e profissional
  const colorClasses = {
    yellow: 'bg-gradient-to-br from-yellow-50/90 to-amber-50/80 border-yellow-200/60 shadow-yellow-100/50',
    pink: 'bg-gradient-to-br from-rose-50/90 to-pink-50/80 border-rose-200/60 shadow-rose-100/50',
    blue: 'bg-gradient-to-br from-blue-50/90 to-sky-50/80 border-blue-200/60 shadow-blue-100/50',
    green: 'bg-gradient-to-br from-emerald-50/90 to-green-50/80 border-emerald-200/60 shadow-emerald-100/50',
    purple: 'bg-gradient-to-br from-purple-50/90 to-violet-50/80 border-purple-200/60 shadow-purple-100/50',
    orange: 'bg-gradient-to-br from-orange-50/90 to-amber-50/80 border-orange-200/60 shadow-orange-100/50'
  };

  // Cores de texto complementares para cada cor de fundo
  const textColorClasses = {
    yellow: 'text-amber-800',
    pink: 'text-rose-800',
    blue: 'text-blue-800',
    green: 'text-emerald-800',
    purple: 'text-purple-800',
    orange: 'text-orange-800'
  };
  const colorKey = note.color as keyof typeof colorClasses;
  const currentColorClass = colorClasses[colorKey] || colorClasses.yellow;
  const currentTextColor = textColorClasses[colorKey] || textColorClasses.yellow;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        w-72 h-52 cursor-pointer transition-all duration-300 ease-out relative overflow-hidden
        ${currentColorClass}
        ${isDragging ? 'opacity-75 rotate-2 scale-105 shadow-xl' : 'hover:shadow-lg hover:-translate-y-1'}
        border-2 backdrop-blur-sm group
        shadow-md hover:shadow-xl
      `}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {/* Textura de papiro sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none" />
      
      <CardContent className="p-5 h-full flex flex-col relative z-10">
        {/* Header com controles */}
        <div className="flex items-center justify-between mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-600" />
          </div>
          
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs opacity-60">
              {note.color}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="h-7 w-7 p-0 rounded-full hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
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
                  ${currentTextColor} placeholder-gray-500 overflow-y-auto
                  scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent
                `}
                placeholder="Digite sua nota..."
                autoFocus
                onClick={e => e.stopPropagation()}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
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
                  className="flex-1 h-8 text-xs hover:bg-gray-100"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden cursor-text">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent pr-2">
                <p className={`
                  text-sm leading-relaxed ${currentTextColor} whitespace-pre-wrap break-words
                  ${!note.text || note.text.trim() === '' ? 'italic opacity-60' : ''}
                `}>
                  {note.text && note.text.trim() !== '' ? note.text : 'Clique para adicionar uma nota...'}
                </p>
              </div>
              
              {/* Indicador de edição */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-50 transition-opacity">
                <Edit3 className="h-3 w-3 text-gray-500" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
const PostitNotes = () => {
  const [notes, setNotes] = useState<PostitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  useEffect(() => {
    loadNotes();
  }, []);
  const loadNotes = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from('postit_notes').select('*').eq('user_id', user.id).order('created_at', {
        ascending: true
      });
      if (error) throw error;

      // Converter o tipo Json para o formato esperado
      const notesWithParsedPosition = (data || []).map(note => ({
        ...note,
        position: typeof note.position === 'string' ? JSON.parse(note.position) : note.position as {
          x: number;
          y: number;
        }
      }));
      setNotes(notesWithParsedPosition);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };
  const addNote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Paleta de cores papiro mais refinada
      const colors = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newNote = {
        text: '',
        position: { x: 0, y: 0 },
        color: randomColor,
        user_id: user.id
      };
      const {
        data,
        error
      } = await supabase.from('postit_notes').insert([newNote]).select().single();
      if (error) throw error;
      const noteWithParsedPosition = {
        ...data,
        position: typeof data.position === 'string' ? JSON.parse(data.position) : data.position as {
          x: number;
          y: number;
        }
      };
      setNotes([...notes, noteWithParsedPosition]);
      toast.success('Nova nota adicionada');
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast.error('Erro ao adicionar nota');
    }
  };
  const updateNote = async (id: string, text: string) => {
    try {
      const {
        error
      } = await supabase.from('postit_notes').update({
        text
      }).eq('id', id);
      if (error) throw error;
      setNotes(notes.map(note => note.id === id ? {
        ...note,
        text
      } : note));
      toast.success('Nota atualizada');
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      toast.error('Erro ao atualizar nota');
    }
  };
  const deleteNote = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from('postit_notes').delete().eq('id', id);
      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
      toast.success('Nota removida');
    } catch (error) {
      console.error('Erro ao remover nota:', error);
      toast.error('Erro ao remover nota');
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      setNotes(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground font-medium">Carregando suas notas...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-parchment-light via-parchment-medium to-parchment-light min-h-screen p-6">
      {/* Header moderno */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl shadow-sm">
            <StickyNote className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sepia-dark">Minhas Notas</h1>
            <p className="text-sm text-sepia-medium">
              {notes.length === 0 ? 'Organize suas ideias' : `${notes.length} nota${notes.length !== 1 ? 's' : ''} criada${notes.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <Button 
          onClick={addNote} 
          className="bg-gradient-primary hover:shadow-lg text-white shadow-md hover:shadow-xl transition-all duration-300 px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Nota
        </Button>
      </div>

      {/* Conteúdo */}
      {notes.length === 0 ? (
        <Card className="p-16 text-center bg-gradient-card border-2 border-dashed border-border/50 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
              <StickyNote className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-sepia-dark mb-3">
                Suas primeiras notas começam aqui
              </h3>
              <p className="text-sepia-medium max-w-md mx-auto leading-relaxed">
                Organize seus pensamentos, ideias e lembretes importantes em notas visuais e práticas.
              </p>
            </div>
            <Button 
              onClick={addNote}
              variant="outline" 
              className="mt-4 border-primary/20 hover:bg-primary/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira nota
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={notes} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-6">
              {notes.map(note => (
                <SortablePostit
                  key={note.id}
                  note={note}
                  onEdit={updateNote}
                  onDelete={deleteNote}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
export default PostitNotes;