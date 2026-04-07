// src/lib/marketplaces/adapter.ts
import { type ProcessedProduct } from '../linkProcessor';

export interface MarketplaceConfig {
  affiliate_id?: string;    // mmp_pid for Shopee
  affiliate_code?: string;  // utm_source / sub_id
  affiliate_username?: string;
}

export interface MarketplaceAdapter {
  id: string;
  name: string;
  
  /**
   * Detects if the given URL belongs to this marketplace
   */
  detect(url: string): boolean;
  
  /**
   * Normalizes the URL by removing third-party trackers and identifying the product
   */
  normalize(url: string): string;
  
  /**
   * Builds the affiliate version of the URL using the provided user configuration
   */
  buildAffiliateUrl(url: string, config: MarketplaceConfig): string;
  
  /**
   * Optional: Fetches product metadata (scraping placeholder)
   */
  getProductInfo?(url: string): Promise<Partial<ProcessedProduct>>;
}
