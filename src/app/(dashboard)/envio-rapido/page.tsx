'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import AIQuickHelper from '@/components/shared/AIQuickHelper';
import { MOCK_GROUPS, MOCK_DESTINATION_LISTS } from '@/mock/mock-data';
import {
    Link2, Loader2, SendHorizonal, CheckCircle2, Clock,
    Edit2, Users, CalendarClock, Sparkles, Store, List, Search, X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TONE_OPTIONS = [
    { value: 'auto', label: '✨ Automático', desc: 'IA adapta ao produto' },
    { value: 'vendedor', label: '🔥 Vendedor', desc: 'Urgência e conversão' },
    { value: 'divertido', label: '😄 Descontraído', desc: 'Leve e acessível' },
    { value: 'profissional', label: '💼 Profissional', desc: 'Sério e direto' },
    { value: 'natural', label: '🌿 Natural', desc: 'Conversa informal' },
];

const MARKETPLACE_COLORS: Record<string, string> = {
    Shopee: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Mercado Livre': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    Amazon: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    Magalu: 'bg-red-500/10 text-red-600 border-red-500/20',
};

interface ProcessedProduct {
    id: number;
    name: string;
    marketplace: string;
    original_price: number;
    current_price: number;
    discount_percent: number;
    commission_percent: number;
    coupon?: string;
    image_url: string;
    affiliate_link: string;
    text: string;
}

const MOCK_PROCESSED: ProcessedProduct[] = [
    { 
        id: 1, 
        name: "Fone Bluetooth TWS Pro Max", 
        marketplace: "Shopee", 
        original_price: 189.90, 
        current_price: 49.90, 
        discount_percent: 74, 
        commission_percent: 12, 
        coupon: "TECH10", 
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", 
        affiliate_link: "https://shope.ee/abc123?af=user_shopee_123", 
        text: "🔥 *Fone Bluetooth TWS Pro Max*\n\nDe ~R$ 189,90~ por apenas *R$ 49,90*!\n\n💰 Economia de R$ 140,00 (74% OFF)\n🏪 TechStore Oficial\n\n🎟️ Cupom: *TECH10*\n\n👉 https://shope.ee/abc123?af=user_shopee_123\n\n⏰ Corre que acaba rápido!" 
    },
    { 
        id: 2, 
        name: "Organizador Maquiagem Acrílico 360°", 
        marketplace: "Shopee", 
        original_price: 149.90, 
        current_price: 59.90, 
        discount_percent: 60, 
        commission_percent: 18, 
        coupon: "BELEZA15", 
        image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop", 
        affiliate_link: "https://shope.ee/xyz456?af=user_shopee_123", 
        text: "💄 *Organizador Maquiagem Acrílico 360°*\n\nDe ~R$ 149,90~ por *R$ 59,90*!\n\n🎟️ Cupom: *BELEZA15*\n\n🔗 https://shope.ee/xyz456?af=user_shopee_123\n\n🚀 Aproveite!" 
    },
];

export default function EnvioRapidoPage() {
    const [links, setLinks] = useState('');
    const [processing, setProcessing] = useState(false);
    const [processed, setProcessed] = useState<ProcessedProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [tone, setTone] = useState('auto');
    const [destMode, setDestMode] = useState<'list' | 'groups'>('list');
    const [selectedList, setSelectedList] = useState(MOCK_DESTINATION_LISTS[0]?.id || '');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [groupSearch, setGroupSearch] = useState('');
    const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    const handleProcess = async () => {
        if (!links.trim()) return toast.error('Cole pelo menos um link');
        setProcessing(true);
        await new Promise(r => setTimeout(r, 1800));
        setProcessed(MOCK_PROCESSED);
        setSelectedIds(MOCK_PROCESSED.map(p => p.id));
        setProcessing(false);
        toast.success(`${MOCK_PROCESSED.length} produto(s) processados com links de afiliado aplicados`);
    };

    const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const startEdit = (item: ProcessedProduct) => { setEditingId(item.id); setEditText(item.text); };
    const saveEdit = () => { setProcessed(prev => prev.map(p => p.id === editingId ? { ...p, text: editText } : p)); setEditingId(null); };

    const handleSend = async () => {
        const toSend = processed.filter(p => selectedIds.includes(p.id));
        if (toSend.length === 0) return toast.error('Selecione ao menos um produto');
        if (destMode === 'list' && !selectedList) return toast.error('Selecione uma lista de destino');
        if (destMode === 'groups' && selectedGroups.length === 0) return toast.error('Selecione ao menos um grupo');
        
        setSending(true);
        await new Promise(r => setTimeout(r, 2000));
        setSending(false);
        setSent(true);
        toast.success(`${toSend.length} produto(s) adicionados à fila de envio`);
    };

    const activeGroups = MOCK_GROUPS.filter(g => g.status === 'active' && g.name.toLowerCase().includes(groupSearch.toLowerCase()));
    
    interface DestinationList {
        id: string;
        name: string;
        icon: string;
        group_ids: string[];
    }
    
    const selectedListData = MOCK_DESTINATION_LISTS.find(l => l.id === selectedList);
    const listMembers = selectedListData ? MOCK_GROUPS.filter(g => selectedListData.group_ids.includes(g.id)).reduce((acc, g) => acc + (g.members_count || 0), 0) : 0;
    const groupMembers = MOCK_GROUPS.filter(g => selectedGroups.includes(g.id)).reduce((acc, g) => acc + (g.members_count || 0), 0);
    const totalReach = destMode === 'list' ? listMembers : groupMembers;
    const selectedItems = processed.filter(p => selectedIds.includes(p.id));

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Envio na fila!</h2>
                    <p className="text-muted-foreground">{selectedItems.length} produto(s) · {totalReach.toLocaleString()} pessoas alcançadas</p>
                    <p className="text-sm text-muted-foreground mt-1">Cadência de envio gerenciada automaticamente pelo sistema</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setSent(false); setProcessed([]); setLinks(''); setSelectedIds([]); }}>Novo envio</Button>
                    <Button className="bg-primary text-white" onClick={() => window.location.href = '/carrinho-ofertas'}><Link2 className="w-4 h-4 mr-2" /> Ver fila</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <PageHeader title="Envio Rápido" description="Cole links, gere textos com IA e envie para suas listas — tudo em uma tela">
                <AIQuickHelper />
            </PageHeader>

            <div className="grid xl:grid-cols-5 gap-4">
                {/* Coluna esquerda */}
                <div className="xl:col-span-3 space-y-4">
                    {/* Cole os links */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Link2 className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm">Cole os links dos produtos</h3>
                            <Badge variant="outline" className="ml-auto text-xs">Um por linha</Badge>
                        </div>
                        <Textarea value={links} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLinks(e.target.value)}
                            placeholder={"https://shopee.com.br/produto/123\nhttps://mercadolivre.com.br/produto/456\nhttps://amazon.com.br/dp/XXXXX"}
                            className="h-24 text-sm font-mono resize-none" />
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                            <p className="text-xs text-muted-foreground max-w-md">
                                {links.split('\n').filter(l => l.trim()).length} link(s) · Marketplace detectado automaticamente · Link de afiliado aplicado automaticamente
                            </p>
                            <Button onClick={handleProcess} disabled={processing || !links.trim()} className="bg-primary text-white h-9" size="sm">
                                {processing ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Processando...</> : <><Sparkles className="w-3.5 h-3.5 mr-2" />Processar links</>}
                            </Button>
                        </div>
                    </Card>

                    {/* Tonalidade do texto */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <h3 className="font-semibold text-sm">Tonalidade do texto (IA)</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {TONE_OPTIONS.map(t => (
                                <button key={t.value} onClick={() => setTone(t.value)}
                                    className={cn("px-3 py-1.5 rounded-full border text-xs transition-all", tone === t.value ? 'bg-primary text-white border-primary shadow-sm' : 'border-border hover:border-primary/50 hover:text-primary')}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                            {TONE_OPTIONS.find(t => t.value === tone)?.desc || ''} — Os textos gerados respeitarão essa tonalidade.
                        </p>
                    </Card>

                    {/* Produtos processados */}
                    {processed.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/60 border">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold text-green-600">{processed.length} produto(s) processados</span>
                                <span className="text-xs text-muted-foreground ml-auto">{selectedIds.length} selecionados para envio</span>
                            </div>
                            {processed.map(item => (
                                <Card key={item.id} className={cn("p-4 transition-all", selectedIds.includes(item.id) ? 'border-primary/40 bg-primary/[0.02]' : 'opacity-70')}>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                            <button onClick={() => toggleSelect(item.id)} className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", selectedIds.includes(item.id) ? 'bg-primary border-primary' : 'border-muted-foreground/40')}>
                                                {selectedIds.includes(item.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </button>
                                            <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover border" onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'; }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate">{item.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <Badge variant="outline" className={cn("text-[10px]", MARKETPLACE_COLORS[item.marketplace] || '')}>
                                                            <Store className="w-2.5 h-2.5 mr-1" />{item.marketplace}
                                                        </Badge>
                                                        <span className="text-xs text-green-500 font-medium">-{item.discount_percent}%</span>
                                                        <span className="text-xs text-primary font-bold">R$ {item.current_price.toFixed(2)}</span>
                                                        <span className="text-[10px] text-green-600 font-bold tracking-tight">💰 {item.commission_percent}%</span>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Edit2 className="w-3.5 h-3.5" /></Button>
                                            </div>
                                            <div className="mt-2 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Link de afiliado aplicado</span>
                                                </div>
                                                <p className="text-[10px] font-mono text-muted-foreground truncate">{item.affiliate_link}</p>
                                            </div>
                                            {editingId === item.id ? (
                                                <div className="mt-2">
                                                    <Textarea value={editText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)} className="h-28 text-xs font-mono" />
                                                    <div className="flex gap-2 mt-2">
                                                        <Button size="sm" className="h-7 text-xs" onClick={saveEdit}>Salvar Texto</Button>
                                                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancelar</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-2 p-2 rounded-lg bg-muted/40 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-24 overflow-auto border">{item.text}</div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Coluna direita */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Destino */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-blue-500" />
                            <h3 className="font-semibold text-sm">Destino do envio</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button onClick={() => setDestMode('list')} className={cn("p-2.5 rounded-xl border-2 text-left transition-all", destMode === 'list' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                                <List className={cn("w-4 h-4 mb-1", destMode === 'list' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Lista de Destino</p>
                                <p className="text-[10px] text-muted-foreground">Grupos pré-config.</p>
                            </button>
                            <button onClick={() => setDestMode('groups')} className={cn("p-2.5 rounded-xl border-2 text-left transition-all", destMode === 'groups' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                                <Users className={cn("w-4 h-4 mb-1", destMode === 'groups' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Grupos Individuais</p>
                                <p className="text-[10px] text-muted-foreground">Seleção manual</p>
                            </button>
                        </div>

                        {destMode === 'list' ? (
                            <div className="space-y-1.5">
                                {MOCK_DESTINATION_LISTS.map(dl => {
                                    const members = MOCK_GROUPS.filter(g => dl.group_ids.includes(g.id)).reduce((acc, g) => acc + (g.members_count || 0), 0);
                                    return (
                                        <button key={dl.id} onClick={() => setSelectedList(dl.id)}
                                            className={cn("w-full text-left flex items-center gap-2.5 p-2 rounded-lg border-2 transition-all", selectedList === dl.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>
                                            <span className="text-base">{dl.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold">{dl.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{dl.group_ids.length} grupos · {members.toLocaleString()} membros</p>
                                            </div>
                                            {selectedList === dl.id && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div>
                                <div className="relative mb-2">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input value={groupSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupSearch(e.target.value)} placeholder="Buscar grupo..." className="pl-8 h-8 text-xs" />
                                </div>
                                <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-1">
                                    {activeGroups.map(g => (
                                        <button key={g.id} onClick={() => setSelectedGroups(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                                            className={cn("w-full text-left flex items-center gap-2.5 p-2 rounded-lg transition-colors border", selectedGroups.includes(g.id) ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/60 border-transparent')}>
                                            <div className={cn("w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border", selectedGroups.includes(g.id) ? 'bg-primary border-primary' : 'border-muted-foreground/40')}>
                                                {selectedGroups.includes(g.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{g.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{(g.members_count || 0).toLocaleString()} membros</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {totalReach > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground">Alcance: <span className="font-bold text-primary">{totalReach.toLocaleString()} pessoas</span></p>
                            </div>
                        )}
                    </Card>

                    {/* Quando */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3"><CalendarClock className="w-4 h-4 text-purple-500" /><h3 className="font-semibold text-sm">Quando enviar</h3></div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setScheduleMode('now')} className={cn("p-3 rounded-xl border-2 transition-all text-left", scheduleMode === 'now' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                                <SendHorizonal className={cn("w-4 h-4 mb-1", scheduleMode === 'now' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Agora</p>
                                <p className="text-[10px] text-muted-foreground">Fila imediata</p>
                            </button>
                            <button onClick={() => setScheduleMode('schedule')} className={cn("p-3 rounded-xl border-2 transition-all text-left", scheduleMode === 'schedule' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                                <Clock className={cn("w-4 h-4 mb-1", scheduleMode === 'schedule' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Agendar</p>
                                <p className="text-[10px] text-muted-foreground">Escolha data e hora</p>
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">Sugestão do sistema: <strong>18–20h</strong> tem o melhor histórico de engajamento.</p>
                    </Card>

                    {/* Resumo */}
                    <Card className={cn("p-4 border-t-4 border-t-primary shadow-sm", processed.length > 0 ? 'bg-primary/[0.01]' : 'opacity-80')}>
                        <h3 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">Resumo do Envio</h3>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground">Produtos</span><span className="font-bold">{selectedItems.length}</span></div>
                            <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground">Destino</span>
                                <span className="font-semibold text-xs truncate max-w-[150px]">{destMode === 'list' ? (selectedListData?.name || '—') : `${selectedGroups.length} grupo(s)`}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground">Alcance</span><span className="font-bold text-primary">{totalReach.toLocaleString()}</span></div>
                            <div className="flex justify-between pb-1"><span className="text-muted-foreground">Modo</span><span className="font-semibold">{scheduleMode === 'now' ? 'Imediato' : 'Agendado'}</span></div>
                        </div>
                        <Button className="w-full bg-primary text-white font-bold h-11" disabled={sending || processed.length === 0 || selectedItems.length === 0} onClick={handleSend}>
                            {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</> : <><SendHorizonal className="w-4 h-4 mr-2" /> {scheduleMode === 'now' ? 'Enviar agora' : 'Agendar envio'}</>}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
