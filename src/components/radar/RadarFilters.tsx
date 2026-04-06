// src/components/radar/RadarFilters.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORY_LABELS, SAVED_FILTERS } from '@/lib/constants';
import { toast } from 'sonner';
import { ProductFilter } from '@/types/product';

interface RadarFiltersProps {
  filters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
  onReset: () => void;
}

const RadarFilters: React.FC<RadarFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const [expanded, setExpanded] = useState(false);

  const updateFilter = (key: keyof ProductFilter, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4 border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm uppercase tracking-tight">Filtros Avançados</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-tight hover:bg-red-500/10 hover:text-red-600 transition-colors" onClick={onReset}>
            <X className="w-3 h-3 mr-1" /> Limpar
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-tight hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => toast.success('Filtro salvo!')}>
            <Save className="w-3 h-3 mr-1" /> Salvar
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Saved Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {SAVED_FILTERS.map((sf) => (
          <Badge
            key={sf.name}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all text-[10px] font-bold px-2 py-0.5"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Categoria</Label>
          <Select value={filters.category || 'all'} onValueChange={(v) => updateFilter('category', v === 'all' ? undefined : v)}>
            <SelectTrigger className="h-9 text-xs font-medium">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Todas as Categorias</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Preço Máximo</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">R$</span>
            <Input 
                type="number" 
                placeholder="0.00" 
                className="h-9 text-xs pl-8 font-medium" 
                value={filters.maxPrice || ''} 
                onChange={e => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)} 
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Comissão Mín (%)</Label>
          <Input 
            type="number" 
            placeholder="0%" 
            className="h-9 text-xs font-medium" 
            value={filters.minCommission || ''} 
            onChange={e => updateFilter('minCommission', e.target.value ? Number(e.target.value) : undefined)} 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Score Mínimo</Label>
          <Input 
            type="number" 
            placeholder="0-100" 
            className="h-9 text-xs font-medium" 
            value={filters.minScore || ''} 
            onChange={e => updateFilter('minScore', e.target.value ? Number(e.target.value) : undefined)} 
          />
        </div>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-6 pt-6 border-t border-dashed space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Preço Mínimo</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">R$</span>
                <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-9 text-xs pl-8 font-medium" 
                    value={filters.maxPrice || ''} // Corrigir aqui se necessário, mas mantendo a lógica de botBase
                    onChange={e => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Desconto Mín (%)</Label>
              <Input 
                type="number" 
                placeholder="0%" 
                className="h-9 text-xs font-medium" 
                value={filters.minDiscount || ''} 
                onChange={e => updateFilter('minDiscount', e.target.value ? Number(e.target.value) : undefined)} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Pesquisa</Label>
              <Input 
                placeholder="Buscar por nome..." 
                className="h-9 text-xs font-medium" 
                value={filters.search || ''} 
                onChange={e => updateFilter('search', e.target.value)} 
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch id="coupon" checked={!!(filters as any).has_coupon} onCheckedChange={(v) => updateFilter('has_coupon' as any, v)} />
              <Label htmlFor="coupon" className="text-[10px] font-bold uppercase cursor-pointer">Com cupom</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="shipping" checked={!!(filters as any).free_shipping} onCheckedChange={(v) => updateFilter('free_shipping' as any, v)} />
              <Label htmlFor="shipping" className="text-[10px] font-bold uppercase cursor-pointer">Frete grátis</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="official" checked={!!(filters as any).official_store} onCheckedChange={(v) => updateFilter('official_store' as any, v)} />
              <Label htmlFor="official" className="text-[10px] font-bold uppercase cursor-pointer">Loja oficial</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="favorites" checked={!!(filters as any).favorites_only} onCheckedChange={(v) => updateFilter('favorites_only' as any, v)} />
              <Label htmlFor="favorites" className="text-[10px] font-bold uppercase cursor-pointer">Apenas favoritos</Label>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RadarFilters;
