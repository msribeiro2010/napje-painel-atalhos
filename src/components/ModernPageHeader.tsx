import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  backTo?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function ModernPageHeader({
  title,
  subtitle,
  icon,
  iconBgColor = 'from-blue-500 to-purple-600',
  showBackButton = true,
  showHomeButton = true,
  backTo,
  actions,
  children,
}: ModernPageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-purple-950/20 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-700 overflow-hidden">
      {/* Barra superior colorida */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="p-6">
        {/* Título e Navegação */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Botões de Navegação */}
            {(showBackButton || showHomeButton) && (
              <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-md">
                {showBackButton && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-3 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={handleBack}
                    title="Voltar"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                {showHomeButton && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-3 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={handleHome}
                    title="Ir para Home"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Ícone e Título */}
            <div className="flex items-center gap-3">
              {icon && (
                <div className={cn(
                  "p-2 bg-gradient-to-br rounded-xl shadow-lg",
                  iconBgColor
                )}>
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ações Personalizadas */}
          {actions && (
            <div className="flex gap-2 items-center flex-wrap">
              {actions}
            </div>
          )}
        </div>

        {/* Conteúdo Adicional (como estatísticas) */}
        {children}
      </div>
    </div>
  );
}
