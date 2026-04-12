
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function inspectSchema() {
  console.log('--- INSPEÇÃO DE SCHEMA REAL ---');

  // Consulta de introspecção (Information Schema)
  const query = `
    SELECT 
      table_name, 
      column_name, 
      data_type, 
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name IN ('automation_sources', 'automation_routes', 'destination_lists')
    ORDER BY table_name, ordinal_position;
  `;

  const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });

  if (error) {
    // Se não houver RPC para SQL, tentamos inferir via selects vazios
    console.error('RPC execute_sql não disponível. Tentando inferência via headers...');
    
    const tables = ['automation_sources', 'automation_routes', 'destination_lists'];
    for (const table of tables) {
      const { data: cols, error: colError } = await supabase.from(table).select('*').limit(0);
      if (colError) {
        console.error(`Erro ao ler ${table}:`, colError.message);
      } else {
        console.log(`\nColunas em [${table}]:`);
        console.log(Object.keys(cols?.[0] || {}).join(', '));
      }
    }
  } else {
    console.log(data);
  }
}

inspectSchema();
