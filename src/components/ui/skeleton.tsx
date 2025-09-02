import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
};

export const CardSkeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div className={cn("rounded-lg border bg-white dark:bg-neutral-800 p-6 shadow-sm", className)} {...props}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
};

export const StatCardSkeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div className={cn("rounded-xl border bg-white dark:bg-neutral-800 p-6", className)} {...props}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
};