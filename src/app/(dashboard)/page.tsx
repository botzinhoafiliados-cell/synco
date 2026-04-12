'use client';

import React from 'react';
import {
  Send,
  PackageCheck,
  DollarSign,
  Star,
  Zap,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import LayoutContainer from '@/components/layout/LayoutContainer';
import PageHeader from '@/components/shared/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { TactileCard } from '@/components/ui/TactileCard';
import { cn } from '@/lib/utils';

// ─── KPI Config ──────────────────────────────────────────────────────────────

const KPI_ITEMS = [
  {
    label: 'Mensagens Enviadas',
    value: '0',
    description: 'Aguardando fluxo real',
    trend: { value: '0%', positive: true },
    icon: <Send size={16} />,
    colorScheme: 'kinetic' as const,
  },
  {
    label: 'Produtos Ativos',
    value: '0',
    description: 'Monitoramento contínuo',
    icon: <PackageCheck size={16} />,
    colorScheme: 'default' as const,
  },
  {
    label: 'Comissão do Mês',
    value: 'R$ 0,00',
    description: 'Ciclo atual de afiliados',
    icon: <DollarSign size={16} />,
    colorScheme: 'success' as const,
  },
  {
    label: 'Score Médio',
    value: '0.0',
    description: 'Qualidade da curadoria',
    icon: <Star size={16} />,
    colorScheme: 'default' as const,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <LayoutContainer type="analytical">
      {/* Page header */}
      <PageHeader 
        title="Dashboard" 
        description="Visão geral do seu desempenho operacional e alcance de afiliados."
        icon={<LayoutDashboard size={24} />}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_ITEMS.map((item) => (
          <StatCard 
            key={item.label}
            label={item.label}
            value={item.value}
            description={item.description}
            trend={item.trend}
            icon={item.icon}
            colorScheme={item.colorScheme}
          />
        ))}
      </div>

      {/* Status panel */}
      <TactileCard className="p-8 border-none bg-gradient-to-br from-anthracite-surface to-deep-void">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-kinetic-orange/15 flex items-center justify-center border border-kinetic-orange/20">
            <Zap className="w-5 h-5 text-kinetic-orange" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90 font-headline italic">
              Status Operacional M1
            </h3>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
              Integridade do motor e conexões
            </p>
          </div>
          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/5 shadow-skeuo-pressed">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">
              Online
            </span>
          </div>
        </div>

        {/* Gradient separator — No-Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Status items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
          {[
            { label: 'Layout & Navegação', ok: true },
            { label: 'Sidebar, Topbar e design tokens', ok: true },
            { label: 'Autenticação Supabase & RLS', ok: true },
            { label: 'Engine de Curadoria (AI)', ok: true },
            { label: 'Processador de Links (Factual)', ok: true },
            { label: 'Monitoramento em Tempo Real', ok: false },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3 group">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                ok ? "bg-emerald-500/10 text-emerald-500 shadow-glow-orange/5" : "bg-white/5 text-white/10"
              )}>
                <ShieldCheck className="w-3 h-3" />
              </div>
              <span className={cn(
                "text-[11px] font-bold uppercase tracking-wider transition-colors",
                ok ? "text-white/60 group-hover:text-white" : "text-white/10"
              )}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </TactileCard>
    </LayoutContainer>
  );
}
