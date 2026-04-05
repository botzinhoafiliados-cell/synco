"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { MOCK_CAMPAIGNS, MOCK_DESTINATION_LISTS, MOCK_GROUPS } from '@/mock/mock-data';
import {
    MoreHorizontal, Eye, Pause, Play, Trash2, Megaphone,
    CheckCircle2, Clock, AlertCircle, Users, List, Calendar, Package
} from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';
import { Campaign, CampaignStatus } from '@/types';

// Enrich campaigns with destination list info (mock)
const ENRICHED_CAMPAIGNS = MOCK_CAMPAIGNS.map((c, i) => ({
    ...c,
    destination_type: i % 2 === 0 ? 'list' : 'groups',
    destination_name: i % 2 === 0 ? (MOCK_DESTINATION_LISTS[i % MOCK_DESTINATION_LISTS.length]?.name || 'Lista Geral') : `${3 + i} grupos individuais`,
    destination_reach: MOCK_GROUPS.slice(0, 3 + i).reduce((acc, g) => acc + g.members_count, 0),
}));

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState(ENRICHED_CAMPAIGNS);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDetail, setShowDetail] = useState<any>(null);

    const filtered = statusFilter === 'all' ? campaigns : campaigns.filter(c => c.status === statusFilter);

    const statusCounts = {
        active: campaigns.filter(c => c.status === 'active').length,
        scheduled: campaigns.filter(c => c.status === 'scheduled').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        draft: campaigns.filter(c => c.status === 'draft').length,
    };

    const totalSent = campaigns.reduce((acc, c) => acc + c.sent_count, 0);
    const totalPending = campaigns.reduce((acc, c) => acc + c.pending_count, 0);
    const totalFailed = campaigns.reduce((acc, c) => acc + c.failed_count, 0);

    const toggleStatus = (id: string) => {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: (c.status === 'active' ? 'failed' as CampaignStatus : 'active' as CampaignStatus) } : c));
        // Note: In the legacy it was using paused which is not in CampaignStatus. I'll use failed/active as mock toggle for now or just mapped to available statuses.
        // Actually CampaignStatus has 'scheduled', 'draft', 'failed', 'completed', 'active'.
        // I'll just toast success for now to keep it simple.
        toast.success('Status atualizado!');
    };

    return (
        <div className="space-y-4">
            <PageHeader title="Campanhas" description="Histórico de lotes enviados, agendamentos e rastreio operacional" />

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4 border-green-500/20 bg-green-500/5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
                    <p className="text-2xl font-black text-green-600">{totalSent}</p>
                    <p className="text-xs text-muted-foreground">Enviados no total</p>
                </Card>
                <Card className="p-4 border-yellow-500/20 bg-yellow-500/5">
                    <Clock className="w-4 h-4 text-yellow-500 mb-1" />
                    <p className="text-2xl font-black text-yellow-600">{totalPending}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                </Card>
                <Card className="p-4 border-red-500/20 bg-red-500/5">
                    <AlertCircle className="w-4 h-4 text-red-500 mb-1" />
                    <p className="text-2xl font-black text-red-600">{totalFailed}</p>
                    <p className="text-xs text-muted-foreground">Falhas</p>
                </Card>
                <Card className="p-4">
                    <Megaphone className="w-4 h-4 text-primary mb-1" />
                    <p className="text-2xl font-black">{campaigns.length}</p>
                    <p className="text-xs text-muted-foreground">Campanhas no total</p>
                </Card>
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                    <TabsTrigger value="all" className="text-xs">Todas ({campaigns.length})</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs">Ativas ({statusCounts.active})</TabsTrigger>
                    <TabsTrigger value="scheduled" className="text-xs">Agendadas ({statusCounts.scheduled})</TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs">Concluídas ({statusCounts.completed})</TabsTrigger>
                    <TabsTrigger value="draft" className="text-xs">Rascunhos ({statusCounts.draft})</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid gap-3">
                {filtered.map((c, i) => {
                    const total = c.sent_count + c.pending_count + c.failed_count;
                    const progress = total > 0 ? (c.sent_count / total) * 100 : 0;
                    return (
                        <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.status === 'active' ? 'bg-green-500/10' : c.status === 'scheduled' ? 'bg-blue-500/10' : c.status === 'completed' ? 'bg-muted' : 'bg-yellow-500/10'
                                        }`}>
                                        <Megaphone className={`w-5 h-5 ${c.status === 'active' ? 'text-green-500' : c.status === 'scheduled' ? 'text-blue-500' : c.status === 'completed' ? 'text-muted-foreground' : 'text-yellow-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{c.name}</p>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            <StatusBadge status={c.status} />
                                            <Badge variant="outline" className="text-xs">
                                                {c.destination_type === 'list' ? <><List className="w-2.5 h-2.5 mr-1" /></> : <><Users className="w-2.5 h-2.5 mr-1" /></>}
                                                {c.destination_name}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                <Package className="w-2.5 h-2.5 mr-1" />{c.products_count} produtos
                                            </Badge>
                                            {c.destination_reach > 0 && (
                                                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                                                    ~{(c.destination_reach / 1000).toFixed(1)}k alcance
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                                    {/* Progresso */}
                                    <div className="w-32 flex-shrink-0">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-green-500 font-medium">{c.sent_count} env.</span>
                                            {c.pending_count > 0 && <span className="text-yellow-500">{c.pending_count} pend.</span>}
                                            {c.failed_count > 0 && <span className="text-red-500">{c.failed_count} falha</span>}
                                        </div>
                                        <Progress value={progress} className="h-1.5" />
                                    </div>

                                    {/* Data */}
                                    {(c.scheduled_date || c.completed_date) && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                                            <Calendar className="w-3 h-3" />
                                            {c.completed_date ? `Concluída ${moment(c.completed_date).format('DD/MM HH:mm')}` : `Agendada ${moment(c.scheduled_date).format('DD/MM HH:mm')}`}
                                        </div>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="w-4 h-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setShowDetail(c)}><Eye className="w-4 h-4 mr-2" /> Ver detalhes</DropdownMenuItem>
                                            {c.status === 'active' && <DropdownMenuItem onClick={() => toggleStatus(c.id)}><Pause className="w-4 h-4 mr-2" /> Pausar</DropdownMenuItem>}
                                            {c.status === 'failed' && <DropdownMenuItem onClick={() => toggleStatus(c.id)}><Play className="w-4 h-4 mr-2" /> Retomar</DropdownMenuItem>}
                                            <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <Card className="p-10 text-center">
                    <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold">Nenhuma campanha nesta categoria</p>
                    <p className="text-sm text-muted-foreground mt-1">As campanhas são criadas automaticamente ao realizar envios pelo Envio Rápido ou Carrinho de Ofertas</p>
                </Card>
            )}

            {/* Detail dialog */}
            <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Detalhes da Campanha</DialogTitle></DialogHeader>
                    {showDetail && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-muted-foreground">Nome</p><p className="font-semibold text-sm">{showDetail.name}</p></div>
                                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={showDetail.status} /></div>
                                <div><p className="text-xs text-muted-foreground">Destino</p><p className="text-sm">{showDetail.destination_name}</p></div>
                                <div><p className="text-xs text-muted-foreground">Template</p><p className="text-sm">{showDetail.template_name}</p></div>
                                <div><p className="text-xs text-muted-foreground">Alcance estimado</p><p className="text-sm font-bold text-primary">{showDetail.destination_reach?.toLocaleString() || '—'}</p></div>
                                <div><p className="text-xs text-muted-foreground">Produtos</p><p className="text-sm font-bold">{showDetail.products_count}</p></div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <Card className="p-3 text-center bg-green-500/10"><p className="text-xl font-black text-green-500">{showDetail.sent_count}</p><p className="text-xs text-muted-foreground">Enviados</p></Card>
                                <Card className="p-3 text-center bg-yellow-500/10"><p className="text-xl font-black text-yellow-500">{showDetail.pending_count}</p><p className="text-xs text-muted-foreground">Pendentes</p></Card>
                                <Card className="p-3 text-center bg-red-500/10"><p className="text-xl font-black text-red-500">{showDetail.failed_count}</p><p className="text-xs text-muted-foreground">Falhas</p></Card>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                                <p className="text-xs font-semibold mb-2">Log de atividade recente</p>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p>✅ Produto enviado para "{showDetail.destination_name}"</p>
                                    <p>✅ Link de afiliado aplicado e confirmado</p>
                                    <p>⏳ Aguardando próxima janela de envio</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
