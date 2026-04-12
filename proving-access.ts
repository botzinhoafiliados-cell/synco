
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function provingAccess() {
  console.log('--- PROVA DE PERSISTÊNCIA REAL ---');
  
  // Tentar um insert extremamente simples
  const { data, error } = await supabase
    .from('destination_lists')
    .insert({
      name: 'PROVA OPERACIONAL ANTIGRAVITY',
      user_id: 'ebf865a7-e066-6798-26a9-66f4b42cb8e6' 
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('[-] ERRO DE ESCRITA NO SUPABASE:', error);
  } else {
    console.log('[+] PERSISTÊNCIA CONFIRMADA!');
    console.log('    ID OPERACIONAL:', data.id);
    console.log('    TABELA: destination_lists');
    
    // Limpar
    await supabase.from('destination_lists').delete().eq('id', data.id);
  }
}

provingAccess();
