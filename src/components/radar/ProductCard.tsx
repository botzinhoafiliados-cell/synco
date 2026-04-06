// src/components/radar/ProductCard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart, Copy, MoreVertical, Eye, Megaphone,
  Zap, Truck, Tag, CheckSquare, Square, Store, CheckCircle2, Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onSelect?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  onAddToCampaign?: (product: Product) => void;
}

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
  Magalu: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  AliExpress: 'bg-red-500/10 text-red-600 border-red-500/20',
  Shein: 'bg-black/10 text-black border-black/20',
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onToggleFavorite,
  onSelect,
  onViewDetails,
  onAddToCampaign
}) => {
  const copyLink = () => {
    const link = product.original_url || '#';
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
          src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'; }}
        />

        {/* Badges no topo */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount_percent && (
            <Badge className="bg-red-500 text-white text-[10px] font-bold border-0 px-1.5 h-5">
              -{product.discount_percent}%
            </Badge>
          )}
          {product.coupon && (
            <Badge className="bg-yellow-500/90 text-white text-[10px] border-0 px-1.5 h-5">
              <Tag className="w-2.5 h-2.5 mr-0.5" />Cupom
            </Badge>
          )}
        </div>

        {/* Score */}
        <div className="absolute top-2 right-2">
          <div className="bg-card/95 rounded-lg px-2 py-1 backdrop-blur-sm shadow-sm border border-border/50">
            <span className={`text-[10px] font-black ${scoreColor}`}>{score}</span>
          </div>
        </div>

        {/* Botão de seleção - canto inferior esquerdo */}
        {onSelect && (
          <button
            onClick={() => onSelect(product)}
            className={cn(
              "absolute bottom-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              isSelected
                ? "bg-primary text-white shadow-md scale-110"
                : "bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-white border border-border/50"
            )}
          >
            {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
        )}

        {/* Botão favorito */}
        <button
          onClick={() => onToggleFavorite && onToggleFavorite(product.id, !product.is_favorite)}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/10 transition-all border border-border/50"
        >
          <Heart className={cn("w-4 h-4 transition-colors", product.is_favorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-3">
        {/* Marketplace */}
        <div className="flex items-center justify-between mb-1.5">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4 font-bold uppercase tracking-wider", MARKETPLACE_COLORS[product.marketplace] || 'text-muted-foreground')}>
            <Store className="w-2.5 h-2.5 mr-1" />{product.marketplace}
          </Badge>
          {product.free_shipping && (
            <span className="text-[10px] text-green-500 flex items-center gap-0.5 font-black uppercase">
              <Truck className="w-3 h-3" /> Grátis
            </span>
          )}
        </div>

        {/* Nome */}
        <h3 className="text-sm font-bold line-clamp-2 mb-2 leading-tight h-10">{product.name}</h3>

        {/* Preços */}
        <div className="flex items-baseline gap-1.5 mb-2">
          {product.original_price && (
            <span className="text-[10px] text-muted-foreground line-through font-medium">R$ {product.original_price.toFixed(2)}</span>
          )}
          <span className="text-base font-black text-primary">R$ {product.current_price?.toFixed(2)}</span>
        </div>

        {/* Comissão */}
        <div className="flex items-center justify-between mb-3">
          <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="text-[10px] font-bold text-green-600">
              💰 {product.commission_percent}% · R$ {product.commission_value?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-muted-foreground">{product.rating}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-1.5 mt-auto">
          <Button 
            size="sm" 
            className={cn(
              "flex-1 h-8 text-[10px] font-bold uppercase tracking-tight",
              isSelected ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" : "bg-primary text-white"
            )} 
            onClick={() => onSelect && onSelect(product)}
            variant={isSelected ? "outline" : "default"}
          >
            {isSelected ? (
              <><CheckCircle2 className="w-3 h-3 mr-1" />Selecionado</>
            ) : (
              <><CheckSquare className="w-3 h-3 mr-1" />Selecionar</>
            )}
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={copyLink}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(product)} className="text-xs font-medium">
                <Eye className="w-4 h-4 mr-2" /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddToCampaign && onAddToCampaign(product)} className="text-xs font-medium">
                <Megaphone className="w-4 h-4 mr-2" /> Adicionar à campanha
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-medium">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" /> Criar automação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
