import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, MessageSquare, X, Sparkles, Zap, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: userMessage.content,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Erro na chamada da função: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhuma resposta recebida da função');
      }

      if (!data.success) {
        throw new Error(data?.error || 'Erro desconhecido na resposta');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-pastel-blue hover:bg-gradient-pastel-purple shadow-large hover:shadow-xl transition-all duration-300 z-50 group hover:scale-110 border-2 border-blue-200/60"
        size="icon"
      >
        <div className="relative">
          <MessageSquare className="h-7 w-7 text-blue-700 group-hover:text-purple-700 transition-colors" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-pastel-green rounded-full animate-pulse"></div>
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[600px] h-[700px] max-h-[90vh] shadow-xl z-50 flex flex-col max-w-[calc(100vw-3rem)] bg-gradient-card backdrop-blur-sm border-2 border-blue-200/40 animate-fade-in font-roboto">
      {/* Header Moderno */}
      <CardHeader className="bg-gradient-pastel-blue/40 backdrop-blur-sm border-b border-blue-200/30 flex flex-row items-center justify-between space-y-0 pb-3 pt-3">
        <CardTitle className="flex items-center gap-3 text-xl font-roboto">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-pastel-blue rounded-full flex items-center justify-center shadow-soft">
              <Bot className="h-7 w-7 text-blue-700" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-pastel-green rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-green-700" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-blue-800 text-lg">Assistente TRT15</span>
            <span className="text-sm text-blue-600 font-normal">Powered by IA</span>
          </div>
          <Badge className="bg-gradient-pastel-green/60 text-green-700 border-green-200/60 text-sm font-medium font-roboto">
            <Zap className="h-4 w-4 mr-1" />
            Online
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="h-8 w-8 hover:bg-red-100/60 transition-colors"
            title="Limpar conversa"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-blue-100/60 transition-colors"
          >
            <X className="h-4 w-4 text-blue-600" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-blue-50/20 to-purple-50/10 min-h-0">
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
                  <div className="w-8 h-8 bg-gradient-pastel-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-soft border border-blue-200/40">
                    <Bot className="h-4 w-4 text-blue-700" />
                  </div>
                )}
                
                <div
                  className={`max-w-[480px] rounded-2xl px-5 py-4 text-base shadow-soft transition-all duration-200 hover:shadow-medium ${
                    message.role === 'user'
                      ? 'bg-gradient-pastel-purple/70 text-purple-800 ml-auto border border-purple-200/40'
                      : 'bg-gradient-card border border-blue-200/30 text-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed break-words max-h-[400px] overflow-y-auto custom-scrollbar font-medium">{message.content}</div>
                  <div className={`text-sm mt-3 opacity-70 font-medium ${
                    message.role === 'user' ? 'text-right text-purple-700' : 'text-left text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-pastel-purple rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-soft border border-purple-200/40">
                    <User className="h-4 w-4 text-purple-700" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Indicador de digitação no final quando loading */}
            {isLoading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="w-8 h-8 bg-gradient-pastel-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-soft border border-blue-200/40">
                  <Bot className="h-4 w-4 text-blue-700" />
                </div>
                <div className="bg-gradient-card rounded-2xl px-5 py-4 text-base shadow-soft border border-blue-200/30">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-blue-600 text-sm font-medium">Assistente está digitando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        </div>

        {/* Área de Input Moderna - sempre visível */}
        <div className="flex-shrink-0 p-4 bg-gradient-card/50 backdrop-blur-sm border-t border-blue-200/30">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="pr-12 py-4 rounded-2xl bg-white/90 border-2 border-blue-200/40 focus:border-blue-300/60 shadow-soft transition-all duration-200 text-base font-medium placeholder:text-gray-500 font-roboto"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {inputValue.length > 0 && (
                  <span className="text-blue-500">{inputValue.length}</span>
                )}
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="h-12 w-12 rounded-full bg-gradient-pastel-blue hover:bg-gradient-pastel-purple shadow-soft hover:shadow-medium transition-all duration-200 border-2 border-blue-200/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
              ) : (
                <Send className="h-5 w-5 text-blue-700" />
              )}
            </Button>
          </div>
          
          {/* Dicas rápidas */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {['Como criar um chamado?', 'Problemas de acesso', 'Status do sistema'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="text-sm px-4 py-2 bg-gradient-pastel-green/40 text-green-700 rounded-full border border-green-200/40 hover:bg-gradient-pastel-green/60 transition-all duration-200 hover:scale-105 font-medium font-roboto"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};