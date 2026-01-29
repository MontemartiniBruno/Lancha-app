import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: 'private' | 'shared' | 'weekday' | 'holiday';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  const variants = {
    private: 'bg-blue-100 text-blue-700',
    shared: 'bg-green-100 text-green-700',
    weekday: 'bg-gray-100 text-gray-700',
    holiday: 'bg-purple-100 text-purple-700'
  };
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
