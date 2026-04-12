// src/components/automation/AutomationHeader.tsx
import React from 'react';
import { AutomationSource } from '@/types/automation';
import { TactileCard } from '@/components/ui/TactileCard';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Info, MessageCircle, Link, Activity } from 'lucide-react';

interface AutomationHeaderProps {
  source: AutomationSource;
  onUpdate: (updates: Partial<AutomationSource>) => void;
}

export function AutomationHeader({ source, onUpdate }: AutomationHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <TactileCard className="md:col-span-2 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-kinetic-orange" size={20} />
              <h1 className="text-2xl font-bold tracking-tight">{source.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {source.external_group_id}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">(ID PROVISÓRIO)</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Monitor Ativo</span>
              <Switch 
                checked={source.is_active} 
                onCheckedChange={(checked) => onUpdate({ is_active: checked })}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Sessão</span>
              <span className="text-xs font-semibold">Canal Principal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link size={16} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Tipo de Entrada</span>
              <span className="text-xs font-semibold">Monitoramento de Grupo</span>
            </div>
          </div>
        </div>
      </TactileCard>

      <TactileCard className="p-6 flex flex-col bg-kinetic-orange/5 border-kinetic-orange/10 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
           <Activity size={120} />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            <div className="p-2 bg-kinetic-orange/20 rounded-lg">
              <Info className="text-kinetic-orange" size={20} />
            </div>
            <Badge className="bg-kinetic-orange text-white border-none font-bold text-[10px]">COMO FUNCIONA</Badge>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Este robô monitora mensagens no grupo acima. Links detectados serão convertidos para seus dados de afiliado e enviados para as rotas configuradas.
          </p>
        </div>
      </TactileCard>
    </div>
  );
}
