import React from 'react';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernLayout = ({ children, className }: ModernLayoutProps) => {
  return (
    <div className={cn(
      "min-h-screen",
      "relative overflow-hidden",
      "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50",
      "dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20",
      className
    )}>
      {/* Papyrus Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-yellow-100/20 to-orange-100/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-amber-200/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Papyrus Texture Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.08] dark:opacity-[0.15]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,69,19,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,69,19,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Papyrus aging effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-100/10 via-transparent to-yellow-100/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};