import TelegramBot from 'node-telegram-bot-api';

export interface Notification {
  type: 'start' | 'complete' | 'error' | 'clarification';
  task: string;
  url?: string;
  error?: string;
}

export class TelegramNotifier {
  private bot: TelegramBot;
  private chatId: string;

  constructor(token: string, chatId: string) {
    this.bot = new TelegramBot(token);
    this.chatId = chatId;
  }

  async send(notification: Notification): Promise<void> {
    const messages = {
      start: `🚀 Starting: ${notification.task}`,
      complete: `✅ PR ready: ${notification.url}`,
      error: `❌ Failed: ${notification.task} — ${notification.error}`,
      clarification: `❓ Need input on: ${notification.task}`
    };

    await this.bot.sendMessage(this.chatId, messages[notification.type]);
  }
}