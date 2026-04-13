const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function diagnoseSync() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const wasenderPAT = process.env.WASENDER_PAT;

  if (!supabaseUrl || !supabaseKey || !wasenderPAT) {
    console.error('Missing credentials in .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('--- DIAGNÓSTICO DE MALHA (BACKEND) ---');

  // 1. Obter uma sessão válida
  const { data: channel } = await supabase
    .from('channels')
    .select('id, config')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (!channel?.config?.sessionId) {
    console.error('Nenhum canal ativo com sessionId encontrado para teste.');
    return;
  }

  const sessionId = channel.config.sessionId;
  console.log(`Usando Canal: ${channel.id}, Session: ${sessionId}`);

  // 2. Testar WasenderAPI Groups
  console.log('Buscando grupos na WasenderAPI...');
  const res = await fetch(`https://wasenderapi.com/api/groups?session_id=${sessionId}`, {
    headers: { 'Authorization': `Bearer ${wasenderPAT}` }
  });
  
  if (!res.ok) {
    console.error(`Wasender API Error: ${res.status} ${await res.text()}`);
    return;
  }

  const wasenderRes = await res.json();
  const groups = wasenderRes.data || wasenderRes.groups || wasenderRes;
  
  if (!Array.isArray(groups) || groups.length === 0) {
    console.error('Nenhum grupo retornado pela Wasender API.');
    console.log('Raw Payload:', JSON.stringify(wasenderRes, null, 2));
    return;
  }

  console.log(`Wasender retornou ${groups.length} grupos.`);
  console.log('Exemplo do primeiro grupo (Keys):', Object.keys(groups[0]));
  console.log('Amostra de dados (id/jid):', groups[0].id || groups[0].jid);

  // 3. Tentar Upsert no Supabase
  const samplePayload = {
    user_id: '8093db5f-7f55-408a-bc3e-a13ea4279093', // UID fixo para teste de diagnóstico
    channel_id: channel.id,
    remote_id: groups[0].id || groups[0].jid,
    name: groups[0].name || groups[0].subject || 'Grupo de Teste',
    status: 'active',
    members_count: groups[0].size || 0,
    avatar_url: groups[0].avatar || null,
    is_active: true,
    updated_at: new Date().toISOString()
  };

  console.log('Tentando upsert manual no banco...');
  const { data: synced, error: upsertErr } = await supabase
    .from('groups')
    .upsert([samplePayload], { onConflict: 'channel_id,remote_id' });

  if (upsertErr) {
    console.error('❌ ERRO NO UPSERT:', JSON.stringify(upsertErr, null, 2));
  } else {
    console.log('✅ UPSERT DE TESTE FUNCIONOU!');
  }

  process.exit(0);
}

diagnoseSync();
