import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ModernButtonProps extends ButtonProps {
  variant?: 'default' | 'gradient' | 'glass' | 'glow' | 'outline' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    loading = false, 
    icon, 
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      gradient: "bg-gradient-primary text-white hover:shadow-glow hover:scale-105",
      glass: "bg-card/80 backdrop-blur-xl border-border/20 hover:bg-card/90",
      glow: "bg-primary text-primary-foreground hover:shadow-glow hover:scale-105",
      outline: "border-2 border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50 backdrop-blur-sm",
      ghost: "hover:bg-accent hover:text-accent-foreground"
    };

    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        className={cn(
          "transition-all duration-300 ease-out",
          "relative overflow-hidden",
          variants[variant],
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-current/10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          "flex items-center gap-2",
          loading && "opacity-0"
        )}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>
    );
  }
);

ModernButton.displayName = "ModernButton";