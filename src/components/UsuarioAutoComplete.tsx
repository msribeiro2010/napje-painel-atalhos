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
}

export const UsuarioAutoComplete = ({ formData, onInputChange }: UsuarioAutoCompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sugestoesPerfil, setSugestoesPerfil] = useState([]);
  const [dadosEncontrados, setDadosEncontrados] = useState(false);
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
  }, []);

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



  const handleCPFChange = async (valor: string) => {
    // Permitir apenas números e formatação
    const somenteNumeros = valor.replace(/\D/g, '');
    
    // Limitar a 11 dígitos - mas sempre atualizar o estado
    const numerosLimitados = somenteNumeros.slice(0, 11);
    
    const cpfFormatado = formatarCPF(numerosLimitados);
    onInputChange('cpfUsuario', cpfFormatado);
    
    // Se digitou mais de 11 dígitos, não processar busca
    if (somenteNumeros.length > 11) {
      return;
    }
    
    // Se o CPF for válido (11 dígitos), buscar dados primeiro na tabela usuarios
    if (numerosLimitados.length === 11 && validarCPF(cpfFormatado)) {
      // Primeiro: buscar na tabela usuarios
      const usuario = await buscarUsuarioPorCPF(cpfFormatado);
      
      if (usuario) {
        onInputChange('nomeUsuario', usuario.nome_completo || '');
        onInputChange('perfilUsuario', usuario.perfil || '');
        setDadosEncontrados(true);
        
        // Limpar sugestões de usuários já que encontramos dados
        setUsuarios([]);
        setShowSuggestions(false);
        return;
      }
      
      // Se não encontrou na tabela usuarios, buscar dados de chamados anteriores
      const dadosUsuario = await buscarDadosUsuarioPorCPF(cpfFormatado);
      
      if (dadosUsuario) {
        onInputChange('nomeUsuario', dadosUsuario.nome_usuario_afetado || '');
        onInputChange('perfilUsuario', dadosUsuario.perfil_usuario_afetado || '');
        setDadosEncontrados(true);
        
        // Limpar sugestões de usuários já que encontramos dados
        setUsuarios([]);
        setShowSuggestions(false);
      } else {
        setDadosEncontrados(false);
      }
    } else {
      setDadosEncontrados(false);
    }
  };

  const selecionarUsuario = (usuario: Usuario) => {
    const cpfLimpo = limparCPF(usuario.cpf);
    const cpfFormatado = formatarCPF(cpfLimpo);
    
    onInputChange('cpfUsuario', cpfFormatado);
    onInputChange('nomeUsuario', usuario.nome_completo);
    onInputChange('perfilUsuario', usuario.perfil || '');
    setShowSuggestions(false);
    setUsuarios([]);
    setDadosEncontrados(true);
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
                formData.cpfUsuario && !validarCPF(formData.cpfUsuario) ? 'border-red-500' : ''
              } ${dadosEncontrados ? 'pr-10' : ''}`}
              maxLength={14}
              autoComplete="off"
            />
            {formData.cpfUsuario && !validarCPF(formData.cpfUsuario) && (
              <p className="text-xs text-red-500 mt-1">CPF inválido</p>
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
      
      {/* Sugestões de usuários - movido para fora do grid */}
      {showSuggestions && usuarios.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 left-0 right-0">
          <Card className="p-2 shadow-lg bg-white border border-gray-200">
            <div className="text-xs text-gray-500 mb-2 font-medium">
              Usuários encontrados:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selecionarUsuario(usuario);
                  }}
                  className="w-full p-2 rounded cursor-pointer hover:bg-blue-50 border border-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {usuario.nome_completo}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatarCPF(usuario.cpf)} {usuario.perfil && `• ${usuario.perfil}`}
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