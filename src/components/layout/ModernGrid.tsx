import React from 'react';
import { cn } from '@/lib/utils';

interface ModernGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ModernGrid = ({ 
  children, 
  cols = 3, 
  gap = 'md', 
  className 
}: ModernGridProps) => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapMap = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div className={cn(
      'grid',
      colsMap[cols],
      gapMap[gap],
      className
    )}>
      {children}
    </div>
  );
};

interface ModernGridItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export const ModernGridItem = ({ 
  children, 
  span = 1, 
  className 
}: ModernGridItemProps) => {
  const spanMap = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4',
    5: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5',
    6: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6'
  };

  return (
    <div className={cn(spanMap[span], className)}>
      {children}
    </div>
  );
};