'use client';

import React from 'react';
import { DestinationList as DestinationType } from '@/types/destination-list';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Users, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TactileCard } from '@/components/ui/TactileCard';
import { KineticButton } from '@/components/ui/KineticButton';

interface DestinationListProps {
  destinations: DestinationType[];
  onEdit: (dest: DestinationType) => void;
  onDelete: (dest: DestinationType) => void;
}

export function DestinationList({ destinations, onEdit, onDelete }: DestinationListProps) {
  if (destinations.length === 0) {
    return (
      <div className="col-span-full py-24 text-center bg-white/5 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center gap-6 animate-in fade-in duration-700">
         <div className="p-6 bg-white/5 rounded-full shadow-skeuo-flat border border-white/5">
            <Users size={48} className="text-white/10" />
         </div>
         <div className="space-y-1">
            <p className="text-white/80 font-black uppercase tracking-[0.2em] text-sm italic font-headline">Nenhuma Coleção Ativa</p>
            <p className="text-white/20 text-[10px] font-medium uppercase tracking-widest">Suas listas de destino táticas ainda não foram configuradas.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {destinations.map((dest) => {
        const totalMembers = dest.groups?.reduce((sum, g) => sum + (g.members_count || 0), 0) || 0;
        const groupCount = dest.groups?.length || 0;
        const visibleGroups = dest.groups?.slice(0, 3) || [];
        const remainingGroups = groupCount > 3 ? groupCount - 3 : 0;

        return (
          <TactileCard key={dest.id} className="group relative overflow-hidden flex flex-col h-full border-white/5 hover:border-kinetic-orange/20 transition-all duration-500">
            {/* Header com Ícone e Menu */}
            <div className="flex justify-between items-start mb-6 p-6 pb-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-skeuo-flat border border-white/10 text-2xl group-hover:shadow-glow-orange-intense/10 transition-all">
                  {dest.icon || '📁'}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-white/90 uppercase tracking-tight italic text-lg font-headline line-clamp-1">
                    {dest.name}
                  </h3>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest truncate max-w-[150px]">
                    {dest.description || 'INFRAESTRUTURA TÁTICA'}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] bg-anthracite-surface border-white/5 shadow-skeuo-elevated">
                  <DropdownMenuItem onClick={() => onEdit(dest)} className="gap-2 cursor-pointer text-[11px] font-bold uppercase tracking-widest text-white/60 focus:text-kinetic-orange">
                    <Edit size={14} /> EDITAR
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(dest)} 
                    className="text-red-500 focus:text-red-400 focus:bg-red-500/10 gap-2 cursor-pointer text-[11px] font-bold uppercase tracking-widest"
                  >
                    <Trash2 size={14} /> EXCLUIR
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Métricas Agregadas */}
            <div className="grid grid-cols-2 gap-3 px-6 mb-4 mt-2">
              <div className="bg-white/5 rounded-2xl p-3 shadow-skeuo-pressed border border-white/[0.02] flex flex-col items-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Velas / Grupos</p>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg font-black text-white/90 font-headline italic">{groupCount}</span>
                  <p className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">Endpoints</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 shadow-skeuo-pressed border border-white/[0.02] flex flex-col items-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Alcance Real</p>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg font-black text-kinetic-orange font-headline italic">
                    {totalMembers >= 1000 ? `${(totalMembers / 1000).toFixed(1)}k` : totalMembers}
                  </span>
                  <p className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">Membros</p>
                </div>
              </div>
            </div>

            {/* Resumo dos Grupos */}
            <div className="space-y-4 flex-1 px-6 mb-6">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] italic">Mapeamento Dinâmico</span>
                <Users size={10} className="text-white/10" />
              </div>
              <div className="space-y-1.5">
                {visibleGroups.map((group, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/[0.02] p-2 rounded-xl border border-white/[0.03] group/item hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-1.5 h-1.5 rounded-full bg-kinetic-orange/40 shadow-glow-orange shrink-0 group-hover/item:bg-kinetic-orange transition-colors" />
                      <span className="text-[11px] text-white/60 font-medium truncate uppercase tracking-tight">{group.name}</span>
                    </div>
                    <span className="text-[9px] text-white/20 font-black font-headline italic">
                      {group.members_count?.toLocaleString() || '0'}
                    </span>
                  </div>
                ))}
                {remainingGroups > 0 && (
                  <div className="text-center py-2 bg-deep-void/50 rounded-xl border border-dashed border-white/5">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">+ {remainingGroups} VETORES ASSOCIADOS</span>
                  </div>
                )}
                {groupCount === 0 && (
                  <div className="text-center py-6 bg-deep-void/50 rounded-xl border border-dashed border-white/5">
                    <p className="text-[9px] text-white/10 uppercase font-black tracking-widest">NENHUM MAPA ENCONTRADO</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ação Principal */}
            <div className="p-6 pt-0 mt-auto">
              <KineticButton 
                className="w-full h-12 rounded-2xl shadow-skeuo-flat active:shadow-skeuo-pressed transition-all duration-300 gap-2 group/btn font-headline text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40 hover:opacity-100"
                onClick={() => onEdit(dest)}
              >
                <Edit size={14} className="group-hover/btn:rotate-12 transition-transform" />
                Configurar Cluster
              </KineticButton>
            </div>
          </TactileCard>
        );
      })}
    </div>
  );
}
