// src/lib/wasender/types.ts

export type WasenderSessionStatus = 'disconnected' | 'connecting' | 'qrcode' | 'connected' | 'session_lost';

export interface WasenderSession {
  id: string;
  name: string;
  phone?: string;
  status: WasenderSessionStatus;
  qrCode?: string;
  webhookUrl?: string;
  updatedAt: string;
}

export interface WasenderCredentials {
  apiKey: string;    // session_api_key
  webhookSecret: string;
}
