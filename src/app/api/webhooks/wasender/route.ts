// src/app/api/webhooks/wasender/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Endpoint para recebimento de webhooks da WasenderAPI.
 * Validará a assinatura/secret para garantir segurança de origem.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. O payload preliminar para identificar o canal
    const payload = await request.json();
    const { action, session_id } = payload;

    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const supabase = createClient();
    
    // 2. Localizar o canal e seu secret
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, user_id')
      .filter('config->>sessionId', 'eq', session_id)
      .single();

    if (channelError || !channel) {
       console.warn(`Webhook Wasender: Canal não encontrado para sessão ${session_id}`);
       return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const { data: secrets } = await supabase
      .from('channel_secrets')
      .select('webhook_secret')
      .eq('id', channel.id)
      .single();

    const signature = request.headers.get('x-wasender-signature');

    if (!secrets?.webhook_secret || !signature || signature !== secrets.webhook_secret) {
      console.warn(`Webhook Wasender: Falha de autenticação para sessão ${session_id}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Mapear status
    console.log(`Webhook Wasender: ${action} para canal ${channel.id}`);
    
    let dbStatus = 'disconnected';
    if (action === 'session_connected') dbStatus = 'connected';
    if (action === 'session_disconnected') dbStatus = 'disconnected';
    if (action === 'session_lost') dbStatus = 'session_lost';

    // Atualizar status no banco
    const { data: currentConfig } = await supabase.from('channels').select('config').eq('id', channel.id).single();
    await supabase.from('channels').update({ 
      config: { ...currentConfig?.config, status: dbStatus } 
    }).eq('id', channel.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook Wasender:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
