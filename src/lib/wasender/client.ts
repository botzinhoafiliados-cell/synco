// src/lib/wasender/client.ts
import { WasenderSession, WasenderSessionStatus } from './types';

const WASENDER_BASE_URL = process.env.WASENDER_BASE_URL || 'https://api.wasender.com/api/v1';

export class WasenderClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${WASENDER_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Wasender API Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Cria uma nova sessão no Wasender.
   */
  async createSession(name: string): Promise<{ id: string }> {
    return this.request('/whatsapp-sessions', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Inicia o processo de conexão da sessão.
   */
  async connectSession(sessionId: string): Promise<{ status: string }> {
    return this.request(`/whatsapp-sessions/${sessionId}/connect`, {
      method: 'POST',
    });
  }

  /**
   * Obtém o QR Code atual da sessão.
   */
  async getQrCode(sessionId: string): Promise<{ qr: string }> {
    return this.request(`/whatsapp-sessions/${sessionId}/qr`);
  }

  /**
   * Consulta o status real da sessão.
   */
  async getStatus(sessionId: string): Promise<{ status: WasenderSessionStatus; phone?: string }> {
    const data = await this.request(`/whatsapp-sessions/${sessionId}/status`);
    // Mapear status da Wasender para o nosso enum interno se necessário
    return {
      status: this.mapStatus(data.status),
      phone: data.phone
    };
  }

  private mapStatus(wasenderStatus: string): WasenderSessionStatus {
    const statusMap: Record<string, WasenderSessionStatus> = {
      'AUTHENTICATED': 'connected',
      'DISCONNECTED': 'disconnected',
      'NEED_SCAN': 'qrcode',
      'SESSION_LOST': 'session_lost',
      'CONNECTING': 'connecting'
    };
    return statusMap[wasenderStatus] || 'disconnected';
  }
}
