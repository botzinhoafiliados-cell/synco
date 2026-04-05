"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { 
    MOCK_MONITORINGS, MOCK_MONITORING_ANALYTICS, MOCK_GROUPS, 
    MOCK_DESTINATION_LISTS, MOCK_TEMPLATES, MOCK_MARKETPLACES 
} from '@/mock/mock-data';
import {
    Plus, MoreHorizontal, Play, Pause, Pencil, Trash2, 
    Activity, Link as LinkIcon, Layers, BarChart3, 
    ShieldCheck, Zap, AlertCircle, Search, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { MonitoringCharts } from '@/components/radar/MonitoringCharts';
import { Monitoring } from '@/types';

// Mock additional groups/channels for selection
const MOCK_CHANNELS = ['Telegram Ofertas', 'WhatsApp Dicas', 'Discord Promo', 'Web Crawler #1'];

export default function MonitoringPage() {
    const [monitorings, setMonitorings] = useState<Monitoring[]>(MOCK_MONITORINGS);
    const [showNew, setShowNew] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const analytics = MOCK_MONITORING_ANALYTICS;

    const toggleStatus = (id: string) => {
        setMonitorings(prev => prev.map(m => m.id === id ? { ...m, status: (m.status === 'active' ? 'paused' : 'active') } : m));
        toast.success('Status atualizado!');
    };

    const deleteMonitoring = (id: string) => {
        setMonitorings(prev => prev.filter(m => m.id !== id));
        toast.success('Monitoramento removido!');
    };

    const filtered = monitorings.filter(m => 
        m.source_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.source_channel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader title="Monitoramento" description="Rastreie fontes de ofertas em tempo real e automatize a interceptação">
                <Button size="sm" onClick={() => setShowNew(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Novo Monitoramento
                </Button>
            </PageHeader>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center gap-4 border-blue-500/20 bg-blue-500/5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-blue-600 tracking-tight">{analytics.activeLinks}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Links Interceptados (Hoje)</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-green-500/20 bg-green-500/5">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-green-600 tracking-tight">{(analytics.activeLinks * 0.7).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Publicados Automaticamente</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-purple-500/20 bg-purple-500/5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-purple-600 tracking-tight">99.8%</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Health Score do Crawler</p>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Performance de Interceptação</h3>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">Atualizado agora</Badge>
                </div>
                <MonitoringCharts hourlyData={analytics.hourlyData} sourceData={analytics.topSourceGroups} />
            </Card>

            {/* Top Items & Monitoring List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Top Items List */}
                <Card className="lg:col-span-1 p-4 h-fit">
                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" /> Top 5 Interceptados
                    </h4>
                    <div className="space-y-3">
                        {analytics.top5Items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold truncate">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{item.count} detecções</p>
                                </div>
                                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">#{i+1}</Badge>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary">
                        Ver Relatório Completo
                    </Button>
                </Card>

                {/* Main Monitoring List */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar fontes ou grupos de monitoramento..." 
                                className="pl-10 h-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] h-10">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Ativos</SelectItem>
                                <SelectItem value="paused">Pausados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-3">
                        {filtered.map((m) => (
                            <Card key={m.id} className="p-4 hover:shadow-md transition-shadow group">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.status === 'active' ? 'bg-blue-500/10' : 'bg-muted'}`}>
                                            <LinkIcon className={`w-5 h-5 ${m.status === 'active' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm">{m.source_group}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium">{m.source_channel}</Badge>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">→</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{m.dest_segments.join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                                        <div className="flex flex-col items-center px-4 border-x border-border/50">
                                            <span className="text-xs font-bold">{m.total_intercepted}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">Detectados</span>
                                        </div>
                                        <div className="flex flex-col items-center px-4 pr-6">
                                            <span className="text-xs font-bold text-green-500">{m.total_sent}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">Postados</span>
                                        </div>
                                        <StatusBadge status={m.status} />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem><Activity className="w-4 h-4 mr-2" /> Ver Logs</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleStatus(m.id)}>
                                                    {m.status === 'active' ? <><Pause className="w-4 h-4 mr-2" /> Pausar</> : <><Play className="w-4 h-4 mr-2" /> Retomar</>}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" /> Configurar Filtros</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteMonitoring(m.id)}><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap pt-3 border-t border-dashed">
                                    <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> Marketplaces: <span className="text-foreground font-semibold">{m.marketplaces.join(', ')}</span></div>
                                    <div className="flex items-center gap-1 font-bold"><Zap className="w-3 h-3 text-primary" /> Auto-postagem: <span className={m.auto_send ? 'text-green-600' : 'text-yellow-600'}>{m.auto_send ? 'LIGADA' : 'MANUAL'}</span></div>
                                    <div className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Min Score: <span className="text-foreground font-semibold">{m.min_score}</span></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dialog Novo Monitoramento */}
            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-primary" /> Configurar Novo Crawler</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Fonte (Grupo de Origem)</Label>
                                <Input placeholder="Link do grupo ou @username" className="h-9" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Canal/Plataforma</Label>
                                <Select defaultValue="Telegram Ofertas">
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>{MOCK_CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Destino (Segmentos de Publicação)</Label>
                            <Select defaultValue={MOCK_DESTINATION_LISTS[0]?.id}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>{MOCK_DESTINATION_LISTS.map(l => <SelectItem key={l.id} value={l.id}>{l.icon} {l.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Template de Mensagem</Label>
                                <Select defaultValue={MOCK_TEMPLATES[0]?.name}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>{MOCK_TEMPLATES.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Score Mínimo (0-100)</Label>
                                <Input type="number" defaultValue={70} className="h-9" />
                            </div>
                        </div>

                        <div className="space-y-3 p-4 bg-muted/50 rounded-xl border">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold">Auto-postagem</Label>
                                    <p className="text-[10px] text-muted-foreground">Postar automaticamente no destino se o score for atingido</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold">Exigir Revisão Humana</Label>
                                    <p className="text-[10px] text-muted-foreground">Mover para fila de revisão antes de postar</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                        <Button className="bg-primary text-white" onClick={() => { setShowNew(false); toast.success('Monitoramento adicionado à fila de ativação!'); }}>
                            <Activity className="w-4 h-4 mr-2" /> Iniciar Rastreamento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
