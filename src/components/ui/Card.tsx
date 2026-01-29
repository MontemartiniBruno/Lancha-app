import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ title, children, className = '', onClick }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200",
        onClick && "cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
