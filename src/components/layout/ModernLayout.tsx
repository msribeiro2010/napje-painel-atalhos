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
      "bg-gradient-to-br from-gray-100 via-slate-100 to-gray-200",
      "dark:from-gray-800 dark:via-slate-800 dark:to-gray-900",
      className
    )}>
      {/* Newspaper Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200/30 via-slate-200/20 to-gray-300/30 dark:from-gray-700/30 dark:via-slate-700/20 dark:to-gray-600/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-gray-300/20 to-slate-300/20 dark:from-gray-600/20 dark:to-slate-600/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-slate-300/20 to-gray-300/20 dark:from-slate-600/20 dark:to-gray-600/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-gray-300/20 to-slate-300/20 dark:from-gray-600/20 dark:to-slate-600/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Newspaper Texture Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.05]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #000 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, #000 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Newspaper aging effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-200/10 via-transparent to-slate-200/10 dark:from-gray-700/10 dark:via-transparent dark:to-slate-700/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/5 to-transparent dark:via-gray-700/5" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};