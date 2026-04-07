// src/lib/linkProcessor.ts
import { createClient } from './supabase/client';
import { ShopeeAdapter } from './marketplaces/shopee';
import { MarketplaceAdapter, MarketplaceConfig } from './marketplaces/adapter';

export type Marketplace = 'Shopee' | 'Amazon' | 'Mercado Livre' | 'Magalu' | 'Unknown';

export type ProcessingStatus = 
  | 'processed' 
  | 'missing_affiliate_config' 
  | 'marketplace_unsupported' 
  | 'invalid_url';

export interface ProcessedProduct {
  id: string;
  name: string;
  marketplace: Marketplace;
  status: ProcessingStatus;
  originalPrice: number;
  currentPrice: number;
  discountPercent: number;
  imageUrl: string;
  originalUrl: string;
  affiliateUrl: string;
}

// Registro de adapters disponíveis
const adapters: MarketplaceAdapter[] = [
  new ShopeeAdapter(),
  // Próximos adapters (Mercado Livre, etc) entram aqui
];

const KNOWN_MARKETPLACES = ['shopee', 'amazon', 'mercadolivre', 'magazineluiza', 'magalu'];

/**
 * Utilitário para detecção de marketplace baseada em URL usando adapters reais
 */
export function detectMarketplace(url: string): Marketplace {
  const adapter = adapters.find(a => a.detect(url));
  if (adapter) {
    return adapter.name as Marketplace;
  }
  return 'Unknown';
}

/**
 * Processamento real de links utilizando o contexto do usuário e adapters de marketplace.
 * Não utiliza dados mockados/inventados conforme regras do projeto.
 */
export async function processLinks(links: string[], userId: string): Promise<ProcessedProduct[]> {
  const supabase = createClient();
  
  // 1. Buscar configurações de marketplace do usuário
  const { data: userConfigs, error } = await supabase
    .from('user_marketplaces')
    .select('marketplace_id, affiliate_id, affiliate_code, marketplaces(name)')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('Erro ao buscar configurações de marketplace:', error);
  }

  // 2. Mapear configurações por nome de marketplace para acesso rápido
  const configMap: Record<string, MarketplaceConfig> = {};
  userConfigs?.forEach((uc: any) => {
    const marketplaceName = uc.marketplaces?.name;
    if (marketplaceName) {
      configMap[marketplaceName] = {
        affiliate_id: uc.affiliate_id,
        affiliate_code: uc.affiliate_code
      };
    }
  });

  // 3. Processar cada link
  const processed = await Promise.all(
    links.filter(link => link.trim().length > 0).map(async (link, index) => {
      const id = `proc_${Date.now()}_${index}`;
      let status: ProcessingStatus = 'processed';
      
      const adapter = adapters.find(a => a.detect(link));
      const marketplace = (adapter?.name as Marketplace) || 'Unknown';
      
      const config = configMap[marketplace];
      let affiliateUrl = link;

      // Determinar Status Semântico
      if (adapter) {
        if (!config) {
          status = 'missing_affiliate_config';
          affiliateUrl = link; // Mantém original
        } else {
          try {
            affiliateUrl = adapter.buildAffiliateUrl(link, config);
            status = 'processed';
          } catch (err) {
            console.warn(`Falha na conversão para ${marketplace}:`, err);
            status = 'invalid_url';
          }
        }
      } else {
        // Verificar se é um marketplace conhecido mas sem adapter
        const isKnown = KNOWN_MARKETPLACES.some(m => link.toLowerCase().includes(m));
        status = isKnown ? 'marketplace_unsupported' : 'invalid_url';
      }

      // Conforme regra: não inventar título, preço ou imagem se não houver extração real
      return {
        id,
        name: marketplace !== 'Unknown' ? `${marketplace} Item` : 'Link Processado',
        marketplace,
        status,
        originalPrice: 0,
        currentPrice: 0,
        discountPercent: 0,
        imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200&h=200&fit=crop', // Placeholder neutro
        originalUrl: link,
        affiliateUrl
      };
    })
  );

  return processed;
}
