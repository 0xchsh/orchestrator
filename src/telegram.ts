import fetch from 'node-fetch';

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
}

export class TelegramNotifier {
  private token: string;
  private chatId: string;
  private baseUrl = 'https://api.telegram.org/bot';

  constructor(token: string, chatId: string) {
    this.token = token;
    this.chatId = chatId;
  }

  async sendNotification(type: 'start' | 'complete' | 'error' | 'clarification', task: string, url?: string, error?: string): Promise<void> {
    const messages = {
      start: `🚀 Starting: ${task}`,
      complete: `✅ PR ready: ${url}`,
      error: `❌ Failed: ${task} — ${error}`,
      clarification: `❓ Need input on: ${task}`
    };

    await this.sendMessage(messages[type]);
  }

  private async sendMessage(text: string): Promise<void> {
    const url = `${this.baseUrl}${this.token}/sendMessage`;
    
    const message: TelegramMessage = {
      chat_id: this.chatId,
      text,
      parse_mode: 'Markdown'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
    }
  }
}