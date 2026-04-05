'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Radar, 
    SlidersHorizontal, 
    SendHorizonal, 
    CheckSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import ProductCard from '@/components/radar/ProductCard';
import RadarFilters from '@/components/radar/RadarFilters';
import { MOCK_PRODUCTS } from '@/mock/mock-data';
import { useSelectedProducts, SelectedProduct } from '@/contexts/SelectedProductsContext';
import { RadarFilters as RadarFiltersType } from '@/types/radar';
import { Product } from '@/types';

export default function RadarOfertasPage() {
    const router = useRouter();
    const { toggleProduct, isSelected, count, clearProducts } = useSelectedProducts();
    const [view, setView] = useState('all');
    const [filters, setFilters] = useState<RadarFiltersType>({
        category: 'all',
        score_min: 70
    });

    const filteredProducts = useMemo(() => {
        return MOCK_PRODUCTS.filter(p => {
            if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
            if (filters.price_max && p.current_price > filters.price_max) return false;
            if (filters.price_min && p.current_price < filters.price_min) return false;
            if (filters.commission_percent_min && p.commission_percent < filters.commission_percent_min) return false;
            if (filters.score_min && (p.opportunity_score || 0) < filters.score_min) return false;
            if (filters.has_coupon && !p.coupon) return false;
            if (filters.free_shipping && !p.free_shipping) return false;
            if (filters.official_store && !p.official_store) return false;
            if (filters.favorites_only && !p.is_favorite) return false;
            if (filters.never_sent && p.already_sent) return false;
            
            if (view === 'favorites' && !p.is_favorite) return false;
            if (view === 'trending' && !p.tags?.includes('Tendência')) return false;
            
            return true;
        });
    }, [filters, view]);

    const handleSelectProduct = (product: Product) => {
        // Adaptar Product para SelectedProduct se necessário
        const selected: SelectedProduct = {
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            current_price: product.current_price,
            original_price: product.original_price,
            discount_percent: product.discount_percent,
            commission_percent: product.commission_percent,
            marketplace: product.marketplace,
            original_link: product.original_link
        };
        toggleProduct(selected);
    };

    const handleResetFilters = () => {
        setFilters({ category: 'all', score_min: 0 });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Radar de Ofertas"
                description="Descubra e selecione os melhores produtos para seus grupos"
                icon={<Radar className="w-6 h-6 text-primary" />}
                actions={
                    <div className="flex items-center gap-3">
                        {count > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={clearProducts}
                            >
                                Limpar Seleção ({count})
                            </Button>
                        )}
                        <Button 
                            className="bg-primary text-white gap-2"
                            disabled={count === 0}
                            onClick={() => router.push('/carrinho-ofertas')}
                        >
                            <SendHorizonal className="w-4 h-4" />
                            Ir para o Carrinho
                            <Badge className="ml-1 bg-white text-primary hover:bg-white">{count}</Badge>
                        </Button>
                    </div>
                }
            />

            <div className="flex flex-col gap-6">
                {/* Tabs de visão rápida */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="all" className="text-xs px-4">Todas</TabsTrigger>
                            <TabsTrigger value="trending" className="text-xs px-4">Tendências 🔥</TabsTrigger>
                            <TabsTrigger value="favorites" className="text-xs px-4">Favoritos ⭐</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Mostrando {filteredProducts.length} produtos encontrados
                        </span>
                    </div>
                </div>

                {/* Filtros */}
                <RadarFilters 
                    filters={filters} 
                    onFilterChange={setFilters} 
                    onReset={handleResetFilters} 
                />

                {/* Grid de Produtos */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isSelected={isSelected(product.id)}
                                onSelect={handleSelectProduct}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
                        <Radar className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-muted-foreground">Nenhum produto encontrado</h3>
                        <p className="text-sm text-muted-foreground mb-4">Tente ajustar seus filtros para encontrar mais ofertas.</p>
                        <Button variant="outline" onClick={handleResetFilters}>
                            Resetar Filtros
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
