import { generateShopeeSignature } from './signature';
import { ShopeeClientConfig, ShopeeGraphQLResponse, GenerateShortLinkResponse } from './types';

/**
 * Cliente da Open API de Afiliados da Shopee via GraphQL.
 * Executado puramente Server-Side.
 */
export class ShopeeAffiliateClient {
  private appId: string;
  private secret: string;
  private apiUrl = 'https://open-api.affiliate.shopee.com.br/graphql';

  constructor(config?: ShopeeClientConfig) {
    this.appId = config?.appId || process.env.SHOPEE_APP_ID || '';
    this.secret = config?.secret || process.env.SHOPEE_APP_SECRET || '';
  }

  /**
   * Converte uma URL normal em Short Link via GraphQL.
   * Utiliza subIds opcionais para tracking de campanha/usuário.
   */
  async generateShortLink(originUrl: string, subIds?: string[]): Promise<string> {
    if (!this.appId || !this.secret) {
      throw new Error('Shopee Open API credentials not configured');
    }

    const payloadObj = {
      query: `
        mutation generateShortLink($originUrl: String!, $subIds: [String!]) {
          generateShortLink(originUrl: $originUrl, subIds: $subIds) {
            shortLink
          }
        }
      `,
      variables: {
        originUrl,
        subIds: subIds || []
      }
    };

    const payload = JSON.stringify(payloadObj);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateShopeeSignature(this.appId, timestamp, payload, this.secret);
    
    // Header esperado: Authorization: SHA256 Credential={AppId}, Timestamp={Timestamp}, Signature={Signature}
    const authHeader = `SHA256 Credential=${this.appId}, Timestamp=${timestamp}, Signature=${signature}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout de segurança pra UI não travar

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: payload,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`[HTTP ${response.status}] ${response.statusText}`);
      }

      const json = await response.json() as ShopeeGraphQLResponse<GenerateShortLinkResponse>;
      
      if (json.errors && json.errors.length > 0) {
        throw new Error(json.errors[0].message);
      }

      if (!json.data?.generateShortLink?.shortLink) {
        throw new Error('API não retornou shortLink no payload esperado');
      }

      return json.data.generateShortLink.shortLink;
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw new Error(`Shopee GraphQL Error: ${error.message}`);
    }
  }
}
