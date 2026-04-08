// src/lib/marketplaces/ShopeeAdapter.ts
// Adapter para Shopee — limpeza de URL, resolução de short-links e geração de link de afiliado.

import { MarketplaceAdapter, ProductMetadata } from './BaseAdapter';
import { UserMarketplaceConnection } from '@/types/marketplace';
import { ShopeeAffiliateClient } from '@/lib/shopee-affiliate/client';

export class ShopeeAdapter extends MarketplaceAdapter {
  readonly name = 'Shopee';

  // ─── Detecção ───────────────────────────────────────────────────────────

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('shopee.com.br') || lower.includes('shope.ee');
  }

  // ─── Limpeza de URL ─────────────────────────────────────────────────────

  async cleanUrl(url: string): Promise<string> {
    let resolvedUrl = url;

    // Resolver short-links (shope.ee/xxx)
    if (url.includes('shope.ee')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
        clearTimeout(timeout);
        resolvedUrl = res.url || url;
      } catch {
        // Se falhar a resolução, continuar com a URL original
        resolvedUrl = url;
      }
    }

    // Remover tracking params desnecessários
    try {
      const parsed = new URL(resolvedUrl);
      const paramsToRemove = [
        'sp_atk', 'xptdk', 'is_from_login', 'af_siteid',
        'pid', 'af_click_lookback', 'af_viewthrough_lookback',
        'is_retarget', 'af_reengagement_window', 'af_sub_siteid',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'
      ];
      paramsToRemove.forEach(p => parsed.searchParams.delete(p));
      return parsed.toString();
    } catch {
      return resolvedUrl;
    }
  }

  // ─── Metadados ──────────────────────────────────────────────────────────

  async fetchMetadata(url: string, connection?: UserMarketplaceConnection): Promise<ProductMetadata | null> {
    // 1. Fallback Imediato: Extrair nome do slug da URL
    let nameFallback = 'Produto Shopee';
    try {
      const path = new URL(url).pathname;
      const parts = path.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('-i.')) {
        const rawSlug = lastPart.split('-i.')[0];
        nameFallback = decodeURIComponent(rawSlug.replace(/-/g, ' '));
        nameFallback = nameFallback.charAt(0).toUpperCase() + nameFallback.slice(1);
      }
    } catch (e) {
      console.error('ShopeeAdapter: URL parse fallback failed:', e);
    }

    // 2. Extração robusta de IDs (ShopID e ItemID)
    let shopId = '';
    let itemId = '';
    const idMatch = url.match(/i\.(\d+)\.(\d+)/);
    if (idMatch) {
      shopId = idMatch[1];
      itemId = idMatch[2];
    }

    // 3. Prioridade 1: Tentar via API v4 da Shopee (Scraper) - Mais estável para metadados visuais
    if (shopId && itemId) {
      try {
        const apiUrl = `https://shopee.com.br/api/v4/item/get?shopid=${shopId}&itemid=${itemId}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://shopee.com.br/'
          },
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const item = data.data || data.item;

          if (item) {
            const name = item.name || item.title || nameFallback;
            const originalPrice = (item.price_before_discount || item.price || 0) / 100000;
            const currentPrice = (item.price || item.price_min || 0) / 100000;
            const discount = originalPrice > 0
              ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
              : 0;
            const imageUrl = item.image
              ? `https://cf.shopee.com.br/file/${item.image}`
              : '';

            return {
              name,
              originalPrice,
              currentPrice,
              discountPercent: discount,
              imageUrl,
              marketplace: 'Shopee'
            };
          }
        }
      } catch (error) {
        console.warn('ShopeeAdapter: Public scraper failed:', error);
      }
    }

    // 4. Prioridade 2: Tentar via Shopee Affiliate Open API (GraphQL) - Para dados de comissão (se disponível)
    if (connection?.is_active && connection.shopee_app_id && connection.shopee_app_secret) {
      try {
        const client = new ShopeeAffiliateClient({
          appId: connection.shopee_app_id,
          secret: connection.shopee_app_secret
        });
        
        // const queryUrl = shopId && itemId ? `https://shopee.com.br/product/${shopId}/${itemId}` : url;
        const nodes = await client.getProductOfferV2(shopId, itemId);

        if (nodes && nodes.length > 0) {
          const node = nodes[0];
          const cPrice = node.price ? parseFloat(node.price) : 0;
          
          return {
            name: node.productName || nameFallback,
            originalPrice: cPrice, // GraphQL api de afiliado removeu suporte a originalPrice em productOfferV2
            currentPrice: cPrice,
            discountPercent: 0, // GraphQL api removeu suporte a discount direto
            imageUrl: node.imageUrl,
            marketplace: 'Shopee',
            commissionRate: node.commissionRate ? parseFloat(String(node.commissionRate)) : undefined,
            commissionValue: node.commission ? parseFloat(String(node.commission)) : undefined
          };
        }
      } catch (err) {
        console.warn('ShopeeAdapter: GraphQL metadata failed:', err);
      }
    }

    // 4. Último Recurso: Fallback visual com nome do slug
    return {
      name: nameFallback,
      originalPrice: 0,
      currentPrice: 0,
      discountPercent: 0,
      imageUrl: '',
      marketplace: 'Shopee',
      metadata_failed: true
    };
  }

  // ─── Link de Afiliado Oficial ──────────────────────────────────────────

  async generateAffiliateLink(cleanUrl: string, connection?: UserMarketplaceConnection): Promise<string> {
    // Prepara trackers internos pra conversões da Open API (subIds suporta até 5 strings)
    const subIds: string[] = [];
    if (connection?.is_active && connection.affiliate_id) subIds.push(connection.affiliate_id);
    if (connection?.is_active && connection.affiliate_code) subIds.push(connection.affiliate_code);

    try {
      // Cria instância descartável/isolada apenas com a credencial do banco de dados deste Affiliate
      if (connection?.is_active && connection.shopee_app_id && connection.shopee_app_secret) {
        const tenantClient = new ShopeeAffiliateClient({
          appId: connection.shopee_app_id,
          secret: connection.shopee_app_secret
        });
        
        return await tenantClient.generateShortLink(cleanUrl, subIds);
      }
      
      // Fallback pra tentar Client System-Global se o usuário ainda usa tracking legado (mmp_pid) mas a agência Synco roda a API Global
      const sysClient = new ShopeeAffiliateClient();
      return await sysClient.generateShortLink(cleanUrl, subIds);

    } catch (error: any) {
      console.error(`ShopeeAdapter: GQL Fallback Triggered - ${error.message}`);

      // Graceful Downgrade: Se a API oficial falhar pesadamente, tentamos o fallback url-based antigo
      const affiliateId = connection?.is_active ? connection.affiliate_id : null;
      const fallbackEnvId = process.env.SHOPEE_AFFILIATE_ID;
      const resolvedId = affiliateId || fallbackEnvId;

      if (resolvedId) {
        try {
          const encoded = encodeURIComponent(cleanUrl);
          let link = `https://shope.ee/redirect?url=${encoded}&af_id=${resolvedId}`;
          if (connection?.affiliate_code && connection.is_active) {
              link += `&utm_source=${connection.affiliate_code}`;
          }
          return link;
        } catch {
          return cleanUrl;
        }
      }

      console.warn('ShopeeAdapter: API Falhou e sem fallback config, returning raw URL');
      return cleanUrl;
    }
  }
}
