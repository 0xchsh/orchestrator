export interface Config {
  notionToken: string;
  githubPat: string;
  telegramToken: string;
  telegramChatId: string;
}

export const loadConfig = (): Config => ({
  notionToken: process.env.NOTION_TOKEN || '',
  githubPat: process.env.GITHUB_PAT || '',
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '', 
  telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
});

export const validateConfig = (config: Config): void => {
  const required = ['notionToken', 'githubPat', 'telegramToken', 'telegramChatId'];
  for (const key of required) {
    if (!config[key as keyof Config]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
};