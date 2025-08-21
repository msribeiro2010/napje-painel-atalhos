import { useState, useEffect } from 'react';
import { Search, User, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsuarios, Usuario } from '@/hooks/useUsuarios';
import { useSugestoes } from '@/hooks/useSugestoes';
import { useChamados } from '@/hooks/useChamados';
import { InputComSugestoes } from '@/components/InputComSugestoes';
import { FormData } from '@/types/form';
import { perfis } from '@/constants/form-options';
import { formatarCPF, validarCPF, limparCPF } from '@/utils/cpf-utils';

interface UsuarioAutoCompleteProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  onMultipleInputChange?: (updates: Partial<FormData>) => void;
}

export const UsuarioAutoComplete = ({ formData, onInputChange, onMultipleInputChange }: UsuarioAutoCompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sugestoesPerfil, setSugestoesPerfil] = useState([]);
  const [dadosEncontrados, setDadosEncontrados] = useState(false);
  const [erro, setErro] = useState('');
  const { buscarUsuarios, buscarUsuarioPorCPF } = useUsuarios();
  const { buscarSugestoesPerfil, loading: sugestoesLoading } = useSugestoes();
  const { buscarDadosUsuarioPorCPF } = useChamados();

  // Carregar sugestões de perfil quando o componente montar
  useEffect(() => {
    const carregarSugestoesPerfil = async () => {
      const sugestoes = await buscarSugestoesPerfil();
      setSugestoesPerfil(sugestoes);
    };
    
    carregarSugestoesPerfil();
  }, [buscarSugestoesPerfil]);

  // Limpar indicador de dados encontrados quando campos forem modificados manualmente
  useEffect(() => {
    if (dadosEncontrados && (formData.nomeUsuario === '' || formData.perfilUsuario === '')) {
      setDadosEncontrados(false);
    }
  }, [formData.nomeUsuario, formData.perfilUsuario, dadosEncontrados]);

  useEffect(() => {
    const buscarUsuariosDebounced = async () => {
      if (formData.cpfUsuario.length >= 3 || formData.nomeUsuario.length >= 3) {
        const termo = formData.cpfUsuario || formData.nomeUsuario;
        const resultados = await buscarUsuarios(termo);
        
        // Filtrar apenas usuários com CPFs válidos
        const usuariosComCPFValido = resultados.filter(usuario => {
          const cpfLimpo = limparCPF(usuario.cpf);
          const cpfFormatado = formatarCPF(cpfLimpo);
          return validarCPF(cpfFormatado);
        });
        
        setUsuarios(usuariosComCPFValido);
        setShowSuggestions(usuariosComCPFValido.length > 0);
      } else {
        setUsuarios([]);
        setShowSuggestions(false);
      }
    };

    const timeout = setTimeout(buscarUsuariosDebounced, 300);
    return () => clearTimeout(timeout);
  }, [formData.cpfUsuario, formData.nomeUsuario, buscarUsuarios]);



    const handleCPFChange = async (cpfTexto: string) => {
    const cpfLimpo = limparCPF(cpfTexto);
    const cpfFormatado = formatarCPF(cpfLimpo);
    
    onInputChange('cpfUsuario', cpfFormatado);
    
    if (cpfLimpo.length === 11) {
      if (validarCPF(cpfLimpo)) {
        try {
          const usuario = await buscarUsuarioPorCPF(cpfLimpo);
          if (usuario) {
            setDadosEncontrados(true);
            setErro('');
            // Preencher automaticamente os campos se o usuário for encontrado
            if (onMultipleInputChange) {
              onMultipleInputChange({
                cpfUsuario: cpfFormatado,
                nomeUsuario: usuario.nome_completo,
                perfilUsuario: usuario.perfil || ''
              });
            }
          } else {
            setDadosEncontrados(false);
            setErro('');
          }
        } catch (error) {
          setErro('');
          setDadosEncontrados(false);
        }
      } else {
        setErro('CPF inválido');
        setDadosEncontrados(false);
        setShowSuggestions(false);
      }
    } else {
      setErro('');
      setDadosEncontrados(false);
      setShowSuggestions(false);
    }
  };

  const selecionarUsuario = (usuario: Usuario) => {
    const cpfLimpo = limparCPF(usuario.cpf);
    const cpfFormatado = formatarCPF(cpfLimpo);
    
    // Ocultar sugestões primeiro
    setShowSuggestions(false);
    setUsuarios([]);
    
    // Se temos a função de múltiplas atualizações, usar ela
    if (onMultipleInputChange) {
      onMultipleInputChange({
        cpfUsuario: cpfFormatado,
        nomeUsuario: usuario.nome_completo,
        perfilUsuario: usuario.perfil || ''
      });
    } else {
      // Fallback para chamadas individuais com delays
      setTimeout(() => onInputChange('cpfUsuario', cpfFormatado), 10);
      setTimeout(() => onInputChange('nomeUsuario', usuario.nome_completo), 20);
      setTimeout(() => onInputChange('perfilUsuario', usuario.perfil || ''), 30);
    }
    
    setTimeout(() => setDadosEncontrados(true), 50);
  };

  return (
    <div className="space-y-4 border-t pt-4 relative">
      <h4 className="font-medium text-gray-700 flex items-center">
        <User className="h-4 w-4 mr-2" />
        Dados do Usuário (Opcional)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {dadosEncontrados && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
            <Input
              value={formData.cpfUsuario}
              onChange={(e) => handleCPFChange(e.target.value)}
              placeholder="000.000.000-00"
              className={`pl-10 ${
                dadosEncontrados ? 'border-green-500 bg-green-50' : 
                formData.cpfUsuario && !validarCPF(formData.cpfUsuario) && !dadosEncontrados ? 'border-red-500' : ''
              } ${dadosEncontrados ? 'pr-10' : ''}`}
              maxLength={14}
              autoComplete="off"
            />
            {(formData.cpfUsuario && !validarCPF(formData.cpfUsuario) && !dadosEncontrados) || erro && (
              <p className="text-xs text-red-500 mt-1">{erro || 'CPF inválido'}</p>
            )}
            {dadosEncontrados && (
              <p className="text-xs text-green-600 mt-1">Dados encontrados no banco de dados</p>
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
          <InputComSugestoes
            value={formData.perfilUsuario}
            onChange={(value) => onInputChange('perfilUsuario', value)}
            placeholder="Selecione o perfil"
            sugestoes={sugestoesPerfil}
            loading={sugestoesLoading}
          />
        </div>

      </div>
      
      {/* Sugestões de usuários - versão ultra compacta */}
      {showSuggestions && usuarios.length > 0 && (
        <div className="absolute z-[9999] w-full -top-16 left-0 right-0">
          <Card className="p-1 shadow-md bg-white border border-gray-200 max-h-16 overflow-hidden">
            <div className="text-[10px] text-gray-400 mb-0.5 font-medium">
              Usuários encontrados:
            </div>
            <div className="space-y-0.5 overflow-y-auto max-h-10">
              {usuarios.slice(0, 2).map((usuario) => (
                <div
                  key={usuario.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selecionarUsuario(usuario);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  className="w-full p-1 rounded cursor-pointer hover:bg-blue-50 border border-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <User className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-gray-900 truncate">
                        {usuario.nome_completo} • {formatarCPF(usuario.cpf)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {usuarios.length > 2 && (
                <div className="text-[9px] text-gray-400 text-center py-0.5">
                  +{usuarios.length - 2} mais...
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};