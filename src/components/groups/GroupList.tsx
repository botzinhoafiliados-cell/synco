'use client';

import React from 'react';
import { Group, Channel } from '@/types/group';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { TactileCard } from '@/components/ui/TactileCard';
import { MoreVertical, Edit, Trash2, Hash, MessageCircle, Send, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KineticButton } from '@/components/ui/KineticButton';

interface GroupListProps {
  groups: Group[];
  channels: Channel[];
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
}

export function GroupList({ groups, channels, onEdit, onDelete }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="col-span-full py-24 text-center bg-white/5 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center gap-6 animate-in fade-in duration-700">
         <div className="p-6 bg-white/5 rounded-full shadow-skeuo-flat border border-white/5">
            <Users size={48} className="text-white/10" />
         </div>
         <div className="space-y-1">
            <p className="text-white/80 font-black uppercase tracking-[0.2em] text-sm italic font-headline">Nenhum Vetor Encontrado</p>
            <p className="text-white/20 text-[10px] font-medium uppercase tracking-widest">Sua malha operacional de grupos está vazia.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {groups.map((group) => {
        const channel = channels.find(c => c.id === group.channel_id);
        const isWhatsApp = channel?.type === 'whatsapp';
        
        return (
          <TactileCard key={group.id} className="group overflow-hidden border-white/5 hover:border-kinetic-orange/20 transition-all duration-500">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-skeuo-flat ${isWhatsApp ? 'group-hover:border-emerald-500/20' : 'group-hover:border-blue-500/20'} transition-colors`}>
                    {isWhatsApp ? (
                      <MessageCircle size={20} className="text-emerald-500" />
                    ) : (
                      <Send size={20} className="text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-white/90 uppercase tracking-tight italic text-base font-headline line-clamp-1">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-white/40 h-4">
                         {channel?.name || 'Vetor Órfão'}
                       </Badge>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] bg-anthracite-surface border-white/5 shadow-skeuo-elevated">
                    <DropdownMenuItem onClick={() => onEdit(group)} className="gap-2 cursor-pointer text-[11px] font-bold uppercase tracking-widest text-white/60 focus:text-kinetic-orange">
                      <Edit size={14} /> EDITAR
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(group)} 
                      className="text-red-500 focus:text-red-400 focus:bg-red-500/10 gap-2 cursor-pointer text-[11px] font-bold uppercase tracking-widest"
                    >
                      <Trash2 size={14} /> EXCLUIR
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/[0.02] shadow-skeuo-pressed">
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Capacidade / Membros</p>
                       <p className="text-xs font-bold text-white/60 italic">{group.members_count || '--'} INTEGRANTES</p>
                    </div>
                    <Badge className="bg-emerald-500 shadow-glow-orange-intense text-white border-none font-bold text-[8px] rounded-full h-4">
                      OPERANTE
                    </Badge>
                 </div>
              </div>

              <div className="flex items-center justify-end mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 text-[9px] font-black uppercase tracking-widest gap-2 opacity-30 hover:opacity-100 transition-opacity"
                  onClick={() => onEdit(group)}
                >
                  CONFIGURAR VETOR <Edit size={12} />
                </Button>
              </div>
            </div>
          </TactileCard>
        );
      })}
    </div>
  );
}
