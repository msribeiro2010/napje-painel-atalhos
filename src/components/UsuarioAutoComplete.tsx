import { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsuarios, Usuario } from '@/hooks/useUsuarios';
import { FormData } from '@/types/form';
import { perfis } from '@/constants/form-options';

interface UsuarioAutoCompleteProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

export const UsuarioAutoComplete = ({ formData, onInputChange }: UsuarioAutoCompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const { buscarUsuarios } = useUsuarios();

  useEffect(() => {
    const buscarUsuariosDebounced = async () => {
      if (formData.cpfUsuario.length >= 3 || formData.nomeUsuario.length >= 3) {
        const termo = formData.cpfUsuario || formData.nomeUsuario;
        const resultados = await buscarUsuarios(termo);
        setUsuarios(resultados);
        setShowSuggestions(resultados.length > 0);
      } else {
        setUsuarios([]);
        setShowSuggestions(false);
      }
    };

    const timeout = setTimeout(buscarUsuariosDebounced, 300);
    return () => clearTimeout(timeout);
  }, [formData.cpfUsuario, formData.nomeUsuario, buscarUsuarios]);

  const formatarCPF = (valor: string) => {
    const somenteNumeros = valor.replace(/\D/g, '');
    
    if (somenteNumeros.length <= 11) {
      return somenteNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return valor;
  };

  const validarCPF = (cpf: string) => {
    const somenteNumeros = cpf.replace(/\D/g, '');
    
    if (somenteNumeros.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(somenteNumeros)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(somenteNumeros[i]) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(somenteNumeros[9])) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(somenteNumeros[i]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(somenteNumeros[10])) return false;
    
    return true;
  };

  const handleCPFChange = (valor: string) => {
    const cpfFormatado = formatarCPF(valor);
    onInputChange('cpfUsuario', cpfFormatado);
  };

  const selecionarUsuario = (usuario: Usuario) => {
    onInputChange('cpfUsuario', formatarCPF(usuario.cpf));
    onInputChange('nomeUsuario', usuario.nome_completo);
    onInputChange('perfilUsuario', usuario.perfil || '');
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-gray-700 flex items-center">
        <User className="h-4 w-4 mr-2" />
        Dados do Usuário (Opcional)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={formData.cpfUsuario}
              onChange={(e) => handleCPFChange(e.target.value)}
              placeholder="000.000.000-00"
              className={`pl-10 ${formData.cpfUsuario && !validarCPF(formData.cpfUsuario) ? 'border-red-500' : ''}`}
              maxLength={14}
            />
            {formData.cpfUsuario && !validarCPF(formData.cpfUsuario) && (
              <p className="text-xs text-red-500 mt-1">CPF inválido</p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={formData.nomeUsuario}
              onChange={(e) => onInputChange('nomeUsuario', e.target.value)}
              placeholder="Nome do usuário"
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Perfil
          </label>
          <Select value={formData.perfilUsuario} onValueChange={(value) => onInputChange('perfilUsuario', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              {perfis.map((perfil) => (
                <SelectItem key={perfil} value={perfil}>{perfil}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>
      
      {/* Sugestões de usuários - movido para fora do grid */}
      {showSuggestions && usuarios.length > 0 && (
        <div className="relative z-50">
          <Card className="p-2 shadow-lg bg-white border mt-2">
            <div className="text-xs text-gray-500 mb-2 font-medium">
              Usuários encontrados:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  onClick={() => selecionarUsuario(usuario)}
                  className="p-2 rounded cursor-pointer hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {usuario.nome_completo}
                      </div>
                      <div className="text-xs text-gray-500">
                        {usuario.cpf} {usuario.perfil && `• ${usuario.perfil}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};