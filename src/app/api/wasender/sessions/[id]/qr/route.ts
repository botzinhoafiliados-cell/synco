// src/app/api/wasender/sessions/[id]/qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WasenderClient } from '@/lib/wasender/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channelId = params.id;

    // 1. Buscar segredos do canal
    const { data: secrets, error: secretsError } = await supabase
      .from('channel_secrets')
      .select('session_api_key')
      .eq('id', channelId)
      .eq('user_id', user.id)
      .single();

    if (secretsError || !secrets) {
      return NextResponse.json({ error: 'Secrets not found' }, { status: 404 });
    }

    // 2. Buscar config do canal para pegar o sessionId da Wasender
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('config')
      .eq('id', channelId)
      .single();

    if (channelError || !channel?.config?.sessionId) {
      return NextResponse.json({ error: 'Session not initialized' }, { status: 400 });
    }

    const wasender = new WasenderClient(secrets.session_api_key);
    const result = await wasender.getQrCode(channel.config.sessionId);

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching QR' }, { status: 500 });
  }
}
