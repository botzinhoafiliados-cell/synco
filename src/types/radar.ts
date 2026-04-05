export interface RadarFilters {
    category?: string;
    price_min?: number | null;
    price_max?: number | null;
    commission_percent_min?: number | null;
    commission_percent_max?: number | null;
    score_min?: number | null;
    discount_min?: number | null;
    rating_min?: number | null;
    sales_min?: number | null;
    has_coupon?: boolean;
    free_shipping?: boolean;
    official_store?: boolean;
    favorites_only?: boolean;
    never_sent?: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = {
    eletronicos: "Eletrônicos",
    casa_cozinha: "Casa & Cozinha",
    moda: "Moda",
    beleza: "Beleza",
    esportes: "Esportes",
    brinquedos: "Brinquedos",
    ferramentas: "Ferramentas",
    outros: "Outros"
};

export interface SavedFilter {
    name: string;
    rules: Partial<RadarFilters>;
}

export const SAVED_FILTERS: SavedFilter[] = [
    {
        name: "Super Ofertas",
        rules: { score_min: 90, discount_min: 50, free_shipping: true }
    },
    {
        name: "Eletrônicos Premium",
        rules: { category: "eletronicos", price_min: 100, score_min: 80 }
    },
    {
        name: "Cupons Ativos",
        rules: { has_coupon: true, score_min: 70 }
    }
];
