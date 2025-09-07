import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Clock } from '@/components/ui/clock';
import { DateDisplay } from '@/components/ui/date-display';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backTo = '/',
  children 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-border/20 shadow-sm mb-8">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Seção Principal do Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {showBackButton && (
              <Button 
                variant="outline" 
                onClick={() => navigate(backTo)}
                className="flex items-center gap-2 w-fit shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            
            {/* Título e Subtítulo */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Seção de Ações e Controles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Children (ações específicas da página) */}
            {children && (
              <div className="flex flex-wrap items-center gap-3">
                {children}
              </div>
            )}
            
            {/* Controles do Sistema */}
            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/20 shadow-sm">
              <Clock />
              <div className="h-4 w-px bg-border/40" />
              <DateDisplay />
              <div className="h-4 w-px bg-border/40" />
              <ThemeToggle />
              <div className="h-4 w-px bg-border/40" />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};