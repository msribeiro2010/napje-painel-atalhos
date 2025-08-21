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
import { useOrgaosJulgadores } from '@/hooks/useOrgaosJulgadores';

interface OrgaoJulgadorSearchSelect2GrauProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const OrgaoJulgadorSearchSelect2Grau = ({ 
  value, 
  onValueChange, 
  placeholder = "Buscar órgão julgador de 2º grau..."
}: OrgaoJulgadorSearchSelect2GrauProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { orgaos, isLoading } = useOrgaosJulgadores('2grau');
  const [filteredOrgaos, setFilteredOrgaos] = useState<typeof orgaos>([]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredOrgaos(orgaos.slice(0, 50));
    } else {
      const filtered = orgaos.filter(orgao =>
        orgao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orgao.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrgaos(filtered);
    }
  }, [searchTerm, orgaos]);

  const selectedOrgao = orgaos.find(orgao => orgao.nome === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          <div className="flex items-center">
            <Search className="h-4 w-4 mr-2 text-gray-500" />
            {selectedOrgao ? (
              <span className="truncate">{selectedOrgao.nome}</span>
            ) : (
              <span className="text-gray-500">
                {isLoading ? "Carregando..." : placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Digite o nome ou código do órgão..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Carregando órgãos..." : "Nenhum órgão julgador encontrado."}
            </CommandEmpty>
            {filteredOrgaos.length > 0 && (
              <CommandGroup heading="Órgãos Julgadores de 2º Grau">
                {filteredOrgaos.map((orgao) => (
                  <CommandItem
                    key={orgao.id}
                    value={`${orgao.codigo} - ${orgao.nome}`}
                    onSelect={() => {
                      onValueChange(orgao.nome);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === orgao.nome ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{orgao.nome}</span>
                      <span className="text-xs text-gray-500">
                        Código: {orgao.codigo}
                      </span>
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