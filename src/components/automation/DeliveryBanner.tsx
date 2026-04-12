// src/components/automation/DeliveryBanner.tsx
'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function DeliveryBanner() {
  return (
    <div className="bg-kinetic-orange/5 border border-kinetic-orange/10 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top duration-500">
       <div className="w-10 h-10 rounded-full bg-kinetic-orange/10 flex items-center justify-center text-kinetic-orange flex-shrink-0">
          <ShieldCheck size={20} className="drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
       </div>
       <div>
         <p className="text-[11px] font-bold text-kinetic-orange uppercase tracking-wider">Entrega Inteligente SYNCO Ativa</p>
         <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter">
           Os envios são enfileirados e distribuídos automaticamente com pacing operacional seguro. 
           O intervalo, cadência e retries são geridos internamente para proteger sua conta e garantir a entrega.
         </p>
       </div>
    </div>
  );
}
