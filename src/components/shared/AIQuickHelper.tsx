'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AIQuickHelperProps {
    context?: string;
    contextText?: string;
}

export default function AIQuickHelper({ context, contextText }: AIQuickHelperProps) {
    return (
        <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-primary">Assistente IA {context ? `(${context})` : ''}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        {contextText || 'Dica: Tente filtrar por "Super Ofertas" para encontrar produtos com maior score de oportunidade e desconto real.'}
                    </p>
                </div>
            </div>
        </Card>
    );
}
