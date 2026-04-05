'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Star, Heart, Copy, MoreVertical, Eye, Megaphone,
    Zap, Truck, Tag, CheckSquare, Square, Store, CheckCircle2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

const TAG_COLORS: Record<string, string> = {
    'Oferta Forte': 'bg-red-500/10 text-red-600 border-red-500/20',
    'Tendência': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Menor Preço': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Cupom Bom': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

const MARKETPLACE_COLORS: Record<string, string> = {
    Shopee: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Mercado Livre': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    Amazon: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    Magalu: 'bg-red-500/10 text-red-600 border-red-500/20',
};

interface ProductCardProps {
    product: Product;
    isSelected?: boolean;
    onToggleFavorite?: (product: Product) => void;
    onSelect?: (product: Product) => void;
    onViewDetails?: (product: Product) => void;
    onAddToCampaign?: (product: Product) => void;
}

export default function ProductCard({ 
    product, 
    isSelected, 
    onToggleFavorite, 
    onSelect, 
    onViewDetails, 
    onAddToCampaign 
}: ProductCardProps) {
    const copyLink = () => {
        const link = product.original_link || '#';
        navigator.clipboard.writeText(link);
        toast.success('Link copiado!');
    };

    const score = product.opportunity_score || 0;
    const scoreColor = score >= 90 ? 'text-green-500' : score >= 75 ? 'text-yellow-500' : 'text-muted-foreground';

    return (
        <Card className={cn(
            "overflow-hidden transition-all hover:shadow-lg group relative",
            isSelected && "border-2 border-primary shadow-primary/20 shadow-md"
        )}>
            {/* Imagem */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'; 
                    }}
                />

                {/* Badges no topo */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.discount_percent && (
                        <Badge className="bg-red-500 text-white text-xs font-bold border-0">
                            -{product.discount_percent}%
                        </Badge>
                    )}
                    {product.coupon && (
                        <Badge className="bg-yellow-500/90 text-white text-xs border-0">
                            <Tag className="w-2.5 h-2.5 mr-0.5" />Cupom
                        </Badge>
                    )}
                </div>

                {/* Score */}
                <div className="absolute top-2 right-2">
                    <div className="bg-card/95 rounded-lg px-2 py-1 backdrop-blur-sm">
                        <span className={`text-xs font-bold ${scoreColor}`}>{score}</span>
                    </div>
                </div>

                {/* Botão de seleção - canto inferior esquerdo */}
                {onSelect && (
                    <button
                        onClick={() => onSelect(product)}
                        className={cn(
                            "absolute bottom-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            isSelected
                                ? "bg-primary text-white shadow-md"
                                : "bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-white"
                        )}
                    >
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                )}

                {/* Botão favorito */}
                <button
                    onClick={() => onToggleFavorite && onToggleFavorite(product)}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/10 transition-all"
                >
                    <Heart className={cn("w-4 h-4 transition-colors", product.is_favorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                </button>
            </div>

            {/* Conteúdo */}
            <div className="p-3">
                {/* Marketplace */}
                <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className={cn("text-xs", MARKETPLACE_COLORS[product.marketplace] || 'text-muted-foreground')}>
                        <Store className="w-2.5 h-2.5 mr-1" />{product.marketplace || 'Shopee'}
                    </Badge>
                    {product.free_shipping && (
                        <span className="text-xs text-green-500 flex items-center gap-0.5 font-medium">
                            <Truck className="w-3 h-3" /> Grátis
                        </span>
                    )}
                </div>

                {/* Nome */}
                <p className="text-sm font-semibold line-clamp-2 mb-2 leading-snug">{product.name}</p>

                {/* Preços */}
                <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-xs text-muted-foreground line-through">R$ {product.original_price?.toFixed(2)}</span>
                    <span className="text-lg font-black text-primary">R$ {product.current_price?.toFixed(2)}</span>
                </div>

                {/* Comissão */}
                <div className="flex items-center justify-between mb-2">
                    <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <span className="text-xs font-semibold text-green-600">
                            💰 {product.commission_percent}% · R$ {product.commission_value?.toFixed(2)}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">⭐ {product.rating}</span>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                        {product.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className={cn("text-xs", TAG_COLORS[tag] || '')}>{tag}</Badge>
                        ))}
                    </div>
                )}

                {/* Ações */}
                <div className="flex gap-1.5 mt-2">
                    <Button size="sm" className="flex-1 h-7 text-xs bg-primary text-white" onClick={() => onSelect && onSelect(product)}>
                        {isSelected ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" />Selecionado</>
                        ) : (
                            <><CheckSquare className="w-3 h-3 mr-1" />Selecionar</>
                        )}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={copyLink}>
                        <Copy className="w-3 h-3" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                                <MoreVertical className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(product)}>
                                <Eye className="w-3.5 h-3.5 mr-2" /> Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddToCampaign && onAddToCampaign(product)}>
                                <Megaphone className="w-3.5 h-3.5 mr-2" /> Adicionar à campanha
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Zap className="w-3.5 h-3.5 mr-2" /> Criar automação
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </Card>
    );
}
