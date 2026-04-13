const { WasenderClient } = require('./src/lib/wasender/client');
require('dotenv').config();

const sessionId = "SEU_SESSION_ID_AQUI"; // Preciso pegar um do DB
const apiKey = "SUA_API_KEY_AQUI"; // Do channel_secrets

async function auditWasender() {
  console.log('--- AUDITORIA WASENDER API ---');
  try {
    const groups = await WasenderClient.getGroups(sessionId);
    console.log('--- SAMPLE GROUP STRUCTURE ---');
    console.log(JSON.stringify(groups.data?.[0] || groups[0], null, 2));
    
    if (groups.data?.[0]?.id) {
       const meta = await WasenderClient.getGroupMetadata(sessionId, groups.data[0].id);
       console.log('--- SAMPLE METADATA STRUCTURE ---');
       console.log(JSON.stringify(meta, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

// auditWasender();
console.log('Manual audit script created. Use WasenderClient directly in a temporary route to test.');
