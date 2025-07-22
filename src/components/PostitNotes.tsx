import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { GripVertical, X, Plus, Edit3, Save, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const colorClasses = {
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-700/50',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/30 border-pink-200 dark:border-pink-700/50',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-700/50',
    green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-700/50',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border-purple-200 dark:border-purple-700/50',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 border-orange-200 dark:border-orange-700/50'
  };
  return <Card ref={setNodeRef} style={style} className={`
        w-64 h-48 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 
        ${colorClasses[note.color as keyof typeof colorClasses] || colorClasses.yellow}
        ${isDragging ? 'opacity-75 rotate-1 scale-105' : ''}
        border hover:border-opacity-70 group overflow-hidden
      `} onClick={() => !isEditing && setIsEditing(true)}>
      <CardContent className="p-4 h-full flex flex-col relative">
        <div className="flex items-center justify-between mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded transition-colors" onClick={e => e.stopPropagation()}>
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
          <Button size="sm" variant="ghost" onClick={e => {
          e.stopPropagation();
          onDelete(note.id);
        }} className="h-6 w-6 p-0 rounded-full transition-all duration-200 bg-zinc-500 hover:bg-zinc-400">
            <X className="h-3 w-3 text-red-500" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col -mt-6">
          {isEditing ? <div className="flex flex-col h-full space-y-2">
              <Textarea value={editText} onChange={e => setEditText(e.target.value)} className="flex-1 text-sm resize-none bg-transparent border-none p-0 focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" placeholder="Digite sua nota..." autoFocus onClick={e => e.stopPropagation()} />
              <div className="flex gap-1">
                <Button size="sm" onClick={e => {
              e.stopPropagation();
              handleSave();
            }} className="flex-1 h-6 text-xs bg-green-600 hover:bg-green-700 text-white">
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={e => {
              e.stopPropagation();
              handleCancel();
            }} className="flex-1 h-6 text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div> : <div className="flex-1 overflow-hidden cursor-text max-h-full">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1 max-h-32">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                  {note.text || 'Clique para editar...'}
                </p>
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const colors = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newNote = {
        text: 'Nova nota...',
        position: {
          x: 0,
          y: 0
        },
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
    return <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando notas...</p>
        </div>
      </div>;
  }
  return <div className="h-full flex flex-col">
      <div className="flex items-center justify-end mb-4">
        <Button onClick={addNote} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Nova Nota
        </Button>
      </div>

      {notes.length === 0 ? <Card className="p-12 text-center bg-gradient-card border-2 border-dashed border-border">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma nota criada ainda
              </h4>
              <p className="text-muted-foreground">
                Clique em "Nova Nota" para começar a organizar suas ideias!
              </p>
            </div>
          </div>
        </Card> : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={notes} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 flex-1">
              {notes.map(note => <SortablePostit key={note.id} note={note} onEdit={updateNote} onDelete={deleteNote} />)}
            </div>
          </SortableContext>
        </DndContext>}
    </div>;
};
export default PostitNotes;