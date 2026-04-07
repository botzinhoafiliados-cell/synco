import { createClient } from '@/lib/supabase/client';
import { Channel } from '@/types/group';

export const channelService = {
  async list(userId: string): Promise<Channel[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }
    return data || [];
  },

  async upsert(channel: Partial<Channel> & { 
    user_id: string; 
    session_api_key?: string; 
    webhook_secret?: string; 
  }): Promise<Channel> {
    const supabase = createClient();
    const { session_api_key, webhook_secret, ...channelData } = channel;

    // 1. Upsert channel metadata
    const { data: channelResult, error: channelError } = await supabase
      .from('channels')
      .upsert(channelData)
      .select()
      .single();
    
    if (channelError) {
      console.error('Error upserting channel:', channelError);
      throw channelError;
    }

    // 2. Upsert secrets if provided (Only for WhatsApp)
    if (session_api_key && webhook_secret) {
      const { error: secretsError } = await supabase
        .from('channel_secrets')
        .upsert({
          id: channelResult.id,
          user_id: channel.user_id,
          session_api_key,
          webhook_secret
        });

      if (secretsError) {
        console.error('Error upserting channel secrets:', secretsError);
        // Desfazer channel se falhar segredo? Para MVP vamos apenas logar, 
        // mas idealmente seria uma transação.
      }
    }

    return channelResult;
  },

  async delete(id: string, userId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting channel:', error);
      throw error;
    }
  }
};
