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

  const notion = new NotionClient(config.notionToken);
  const dispatcher = new AlgernonDispatcher();
  const notifier = new TelegramNotifier(config.telegramToken, config.telegramChatId);

  console.log('🚀 Orchestrator started');

  setInterval(async () => {
    try {
      const projects = await notion.getQueuedProjects();
      const tasks = await notion.getQueuedTasks();

      console.log(`Found ${projects.length} queued projects and ${tasks.length} queued tasks`);

      // Process projects
      for (const project of projects) {
        console.log(`Processing project: ${project.name}`);
        await notion.updateStatus(project.id, 'Active', 'projects');
      }

      // Process tasks
      for (const task of tasks) {
        console.log(`Processing task: ${task.name}`);
        await notion.updateStatus(task.id, 'In Progress', 'tasks');
      }

    } catch (error) {
      console.error('❌ Error in polling loop:', error);
    }
  }, POLL_INTERVAL_MS);
}

process.on('SIGTERM', () => {
  console.log('📺 Graceful shutdown');
  process.exit(0);
});

main().catch(console.error);