import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TelegramClient } from '@/lib/telegram/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId, chatId, message } = await request.json();

    if (!channelId || !chatId || !message) {
      return NextResponse.json({ error: 'Campos obrigatórios: channelId, chatId e message' }, { status: 400 });
    }

    // Buscar segredos com admin client (RLS bloqueia select para usuários normais)
    const admin = createAdminClient();
    const { data: secretData } = await admin
      .from('channel_secrets')
      .select('session_api_key')
      .eq('channel_id', channelId)
      .maybeSingle();

    const botToken = secretData?.session_api_key;
    if (!botToken) {
      return NextResponse.json({ error: 'Bot Token não encontrado. Conecte o bot na aba Canais.' }, { status: 400 });
    }

    console.log(`[TG-TEST-SEND] Disparando para chat: ${chatId}`);

    const response = await TelegramClient.sendMessage(botToken, chatId.toString(), message);

    return NextResponse.json({ success: true, response: response.result });

  } catch (error: any) {
    console.error('Telegram Test Send Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
