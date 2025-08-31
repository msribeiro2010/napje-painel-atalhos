import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type PostitNote = Tables<'postit_notes'>;

export const usePostItNotes = () => {
  const [notes, setNotes] = useState<PostitNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Timeout de 10 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 10 segundos')), 10000)
      );

      const queryPromise = supabase
        .from('postit_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5); // Apenas as 5 mais recentes para o dashboard

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      
      // Tratamento específico para erros de conectividade e timeout
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('TypeError: Failed to fetch')) {
          console.warn('Problema de conectividade ao carregar notas');
        } else if (error.message.includes('Timeout')) {
          console.warn('Timeout ao carregar notas');
        }
      }
      
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotesStats = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const todayNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at);
      return noteDate.toDateString() === todayStr;
    });

    return {
      total: notes.length,
      today: todayNotes.length
    };
  };

  const getLatestNote = () => {
    return notes.length > 0 ? notes[0] : null;
  };

  return {
    notes,
    loading,
    stats: getNotesStats(),
    latestNote: getLatestNote(),
    refreshNotes: loadNotes
  };
};