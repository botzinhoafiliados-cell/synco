const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function diagnoseDeepSync() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const wasenderUrl = process.env.WASENDER_API_URL || 'https://wasenderapi.com/api';

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('--- DIAGNÓSTICO DE MALHA PROFUNDA ---');

  // 1. Usar o grupo identificado na pesquisa anterior
  const channel_id = 'f3662b5c-fd0c-403e-a2f2-e754a116e514';
  const remote_id = '-5128353168';

  // 2. Buscar API Key do canal
  const { data: secrets } = await supabase
    .from('channel_secrets')
    .select('session_api_key')
    .eq('channel_id', channel_id)
    .single();

  if (!secrets?.session_api_key) {
    console.error('API Key não encontrada no banco para este canal.');
    return;
  }

  // Pegar sessionId do canal
  const { data: channel } = await supabase
    .from('channels')
    .select('config')
    .eq('id', channel_id)
    .single();
  
  const sessionId = channel?.config?.sessionId;
  const apiKey = secrets.session_api_key;

  console.log(`Testando: Session ${sessionId}, Group ${remote_id}`);

  // 3. Testar Metadados
  console.log('\n--- Testando Metadados (/groups/{id}) ---');
  const metaRes = await fetch(`${wasenderUrl}/groups/${remote_id}?session_id=${sessionId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'X-Api-Key': apiKey }
  });
  console.log('Status:', metaRes.status);
  const metaJson = await metaRes.json();
  console.log('Keys Metadados:', Object.keys(metaJson.data || metaJson));
  if (metaJson.data || metaJson) console.log('Exemplo Descrição:', (metaJson.data || metaJson).description);

  // 4. Testar Participantes
  console.log('\n--- Testando Participantes (/groups/{id}/participants) ---');
  const partRes = await fetch(`${wasenderUrl}/groups/${remote_id}/participants?session_id=${sessionId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'X-Api-Key': apiKey }
  });
  console.log('Status:', partRes.status);
  const partJson = await partRes.json();
  const participants = partJson.data || partJson.participants || partJson;

  if (Array.isArray(participants) && participants.length > 0) {
    console.log(`Encontrados ${participants.length} participantes.`);
    console.log('Participante 0 (Keys):', Object.keys(participants[0]));
    console.log('Participante 0 (Dados):', JSON.stringify(participants[0], null, 2));
    
    // Verificar quem é admin
    const admins = participants.filter(p => p.admin || p.isAdmin || p.role === 'admin' || p.is_admin);
    console.log(`Total de Admins identificados com lógica atual: ${admins.length}`);
  } else {
    console.error('Nenhum participante retornado ou formato inválido:', partJson);
  }

  process.exit(0);
}

diagnoseDeepSync();
