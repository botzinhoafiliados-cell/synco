// src/app/api/automations/process/route.ts
import { NextResponse } from 'next/server';
import { processInboundAutomation } from '@/lib/automation/processor';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Autenticação básica (opcional, como o processamento é interno)
    // No MVP, confiamos na rede interna ou segredo simples
    
    const result = await processInboundAutomation(payload);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[AUTOMATION API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
