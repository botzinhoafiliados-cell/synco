// src/lib/marketplaces/shopee.ts
import { MarketplaceAdapter, MarketplaceConfig } from './adapter';

export class ShopeeAdapter implements MarketplaceAdapter {
  id = 'shopee';
  name = 'Shopee';

  detect(url: string): boolean {
    const lowercaseUrl = url.toLowerCase();
    return lowercaseUrl.includes('shopee.com.br') || lowercaseUrl.includes('shope.ee');
  }

  normalize(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Se for link curto, não conseguimos normalizar sem expandi-lo via HTTP (scraping futuro)
      if (urlObj.hostname === 'shope.ee') {
        return url;
      }

      // Limpar parâmetros de rastreio de terceiros (smtt, sp_atk, etc)
      const cleanUrl = new URL(urlObj.origin + urlObj.pathname);
      
      // Preservar apenas o que identifica o produto se estiver na query (raro na Shopee)
      // Na Shopee o ID geralmente está no path: /product/SHOP_ID/ITEM_ID
      
      return cleanUrl.toString();
    } catch {
      return url;
    }
  }

  buildAffiliateUrl(url: string, config: MarketplaceConfig): string {
    const { affiliate_id, affiliate_code } = config;
    
    if (!affiliate_id) {
      throw new Error('Configuração de afiliado (mmp_pid) ausente para Shopee.');
    }

    try {
      const urlObj = new URL(url);
      
      // Adicionar parâmetros de conversão real conforme diretriz do usuário
      // mmp_pid (affiliate_id) e utm_source (affiliate_code)
      urlObj.searchParams.set('mmp_pid', affiliate_id);
      
      if (affiliate_code) {
        urlObj.searchParams.set('utm_source', affiliate_code);
      }

      // Adicionar utm_medium para identificar o tráfego do SYNCO
      urlObj.searchParams.set('utm_medium', 'affiliate');
      
      return urlObj.toString();
    } catch {
      // Fallback para concatenação simples se a URL for malformada
      const separator = url.includes('?') ? '&' : '?';
      let converted = `${url}${separator}mmp_pid=${affiliate_id}`;
      if (affiliate_code) converted += `&utm_source=${affiliate_code}`;
      return converted;
    }
  }
}
