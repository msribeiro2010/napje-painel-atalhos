import React from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'loading';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator = ({ 
  status, 
  size = 'md', 
  showLabel = false,
  className 
}: StatusIndicatorProps) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusConfig = {
    online: {
      color: 'bg-green-500',
      animation: 'animate-pulse',
      label: 'Online'
    },
    offline: {
      color: 'bg-gray-400',
      animation: '',
      label: 'Offline'
    },
    busy: {
      color: 'bg-red-500',
      animation: 'animate-pulse',
      label: 'Ocupado'
    },
    away: {
      color: 'bg-yellow-500',
      animation: 'animate-pulse',
      label: 'Ausente'
    },
    loading: {
      color: 'bg-blue-500',
      animation: 'animate-spin',
      label: 'Carregando'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-full",
        sizes[size],
        config.color,
        config.animation
      )} />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {config.label}
        </span>
      )}
    </div>
  );
};