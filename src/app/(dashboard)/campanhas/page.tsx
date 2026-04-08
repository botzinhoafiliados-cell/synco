'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaigns } from '@/hooks/use-campaigns';
import { 
  LayoutList,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaign';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { CampaignDetailsDrawer } from '@/components/campaigns/CampaignDetailsDrawer';
import { cn } from '@/lib/utils';

export default function CampanhasPage() {
  const { user } = useAuth();
  const { data: campaigns = [], isLoading, isError, refetch } = useCampaigns(user?.id);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                           c.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-kinetic-orange shadow-glow-orange flex items-center justify-center">
                <BarChart3 className="text-white w-5 h-5" />
             </div>
             <h1 className="text-2xl font-black uppercase tracking-tighter font-headline text-white">Campanhas</h1>
          </div>
          <p className="text-xs font-bold text-white/20 uppercase tracking-widest px-1">Monitoramento operacional e histórico de disparos</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetch()} 
            className="h-11 w-11 rounded-xl bg-deep-void border-white/5 hover:bg-white/5 transition-all shadow-skeuo-pressed"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-6 bg-white/5 p-6 rounded-2xl shadow-skeuo-flat border border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-kinetic-orange transition-colors" />
            <Input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou ID..."
              className="bg-deep-void border-none h-12 pl-12 rounded-xl text-sm font-bold shadow-skeuo-pressed placeholder:text-white/10 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
            />
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 p-1.5 bg-deep-void rounded-xl shadow-skeuo-pressed">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    statusFilter === 'all' ? "bg-kinetic-orange text-black" : "text-white/20 hover:text-white"
                  )}
                >
                  Todas
                </button>
                <button
                  onClick={() => setStatusFilter('sending')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    statusFilter === 'sending' ? "bg-blue-500 text-white" : "text-white/20 hover:text-white"
                  )}
                >
                  Em Curso
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    statusFilter === 'completed' ? "bg-emerald-500 text-white" : "text-white/20 hover:text-white"
                  )}
                >
                  Concluídas
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
          <Loader2 className="w-8 h-8 animate-spin text-kinetic-orange" />
          <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando banco de campanhas...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-2">
          <h3 className="text-sm font-black uppercase">Erro Crítico</h3>
          <p className="text-[10px] font-bold uppercase opacity-50">Falha ao acessar o motor de dados.</p>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 shadow-skeuo-flat">
               <Filter className="w-6 h-6 text-white/10" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Nenhum registro encontrado</h3>
            <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Ajuste seus filtros ou inicie um novo envio rápido.</p>
        </div>
      )}

      {/* Campaign Detail Drawer */}
      <CampaignDetailsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        campaign={selectedCampaign}
      />
    </div>
  );
}
