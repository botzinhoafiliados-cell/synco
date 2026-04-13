
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Payload descoberto no diagnóstico anterior
const mockParticipants = [
  {
    "id": "176166707146814@lid",
    "jid": "557199763706@s.whatsapp.net",
    "admin": null,
    "isAdmin": false
  },
  {
    "id": "94205963685915@lid",
    "jid": "557199403020@s.whatsapp.net",
    "admin": "admin",
    "isAdmin": true
  }
];

const groupOwnerFromMetadata = "557199403020@s.whatsapp.net"; // Exemplo

async function testLogic() {
  console.log('--- TESTE DE LÓGICA DE MAPEAMENTO (Dry Run) ---');

  // 1. Preparar contatos (Simulando o mapeamento JID > LID)
  const contactsPayload = mockParticipants.map((p) => {
    const bestId = p.jid || p.id;
    return { remote_id: bestId, jid: p.jid, lid: p.id };
  });

  console.log('IDs escolhidos para contacts:', contactsPayload.map(c => c.remote_id));

  // 2. Simular o contactMap que viria do banco
  // Na vida real, o contactMap.get(pJid) || contactMap.get(pLid) resolveria o problema
  const contactMap = new Map();
  contactsPayload.forEach((c, idx) => {
    contactMap.set(c.remote_id, `UUID-${idx}`);
  });

  // 3. Processar participantes com a NOVA LÓGICA
  const results = mockParticipants.map(p => {
    const pJid = p.jid;
    const pLid = p.id;
    const bestId = pJid || pLid;

    // A mágica: busca por JID primeiro, depois LID
    const cId = contactMap.get(pJid) || contactMap.get(pLid);
    
    // Normalização para creator
    const normalize = (id) => id?.split('@')[0];
    const isOwner = normalize(pJid) === normalize(groupOwnerFromMetadata) || 
                    normalize(pLid) === normalize(groupOwnerFromMetadata);

    let role = 'member';
    if (isOwner) role = 'creator';
    else if (p.isAdmin) role = 'admin';

    return { bestId, cId, role };
  });

  console.log('Resultado do processamento:', JSON.stringify(results, null, 2));

  const allMapped = results.every(r => r.cId);
  console.log(`\nStatus final: ${allMapped ? '✅ SUCESSO' : '❌ FALHA'} (Todos mapeados)`);
}

testLogic();
