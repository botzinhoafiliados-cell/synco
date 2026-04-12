import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  actions, 
  className,
  children 
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2", className)}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-kinetic-orange drop-shadow-glow-orange animate-pulse-slow">
              {icon}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white/90 uppercase italic font-headline">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-white/40 text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
