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
      "bg-transparent",
      className
    )}>
      {/* Newspaper Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(42_30%_94%/0.3)] via-[hsl(40_25%_93%/0.2)] to-[hsl(42_20%_90%/0.3)] dark:from-gray-700/30 dark:via-slate-700/20 dark:to-gray-600/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[hsl(42_35%_95%/0.25)] to-[hsl(40_25%_93%/0.25)] dark:from-gray-600/20 dark:to-slate-600/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[hsl(40_25%_93%/0.25)] to-[hsl(42_35%_95%/0.25)] dark:from-slate-600/20 dark:to-gray-600/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-[hsl(42_35%_95%/0.25)] to-[hsl(40_25%_93%/0.25)] dark:from-gray-600/20 dark:to-slate-600/20 rounded-full opacity-40 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Newspaper Texture Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(85, 70, 40, 0.4) 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, rgba(85, 70, 40, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Newspaper aging effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(42_25%_88%/0.12)] via-transparent to-[hsl(42_25%_88%/0.12)] dark:from-gray-700/10 dark:via-transparent dark:to-slate-700/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(42_20%_86%/0.08)] to-transparent dark:via-gray-700/5" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
