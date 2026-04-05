'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import { useSelectedProducts, SelectedProduct } from '@/contexts/SelectedProductsContext';
import AIQuickHelper from '@/components/shared/AIQuickHelper';
import { 
    MOCK_GROUPS, 
    MOCK_DESTINATION_LISTS, 
    MOCK_TEMPLATES, 
    MOCK_SEND_QUEUE 
} from '@/mock/mock-data';
import {
    CheckCircle2, X, Edit2, SendHorizonal, Clock, Package,
    Users, Loader2, Store, Trash2, ChevronDown, ChevronUp,
    List, Search, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MARKETPLACE_COLORS: Record<string, string> = {
    Shopee: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Mercado Livre': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    Amazon: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    Magalu: 'bg-red-500/10 text-red-600 border-red-500/20',
    AliExpress: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const STATUS_QUEUE: Record<string, { label: string, color: string, bg: string }> = {
    sending: { label: 'Enviando...', color: 'text-blue-500', bg: 'bg-blue-500' },
    pending: { label: 'Fila', color: 'text-yellow-500', bg: 'bg-yellow-500' },
    completed: { label: 'Concluído', color: 'text-green-500', bg: 'bg-green-500' },
    scheduled: { label: 'Agendado', color: 'text-purple-500', bg: 'bg-purple-500' },
    failed: { label: 'Falhou', color: 'text-red-500', bg: 'bg-red-500' },
};

interface CartItem extends SelectedProduct {
    text: string;
    affiliate_link: string;
}

interface QueueItem {
    id: string;
    product_name: string;
    segment: string;
    groups: number;
    status: 'sending' | 'pending' | 'completed' | 'scheduled' | 'failed';
    time: string; // Refletindo mock-data.ts
}

function generateText(product: SelectedProduct) {
    const eco = ((product.original_price || 0) - (product.current_price || 0)).toFixed(2);
    let text = `🔥 *${product.name}*\n\n`;
    text += `De ~R$ ${product.original_price?.toFixed(2) || '?'}~ por apenas *R$ ${product.current_price?.toFixed(2) || '?'}*!\n\n`;
    text += `💰 Economia de R$ ${eco} (${product.discount_percent}% OFF)\n`;
    text += `🏪 Loja\n`;
    text += `\n👉 ${product.original_link || '#'}\n\n`;
    text += `⏰ Corre que acaba rápido!`;
    return text;
}

export default function CarrinhoOfertasPage() {
    const { selectedProducts, removeProduct, clearProducts } = useSelectedProducts();
    const [items, setItems] = useState<CartItem[]>([]);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [destMode, setDestMode] = useState<'list' | 'groups'>('list');
    const [selectedList, setSelectedList] = useState(MOCK_DESTINATION_LISTS[0]?.id || '');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [groupSearch, setGroupSearch] = useState('');
    const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
    const [sending, setSending] = useState(false);
    const [queue, setQueue] = useState<QueueItem[]>(MOCK_SEND_QUEUE as unknown as QueueItem[]);

    useEffect(() => {
        if (selectedProducts.length > 0) {
            const enriched: CartItem[] = selectedProducts.map(p => ({
                ...p,
                affiliate_link: `https://${(p.marketplace || 'shopee').toLowerCase().replace(/ /g, '')}.com.br/af/${p.id.toString().toLowerCase()}?aff=user123`,
                text: generateText(p),
            }));
            setItems(enriched);
            setCheckedIds(enriched.map(p => p.id));
        } else {
            setItems([]);
            setCheckedIds([]);
        }
    }, [selectedProducts]);

    const toggleCheck = (id: string) => setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const startEdit = (item: CartItem) => { setEditingId(item.id); setEditText(item.text); setExpandedId(item.id); };
    const saveEdit = () => { setItems(prev => prev.map(p => p.id === editingId ? { ...p, text: editText } : p)); setEditingId(null); };
    const removeItem = (id: string) => { 
        setItems(prev => prev.filter(p => p.id !== id)); 
        setCheckedIds(prev => prev.filter(i => i !== id)); 
        removeProduct(id); 
    };

    const handleSend = async () => {
        const toSend = items.filter(i => checkedIds.includes(i.id));
        if (toSend.length === 0) return toast.error('Selecione ao menos um produto');
        if (destMode === 'list' && !selectedList) return toast.error('Selecione uma lista de destino');
        if (destMode === 'groups' && selectedGroups.length === 0) return toast.error('Selecione ao menos um grupo');
        
        setSending(true);
        await new Promise(r => setTimeout(r, 2000));
        
        const destLabel = destMode === 'list'
            ? MOCK_DESTINATION_LISTS.find(l => l.id === selectedList)?.name || 'Lista'
            : `${selectedGroups.length} grupos`;
            
        const newItems: QueueItem[] = toSend.map((p, idx) => ({
            id: `new_${Date.now()}_${idx}`,
            product_name: p.name,
            segment: destLabel,
            groups: destMode === 'list' ? (MOCK_DESTINATION_LISTS.find(l => l.id === selectedList)?.group_ids.length || 0) : selectedGroups.length,
            status: 'pending' as const,
            time: 'Hoje'
        }));
        
        setQueue(prev => [...newItems, ...prev]);
        setSending(false);
        clearProducts();
        toast.success(`${toSend.length} produto(s) adicionados à fila para "${destLabel}"`);
    };

    const checkedItems = items.filter(i => checkedIds.includes(i.id));
    const activeGroups = MOCK_GROUPS.filter(g => g.status === 'active' && g.name.toLowerCase().includes(groupSearch.toLowerCase()));
    
    const selectedListData = MOCK_DESTINATION_LISTS.find(l => l.id === selectedList);
    const listMembers = selectedListData ? MOCK_GROUPS.filter(g => selectedListData.group_ids.includes(g.id)).reduce((acc, g) => acc + (g.members_count || 0), 0) : 0;
    const groupMembers = MOCK_GROUPS.filter(g => selectedGroups.includes(g.id)).reduce((acc, g) => acc + (g.members_count || 0), 0);
    const totalReach = destMode === 'list' ? listMembers : groupMembers;

    return (
        <div className="space-y-4">
            <PageHeader title="Carrinho de Ofertas" description="Produtos selecionados do Radar — prepare e envie em lote">
                {items.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCheckedIds(items.map(i => i.id))} className="text-xs">Selecionar todos</Button>
                        <Button variant="ghost" size="sm" onClick={() => { clearProducts(); }} className="text-xs text-red-500">
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpar tudo
                        </Button>
                    </div>
                )}
            </PageHeader>

            <div className="grid xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3 space-y-3">
                    {items.length > 0 && (
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/60 border">
                            <input type="checkbox" checked={checkedIds.length === items.length && items.length > 0}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.checked ? setCheckedIds(items.map(i => i.id)) : setCheckedIds([])}
                                className="w-4 h-4 accent-primary cursor-pointer" />
                            <span className="text-sm font-medium">{checkedIds.length} de {items.length} selecionados</span>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs" variant="outline">{checkedItems.length} para enviar</Badge>
                        </div>
                    )}

                    {items.length === 0 ? (
                        <Card className="p-10 text-center">
                            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="font-semibold">Carrinho vazio</p>
                            <p className="text-sm text-muted-foreground mt-1">Selecione produtos no Radar de Ofertas para preparar o envio</p>
                            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/radar-ofertas'}>
                                Ir para o Radar
                            </Button>
                        </Card>
                    ) : (
                        items.map(item => (
                            <Card key={item.id} className={cn("p-4 transition-all", checkedIds.includes(item.id) ? 'border-primary/40 bg-primary/[0.02]' : '')}>
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" checked={checkedIds.includes(item.id)} onChange={() => toggleCheck(item.id)} className="w-4 h-4 accent-primary mt-1 flex-shrink-0 cursor-pointer" />
                                    <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'; }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <Badge variant="outline" className={cn("text-xs", MARKETPLACE_COLORS[item.marketplace] || '')}>
                                                        <Store className="w-2.5 h-2.5 mr-1" />{item.marketplace || 'Shopee'}
                                                    </Badge>
                                                    <span className="text-xs text-green-500 font-medium">-{item.discount_percent}%</span>
                                                    <span className="text-xs font-bold text-primary">R$ {item.current_price?.toFixed(2)}</span>
                                                    <span className="text-xs text-green-600 font-medium">💰 {item.commission_percent}%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Edit2 className="w-3.5 h-3.5" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-500" onClick={() => removeItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                                                    {expandedId === item.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
                                            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                                            <span className="text-[10px] text-green-600 font-medium whitespace-nowrap">Link afiliado aplicado</span>
                                            <span className="text-[10px] font-mono text-muted-foreground truncate">{item.affiliate_link}</span>
                                        </div>
                                        {expandedId === item.id && (
                                            <div className="mt-3">
                                                {editingId === item.id ? (
                                                    <div>
                                                        <Textarea value={editText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)} className="h-32 text-xs" />
                                                        <div className="flex gap-2 mt-2">
                                                            <Button size="sm" className="h-7 text-xs" onClick={saveEdit}>Salvar</Button>
                                                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancelar</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 rounded-lg bg-muted/50 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-auto border">{item.text}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}

                    {/* Fila atual */}
                    {queue.length > 0 && (
                        <Card className="p-4">
                            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-500" /> Fila de envios atual
                            </h3>
                            <div className="space-y-2">
                                {queue.map((q: QueueItem) => {
                                    const s = STATUS_QUEUE[q.status] || { label: 'Desconhecido', color: 'text-gray-500', bg: 'bg-gray-500' };
                                    return (
                                        <div key={q.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 border border-transparent hover:border-border transition-colors">
                                            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", s.bg, q.status === 'sending' ? 'animate-pulse' : '')} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{q.product_name}</p>
                                                <p className="text-[10px] text-muted-foreground">{q.segment} · {q.groups} grupos</p>
                                            </div>
                                            <span className={cn("text-[10px] font-bold flex-shrink-0 uppercase tracking-wider", s.color)}>{s.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Painel direito */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Template */}
                    <Card className="p-4">
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Template de mensagem
                        </h3>
                        <Select defaultValue={MOCK_TEMPLATES[0]?.name}>
                            <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {MOCK_TEMPLATES.map(t => <SelectItem key={t.id} value={t.name} className="text-xs">{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Card>

                    {/* Destino — modo dual */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-blue-500" />
                            <h3 className="font-semibold text-sm">Destino do envio</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button onClick={() => setDestMode('list')}
                                className={cn("p-2.5 rounded-xl border-2 text-left transition-all", destMode === 'list' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                                <List className={cn("w-4 h-4 mb-1", destMode === 'list' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Lista de Destino</p>
                                <p className="text-[10px] text-muted-foreground">Grupos pré-configurados</p>
                            </button>
                            <button onClick={() => setDestMode('groups')}
                                className={cn("p-2.5 rounded-xl border-2 text-left transition-all", destMode === 'groups' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                                <Users className={cn("w-4 h-4 mb-1", destMode === 'groups' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Grupos Individuais</p>
                                <p className="text-[10px] text-muted-foreground">Selecione manualmente</p>
                            </button>
                        </div>

                        {destMode === 'list' ? (
                            <div className="space-y-1.5">
                                {MOCK_DESTINATION_LISTS.map(dl => {
                                    const groupsCount = dl.group_ids.length;
                                    const membersCount = MOCK_GROUPS.filter(g => dl.group_ids.includes(g.id)).reduce((acc, g) => acc + (g.members_count || 0), 0);
                                    return (
                                        <button key={dl.id} onClick={() => setSelectedList(dl.id)}
                                            className={cn("w-full text-left flex items-center gap-2.5 p-2 rounded-lg border-2 transition-all", selectedList === dl.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>
                                            <span className="text-base">{dl.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold">{dl.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{groupsCount} grupos · {membersCount.toLocaleString()} membros</p>
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
                                <div className="space-y-1 max-h-52 overflow-y-auto border rounded-lg p-1">
                                    {activeGroups.map(g => (
                                        <button key={g.id} onClick={() => setSelectedGroups(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                                            className={cn("w-full text-left flex items-center gap-2.5 p-2 rounded-lg transition-colors border", selectedGroups.includes(g.id) ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/60 border-transparent')}>
                                            <div className={cn("w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border", selectedGroups.includes(g.id) ? 'bg-primary border-primary' : 'border-muted-foreground/40')}>
                                                {selectedGroups.includes(g.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{g.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{(g.members_count || 0).toLocaleString()} membros · {g.platform}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {totalReach > 0 && (
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground">
                                    Alcance estimado: <span className="font-bold text-primary">{totalReach.toLocaleString()} pessoas</span>
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Quando enviar */}
                    <Card className="p-4">
                        <h3 className="font-semibold text-sm mb-3">Quando enviar</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setScheduleMode('now')} className={cn("p-3 rounded-xl border-2 transition-all text-left", scheduleMode === 'now' ? 'border-primary bg-primary/5' : 'border-border')}>
                                <SendHorizonal className={cn("w-4 h-4 mb-1", scheduleMode === 'now' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Agora</p>
                                <p className="text-[10px] text-muted-foreground">Fila imediata</p>
                            </button>
                            <button onClick={() => setScheduleMode('schedule')} className={cn("p-3 rounded-xl border-2 transition-all text-left", scheduleMode === 'schedule' ? 'border-primary bg-primary/5' : 'border-border')}>
                                <Clock className={cn("w-4 h-4 mb-1", scheduleMode === 'schedule' ? 'text-primary' : 'text-muted-foreground')} />
                                <p className="text-xs font-semibold">Agendar</p>
                                <p className="text-[10px] text-muted-foreground">Escolher horário</p>
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">Cadência gerenciada automaticamente pelo sistema.</p>
                    </Card>

                    {/* Resumo e botão */}
                    <Card className={cn("p-4 border-t-4 border-t-primary", checkedItems.length > 0 ? 'shadow-lg' : 'opacity-80')}>
                        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Resumo do Envio</h3>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground">Produtos</span><span className="font-bold text-primary">{checkedItems.length}</span></div>
                            <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground">Destino</span>
                                <span className="font-semibold text-xs text-right truncate max-w-[150px]">
                                    {destMode === 'list' ? (selectedListData?.name || '—') : `${selectedGroups.length} grupo(s)`}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-dashed pb-1"><span className="text-muted-foreground">Alcance</span><span className="font-bold text-primary">{totalReach.toLocaleString()}</span></div>
                            <div className="flex justify-between pb-1"><span className="text-muted-foreground">Modo</span><span className="font-semibold">{scheduleMode === 'now' ? 'Imediato' : 'Agendado'}</span></div>
                        </div>
                        <Button className="w-full bg-primary text-white font-bold h-11" disabled={sending || checkedItems.length === 0} onClick={handleSend}>
                            {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</> : <><SendHorizonal className="w-4 h-4 mr-2" />Enviar {checkedItems.length} produto(s)</>}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
