'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
  type?: 'operational' | 'analytical';
}

/**
 * LayoutContainer
 * 
 * Componente central de grid e contenção.
 * Implementa a estratégia de densidade híbrida sugerida na Auditoria Visual.
 * 
 * - operational: Densidade alta, para telas de ação rápida (Envio, Automações).
 * - analytical: Densidade baixa, mais respiro para relatórios e dashboards.
 */
export default function LayoutContainer({
  children,
  className,
  type = 'operational'
}: LayoutContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto transition-all duration-700 animate-in fade-in slide-in-from-bottom-2',
        // Operational: Optimized for Command Center speed and data density
        type === 'operational' && 'max-w-[1680px] flex flex-col gap-8 px-4 md:px-8 pt-6 pb-12',
        // Analytical: Optimized for executive reporting and premium spacing
        type === 'analytical' && 'max-w-[1440px] flex flex-col gap-12 px-6 md:px-12 pt-10 pb-24',
        className
      )}
    >
      {children}
    </div>
  );
}
