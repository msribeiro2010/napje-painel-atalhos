import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAssuntosLocal, AssuntoLocal } from '@/hooks/useAssuntosLocal';

interface AssuntoSearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  resumosPadroes?: string[];
}

export const AssuntoSearchSelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Buscar assunto...",
  resumosPadroes = []
}: AssuntoSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { assuntos, loading } = useAssuntosLocal();
  const [filteredAssuntos, setFilteredAssuntos] = useState<AssuntoLocal[]>([]);
  const [filteredResumos, setFilteredResumos] = useState<string[]>([]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAssuntos(assuntos.slice(0, 30)); // Limitar para dar espaço aos resumos
      setFilteredResumos(resumosPadroes.slice(0, 20));
    } else {
      const filteredA = assuntos.filter(assunto =>
        assunto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assunto.categoria && assunto.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      const filteredR = resumosPadroes.filter(resumo =>
        resumo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssuntos(filteredA);
      setFilteredResumos(filteredR);
    }
  }, [searchTerm, assuntos, resumosPadroes]);

  const selectedAssunto = assuntos.find(assunto => assunto.nome === value);
  const isResumoSelecionado = resumosPadroes.includes(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <Search className="h-4 w-4 mr-2 text-gray-500" />
            {selectedAssunto || isResumoSelecionado ? (
              <span className="truncate">{selectedAssunto?.nome || value}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Digite para buscar assunto..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Carregando assuntos..." : "Nenhum assunto encontrado."}
            </CommandEmpty>
            {!loading && filteredResumos.length > 0 && (
              <CommandGroup heading="Resumos Padrões">
                {filteredResumos.map((resumo) => (
                  <CommandItem
                    key={resumo}
                    value={resumo}
                    onSelect={() => {
                      onValueChange(resumo);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === resumo ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{resumo}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!loading && filteredAssuntos.length > 0 && (
              <CommandGroup heading="Assuntos da Base">
                {filteredAssuntos.map((assunto) => (
                  <CommandItem
                    key={assunto.id}
                    value={assunto.nome}
                    onSelect={() => {
                      onValueChange(assunto.nome);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === assunto.nome ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{assunto.nome}</span>
                      {assunto.categoria && (
                        <span className="text-xs text-gray-500">{assunto.categoria}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};