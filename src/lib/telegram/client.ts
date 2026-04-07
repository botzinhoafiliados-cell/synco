export class TelegramClient {
  private static getBaseUrl(token: string) {
    return `https://api.telegram.org/bot${token}`;
  }

  /**
   * Valida o token retornando os dados do bot
   */
  static async getMe(token: string) {
    const res = await fetch(`${this.getBaseUrl(token)}/getMe`, {
      method: 'GET',
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(`Failed to validate token: ${data.description || 'Unknown error'}`);
    }
    
    return data;
  }

  /**
   * Envia uma mensagem de texto longa
   */
  static async sendMessage(token: string, chatId: string, text: string) {
    const res = await fetch(`${this.getBaseUrl(token)}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(`Failed to send Telegram message: ${data.description || 'Unknown error'}`);
    }
    return data;
  }

  /**
   * Envia uma foto com legenda opcional
   */
  static async sendPhoto(token: string, chatId: string, photoUrl: string, caption?: string) {
    const res = await fetch(`${this.getBaseUrl(token)}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption || '',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(`Failed to send Telegram photo: ${data.description || 'Unknown error'}`);
    }
    return data;
  }
}
