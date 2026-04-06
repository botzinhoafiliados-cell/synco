// src/lib/linkProcessor.ts

export type Marketplace = 'Shopee' | 'Amazon' | 'Mercado Livre' | 'Magalu' | 'Unknown';

export interface ProcessedProduct {
  id: string;
  name: string;
  marketplace: Marketplace;
  originalPrice: number;
  currentPrice: number;
  discountPercent: number;
  imageUrl: string;
  originalUrl: string;
  affiliateUrl: string;
}

/**
 * Utilitário para detecção de marketplace baseada em URL
 */
export function detectMarketplace(url: string): Marketplace {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('shopee.com.br')) return 'Shopee';
  if (lowercaseUrl.includes('amazon.com.br')) return 'Amazon';
  if (lowercaseUrl.includes('mercadolivre.com.br')) return 'Mercado Livre';
  if (lowercaseUrl.includes('magazineluiza.com.br') || lowercaseUrl.includes('magalu.com')) return 'Magalu';
  
  return 'Unknown';
}

/**
 * Simula o processamento (scraping/conversão) de links
 * Retorna dados mockados para demonstração da UX
 */
export async function processLinks(links: string[]): Promise<ProcessedProduct[]> {
  // Simular delay de rede/processamento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return links.filter(link => link.trim().length > 0).map((link, index) => {
    const marketplace = detectMarketplace(link);
    const id = `proc_${Date.now()}_${index}`;
    
    // Dados mockados baseados no marketplace
    const mocks: Record<Marketplace, Partial<ProcessedProduct>> = {
      'Shopee': {
        name: 'Fone de Ouvido Bluetooth TWS i12 Pro',
        originalPrice: 129.90,
        currentPrice: 47.50,
        discountPercent: 63,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop'
      },
      'Amazon': {
        name: 'Kindle 11ª Geração (2022) — Leve, com tela de 300 ppi',
        originalPrice: 499.00,
        currentPrice: 449.00,
        discountPercent: 10,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop'
      },
      'Mercado Livre': {
        name: 'Smart TV 50" 4K UHD LED Samsung',
        originalPrice: 2899.00,
        currentPrice: 2499.00,
        discountPercent: 14,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop'
      },
      'Magalu': {
        name: 'Fritadeira Elétrica Air Fryer Nell Fit 3.2L',
        originalPrice: 349.00,
        currentPrice: 269.90,
        discountPercent: 22,
        imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=200&h=200&fit=crop'
      },
      'Unknown': {
        name: 'Produto Desconhecido',
        originalPrice: 0,
        currentPrice: 0,
        discountPercent: 0,
        imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200&h=200&fit=crop'
      }
    };
    
    const mockData = mocks[marketplace] || mocks['Unknown'];
    
    return {
      id,
      name: mockData.name!,
      marketplace,
      originalPrice: mockData.originalPrice!,
      currentPrice: mockData.currentPrice!,
      discountPercent: mockData.discountPercent!,
      imageUrl: mockData.imageUrl!,
      originalUrl: link,
      affiliateUrl: `https://sync.af/${id}`
    };
  });
}
