
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function finalProof() {
  console.log('--- EVIDÊNCIA DE PERSISTÊNCIA REAL ---');
  
  const { data, error } = await supabase
    .from('destination_lists')
    .insert({
      name: 'PROVA OPERACIONAL SUCESSO',
      user_id: '59cd0337-2f39-43ce-a596-cd068a1df7f6' // ID Real encontrado no profiles
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('[-] FALHA:', error.message);
  } else {
    console.log('[+] PERSISTÊNCIA PROVADA!');
    console.log('    ID REAL CRIADO:', data.id);
    console.log('    TIMESTAMP:', new Date().toISOString());
    
    // Limpar
    await supabase.from('destination_lists').delete().eq('id', data.id);
    console.log('[+] REGISTRO EXCLUÍDO APÓS PROVA.');
  }
}

finalProof();
