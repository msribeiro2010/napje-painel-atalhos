import { useState, useEffect, useRef, forwardRef } from 'react';
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

export const InputComSugestoes = forwardRef<HTMLInputElement, InputComSugestoesProps>((
  {
    value,
    onChange,
    placeholder,
    sugestoes,
    loading = false,
    className,
    id
  },
  ref
) => {
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
    // Focar no input após um pequeno delay para garantir que a mudança foi aplicada
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSugestoes(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showSugestoes && filteredSugestoes.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-[9999] mt-1 max-h-60 overflow-y-auto shadow-lg border-2">
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredSugestoes.map((sugestao, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left hover:bg-gray-100 focus:bg-gray-100"
                  onMouseDown={(e) => {
                    // Previne que o input perca o foco antes do clique ser processado
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSugestaoClick(sugestao);
                  }}
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
        <Card className="absolute top-full left-0 right-0 z-[9999] mt-1 shadow-lg border-2">
          <CardContent className="p-3">
            <div className="text-center text-sm text-muted-foreground">
              Nenhuma sugestão encontrada
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

InputComSugestoes.displayName = 'InputComSugestoes';
