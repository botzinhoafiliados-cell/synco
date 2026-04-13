
import { createClient } from '@supabase/supabase-js';
import { WasenderClient } from './src/lib/wasender/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnostic() {
  console.log('--- DIAGNÓSTICO DE PARTICIPANTES ---');

  // 1. Localizar canal com sessão ativa
  const { data: channels } = await supabase
    .from('channels')
    .select('id, name, config')
    .not('config->sessionId', 'is', null)
    .limit(1);

  if (!channels || channels.length === 0) {
    console.error('ERRO: Nenhum canal com sessionId encontrado.');
    return;
  }

  const channel = channels[0];
  const sessionId = channel.config?.sessionId;
  console.log(`Canal: ${channel.name}, Session: ${sessionId}`);

  // 2. Localizar um grupo DESTE canal
  const { data: groups } = await supabase
    .from('groups')
    .select('id, remote_id, name, user_id')
    .eq('channel_id', channel.id)
    .not('remote_id', 'is', null)
    .limit(1);

  if (!groups || groups.length === 0) {
    console.error(`ERRO: Nenhum grupo encontrado para o canal ${channel.id}.`);
    return;
  }

  const group = groups[0];
  const remoteId = group.remote_id;
  console.log(`Grupo: ${group.name} (${remoteId})`);

  // 3. Buscar Key
  const { data: secrets } = await supabase.from('channel_secrets').select('session_api_key').eq('channel_id', channel.id).single();
  const apiKey = secrets?.session_api_key;

  // 4. Chamada Wasender
  try {
    console.log('\n--- Chamando Wasender ---');
    const partRes = await WasenderClient.getGroupParticipants(sessionId, remoteId, apiKey);
    
    // CAPTURAR PAYLOAD BRUTO (Conforme solicitado pelo usuário)
    console.log('PAYLOAD BRUTO PARTICIPANTES (primeiros 2):', JSON.stringify((partRes?.data || partRes).slice(0, 2), null, 2));

    const participants = partRes?.data || partRes?.participants || partRes || [];
    console.log(`Total retornados: ${participants.length}`);

    if (participants.length > 0) {
      // 5. Testar UPSERT de Contatos
      const contactsPayload = participants.slice(0, 3).map((p: any) => ({
        user_id: group.user_id,
        channel_id: channel.id,
        remote_id: p.id || p.jid || p.remote_id,
        push_name: p.pushName || p.pushname || p.name || null,
        name: p.name || null
      }));

      console.log('\n--- Testando Upsert de Contatos ---');
      const { data: synced, error } = await supabase
        .from('contacts')
        .upsert(contactsPayload, { onConflict: 'channel_id,remote_id' })
        .select('id, remote_id');

      if (error) {
        console.error('ERRO no upsert:', error.message);
      } else {
        console.log(`Sucesso! Upsert retornou ${synced?.length} itens.`);
        console.log('Mapping return:', JSON.stringify(synced, null, 2));
      }
    }
  } catch (err: any) {
    console.error('ERRO FATAL:', err.message);
  }
}

diagnostic();
