// src/components/automation/TemplateBlock.tsx
'use client';

import React from 'react';
import { TactileCard } from '@/components/ui/TactileCard';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Type, Info } from 'lucide-react';

interface TemplateConfig {
  body?: string;
  tone?: string;
}

interface TemplateBlockProps {
  template: TemplateConfig;
  onUpdate: (template: TemplateConfig) => void;
}

const PLACEHOLDERS = [
  { key: '{{titulo}}', desc: 'Nome do produto' },
  { key: '{{preco}}', desc: 'Preço formatado' },
  { key: '{{pix}}', desc: 'Preço com desconto Pix' },
  { key: '{{link}}', desc: 'Link de afiliado' },
  { key: '{{desconto}}', desc: '% de desconto' }
];

export function TemplateBlock({ template, onUpdate }: TemplateBlockProps) {
  return (
    <TactileCard className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <Type size={14} className="text-kinetic-orange" />
          4. Composição (Visual da Mensagem)
        </h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Corpo da Mensagem</Label>
          <Textarea 
            className="bg-deep-void border-white/5 min-h-[180px] text-sm font-medium leading-relaxed resize-none focus:border-kinetic-orange/30 transition-all scrollbar-hide"
            placeholder="Ex: 🔥 {{titulo}} por apenas {{preco}}! 😱"
            value={template.body || ''}
            onChange={(e) => onUpdate({ ...template, body: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 opacity-40">
            <Info size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Placeholders Disponíveis</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDERS.map(p => (
              <div 
                key={p.key} 
                className="px-2 py-1 rounded bg-white/5 border border-white/5 flex flex-col items-center gap-0.5 cursor-help hover:border-kinetic-orange/20 transition-all"
                title={p.desc}
              >
                <code className="text-[10px] font-black text-kinetic-orange">{p.key}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TactileCard>
  );
}
