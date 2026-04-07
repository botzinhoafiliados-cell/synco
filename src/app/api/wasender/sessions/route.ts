// src/app/api/wasender/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WasenderClient } from '@/lib/wasender/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId, action } = await request.json();

    if (!channelId || !action) {
      return NextResponse.json({ error: 'Missing channelId or action' }, { status: 400 });
    }

    // 1. Buscar segredos do canal (Isolados)
    const { data: secrets, error: secretsError } = await supabase
      .from('channel_secrets')
      .select('session_api_key, webhook_secret')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();

    if (secretsError || !secrets) {
      return NextResponse.json({ error: 'Channel secrets not found or access denied' }, { status: 404 });
    }

    const wasender = new WasenderClient(secrets.session_api_key);

    // 2. Executar ação conforme o lifecycle
    let result;
    switch (action) {
      case 'create':
        const { data: channel } = await supabase.from('channels').select('name').eq('id', channelId).single();
        result = await wasender.createSession(channel?.name || 'SYNCO Session');
        // Atualizar metadata inicial
        await supabase.from('channels').update({ 
          config: { sessionId: result.id, status: 'disconnected' } 
        }).eq('id', channelId);
        break;

      case 'connect':
        const { data: configData } = await supabase.from('channels').select('config').eq('id', channelId).single();
        if (!configData?.config?.sessionId) throw new Error('Session ID not found in channel config');
        result = await wasender.connectSession(configData.config.sessionId);
        break;

      case 'status':
        const { data: statusConfig } = await supabase.from('channels').select('config').eq('id', channelId).single();
        if (!statusConfig?.config?.sessionId) throw new Error('Session ID not found');
        result = await wasender.getStatus(statusConfig.config.sessionId);
        // Sync local status
        await supabase.from('channels').update({ 
          config: { ...statusConfig.config, status: result.status, phoneNumber: result.phone } 
        }).eq('id', channelId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error('Wasender Session Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
