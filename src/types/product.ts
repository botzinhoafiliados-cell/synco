export type ProductStatus = 'active' | 'inactive' | 'paused' | 'expired';

export interface Product {
    id: string; // Adicionado para SYNCO (botBase usava link como ID em alguns casos)
    name: string;
    store_name: string;
    original_price: number;
    current_price: number;
    discount_percent: number;
    commission_percent: number;
    commission_value: number;
    coupon?: string;
    rating: number;
    sales_count: number;
    opportunity_score: number;
    category: string;
    free_shipping: boolean;
    official_store: boolean;
    tags: string[];
    status: ProductStatus;
    is_favorite: boolean;
    already_sent: boolean;
    marketplace: string;
    image_url: string;
    original_link: string;
}
