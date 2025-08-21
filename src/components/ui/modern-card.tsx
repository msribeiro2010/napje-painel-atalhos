import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  hover?: boolean;
  glow?: boolean;
}

export const ModernCard = ({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  glow = false,
  ...props
}: ModernCardProps) => {
  const variants = {
    default: "bg-card border-border/50",
    gradient: "bg-gradient-to-br from-card via-card/95 to-card/90 border-border/30",
    glass: "bg-card/80 backdrop-blur-xl border-border/20",
    elevated: "bg-card shadow-xl border-border/30"
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 ease-out",
        variants[variant],
        hover && "hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]",
        glow && "hover:shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};

interface ModernCardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const ModernCardHeader = ({ 
  title, 
  description, 
  icon, 
  action, 
  className 
}: ModernCardHeaderProps) => {
  return (
    <CardHeader className={cn("pb-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-gradient-primary rounded-xl shadow-soft">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {action}
      </div>
    </CardHeader>
  );
};

export const ModernCardContent = CardContent;