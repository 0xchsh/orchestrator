import { config } from 'dotenv';
config();

console.log('🚀 Task 1 complete - ready for Task 2');

import { NotionClient } from './notion.js';
import { AlgernonDispatcher } from './algernon.js';
import { TelegramNotifier } from './telegram.js';
import { loadConfig, validateConfig } from './config.js';

const POLL_INTERVAL_MS = 30000;

async function main() {
  const config = loadConfig();
  validateConfig(config);

  const { Orchestrator } = await import('./orchestrator.js');
  const orchestrator = new Orchestrator();
  
  await orchestrator.start();
}

process.on('SIGTERM', () => {
  console.log('📺 Graceful shutdown');
  process.exit(0);
});

main().catch(console.error);