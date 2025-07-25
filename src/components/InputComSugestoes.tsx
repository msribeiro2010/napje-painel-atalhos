import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp } from 'lucide-react';
import { SugestaoItem } from '@/hooks/useSugestoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InputComSugestoesProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sugestoes: SugestaoItem[];
  loading?: boolean;
  className?: string;
  id?: string;
}

export const InputComSugestoes = ({
  value,
  onChange,
  placeholder,
  sugestoes,
  loading = false,
  className,
  id
}: InputComSugestoesProps) => {
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [filteredSugestoes, setFilteredSugestoes] = useState<SugestaoItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar sugestões baseado no valor digitado
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSugestoes(sugestoes);
    } else {
      const filtered = sugestoes.filter(sugestao =>
        sugestao.valor.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSugestoes(filtered);
    }
  }, [value, sugestoes]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSugestoes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    if (sugestoes.length > 0) {
      setShowSugestoes(true);
    }
  };

  const handleSugestaoClick = (sugestao: SugestaoItem) => {
    onChange(sugestao.valor);
    setShowSugestoes(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSugestoes(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showSugestoes && filteredSugestoes.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredSugestoes.map((sugestao, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => handleSugestaoClick(sugestao)}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{sugestao.valor}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{sugestao.frequencia}x</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(sugestao.ultimo_uso), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            {loading && (
              <div className="text-center py-2 text-sm text-muted-foreground">
                Carregando sugestões...
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {showSugestoes && filteredSugestoes.length === 0 && !loading && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-3">
            <div className="text-center text-sm text-muted-foreground">
              Nenhuma sugestão encontrada
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};