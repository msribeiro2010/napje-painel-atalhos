import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  required?: boolean;
  badge?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'border-slate-200 dark:border-slate-700',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400'
  },
  primary: {
    card: 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  secondary: {
    card: 'border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  success: {
    card: 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  warning: {
    card: 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  }
};

export const CollapsibleSection = ({
  title,
  description,
  icon,
  children,
  defaultExpanded = true,
  required = false,
  badge,
  variant = 'default',
  className
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'border-0 shadow-sm transition-all duration-300 hover:shadow-md',
      styles.card,
      className
    )}>
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-start p-0 h-auto hover:bg-transparent group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {/* Ícone da Seção */}
              {icon && (
                <div className={cn(
                  'p-2 rounded-lg transition-colors duration-200',
                  styles.iconBg
                )}>
                  <div className={cn('h-5 w-5', styles.iconColor)}>
                    {icon}
                  </div>
                </div>
              )}
              
              {/* Título e Descrição */}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  {required && (
                    <Badge variant="destructive" className="text-xs px-2 py-0.5">
                      Obrigatório
                    </Badge>
                  )}
                  {badge && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {badge}
                    </Badge>
                  )}
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Ícone de Expansão */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'p-1 rounded-md transition-all duration-200',
                'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
              )}>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                )}
              </div>
            </div>
          </div>
        </Button>
      </CardHeader>
      
      {/* Conteúdo Colapsável */}
      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <CardContent className="pt-0 pb-6">
          {children}
        </CardContent>
      </div>
    </Card>
  );
};