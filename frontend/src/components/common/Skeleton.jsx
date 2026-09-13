import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div
      className={twMerge(
        'animate-pulse bg-slate-200 dark:bg-slate-800/80',
        rounded,
        className
      )}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => (
  <div className={twMerge('app-card p-6 space-y-4', className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-8 rounded-full" />
    </div>
    <Skeleton className="h-10 w-24" />
    <Skeleton className="h-3 w-full" />
  </div>
);

export const SkeletonDiaryRow = () => (
  <div className="flex items-center justify-between py-3 px-4 border-b border-slate-100 dark:border-slate-800">
    <div className="space-y-1">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

export default Skeleton;
