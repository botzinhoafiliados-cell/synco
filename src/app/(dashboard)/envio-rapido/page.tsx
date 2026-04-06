// src/app/(dashboard)/envio-rapido/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  ChevronLeft, 
  LayoutList, 
  Type, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Store
} from 'lucide-react';
import { useSelectedProducts } from '@/contexts/SelectedProductsContext';
import { useDestinations } from '@/hooks/use-destinations';
import { useCreateCampaign } from '@/hooks/use-campaigns';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EnvioRapidoPage() {
  const { user } = useAuth();
  const { selectedProducts, count, clearProducts } = useSelectedProducts();
  const { data: destinations, isLoading: loadingDestinations } = useDestinations(user?.id);
  const { mutate: createCampaign, isPending: isSending } = useCreateCampaign();
  const router = useRouter();

  // State
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [generatedTexts, setGeneratedTexts] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize texts
  useEffect(() => {
    const initialTexts: Record<string, string> = {};
    selectedProducts.forEach(p => {
      initialTexts[p.id] = `🔥 *OFERTA IMPERDÍVEL* 🔥\n\n*${p.name}*\n\n💰 De: ~~R$ ${p.original_price?.toFixed(2)}~~\n✅ Por: *R$ ${p.current_price?.toFixed(2)}*\n📉 *${p.discount_percent}% de DESCONTO!*\n\n🚀 Compre aqui: ${p.original_url}\n\n#oferta #promoção #${p.marketplace.toLowerCase()}`;
    });
    setGeneratedTexts(initialTexts);
  }, [selectedProducts]);

  const handleToggleDestination = (id: string) => {
    setSelectedDestinations(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedDestinations.length === 0) {
      toast.error('Selecione pelo menos uma lista de destino.');
      return;
    }

    const campaignData = {
      name: `Envio Rápido - ${new Date().toLocaleDateString()}`,
      items: selectedProducts.map(p => ({
        product_id: p.id,
        product_name: p.name,
        custom_text: generatedTexts[p.id] || ''
      })),
      destinations: selectedDestinations.map(id => ({
        type: 'list' as const,
        id: id
      }))
    };

    createCampaign({ userId: user?.id as string, dto: campaignData }, {
      onSuccess: () => {
        setIsSuccess(true);
        clearProducts();
        toast.success('Campanha criada e enviada com sucesso!');
      },
      onError: (error) => {
        console.error('Erro ao criar campanha:', error);
        toast.error('Erro ao realizar o envio. Tente novamente.');
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Envio Concluído!</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Suas ofertas foram processadas e o registro da campanha foi salvo no Supabase.
        </p>
        <div className="flex gap-4">
          <Link href="/radar-ofertas">
            <Button variant="outline" className="font-bold uppercase tracking-tight">Voltar ao Radar</Button>
          </Link>
          <Button className="font-bold uppercase tracking-tight" onClick={() => router.push('/campanhas')}>Ver Relatório</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-muted-foreground mb-[-1rem]">
        <Link href="/carrinho-ofertas" className="flex items-center hover:text-primary transition-colors text-xs font-bold uppercase tracking-tight">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar ao Carrinho
        </Link>
      </div>

      <PageHeader
        title="Envio Rápido"
        description="Configure os textos e selecione os destinos para suas ofertas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo: Produtos e Textos */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Type className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest">Personalizar Conteúdo</h3>
          </div>

          {selectedProducts.length === 0 ? (
             <Card className="p-12 text-center border-dashed">
                <p className="text-sm text-muted-foreground">Nenhum produto selecionado para envio.</p>
                <Link href="/radar-ofertas" className="text-primary font-bold text-xs uppercase mt-2 inline-block">Voltar ao Radar</Link>
             </Card>
          ) : (
            <div className="space-y-4">
              {selectedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden border-border/50">
                  <div className="bg-muted/30 p-3 flex items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded bg-background border overflow-hidden flex-shrink-0">
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold truncate">{product.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase h-5">
                      {product.marketplace}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Texto da Mensagem
                      </label>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] font-bold uppercase text-primary">
                        Regerar com IA
                      </Button>
                    </div>
                    <Textarea 
                      className="min-h-[160px] text-xs font-mono leading-relaxed bg-muted/10 border-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={generatedTexts[product.id] || ''}
                      onChange={(e) => setGeneratedTexts(prev => ({ ...prev, [product.id]: e.target.value }))}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito: Destinos e Finalização */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <LayoutList className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest">Selecionar Destinos</h3>
          </div>

          <Card className="p-6 border-border/50">
            {loadingDestinations ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Carregando listas...</span>
              </div>
            ) : destinations?.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-muted-foreground">Você ainda não tem listas de destino cadastradas.</p>
                <Link href="/listas-destino">
                  <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase">Cadastrar Listas</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {destinations?.map((list) => (
                  <div 
                    key={list.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer",
                      selectedDestinations.includes(list.id) 
                        ? "bg-primary/5 border-primary/30" 
                        : "bg-muted/20 border-transparent hover:bg-muted/40"
                    )}
                    onClick={() => handleToggleDestination(list.id)}
                  >
                    <Checkbox 
                      id={list.id} 
                      checked={selectedDestinations.includes(list.id)}
                      onCheckedChange={() => handleToggleDestination(list.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-none">{list.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                            ID: {list.id.substring(0, 8)}...
                         </span>
                      </div>
                    </div>
                    {/* Placeholder for platform icons if available in list metadata */}
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 lowercase opacity-60">
                      telegram
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 border-primary/20 bg-primary/[0.02] shadow-md space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Resumo do Envio</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">Produtos:</span>
                <span className="font-bold">{count}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">Listas de Destino:</span>
                <span className="font-bold">{selectedDestinations.length}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-3 border-t border-dashed">
                <span className="text-muted-foreground font-black uppercase">Total de Posts:</span>
                <span className="font-black text-primary">{count * selectedDestinations.length}</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSending || count === 0 || selectedDestinations.length === 0}
              onClick={handleSend}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Confirmar e Enviar
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg text-blue-700 border border-blue-500/20">
               <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
               <p className="text-[9px] font-bold leading-tight uppercase">
                 Ao confirmar, os registros serão salvos no Supabase. O disparo externo real será integrado em uma fase futura.
               </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
