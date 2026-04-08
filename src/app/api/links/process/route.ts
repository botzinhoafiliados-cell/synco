import { NextResponse } from 'next/server';
import { processLinks } from '@/lib/linkProcessor';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Basic auth check
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const links = body.links || [];

    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ error: 'No links provided' }, { status: 400 });
    }

    // Buscar conexões do usuário de forma segura no server-side usando o token atual
    const { data: userConnections } = await supabase
      .from('user_marketplaces')
      .select('*, marketplaces(name)')
      .eq('user_id', user.id);

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const enrichedConnections = await Promise.all((userConnections || []).map(async (conn) => {
      let appSecret = '';
      if (conn.shopee_app_secret_id) {
        const { data: secretData } = await supabaseAdmin
          .schema('vault')
          .from('decrypted_secrets')
          .select('decrypted_secret')
          .eq('id', conn.shopee_app_secret_id)
          .single();
        appSecret = secretData?.decrypted_secret || '';
      }

      return {
        ...conn,
        marketplace_name: conn.marketplaces?.name || '',
        shopee_app_secret: appSecret
      };
    }));

    // Server-side processing with safely fetched user context
    const results = await processLinks(links, enrichedConnections);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error processing links via API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
