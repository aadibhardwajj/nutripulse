import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-5 sm:p-6',
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-subtle',
        padding,
        hoverEffect &&
          'transition-all duration-200 hover:border-emerald-500/40 hover:shadow-card cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
