import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, MessageSquare, X, Sparkles, Zap, Trash2, Globe, Database, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ChatAssistant = ({ isOpen = false, onToggle }: ChatAssistantProps) => {
  const { data: profile } = useProfile();
  
  const getWelcomeMessage = () => {
    const nomeUsuario = profile?.nome_completo || profile?.email?.split('@')[0] || 'Usuário';
    return `Como posso ajudar ${nomeUsuario}?`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [searchMode, setSearchMode] = useState<'auto' | 'internal' | 'web'>('auto');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update welcome message when profile loads
  useEffect(() => {
    if (profile) {
      setMessages(prev => prev.map(msg => 
        msg.id === 'welcome' 
          ? { ...msg, content: getWelcomeMessage() }
          : msg
      ));
    }
  }, [profile]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Debug logs para identificar o problema
      console.log('[ChatBot] Iniciando envio de mensagem...');
      console.log('[ChatBot] Configuração Supabase:', {
        url: import.meta.env.VITE_SUPABASE_URL ? 'configurada' : 'não configurada',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configurada' : 'não configurada'
      });

      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const requestBody = {
        message: userMessage.content,
        conversationHistory: conversationHistory,
        enableWebSearch: searchMode === 'auto' ? enableWebSearch : searchMode === 'web',
        searchMode: searchMode
      };

      console.log('[ChatBot] Enviando requisição:', requestBody);

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: requestBody
      });

      console.log('[ChatBot] Resposta recebida:', { data, error });

      if (error) {
        console.error('[ChatBot] Erro do Supabase:', error);
        console.error('[ChatBot] Tipo do erro:', typeof error);
        console.error('[ChatBot] Propriedades do erro:', Object.keys(error));
        throw new Error(`Erro na chamada da função: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        console.error('[ChatBot] Data é null/undefined');
        throw new Error('Nenhuma resposta recebida da função');
      }

      console.log('[ChatBot] Data recebida:', {
        success: data.success,
        response: data.response ? `${data.response.substring(0, 50)}...` : 'sem resposta',
        error: data.error || 'sem erro'
      });

      if (!data.success) {
        console.error('[ChatBot] Function retornou success=false:', data.error);
        throw new Error(data?.error || 'Erro desconhecido na resposta');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log('[ChatBot] Mensagem adicionada com sucesso');

    } catch (error) {
      console.error('[ChatBot] Exception capturada:', error);
      console.error('[ChatBot] Tipo da exception:', typeof error);
      console.error('[ChatBot] Stack trace:', error.stack);
      
      // Fallback local para quando há problemas de conectividade
      const fallbackResponse = getFallbackResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: "Modo Offline",
        description: `Conectividade limitada. Usando respostas locais. Erro: ${error.message}`,
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Respostas para problemas comuns do TRT15
    if (lowerMessage.includes('chamado') || lowerMessage.includes('ticket')) {
      return `Para criar um chamado no sistema do TRT15:

1. Acesse a seção "Criar Chamado" no painel
2. Selecione o tipo apropriado (Incidente, Solicitação, etc.)
3. Preencha o título e descrição detalhada
4. Selecione o assunto relacionado
5. Adicione anexos se necessário
6. Clique em "Criar Chamado"

O sistema gerará automaticamente um número de protocolo para acompanhamento.`;
    }
    
    if (lowerMessage.includes('acesso') || lowerMessage.includes('login') || lowerMessage.includes('senha')) {
      return `Para problemas de acesso ao sistema:

🔐 **Reset de Senha:**
- Use a opção "Esqueci minha senha" na tela de login
- Verifique seu email institucional
- Siga as instruções do link recebido

🔑 **Problemas de Login:**
- Verifique se está usando o email correto (@trt15.jus.br)
- Limpe o cache do navegador
- Tente em modo anônimo/privado
- Entre em contato com o suporte se persistir

⚠️ **Conta Bloqueada:**
- Entre em contato com a equipe de TI
- Forneça seu nome completo e matrícula`;
    }
    
    if (lowerMessage.includes('sistema') || lowerMessage.includes('status') || lowerMessage.includes('funcionando')) {
      return `Status dos sistemas TRT15:

✅ **Sistemas Principais:**
- PJe (Processo Judicial Eletrônico)
- Sistema de Chamados
- Portal do Servidor

🔄 **Para verificar status atual:**
- Consulte o painel de status interno
- Verifique comunicados oficiais
- Entre em contato com a equipe de TI

📞 **Suporte:**
- Sistema de Chamados: Prioridade 1
- Email: suporte@trt15.jus.br
- Ramal interno: 2345`;
    }
    
    if (lowerMessage.includes('pje') || lowerMessage.includes('processo')) {
      return `Informações sobre o PJe (Processo Judicial Eletrônico):

📋 **Funcionalidades Principais:**
- Consulta de processos
- Movimentação processual
- Audiências virtuais
- Documentos eletrônicos

🔧 **Problemas Comuns:**
- Certificado digital expirado
- Navegador incompatível
- Cache do navegador
- Conexão de internet

📞 **Suporte PJe:**
- Abra chamado específico para PJe
- Informe número do processo
- Descreva o erro detalhadamente`;
    }
    
    // Resposta padrão
    return `Sou o Assistente TRT15 e estou operando em modo offline limitado.

📋 **Posso ajudar com:**
- Orientações sobre criação de chamados
- Problemas de acesso e senha
- Status dos sistemas
- Informações sobre PJe
- Procedimentos básicos de TI

💡 **Para suporte completo:**
- Abra um chamado no sistema
- Entre em contato com a equipe de TI
- Consulte a base de conhecimento

🔄 **Aguarde:** Trabalhamos para restabelecer a conectividade completa da IA.

Como posso ajudá-lo com base nas informações disponíveis?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    }]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-pastel-blue hover:bg-gradient-pastel-purple shadow-large hover:shadow-xl transition-all duration-300 z-50 group hover:scale-110 border-2 border-blue-200/60 dark:border-blue-700/60 dark:bg-gradient-to-br dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500"
        size="icon"
      >
        <div className="relative">
          <MessageSquare className="h-7 w-7 text-blue-700 group-hover:text-purple-700 transition-colors dark:text-blue-100 dark:group-hover:text-purple-100" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-pastel-green rounded-full animate-pulse dark:bg-green-400"></div>
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[600px] h-[700px] max-h-[90vh] shadow-xl z-50 flex flex-col max-w-[calc(100vw-3rem)] bg-gradient-card backdrop-blur-sm border-2 border-blue-200/40 animate-fade-in font-roboto dark:bg-gray-900/95 dark:border-gray-700/50 dark:shadow-2xl">
      {/* Header Moderno */}
      <CardHeader className="bg-gradient-pastel-blue/40 backdrop-blur-sm border-b border-blue-200/30 flex flex-row items-center justify-between space-y-0 pb-3 pt-3 dark:bg-gray-800/80 dark:border-gray-700/50">
        <CardTitle className="flex items-center gap-3 text-xl font-roboto">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-pastel-blue rounded-full flex items-center justify-center shadow-soft dark:bg-gradient-to-br dark:from-blue-600 dark:to-purple-600">
              <Bot className="h-7 w-7 text-blue-700 dark:text-blue-100" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-pastel-green rounded-full border-2 border-white flex items-center justify-center dark:bg-green-400 dark:border-gray-800">
              <Sparkles className="h-2 w-2 text-green-700 dark:text-green-900" />
            </div>
          </div>
                      <div className="flex flex-col">
            <span className="font-bold text-blue-800 text-lg dark:text-blue-100">Assistente TRT15</span>
            <span className="text-sm text-blue-600 font-normal dark:text-blue-300">Powered by IA</span>
          </div>
          <Badge className={`text-sm font-medium font-roboto border ${
            searchMode === 'auto' ? 'bg-gradient-pastel-green/60 text-green-700 border-green-200/60 dark:bg-green-600/80 dark:text-green-100 dark:border-green-500/50' :
            searchMode === 'internal' ? 'bg-gradient-pastel-blue/60 text-blue-700 border-blue-200/60 dark:bg-blue-600/80 dark:text-blue-100 dark:border-blue-500/50' :
            'bg-gradient-pastel-purple/60 text-purple-700 border-purple-200/60 dark:bg-purple-600/80 dark:text-purple-100 dark:border-purple-500/50'
          }`}>
            {searchMode === 'auto' && <Zap className="h-4 w-4 mr-1" />}
            {searchMode === 'internal' && <Database className="h-4 w-4 mr-1" />}
            {searchMode === 'web' && <Globe className="h-4 w-4 mr-1" />}
            {searchMode === 'auto' ? 'Inteligente' : searchMode === 'internal' ? 'Base Interna' : 'Busca Web'}
          </Badge>
        </CardTitle>
        <div className="flex gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const modes: Array<'auto' | 'internal' | 'web'> = ['auto', 'internal', 'web'];
                    const currentIndex = modes.indexOf(searchMode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    setSearchMode(nextMode);
                    toast({
                      title: "Modo de busca alterado",
                      description: `Agora usando: ${
                        nextMode === 'auto' ? 'Busca Inteligente (recomendado)' :
                        nextMode === 'internal' ? 'Apenas Base Interna' :
                        'Busca Web Prioritária'
                      }`,
                      duration: 2000,
                    });
                  }}
                  className="h-8 px-3 hover:bg-blue-100/60 transition-colors dark:hover:bg-blue-900/50 text-xs"
                >
                  <Search className="h-3 w-3 mr-1" />
                  {searchMode === 'auto' ? 'Auto' : searchMode === 'internal' ? 'Base' : 'Web'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  <strong>Modo atual:</strong> {
                    searchMode === 'auto' ? 'Busca Inteligente' :
                    searchMode === 'internal' ? 'Apenas Base Interna' :
                    'Busca Web Prioritária'
                  }
                  <br />
                  <em>Clique para alternar</em>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="h-8 w-8 hover:bg-red-100/60 transition-colors dark:hover:bg-red-900/50 dark:text-red-400"
            title="Limpar conversa"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-blue-100/60 transition-colors dark:hover:bg-blue-900/50 dark:text-blue-400"
          >
            <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-blue-50/20 to-purple-50/10 min-h-0 dark:bg-gradient-to-b dark:from-gray-800/50 dark:to-gray-900/50">
        {/* Área de Mensagens com altura fixa e scroll */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-pastel-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-soft border border-blue-200/40 dark:bg-gradient-to-br dark:from-blue-600 dark:to-purple-600 dark:border-blue-500/50">
                    <Bot className="h-4 w-4 text-blue-700 dark:text-blue-100" />
                  </div>
                )}
                
                <div
                  className={`max-w-[480px] rounded-2xl px-5 py-4 text-base shadow-soft transition-all duration-200 hover:shadow-medium ${
                    message.role === 'user'
                      ? 'bg-gradient-pastel-purple/70 text-purple-800 ml-auto border border-purple-200/40 dark:bg-gradient-to-br dark:from-purple-600/80 dark:to-blue-600/80 dark:text-purple-100 dark:border-purple-500/50'
                      : 'bg-gradient-card border border-blue-200/30 text-gray-700 dark:bg-gray-800/90 dark:border-gray-600/50 dark:text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed break-words max-h-[400px] overflow-y-auto custom-scrollbar font-medium">{message.content}</div>
                  <div className={`text-sm mt-3 opacity-70 font-medium ${
                    message.role === 'user' ? 'text-right text-purple-700 dark:text-purple-300' : 'text-left text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-pastel-purple rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-soft border border-purple-200/40 dark:bg-gradient-to-br dark:from-purple-600 dark:to-pink-600 dark:border-purple-500/50">
                    <User className="h-4 w-4 text-purple-700 dark:text-purple-100" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Indicador de digitação no final quando loading */}
            {isLoading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="w-8 h-8 bg-gradient-pastel-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-soft border border-blue-200/40 dark:bg-gradient-to-br dark:from-blue-600 dark:to-purple-600 dark:border-blue-500/50">
                  <Bot className="h-4 w-4 text-blue-700 dark:text-blue-100" />
                </div>
                <div className="bg-gradient-card rounded-2xl px-5 py-4 text-base shadow-soft border border-blue-200/30 dark:bg-gray-800/90 dark:border-gray-600/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce dark:bg-blue-300"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce dark:bg-blue-300" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce dark:bg-blue-300" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-blue-600 text-sm font-medium dark:text-blue-300">Assistente está digitando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        </div>

        {/* Área de Input Moderna - sempre visível */}
        <div className="flex-shrink-0 p-4 bg-gradient-card/50 backdrop-blur-sm border-t border-blue-200/30 dark:bg-gray-800/50 dark:border-gray-700/50">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
                              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="pr-12 py-4 rounded-2xl bg-white/90 border-2 border-blue-200/40 focus:border-blue-300/60 shadow-soft transition-all duration-200 text-base font-medium placeholder:text-gray-500 font-roboto dark:bg-gray-800/90 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-500/60"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                {inputValue.length > 0 && (
                  <span className="text-blue-500 dark:text-blue-400">{inputValue.length}</span>
                )}
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="h-12 w-12 rounded-full bg-gradient-pastel-blue hover:bg-gradient-pastel-purple shadow-soft hover:shadow-medium transition-all duration-200 border-2 border-blue-200/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 dark:bg-gradient-to-br dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 dark:border-blue-500/50"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-700 dark:text-blue-100" />
              ) : (
                <Send className="h-5 w-5 text-blue-700 dark:text-blue-100" />
              )}
            </Button>
          </div>
          
          {/* Dicas rápidas e indicador de modo de busca */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-3">
              <div className="flex gap-2 flex-wrap mb-3">
                {['Como criar um chamado?', 'Problemas de acesso', 'Status do sistema'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="text-sm px-4 py-2 bg-gradient-pastel-green/40 text-green-700 rounded-full border border-green-200/40 hover:bg-gradient-pastel-green/60 transition-all duration-200 hover:scale-105 font-medium font-roboto dark:bg-green-600/60 dark:text-green-100 dark:border-green-500/50 dark:hover:bg-green-600/80"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              {/* Indicador do modo de busca */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-2">
                {searchMode === 'auto' && (
                  <>
                    <Zap className="h-3 w-3 text-green-600" />
                    <span><strong>Busca Inteligente:</strong> Prioriza base interna, complementa com web quando necessário</span>
                  </>
                )}
                {searchMode === 'internal' && (
                  <>
                    <Database className="h-3 w-3 text-blue-600" />
                    <span><strong>Base Interna:</strong> Busca apenas na base de conhecimento e chamados do TRT15</span>
                  </>
                )}
                {searchMode === 'web' && (
                  <>
                    <Globe className="h-3 w-3 text-purple-600" />
                    <span><strong>Busca Web:</strong> Inclui sites oficiais (TRT15, CNJ, TST) além da base interna</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};