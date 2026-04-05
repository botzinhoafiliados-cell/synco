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
import { MOCK_AUTOMATIONS, MOCK_DESTINATION_LISTS, MOCK_TEMPLATES, MOCK_PRODUCTS } from '@/mock/mock-data';
import {
    Plus, MoreHorizontal, Play, Pause, Pencil, Trash2, Zap, Clock,
    History, Loader2, Filter, TrendingUp, Package, RotateCcw, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';
import { Automation, AutomationFrequency } from '@/types';

const FREQ_LABELS: Record<AutomationFrequency, string> = { 
    every_30min: 'A cada 30min', 
    hourly: 'A cada hora', 
    every_2h: 'A cada 2h', 
    every_4h: 'A cada 4h', 
    daily: 'Diário' 
};

const CATEGORIES = ['eletronicos', 'casa_cozinha', 'moda', 'beleza', 'esportes', 'brinquedos', 'pets', 'saude'];
const CAT_LABELS: Record<string, string> = { 
    eletronicos: 'Eletrônicos', 
    casa_cozinha: 'Casa & Cozinha', 
    moda: 'Moda', 
    beleza: 'Beleza', 
    esportes: 'Esportes', 
    brinquedos: 'Brinquedos', 
    pets: 'Pets', 
    saude: 'Saúde' 
};

const DEFAULT_FILTERS = {
    marketplace: 'all', category: 'all',
    price_min: '', price_max: '',
    commission_min: '', commission_max: '',
    discount_min: '', score_min: '',
    has_coupon: false, free_shipping: false,
    official_store: false, never_sent: false,
    exclude_adult: true,
};

function getPreviewProducts(filters: any) {
    return MOCK_PRODUCTS.filter(p => {
        if (filters.marketplace !== 'all' && p.marketplace !== filters.marketplace) return false;
        if (filters.category !== 'all' && p.category !== filters.category) return false;
        if (filters.price_min && p.current_price < Number(filters.price_min)) return false;
        if (filters.price_max && p.current_price > Number(filters.price_max)) return false;
        if (filters.commission_min && (p.commission_percent || 0) < Number(filters.commission_min)) return false;
        if (filters.discount_min && p.discount_percent < Number(filters.discount_min)) return false;
        if (filters.score_min && (p.opportunity_score || 0) < Number(filters.score_min)) return false;
        if (filters.has_coupon && !p.coupon) return false;
        if (filters.free_shipping && !p.free_shipping) return false;
        if (filters.official_store && !p.official_store) return false;
        if (filters.never_sent && p.already_sent) return false;
        return true;
    });
}

export default function AutomationsPage() {
    const [automations, setAutomations] = useState<Automation[]>(MOCK_AUTOMATIONS);
    const [showNew, setShowNew] = useState(false);
    const [showHistory, setShowHistory] = useState<Automation | null>(null);
    const [running, setRunning] = useState<string | null>(null);
    const [filters, setFilters] = useState<any>(DEFAULT_FILTERS);
    const [newName, setNewName] = useState('');
    const [newFreq, setNewFreq] = useState<AutomationFrequency>('hourly');
    const [newList, setNewList] = useState(MOCK_DESTINATION_LISTS[0]?.id || '');
    const [newTemplate, setNewTemplate] = useState(MOCK_TEMPLATES[0]?.name || '');
    const [maxProducts, setMaxProducts] = useState(10);

    const preview = getPreviewProducts(filters);

    const runNow = (a: Automation) => {
        setRunning(a.name);
        setTimeout(() => { 
            setRunning(null); 
            toast.success(`Automação "${a.name}" executada! ${Math.floor(Math.random() * 10 + 3)} produtos enviados.`); 
        }, 2000);
    };

    const toggleStatus = (name: string) => {
        setAutomations(prev => prev.map(a => a.name === name ? { ...a, status: (a.status === 'active' ? 'paused' : 'active') } : a));
        toast.success('Status alterado!');
    };

    const duplicateAutomation = (a: Automation) => {
        setAutomations(prev => [...prev, { ...a, name: `${a.name} (cópia)`, status: 'paused', total_runs: 0, total_products_sent: 0 }]);
        toast.success('Automação duplicada!');
    };

    const deleteAutomation = (name: string) => {
        setAutomations(prev => prev.filter(a => a.name !== name));
        toast.success('Automação removida!');
    };

    const handleCreate = () => {
        if (!newName.trim()) return toast.error('Dê um nome à automação');
        const listData = MOCK_DESTINATION_LISTS.find(l => l.id === newList);
        const newA: Automation = {
            name: newName,
            saved_filter_name: 'Filtro personalizado',
            min_score: Number(filters.score_min) || 0,
            max_products: maxProducts,
            frequency: newFreq,
            segment_name: listData?.name || 'Lista principal',
            template_name: newTemplate,
            status: 'active',
            no_repeat_hours: 24,
            total_runs: 0,
            total_products_sent: 0,
            last_run: null,
        };
        setAutomations(prev => [newA, ...prev]);
        setShowNew(false);
        setNewName('');
        setFilters(DEFAULT_FILTERS);
        toast.success('Automação criada e ativada!');
    };

    const setFilter = (key: string, val: any) => setFilters((prev: any) => ({ ...prev, [key]: val }));

    return (
        <div className="space-y-4">
            <PageHeader title="Automações" description="Configure regras automáticas para descoberta e envio de produtos">
                <Button size="sm" onClick={() => setShowNew(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Nova Automação
                </Button>
            </PageHeader>

            {/* Lista de automações */}
            <div className="grid gap-3">
                {automations.map((a, i) => (
                    <Card key={a.name} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.status === 'active' ? 'bg-yellow-500/10' : 'bg-muted'}`}>
                                    <Zap className={`w-5 h-5 ${a.status === 'active' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{a.name}</p>
                                        {a.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Destino: {a.segment_name} · {FREQ_LABELS[a.frequency]} · Máx {a.max_products} produtos
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <StatusBadge status={a.status} />
                                <Badge variant="secondary" className="text-xs gap-1"><Clock className="w-3 h-3" />{FREQ_LABELS[a.frequency]}</Badge>
                                <div className="text-center">
                                    <p className="text-sm font-bold">{a.total_runs}</p>
                                    <p className="text-[10px] text-muted-foreground">Execuções</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-green-500">{a.total_products_sent}</p>
                                    <p className="text-[10px] text-muted-foreground">Enviados</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => runNow(a)} disabled={running === a.name}>
                                        {running === a.name ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3 mr-1" />Executar</>}
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setShowHistory(a)}><History className="w-4 h-4 mr-2" /> Histórico</DropdownMenuItem>
                                            <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" /> Editar filtros</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => duplicateAutomation(a)}><Copy className="w-4 h-4 mr-2" /> Duplicar</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => toggleStatus(a.name)}>
                                                {a.status === 'active' ? <><Pause className="w-4 h-4 mr-2" />Pausar</> : <><Play className="w-4 h-4 mr-2" />Ativar</>}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => deleteAutomation(a.name)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span>Template: <strong className="text-foreground">{a.template_name}</strong></span>
                            <span>Última execução: <strong className="text-foreground">{a.last_run ? moment(a.last_run).format('DD/MM HH:mm') : '—'}</strong></span>
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                                <RotateCcw className="w-2.5 h-2.5" /> Repetição inteligente ativa
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Dialog de nova automação */}
            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Nova Automação</DialogTitle></DialogHeader>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Esquerda — Filtros */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Filter className="w-4 h-4 text-primary" /> Filtros de produtos</h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Marketplace</Label>
                                            <Select value={filters.marketplace} onValueChange={v => setFilter('marketplace', v)}>
                                                <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos</SelectItem>
                                                    {['Shopee', 'Mercado Livre', 'Amazon', 'Magalu', 'AliExpress'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Categoria</Label>
                                            <Select value={filters.category} onValueChange={v => setFilter('category', v)}>
                                                <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas</SelectItem>
                                                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CAT_LABELS[c]}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div><Label className="text-xs">Preço mínimo (R$)</Label><Input type="number" placeholder="0" value={filters.price_min} onChange={e => setFilter('price_min', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
                                        <div><Label className="text-xs">Preço máximo (R$)</Label><Input type="number" placeholder="Sem limite" value={filters.price_max} onChange={e => setFilter('price_max', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div><Label className="text-xs">Comissão mínima (%)</Label><Input type="number" placeholder="0" value={filters.commission_min} onChange={e => setFilter('commission_min', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
                                        <div><Label className="text-xs">Desconto mínimo (%)</Label><Input type="number" placeholder="0" value={filters.discount_min} onChange={e => setFilter('discount_min', e.target.value)} className="h-8 text-xs mt-0.5" /></div>
                                    </div>

                                    <div><Label className="text-xs">Score mínimo: <strong>{filters.score_min || '0'}</strong></Label>
                                        <input type="range" min={0} max={100} value={filters.score_min || 0} onChange={e => setFilter('score_min', e.target.value)} className="w-full accent-primary mt-1" />
                                    </div>

                                    <div className="space-y-2 pt-1">
                                        {[
                                            { key: 'has_coupon', label: 'Apenas com cupom' },
                                            { key: 'free_shipping', label: 'Apenas frete grátis' },
                                            { key: 'official_store', label: 'Apenas lojas oficiais' },
                                            { key: 'never_sent', label: 'Apenas nunca enviados' },
                                            { key: 'exclude_adult', label: 'Excluir conteúdo adulto/sensível' },
                                        ].map(f => (
                                            <div key={f.key} className="flex items-center justify-between">
                                                <Label className="text-xs font-normal">{f.label}</Label>
                                                <Switch checked={!!filters[f.key]} onCheckedChange={v => setFilter(f.key, v)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Direita — Preview + Configuração */}
                        <div className="space-y-4">
                            {/* Preview */}
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" /> Preview de produtos
                                    <Badge className="ml-auto text-xs bg-green-500/10 text-green-600 border-green-500/20" variant="outline">{preview.length} encontrado(s)</Badge>
                                </h4>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {preview.length === 0 ? (
                                        <div className="text-center py-4 text-xs text-muted-foreground">
                                            <Package className="w-6 h-6 mx-auto mb-1 opacity-40" />
                                            Nenhum produto com esses filtros
                                        </div>
                                    ) : preview.slice(0, 5).map((p, i) => (
                                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                                            <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">R$ {p.current_price.toFixed(2)} · -{p.discount_percent}% · {(p as any).commission_percent}% comissão</p>
                                            </div>
                                            <span className="text-xs font-bold text-primary">{p.opportunity_score}</span>
                                        </div>
                                    ))}
                                    {preview.length > 5 && <p className="text-xs text-muted-foreground text-center py-1">+ {preview.length - 5} produtos</p>}
                                </div>
                            </div>

                            {/* Configuração da automação */}
                            <div className="space-y-3 pt-3 border-t">
                                <h4 className="text-sm font-semibold">Configuração</h4>
                                <div><Label className="text-xs">Nome da automação</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Eletrônicos com Cupom" className="h-8 text-xs mt-0.5" /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs">Frequência</Label>
                                        <Select value={newFreq} onValueChange={(v: AutomationFrequency) => setNewFreq(v)}>
                                            <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                            <SelectContent>{Object.entries(FREQ_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div><Label className="text-xs">Máx. por rodada</Label><Input type="number" value={maxProducts} onChange={e => setMaxProducts(Number(e.target.value))} className="h-8 text-xs mt-0.5" /></div>
                                </div>
                                <div>
                                    <Label className="text-xs">Lista de destino</Label>
                                    <Select value={newList} onValueChange={setNewList}>
                                        <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>{MOCK_DESTINATION_LISTS.map(l => <SelectItem key={l.id} value={l.id} className="text-xs">{l.icon} {l.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">Template</Label>
                                    <Select value={newTemplate} onValueChange={setNewTemplate}>
                                        <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>{MOCK_TEMPLATES.map(t => <SelectItem key={t.name} value={t.name} className="text-xs">{t.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                                        <p className="text-xs font-semibold text-blue-600">Repetição inteligente ativa</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">O sistema evita repetição excessiva, reaparece gradualmente produtos de boa performance e prioriza os destinos com melhor histórico — automaticamente.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={!newName.trim()} className="bg-primary text-white">
                            <Zap className="w-4 h-4 mr-1" /> Criar e Ativar Automação
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Histórico */}
            <Dialog open={!!showHistory} onOpenChange={() => setShowHistory(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Histórico — {showHistory?.name}</DialogTitle></DialogHeader>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => {
                            const sent = Math.floor(Math.random() * 10 + 3);
                            return (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="text-sm font-medium">Execução #{(showHistory?.total_runs || 0) - i}</p>
                                        <p className="text-xs text-muted-foreground">{moment().subtract(i * 2, 'hours').format('DD/MM HH:mm')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-500">{sent} enviados</p>
                                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500">Sucesso</Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
