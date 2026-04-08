import { createClient } from '@/lib/supabase/client';
import { Marketplace, UserMarketplaceConnection } from '@/types/marketplace';

export const marketplaceService = {
  /**
   * Busca o catálogo global de marketplaces
   */
  async getCatalog(): Promise<Marketplace[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('marketplaces')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching marketplace catalog:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Busca as conexões do usuário logado
   */
  async getUserConnections(userId: string): Promise<UserMarketplaceConnection[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_marketplaces')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user marketplace connections:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Cria ou atualiza uma conexão de marketplace para o usuário
   */
  async upsertConnection(connection: Partial<UserMarketplaceConnection> & { user_id: string; marketplace_id: string }): Promise<UserMarketplaceConnection> {
    const supabase = createClient();
    
    // Separa o secret do payload normal para não tentar salvar na tabela diretamente
    const { shopee_app_secret, ...safeConnection } = connection;

    const { data, error } = await supabase
      .from('user_marketplaces')
      .upsert(safeConnection, { onConflict: 'user_id, marketplace_id' })
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting marketplace connection:', error);
      throw error;
    }

    // Se o usuário digitou um secret novo, rolar o upload seguro via RPC pro Vault
    if (shopee_app_secret && safeConnection.marketplace_id) {
      const { error: rpcError } = await supabase.rpc('set_shopee_secret', {
        p_marketplace_id: safeConnection.marketplace_id,
        p_secret: shopee_app_secret
      });
      
      if (rpcError) {
        console.error('Falha ao instanciar Secret no Vault:', rpcError);
        throw new Error('Falha ao salvar senha criptográfica. O registro base foi salvo, mas a API falhará.');
      }
    }

    return data;
  }
};
