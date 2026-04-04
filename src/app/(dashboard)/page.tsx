import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Visão geral do seu desempenho de afiliado.',
};

/**
 * Dashboard Page — Placeholder Fase 1
 *
 * Esta página será preenchida com o conteúdo real do Dashboard.jsx
 * na Fase 4 da migração.
 *
 * Origem planejada: scr/pages/Dashboard.jsx (botBase)
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do seu desempenho
        </p>
      </div>

      {/* Placeholder visual — será substituído na Fase 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Mensagens Enviadas', 'Produtos Ativos', 'Comissão do Mês', 'Score Médio'].map(
          (label) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2"
            >
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <div className="h-7 w-24 bg-muted animate-pulse rounded-md" />
            </div>
          )
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-medium text-muted-foreground">
            Shell SYNCO inicializada — Fase 1 concluída
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Layout, Sidebar, Topbar, design tokens e navegação em pt-BR estão operacionais.
          O conteúdo real das páginas será migrado nas Fases 2–4.
        </p>
      </div>
    </div>
  );
}
