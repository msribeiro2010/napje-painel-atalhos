import { useState, useEffect } from 'react';
import assuntosData from '../../assuntos.json';

export interface AssuntoLocal {
  id: string;
  nome: string;
  categoria: string | null;
}

export const useAssuntosLocal = () => {
  const [assuntos, setAssuntos] = useState<AssuntoLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssuntos = () => {
    try {
      setLoading(true);
      
      // Converter array de strings para objetos com estrutura compatível
      const assuntosFormatados = assuntosData.map((assunto, index) => ({
        id: `local-${index}`,
        nome: assunto,
        categoria: null // Pode ser expandido futuramente para categorizar
      }));
      
      setAssuntos(assuntosFormatados);
      console.log(`✅ Carregados ${assuntosFormatados.length} assuntos do arquivo local`);
    } catch (err) {
      console.error('Erro ao carregar assuntos do arquivo local:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar assuntos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssuntos();
  }, []);

  return { 
    assuntos, 
    loading, 
    error, 
    refetch: loadAssuntos,
    totalAssuntos: assuntos.length
  };
};