
import { createClient } from '@supabase/supabase-js';
import { WasenderClient } from './src/lib/wasender/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalVerify() {
  console.log('--- VERIFICAÇÃO FINAL: PIPELINE DE PARTICIPANTES ---');

  // 1. Localizar o canal/grupo do usuário
  const { data: group } = await supabase
    .from('groups')
    .select('id, remote_id, channel_id, user_id, name, members_count, admin_count, channels(config)')
    .eq('name', 'Vó Jovina e Tio Dilson ❤️💙') // Usar o grupo real do diagnóstico anterior
    .single();

  if (!group) {
    console.error('ERRO: Grupo alvo não encontrado.');
    return;
  }

  const groupId = group.id;
  const remoteId = group.remote_id;
  const sessionId = (group.channels as any)?.config?.sessionId;

  console.log(`Limpando participantes antigos para teste limpo...`);
  await supabase.from('group_participants').delete().eq('group_id', groupId);

  console.log(`Executando lógica corrigida para: ${group.name}`);

  const { data: secrets } = await supabase.from('channel_secrets').select('session_api_key').eq('channel_id', group.channel_id).single();
  const apiKey = secrets?.session_api_key;

  try {
    const partRes = await WasenderClient.getGroupParticipants(sessionId, remoteId, apiKey);
    const participants = partRes?.data || partRes?.participants || partRes || [];
    
    console.log(`Recebidos da Wasender: ${participants.length}`);

    // a. Upsert Contatos (JID > LID)
    const contactsPayload = participants.map((p: any) => ({
      user_id: group.user_id,
      channel_id: group.channel_id,
      remote_id: p.jid || p.id || p.remote_id,
      push_name: p.pushName || p.pushname || p.name || null,
      name: p.name || null
    })).filter(p => p.remote_id);

    const { data: syncedContacts } = await supabase.from('contacts').upsert(contactsPayload, { onConflict: 'channel_id,remote_id' }).select('id, remote_id');
    console.log(`Contatos persistidos: ${syncedContacts?.length}`);

    const contactMap = new Map(syncedContacts?.map(c => [c.remote_id, c.id]));

    // b. Vincular participantes
    const participantPayload = participants.map((p: any) => {
      const pJid = p.jid;
      const pLid = p.id;
      const cId = contactMap.get(pJid) || contactMap.get(pLid);
      if (!cId) return null;
      return { group_id: groupId, contact_id: cId, role: p.isAdmin ? 'admin' : 'member' };
    }).filter(Boolean);

    const { error: partErr } = await supabase.from('group_participants').upsert(participantPayload);
    if (partErr) console.error('Erro no vínculo:', partErr.message);

    // c. Atualizar contadores
    const finalMembers = participantPayload.length;
    await supabase.from('groups').update({ members_count: finalMembers }).eq('id', groupId);

    console.log(`Vínculos criados: ${participantPayload.length}`);
    console.log(`Contagem final no banco: ${finalMembers}`);

    const success = syncedContacts?.length > 0 && participantPayload.length > 0;
    console.log(`\nStatus: ${success ? '✅ SUCESSO - Pipeline Restaurado' : '❌ FALHA'}`);

  } catch (err: any) {
    console.error('Falha no teste:', err.message);
  }
}

finalVerify();
