import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WasenderClient } from '@/lib/wasender/client';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const logPrefix = `[MESH-SYNC] [${new Date().toISOString()}]`;
  
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_id, force_restart = false } = await request.json();

    if (!channel_id) {
       return NextResponse.json({ error: 'channel_id is required' }, { status: 400 });
    }

    console.log(`${logPrefix} Iniciando sync rápido para canal: ${channel_id} (Force: ${force_restart})`);

    // ... (Validação de canal e sessão permanece igual até a obtenção do sessionId/apiKey)
    // 1. Validar autorização e extrair sessionId
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('config')
      .eq('id', channel_id)
      .eq('user_id', user.id)
      .single();

    if (channelError || !channel || !channel.config || !channel.config.sessionId) {
       return NextResponse.json({ error: 'Session not initialized for this channel' }, { status: 404 });
    }

    const sessionId = channel.config.sessionId;

    // 1.1 Buscar Session API Key nas secrets
    const { data: secrets } = await supabase
      .from('channel_secrets')
      .select('session_api_key')
      .eq('channel_id', channel_id)
      .single();

    let sessionApiKey = secrets?.session_api_key;
    
    // 1.2 PONTE DE AUTENTICAÇÃO E RESTART
    if (force_restart) {
       console.log(`${logPrefix} Comando FORÇAR RESTART recebido. Reinicializando sessão...`);
       await WasenderClient.restartSession(sessionId);
       console.log(`${logPrefix} Restart enviado. Aguardando 5 segundos para estabilização da malha...`);
       await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (!sessionApiKey || sessionApiKey.includes(':')) {
      console.log(`${logPrefix} Chave operacional ausente ou inválida. Iniciando ponte de autenticação...`);
      const sessionData = await WasenderClient.getSession(sessionId);
      const fetchedKey = sessionData.api_key || sessionData.data?.api_key;
      
      if (fetchedKey) {
        await supabase.from('channel_secrets').upsert({
          channel_id, user_id: user.id, session_api_key: fetchedKey, updated_at: new Date().toISOString()
        }, { onConflict: 'channel_id' });
        sessionApiKey = fetchedKey;
      }
    }

    // 2. Buscar grupos na API externa
    console.log(`${logPrefix} Buscando grupos na WasenderAPI...`);
    let wasenderGroups;
    try {
      wasenderGroups = await WasenderClient.getGroups(sessionId, sessionApiKey);
    } catch (apiErr: any) {
      console.error(`${logPrefix} Falha na WasenderAPI:`, apiErr.message);
      throw apiErr;
    }

    const externalGroups = wasenderGroups.data || wasenderGroups.groups || (Array.isArray(wasenderGroups) ? wasenderGroups : []);
    
    if (!Array.isArray(externalGroups)) {
       throw new Error('Invalid format returned from Wasender API');
    }

    // 3. Executar Upsert dos grupos
    const upsertPayload = externalGroups.map((g: any) => {
      const remoteId = g.id || g.jid || g.remote_id;
      if (!remoteId) return null;

      return {
        user_id: user.id,
        channel_id: channel_id,
        remote_id: remoteId, 
        name: g.name || g.subject || g.pushName || 'Grupo sem nome',
        status: 'active',
        members_count: g.size || g.participants?.length || g.members_count || 0,
        avatar_url: g.avatar || g.profile_picture || g.image || g.imgUrl || null,
        is_active: true,
        updated_at: new Date().toISOString()
      };
    }).filter(Boolean);

    // Contagem antes do upsert para detectar novidades
    const { count: oldCount } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channel_id);

    const { data: syncedData, error: upsertError } = await supabase
      .from('groups')
      .upsert(upsertPayload, { onConflict: 'channel_id,remote_id' })
      .select('id');

    if (upsertError) throw upsertError;

    const currentCount = syncedData?.length || 0;
    const previousCount = oldCount || 0;
    const newGroupsCount = currentCount > previousCount ? currentCount - previousCount : 0;

    // LOG DIAGNÓSTICO: Trace de Auditoria (Safe Write)
    try {
      const tracePath = path.join('C:\\Users\\esaur_4zg16wg\\.gemini\\antigravity\\brain\\834affe6-c3e1-4e78-a81c-5d3acf8586f5', 'sync_trace.json');
      fs.writeFileSync(tracePath, JSON.stringify({
        timestamp: new Date().toISOString(),
        channel_id, 
        sessionId, 
        did_restart: force_restart,
        received_count: externalGroups.length,
        persisted_count: currentCount,
        new_groups: newGroupsCount
      }, null, 2));
    } catch (e: any) {
      console.warn(`${logPrefix} Falha ao salvar trace:`, e.message);
    }

    // 4. Update lastSyncAt
    await supabase.from('channels').update({ 
      config: { ...channel.config, lastSyncAt: new Date().toISOString() } 
    }).eq('id', channel_id);

    return NextResponse.json({ 
        success: true, 
        synced: currentCount,
        new_groups: newGroupsCount,
        did_restart: force_restart,
        message: newGroupsCount > 0 
          ? `${newGroupsCount} novos grupos detectados.` 
          : (force_restart ? 'Sessão reinicializada. Malha atualizada.' : 'Malha sincronizada. Nenhum grupo novo encontrado.')
    });

  } catch (error: any) {
    console.error(`[MESH-SYNC] ERRO:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
