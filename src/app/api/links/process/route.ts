import { NextResponse } from 'next/server';
import { processLinks } from '@/lib/linkProcessor';
import { createClient } from '@/lib/supabase/server';

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

    // Server-side processing with user context for real affiliate configs
    const results = await processLinks(links, user.id);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error processing links via API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
