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

interface OrgaoJulgador {
  codigo: string;
  nome: string;
}

interface OrgaoJulgadorSearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  orgaosJulgadores: OrgaoJulgador[];
}

export const OrgaoJulgadorSearchSelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Buscar órgão julgador por cidade ou nome...",
  orgaosJulgadores = []
}: OrgaoJulgadorSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrgaos, setFilteredOrgaos] = useState<OrgaoJulgador[]>([]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredOrgaos(orgaosJulgadores.slice(0, 50));
    } else {
      const filtered = orgaosJulgadores.filter(orgao =>
        orgao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orgao.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Busca específica por cidades comuns
        extractCityFromOrgao(orgao.nome).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrgaos(filtered);
    }
  }, [searchTerm, orgaosJulgadores]);

  // Função para extrair o nome da cidade do nome do órgão
  const extractCityFromOrgao = (nomeOrgao: string): string => {
    // Remove prefixos comuns e extrai a cidade
    const prefixosRemover = [
      'Vara do Trabalho de ',
      'ª Vara do Trabalho de ',
      'º Vara do Trabalho de ',
      'Órgão Centralizador de Leilões Judiciais de ',
      'Centro de Conciliação Pré Processual ',
      'Centro Judiciário de Métodos Consensuais de Solução de Disputas da Justiça do Trabalho ',
      'Posto Avançado da Justiça do Trabalho de ',
      'Posto Avançado da Justiça do Trabalho ',
      'Juizado Especial da Infância e Adolescência de ',
      'Divisão de Execução de ',
      'CEJUSC ',
      'CCP ',
      'DIVEX - ',
      'LIQ1 - ',
      'LIQ2 - ',
      'CON1 - ',
      'CON2 - ',
      'EXE1 - ',
      'EXE2 - ',
      'EXE3 - ',
      'EXE4 - ',
      'EXE5 - ',
      'EXE6 - ',
      'DAM - '
    ];

    let cidade = nomeOrgao;
    
    // Remove números ordinais no início
    cidade = cidade.replace(/^\d+ª?\s/, '');
    
    // Remove prefixos
    prefixosRemover.forEach(prefixo => {
      if (cidade.includes(prefixo)) {
        cidade = cidade.replace(prefixo, '');
      }
    });

    // Pega apenas a primeira palavra/cidade (antes de "em" se houver)
    if (cidade.includes(' em ')) {
      cidade = cidade.split(' em ')[1];
    }

    // Remove sufixos como "- JT"
    cidade = cidade.replace(/ - JT.*$/, '');
    
    return cidade.trim();
  };

  const selectedOrgao = orgaosJulgadores.find(orgao => `${orgao.codigo} - ${orgao.nome}` === value);

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
            {selectedOrgao ? (
              <span className="truncate">{selectedOrgao.codigo} - {selectedOrgao.nome}</span>
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
            placeholder="Digite o nome da cidade ou órgão..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              Nenhum órgão julgador encontrado.
            </CommandEmpty>
            {filteredOrgaos.length > 0 && (
              <CommandGroup heading="Órgãos Julgadores">
                {filteredOrgaos.map((orgao) => (
                  <CommandItem
                    key={orgao.codigo}
                    value={`${orgao.codigo} - ${orgao.nome}`}
                    onSelect={() => {
                      onValueChange(`${orgao.codigo} - ${orgao.nome}`);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === `${orgao.codigo} - ${orgao.nome}` ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{orgao.codigo} - {orgao.nome}</span>
                      <span className="text-xs text-gray-500">
                        Cidade: {extractCityFromOrgao(orgao.nome)}
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