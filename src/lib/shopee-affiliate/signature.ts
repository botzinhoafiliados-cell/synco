import { createHash } from 'crypto';

/**
 * Gera a assinatura criptográfica exigida pela Shopee Open API (GraphQL)
 * O formato padrão aprovado é: SHA256(appId + timestamp + payload + secret)
 */
export function generateShopeeSignature(
  appId: string, 
  timestamp: number, 
  payload: string, 
  secret: string
): string {
  const baseString = `${appId}${timestamp}${payload}${secret}`;
  return createHash('sha256').update(baseString).digest('hex');
}
