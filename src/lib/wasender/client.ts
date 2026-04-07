import { WasenderSessionStatus } from '@/types/group';

export class WasenderClient {
  private static get baseURL() {
    return process.env.WASENDER_API_URL || 'https://wasenderapi.com/api';
  }

  private static get pat() {
    return process.env.WASENDER_PAT;
  }

  private static get headers() {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.pat || '',
      'Authorization': `Bearer ${this.pat || ''}`
    };
  }

  // ─── Session Lifecycle ──────────────────────────────────────────────────

  static async createSession(params: {
    name: string;
    phoneNumber: string;
    webhookUrl?: string;
  }) {
    const body: Record<string, any> = {
      name: params.name,
      phone_number: params.phoneNumber,
      account_protection: true,
      log_messages: true,
      read_incoming_messages: false,
    };

    // Só incluir webhook se tiver URL pública
    if (params.webhookUrl) {
      body.webhook_url = params.webhookUrl;
      body.webhook_enabled = true;
      body.webhook_events = [
        'messages.received',
        'session.status',
        'messages.update',
        'qrcode.updated'
      ];
    }

    const res = await fetch(`${this.baseURL}/whatsapp-sessions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to create Wasender session: ${err}`);
    }
    return res.json();
  }

  static async connectSession(sessionId: string) {
    const res = await fetch(`${this.baseURL}/whatsapp-sessions/${sessionId}/connect`, {
      method: 'POST',
      headers: this.headers
    });
    
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to connect session: ${err}`);
    }
    return res.json();
  }

  static async getStatus(sessionId: string) {
    const res = await fetch(`${this.baseURL}/whatsapp-sessions/${sessionId}`, {
      method: 'GET',
      headers: this.headers
    });
    
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to get status: ${err}`);
    }
    return res.json();
  }

  static async getQrCode(sessionId: string) {
    const res = await fetch(`${this.baseURL}/whatsapp-sessions/${sessionId}/qrcode`, {
      method: 'GET',
      headers: this.headers
    });
    
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to get QR code: ${err}`);
    }
    return res.json(); 
  }

  // ─── Groups ─────────────────────────────────────────────────────────────

  static async getGroups(sessionId: string) {
    const res = await fetch(`${this.baseURL}/groups?session_id=${sessionId}`, {
      method: 'GET',
      headers: this.headers
    });
    
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to get groups: ${err}`);
    }
    return res.json();
  }

  // ─── Messaging ──────────────────────────────────────────────────────────

  /**
   * Envia uma mensagem de texto para um destino via Wasender.
   * IMPORTANTE: Envio requer a API_KEY da sessão (e não o PAT global) e a rota /send-message.
   * @param sessionApiKey - Chave de API única da sessão (do channel_secrets)
   * @param to - Número do destinatário
   * @param message - Corpo da mensagem
   */
  static async sendMessage(sessionApiKey: string, to: string, message: string) {
    const res = await fetch(`${this.baseURL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionApiKey}`
      },
      body: JSON.stringify({
        to,
        text: message
      })
    });

    // O wasender muitas vezes volta sucesso, mas message=..., precisamos checar res.json
    const data = await res.json();
    
    if (!res.ok || data.success === false) {
      throw new Error(`Failed to send message: ${data.message || JSON.stringify(data.errors) || 'Unknown Error'}`);
    }
    return data;
  }

  /**
   * Envia uma mensagem com imagem e texto opcional.
   * @param sessionApiKey - Chave de API da sessão
   * @param to - Número ou remote_id do grupo
   * @param imageUrl - URL da imagem
   * @param caption - Texto opcional embaixo da imagem
   */
  static async sendImage(sessionApiKey: string, to: string, imageUrl: string, caption?: string) {
    const res = await fetch(`${this.baseURL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionApiKey}`
      },
      body: JSON.stringify({
        to,
        image: imageUrl,
        text: caption || ''
      })
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(`Failed to send image: ${data.message || JSON.stringify(data.errors) || 'Unknown Error'}`);
    }
    return data;
  }
}
