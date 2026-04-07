import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WasenderClient } from '@/lib/wasender/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId, phone, message } = await request.json();

    if (!channelId || !phone || !message) {
      return NextResponse.json({ error: 'Campos obrigatórios: channelId, phone, message' }, { status: 400 });
    }

    // 1. Buscar a configuração do canal
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('config')
      .eq('id', channelId)
      .eq('user_id', session.user.id)
      .single();

    if (channelError || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const sessionId = channel.config?.sessionId;
    if (!sessionId) {
      return NextResponse.json({ error: 'Channel not connected (missing sessionId)' }, { status: 400 });
    }

    // 1.5 Buscar a session_api_key no channel_secrets
    const { data: secretData } = await supabase
      .from('channel_secrets')
      .select('session_api_key')
      .eq('channel_id', channelId)
      .eq('user_id', session.user.id)
      .single();

    if (!secretData?.session_api_key) {
      return NextResponse.json({ error: 'Channel Secret (session_api_key) ausente. Por favor, exclua e reconecte seu WhatsApp na guia Canais.' }, { status: 400 });
    }

    // Extrai rigidamente apenar NÚMEROS do telefone (O Wame faz o append automático dos sufixos c.us e rejeita se for manual)
    const formattedPhone = phone.replace(/[^\d]/g, ''); 

    console.log(`[TEST-SEND] Disparando para: ${formattedPhone} usando token via Wame Route!`);
    
    // 2. Disparar direto no Wasender
    const response = await WasenderClient.sendMessage(secretData.session_api_key, formattedPhone, message);

    console.log(`[TEST-SEND] Sucesso:`, response);
    return NextResponse.json({ success: true, response });

  } catch (error: any) {
    console.error('Test Send Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
