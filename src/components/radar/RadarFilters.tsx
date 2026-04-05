'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { RadarFilters as RadarFiltersType, CATEGORY_LABELS, SAVED_FILTERS } from '@/types/radar';

interface RadarFiltersProps {
    filters: RadarFiltersType;
    onFilterChange: (filters: RadarFiltersType) => void;
    onReset: () => void;
}

export default function RadarFilters({ filters, onFilterChange, onReset }: RadarFiltersProps) {
    const [expanded, setExpanded] = useState(false);

    const updateFilter = (key: keyof RadarFiltersType, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Filtros</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={onReset}>
                        <X className="w-3 h-3 mr-1" /> Limpar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.success('Filtro salvo!')}>
                        <Save className="w-3 h-3 mr-1" /> Salvar filtro
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                </div>
            </div>

            {/* Saved Filters */}
            <div className="flex gap-2 flex-wrap mb-3">
                {SAVED_FILTERS.map((sf) => (
                    <Badge
                        key={sf.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                        onClick={() => { 
                            onFilterChange({ ...filters, ...sf.rules }); 
                            toast.success(`Filtro "${sf.name}" aplicado`); 
                        }}
                    >
                        {sf.name}
                    </Badge>
                ))}
            </div>

            {/* Basic filters - always visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                    <Label className="text-xs mb-1 block">Categoria</Label>
                    <Select value={filters.category || 'all'} onValueChange={(v) => updateFilter('category', v)}>
                        <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs mb-1 block">Preço até</Label>
                    <Input 
                        type="number" 
                        placeholder="R$ máx" 
                        className="h-9 text-xs" 
                        value={filters.price_max || ''} 
                        onChange={e => updateFilter('price_max', e.target.value ? Number(e.target.value) : null)} 
                    />
                </div>
                <div>
                    <Label className="text-xs mb-1 block">Comissão mín %</Label>
                    <Input 
                        type="number" 
                        placeholder="%" 
                        className="h-9 text-xs" 
                        value={filters.commission_percent_min || ''} 
                        onChange={e => updateFilter('commission_percent_min', e.target.value ? Number(e.target.value) : null)} 
                    />
                </div>
                <div>
                    <Label className="text-xs mb-1 block">Score mínimo</Label>
                    <Input 
                        type="number" 
                        placeholder="0-100" 
                        className="h-9 text-xs" 
                        value={filters.score_min || ''} 
                        onChange={e => updateFilter('score_min', e.target.value ? Number(e.target.value) : null)} 
                    />
                </div>
            </div>

            {/* Expanded filters */}
            {expanded && (
                <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <Label className="text-xs mb-1 block">Preço mínimo</Label>
                            <Input 
                                type="number" 
                                placeholder="R$ mín" 
                                className="h-9 text-xs" 
                                value={filters.price_min || ''} 
                                onChange={e => updateFilter('price_min', e.target.value ? Number(e.target.value) : null)} 
                            />
                        </div>
                        <div>
                            <Label className="text-xs mb-1 block">Comissão máx %</Label>
                            <Input 
                                type="number" 
                                placeholder="%" 
                                className="h-9 text-xs" 
                                value={filters.commission_percent_max || ''} 
                                onChange={e => updateFilter('commission_percent_max', e.target.value ? Number(e.target.value) : null)} 
                            />
                        </div>
                        <div>
                            <Label className="text-xs mb-1 block">Desconto mín %</Label>
                            <Input 
                                type="number" 
                                placeholder="%" 
                                className="h-9 text-xs" 
                                value={filters.discount_min || ''} 
                                onChange={e => updateFilter('discount_min', e.target.value ? Number(e.target.value) : null)} 
                            />
                        </div>
                        <div>
                            <Label className="text-xs mb-1 block">Nota mínima</Label>
                            <Input 
                                type="number" 
                                placeholder="0-5" 
                                className="h-9 text-xs" 
                                value={filters.rating_min || ''} 
                                onChange={e => updateFilter('rating_min', e.target.value ? Number(e.target.value) : null)} 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <Label className="text-xs mb-1 block">Vendas mín</Label>
                            <Input 
                                type="number" 
                                placeholder="Qtd" 
                                className="h-9 text-xs" 
                                value={filters.sales_min || ''} 
                                onChange={e => updateFilter('sales_min', e.target.value ? Number(e.target.value) : null)} 
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                            <Switch checked={!!filters.has_coupon} onCheckedChange={(v) => updateFilter('has_coupon', v)} />
                            <Label className="text-xs">Com cupom</Label>
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                            <Switch checked={!!filters.free_shipping} onCheckedChange={(v) => updateFilter('free_shipping', v)} />
                            <Label className="text-xs">Frete grátis</Label>
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                            <Switch checked={!!filters.official_store} onCheckedChange={(v) => updateFilter('official_store', v)} />
                            <Label className="text-xs">Loja oficial</Label>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                            <Switch checked={!!filters.favorites_only} onCheckedChange={(v) => updateFilter('favorites_only', v)} />
                            <Label className="text-xs">Apenas favoritos</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={!!filters.never_sent} onCheckedChange={(v) => updateFilter('never_sent', v)} />
                            <Label className="text-xs">Nunca enviado</Label>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
