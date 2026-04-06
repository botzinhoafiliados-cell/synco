// src/app/(dashboard)/radar-ofertas/page.tsx
'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  ShoppingCart, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowUpDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useProducts, useToggleFavorite } from '@/hooks/use-products';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import ProductCard from '@/components/radar/ProductCard';
import RadarFilters from '@/components/radar/RadarFilters';
import { MARKETPLACE_TABS, OFFER_TABS, SORT_OPTIONS } from '@/lib/constants';
import { ProductFilter } from '@/types/product';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RadarOfertasPage() {
  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [marketplace, setMarketplace] = useState('all');
  const [offerType, setOfferType] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score_desc');
  const [filters, setFilters] = useState<ProductFilter>({});

  // Context & Hooks
  const { toggleProduct, isSelected, count: cartCount } = useSelectedProducts();
  const toggleFavoriteMutation = useToggleFavorite();
  
  // Data Fetching
  const { data: products, isLoading, isError, error } = useProducts({
    ...filters,
    marketplace: marketplace === 'all' ? undefined : marketplace,
    search: search || undefined,
    // Note: service handles offerType mapping internally or we can map it here
  });

  const handleResetFilters = () => {
    setFilters({});
    setSearch('');
    setMarketplace('all');
    setOfferType('all');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title="Radar de Ofertas"
        description="Monitore e selecione as melhores oportunidades dos marketplaces em tempo real."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/carrinho-ofertas">
              <Button className="relative bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-tight h-10 px-6 shadow-lg shadow-primary/20">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Toolbar & Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <Tabs value={marketplace} onValueChange={setMarketplace} className="w-full lg:w-auto">
            <TabsList className="bg-muted/50 p-1 h-11">
              {MARKETPLACE_TABS.map(tab => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="px-4 text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ofertas..."
                className="pl-9 h-10 text-xs font-medium bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 px-3 text-[10px] font-bold uppercase border-border/50">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Ordenar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5">Opções de Ordenação</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                  {SORT_OPTIONS.map(opt => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-xs font-medium">
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center border border-border/50 rounded-lg p-1 bg-muted/20">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={offerType} onValueChange={setOfferType} className="w-full">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-8">
            {OFFER_TABS.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="px-0 py-3 text-[10px] font-black uppercase tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <RadarFilters 
            filters={filters} 
            onFilterChange={setFilters} 
            onReset={handleResetFilters} 
          />
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 relative overflow-hidden group">
            <Zap className="absolute -right-2 -bottom-2 w-24 h-24 text-primary/5 group-hover:scale-110 transition-transform duration-500" />
            <h4 className="text-xs font-black uppercase tracking-tight text-primary mb-1">Dica de Especialista</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed relative z-10">
              Produtos com <b>Opportunity Score &gt; 90</b> têm 3.5x mais chances de conversão imediata. Fique de olho neles!
            </p>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Sintonizando as melhores ofertas...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight">Ocorreu um erro</h3>
                <p className="text-sm text-muted-foreground">Não foi possível carregar as ofertas. Tente novamente em instantes.</p>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()}>Recarregar Página</Button>
            </div>
          ) : products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight">Nenhuma oferta encontrada</h3>
                <p className="text-sm">Tente ajustar seus filtros ou mudar a categoria.</p>
              </div>
              <Button variant="link" onClick={handleResetFilters}>Limpar todos os filtros</Button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' 
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {products?.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  isSelected={isSelected(product.id)}
                  onSelect={toggleProduct}
                  onToggleFavorite={(id, fav) => toggleFavoriteMutation.mutate({ id, isFavorite: fav })}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
