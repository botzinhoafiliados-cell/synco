import { 
    Product, 
    Group, 
    DestinationList, 
    Marketplace, 
    Campaign,
    Channel
} from '@/types';
import { 
    MOCK_PRODUCTS, 
    MOCK_GROUPS, 
    MOCK_DESTINATION_LISTS, 
    MOCK_MARKETPLACES, 
    MOCK_CAMPAIGNS,
    MOCK_CHANNELS
} from '@/mock/mock-data';

/**
 * FakeDataService — Camada de Abstração de Dados (Fase 2A)
 * 
 * Este serviço simula chamadas de API assíncronas retornando os dados mockados.
 * Na Fase 6, estas funções serão substituídas por chamadas reais ao Supabase.
 */

const DEFAULT_DELAY = 300; // ms

async function delay(ms = DEFAULT_DELAY) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const FakeDataService = {
    /** Retorna a lista de produtos ativos */
    getProducts: async (): Promise<Product[]> => {
        await delay();
        return [...MOCK_PRODUCTS];
    },

    /** Retorna um produto específico pelo ID */
    getProductById: async (id: string): Promise<Product | null> => {
        await delay(100);
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    },

    /** Retorna a lista de canais conectados */
    getChannels: async (): Promise<Channel[]> => {
        await delay();
        return [...MOCK_CHANNELS];
    },

    /** Retorna a lista de grupos cadastrados */
    getGroups: async (): Promise<Group[]> => {
        await delay(400);
        return [...MOCK_GROUPS];
    },

    /** Retorna as listas de destino */
    getDestinationLists: async (): Promise<DestinationList[]> => {
        await delay(200);
        return [...MOCK_DESTINATION_LISTS];
    },

    /** Retorna os marketplaces configurados */
    getMarketplaces: async (): Promise<Marketplace[]> => {
        await delay();
        return [...MOCK_MARKETPLACES];
    },

    /** Retorna as campanhas de envio */
    getCampaigns: async (): Promise<Campaign[]> => {
        await delay(500);
        return [...MOCK_CAMPAIGNS];
    }
};
