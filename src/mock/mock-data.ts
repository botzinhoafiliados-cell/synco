import { 
    Product, 
    Group, 
    Channel, 
    DestinationList, 
    Marketplace, 
    Campaign 
} from '@/types';

// Mock data for SYNCO - Migrado do botBase

export const PRODUCT_IMAGES = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
];

export const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: "Fone Bluetooth TWS Pro Max", store_name: "TechStore Oficial", original_price: 189.90, current_price: 49.90, discount_percent: 74, commission_percent: 12, commission_value: 5.99, coupon: "TECH10", rating: 4.7, sales_count: 15420, opportunity_score: 95, category: "eletronicos", free_shipping: true, official_store: true, tags: ["Oferta Forte", "Menor Preço", "Tendência"], status: "active", is_favorite: true, already_sent: false, marketplace: "Shopee", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", original_link: "https://shopee.com.br/produto/1" },
    { id: '2', name: "Kit 3 Panos Microfibra Premium", store_name: "Casa & Cia", original_price: 59.90, current_price: 19.90, discount_percent: 67, commission_percent: 15, commission_value: 2.99, coupon: "CASA5", rating: 4.5, sales_count: 8320, opportunity_score: 88, category: "casa_cozinha", free_shipping: true, official_store: false, tags: ["Cupom Bom", "Oferta Forte"], status: "active", is_favorite: false, already_sent: true, marketplace: "Shopee", image_url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop", original_link: "https://shopee.com.br/produto/2" },
    { id: '3', name: "Relógio Digital LED Esportivo", store_name: "SportWatch", original_price: 129.90, current_price: 34.90, discount_percent: 73, commission_percent: 10, commission_value: 3.49, coupon: "", rating: 4.3, sales_count: 22150, opportunity_score: 82, category: "esportes", free_shipping: true, official_store: true, tags: ["Tendência", "Menor Preço"], status: "active", is_favorite: false, already_sent: false, marketplace: "Shopee", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop", original_link: "https://shopee.com.br/produto/3" },
    { id: '4', name: "Organizador Maquiagem Acrílico 360°", store_name: "Beleza Express", original_price: 149.90, current_price: 59.90, discount_percent: 60, commission_percent: 18, commission_value: 10.78, coupon: "BELEZA15", rating: 4.8, sales_count: 5890, opportunity_score: 91, category: "beleza", free_shipping: false, official_store: false, tags: ["Oferta Forte", "Cupom Bom"], status: "active", is_favorite: true, already_sent: false, marketplace: "Shopee", image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop", original_link: "https://shopee.com.br/produto/4" },
    { id: '5', name: "Óculos de Sol Polarizado UV400", store_name: "Fashion World", original_price: 89.90, current_price: 29.90, discount_percent: 67, commission_percent: 14, commission_value: 4.19, coupon: "FASHION20", rating: 4.4, sales_count: 31200, opportunity_score: 86, category: "moda", free_shipping: true, official_store: true, tags: ["Menor Preço", "Tendência"], status: "active", is_favorite: false, already_sent: true, marketplace: "Mercado Livre", image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop", original_link: "https://mercadolivre.com.br/produto/5" },
    { id: '6', name: "Câmera Wi-Fi 360° Segurança", store_name: "SmartHome BR", original_price: 299.90, current_price: 89.90, discount_percent: 70, commission_percent: 8, commission_value: 7.19, coupon: "", rating: 4.6, sales_count: 9870, opportunity_score: 79, category: "eletronicos", free_shipping: true, official_store: true, tags: ["Oferta Forte"], status: "active", is_favorite: false, already_sent: false, marketplace: "Amazon", image_url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop", original_link: "https://amazon.com.br/produto/6" },
    { id: '7', name: "Tênis Casual Leve Respirável", store_name: "Calçados Prime", original_price: 199.90, current_price: 69.90, discount_percent: 65, commission_percent: 11, commission_value: 7.69, coupon: "TENIS30", rating: 4.2, sales_count: 18450, opportunity_score: 84, category: "moda", free_shipping: true, official_store: false, tags: ["Tendência", "Cupom Bom"], status: "active", is_favorite: true, already_sent: false, marketplace: "Shopee", image_url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop", original_link: "https://shopee.com.br/produto/7" },
    { id: '8', name: "Headphone Gamer RGB Surround 7.1", store_name: "GamersHub", original_price: 249.90, current_price: 79.90, discount_percent: 68, commission_percent: 9, commission_value: 7.19, coupon: "GAMER15", rating: 4.5, sales_count: 12300, opportunity_score: 87, category: "eletronicos", free_shipping: true, official_store: true, tags: ["Oferta Forte", "Cupom Bom", "Tendência"], status: "active", is_favorite: false, already_sent: false, marketplace: "Mercado Livre", image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop", original_link: "https://mercadolivre.com.br/produto/8" },
    { id: '9', name: "Kit Pincéis Maquiagem 15 peças", store_name: "Beauty Queen", original_price: 79.90, current_price: 24.90, discount_percent: 69, commission_percent: 20, commission_value: 4.98, coupon: "BEAUTY10", rating: 4.6, sales_count: 7650, opportunity_score: 92, category: "beleza", free_shipping: true, official_store: false, tags: ["Oferta Forte", "Menor Preço", "Cupom Bom"], status: "active", is_favorite: false, already_sent: false, marketplace: "Magalu", image_url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop", original_link: "https://magalu.com.br/produto/9" },
    { id: '10', name: "Luminária LED Mesa Toque Dimmer", store_name: "LuzDesign", original_price: 119.90, current_price: 44.90, discount_percent: 63, commission_percent: 13, commission_value: 5.84, coupon: "", rating: 4.4, sales_count: 6230, opportunity_score: 76, category: "casa_cozinha", free_shipping: false, official_store: false, tags: ["Tendência"], status: "active", is_favorite: false, already_sent: true, marketplace: "Shopee", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", original_link: "https://shopee.com.br/produto/10" },
];

export const MOCK_CHANNELS: Channel[] = [
    { id: 'c1', name: "WhatsApp Principal", type: "whatsapp", status: "active", groups_count: 12, contacts_count: 3450, messages_sent: 15230, description: "Canal principal de divulgação via WhatsApp" },
    { id: 'c2', name: "Telegram Ofertas", type: "telegram", status: "active", groups_count: 5, contacts_count: 8920, messages_sent: 22100, description: "Canal de ofertas no Telegram" },
    { id: 'c3', name: "Instagram @achadinhos", type: "instagram", status: "active", groups_count: 0, contacts_count: 12500, messages_sent: 890, description: "Perfil do Instagram" },
];

export const MOCK_GROUPS: Group[] = [
    { id: 'g1', name: "Achadinhos do Dia 🔥", channel_name: "WhatsApp Principal", members_count: 2560, status: "active", tags: ["ofertas", "diário"], is_source: false, is_destination: true, sends_received: 142, is_monitored: true },
    { id: 'g2', name: "Eletrônicos em Promo", channel_name: "WhatsApp Principal", members_count: 1890, status: "active", tags: ["eletrônicos", "tech"], is_source: false, is_destination: true, sends_received: 98, is_monitored: false },
    { id: 'g6', name: "Ofertas Flash ⚡", channel_name: "Telegram Ofertas", members_count: 4520, status: "active", tags: ["flash", "urgente"], is_source: true, is_destination: true, sends_received: 320, is_monitored: true },
];

export const MOCK_DESTINATION_LISTS: DestinationList[] = [
    { id: 'dl1', name: "Promoções Gerais", description: "Grupos principais de divulgação geral", group_ids: ['g1', 'g2', 'g6'], color: 'orange', icon: '🔥', status: 'active' },
    { id: 'dl2', name: "Eletrônicos", description: "Grupos especializados em tech e eletrônicos", group_ids: ['g2', 'g6'], color: 'blue', icon: '💻', status: 'active' },
];

export const MOCK_MARKETPLACES: Marketplace[] = [
    { id: 'shopee', name: 'Shopee', icon: '🛍️', configured: true, affiliate_id: 'user_shopee_123', last_validated: '2026-04-03T08:00:00', color: 'orange', description: 'Programa de afiliados Shopee' },
    { id: 'amazon', name: 'Amazon', icon: '📦', configured: true, affiliate_id: 'user-amazon-br-20', last_validated: '2026-04-02T14:00:00', color: 'blue', description: 'Amazon Associates BR' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: '1', name: 'Promoção de Verão', segment_name: 'Achadinhos do Dia 🔥', template_name: 'Oferta Irresistível', status: 'active', products_count: 5, sent_count: 2, pending_count: 3, failed_count: 0, scheduled_date: '2026-04-10T10:00:00' },
    { id: '2', name: 'Flash Sale Eletrônicos', segment_name: 'Eletrônicos em Promo', template_name: 'Flash Sale ⚡', status: 'completed', products_count: 10, sent_count: 10, pending_count: 0, failed_count: 0, completed_date: '2026-04-01T15:00:00' },
];

export const MOCK_TEMPLATES = [
    { id: 't1', name: "Oferta Irresistível", content: "🔥 *{name}*\n\nDe ~R$ {original_price}~ por apenas *R$ {current_price}*!\n\n💰 Economia de R$ {eco} ({discount}% OFF)\n\n👉 {link}\n\n⏰ Corre que acaba rápido!" },
    { id: 't2', name: "Flash Sale ⚡", content: "⚡ FLASH SALE: {name}\n\nDe: R$ {original_price}\nPor: R$ {current_price}\n\nLink: {link}" },
    { id: 't3', name: "Curto & Direto", content: "🔥 {name}\n💰 R$ {current_price}\n👉 {link}" },
];

export const MOCK_SEND_QUEUE = [
    { id: 'q1', product_name: 'Fone Bluetooth TWS', segment: 'Promoções Gerais', groups: 12, status: 'sending', time: 'Agora' },
    { id: 'q2', product_name: 'Kit Panos Microfibra', segment: 'Casa & Cia', groups: 5, status: 'pending', time: 'Em 2 min' },
    { id: 'q3', product_name: 'Relógio Digital LED', segment: 'Esportes', groups: 8, status: 'scheduled', time: '14:30' },
];

export const MOCK_PROCESSED = [
    { 
        id: 'p1', 
        name: "Fone Bluetooth TWS Pro Max", 
        marketplace: "Shopee", 
        original_price: 189.90, 
        current_price: 49.90, 
        discount_percent: 74, 
        commission_percent: 12, 
        coupon: "TECH10", 
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", 
        affiliate_link: "https://shope.ee/abc123?af=user_shopee_123", 
        text: "🔥 *Fone Bluetooth TWS Pro Max*\n\nDe ~R$ 189,90~ por apenas *R$ 49,90*!\n\n💰 Economia de R$ 140,00 (74% OFF)\n\n🎟️ Cupom: *TECH10*\n\n👉 https://shope.ee/abc123?af=user_shopee_123\n\n⏰ Corre que acaba rápido!" 
    },
    { 
        id: 'p2', 
        name: "Organizador Maquiagem Acrílico 360°", 
        marketplace: "Shopee", 
        original_price: 149.90, 
        current_price: 59.90, 
        discount_percent: 60, 
        commission_percent: 18, 
        coupon: "BELEZA15", 
        image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop", 
        affiliate_link: "https://shope.ee/xyz456?af=user_shopee_123", 
        text: "💄 *Organizador Maquiagem Acrílico 360°*\n\nDe ~R$ 149,90~ por *R$ 59,90*!\n\n🎟️ Cupom: *BELEZA15*\n\n🔗 https://shope.ee/xyz456?af=user_shopee_123\n\n🚀 Aproveite!" 
    },
];

export const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
    active: { label: 'Ativo', color: 'green' },
    inactive: { label: 'Inativo', color: 'red' },
    pending: { label: 'Pendente', color: 'yellow' },
    completed: { label: 'Concluído', color: 'blue' },
    sending: { label: 'Enviando', color: 'purple' },
    scheduled: { label: 'Agendado', color: 'blue' },
    failed: { label: 'Falhou', color: 'red' },
};
