import React from 'react';
import { cn } from '@/lib/utils';

interface ModernSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
}

export const ModernSkeleton = ({ 
  className, 
  variant = 'default',
  lines = 1
}: ModernSkeletonProps) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg";
  
  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    text: "h-4",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24"
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants.text,
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, variants[variant], className)} />
  );
};

interface ModernSkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export const ModernSkeletonCard = ({ 
  className, 
  showAvatar = false,
  lines = 3
}: ModernSkeletonCardProps) => {
  return (
    <div className={cn("p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-4">
        {showAvatar && <ModernSkeleton variant="avatar" />}
        <div className="space-y-2 flex-1">
          <ModernSkeleton className="h-4 w-1/2" />
          <ModernSkeleton className="h-3 w-1/3" />
        </div>
      </div>
      
      {/* Content */}
      <ModernSkeleton variant="text" lines={lines} />
      
      {/* Footer */}
      <div className="flex space-x-2">
        <ModernSkeleton variant="button" />
        <ModernSkeleton variant="button" />
      </div>
    </div>
  );
};