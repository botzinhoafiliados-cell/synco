// src/lib/automation/template-engine.ts
import { FactualData } from '../linkProcessor';

/**
 * Preenche um template de mensagem com dados factuais do produto.
 * Placeholders suportados:
 * - {{titulo}}
 * - {{preco}}
 * - {{pix}}
 * - {{link}}
 * - {{loja}}
 * - {{comissao_percentual}}
 * - {{comissao_valor}}
 * - {{categoria}}
 * - {{grupo_origem}}
 */
export function fillTemplate(template: string, data: FactualData, sourceName?: string): string {
  if (!template) return '';

  const placeholders: Record<string, string> = {
    '{{titulo}}': data.title || '',
    '{{preco}}': data.priceFormatted || '',
    '{{pix}}': data.estimatedPixPriceFormatted || '',
    '{{link}}': data.finalLinkToSend || '',
    '{{loja}}': data.shopName || '',
    '{{comissao_percentual}}': data.commissionRatePercent || '',
    '{{comissao_valor}}': data.commissionValueFormatted || '',
    '{{categoria}}': (data as any).category || 'Oferta',
    '{{grupo_origem}}': sourceName || 'Fonte Monitorada'
  };

  let result = template;
  
  // Substituir cada placeholder pelo seu valor correspondente
  Object.entries(placeholders).forEach(([key, value]) => {
    // Escapar colchetes do placeholder para o RegExp
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escapedKey, 'g'), value);
  });

  // Limpeza final: remove placeholders remanescentes que não foram mapeados (segurança)
  result = result.replace(/\{\{[a-z0-9_]+\}\}/gi, '');

  // Normalização de quebras de linha múltiplas causadas por campos vazios
  return result.replace(/\n{3,}/g, '\n\n').trim();
}
