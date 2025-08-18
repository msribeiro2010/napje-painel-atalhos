import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <ModernCard variant="glass" className="max-w-md w-full">
            <ModernCardHeader
              title="Ops! Algo deu errado"
              description="Ocorreu um erro inesperado"
              icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            />
            <ModernCardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Não se preocupe, isso pode acontecer às vezes.</p>
                <p className="mt-2">Tente recarregar a página ou entre em contato com o suporte se o problema persistir.</p>
              </div>
              
              {this.state.error && (
                <details className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                <Button
                  onClick={() => this.setState({ hasError: false })}
                  variant="outline"
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar em componentes funcionais
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: string) => {
    console.error('🚨 Erro capturado:', error, errorInfo);
    // Aqui você pode enviar o erro para um serviço de monitoramento
  };

  return { handleError };
};