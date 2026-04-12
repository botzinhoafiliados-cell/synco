// src/components/automation/DestinationBlock.tsx
'use client';

import React from 'react';
import { TactileCard } from '@/components/ui/TactileCard';
import { Button } from '@/components/ui/button';
import { Target, Users, List, Plus, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AutomationRoute } from '@/types/automation';

interface DestinationBlockProps {
  routes: AutomationRoute[];
  targetNames: Record<string, string>;
  onAdd: () => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function DestinationBlock({ routes, targetNames, onAdd, onDelete, isLoading }: DestinationBlockProps) {
  return (
    <TactileCard className="p-6 space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <Target size={14} className="text-kinetic-orange" />
          4. Distribuição (Destinos)
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAdd}
          className="h-8 gap-2 bg-white/5 border-white/10 hover:bg-kinetic-orange/10 hover:border-kinetic-orange/30 text-[9px] font-black uppercase tracking-widest"
        >
          <Plus size={14} /> Adicionar
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {routes.length > 0 ? (
          routes.map((route) => (
            <div 
              key={route.id}
              className="group flex items-center justify-between p-3 rounded-xl bg-deep-void border border-white/5 hover:border-white/10 transition-all shadow-skeuo-pressed"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                   {route.target_type === 'group' ? <Users size={14} /> : <List size={14} />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">{targetNames[route.id] || 'Carregando...'}</p>
                  <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 mt-1">
                    {route.target_type === 'group' ? 'WhatsApp Group' : 'Coleção de Destino'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => onDelete(route.id)}
                className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30">
            <Target size={32} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum destino configurado</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-deep-void/10 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
           <Loader2 className="animate-spin text-kinetic-orange" />
        </div>
      )}
    </TactileCard>
  );
}
