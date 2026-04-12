
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente faltando.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPersistence() {
  console.log('--- DIAGNÓSTICO DE PERSISTÊNCIA REAL ---');
  console.log(`Conectado a: ${supabaseUrl}`);

  // 1. Verificar tabelas via query direta (rpc ou metadados se permitido)
  // Como não sabemos se rpc existe, vamos tentar um "SELECT" simples nas tabelas novas
  const tables = ['automation_sources', 'automation_routes', 'destination_lists'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.error(`[X] TABELA INEXISTENTE: ${table}`);
      } else {
        console.error(`[!] ERRO NA TABELA ${table}:`, error.message);
      }
    } else {
      console.log(`[OK] TABELA DETECTADA: ${table}`);
    }
  }

  // 2. Tentar um insert real em destination_lists (que sabemos que existe)
  console.log('\n--- TESTE DE INSERT REAL (LISTAS) ---');
  const testName = `Teste Persistência ${new Date().getTime()}`;
  const { data, error: insertError } = await supabase
    .from('destination_lists')
    .insert({
      name: testName,
      user_id: 'ebf865a7-e066-6798-26a9-66f4b42cb8e6', // ID fictício baseado na Master Key ou padrão
      description: 'PROVA DE PERSISTÊNCIA REAL OPERACIONAL'
    })
    .select()
    .single();

  if (insertError) {
    console.error('[-] FALHA NO INSERT:', insertError.message);
  } else {
    console.log('[+] SUCESSO NO INSERT!');
    console.log('    ID Retornado:', data.id);
    console.log('    Nome:', data.name);
    
    // Limpar o teste
    await supabase.from('destination_lists').delete().eq('id', data.id);
    console.log('[+] REGISTRO DE TESTE EXCLUÍDO.');
  }
}

verifyPersistence();
