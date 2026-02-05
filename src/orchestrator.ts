import { NotionClient } from './notion.js';
import { AlgernonDispatcher } from './algernon.js';
import { TelegramNotifier } from './telegram.js';
import { GitHubClient } from './github.js';
import { loadConfig } from './config.js';
import { Project, Task, AlgernonTask } from './types.js';

export class Orchestrator {
  private notion: NotionClient;
  private github: GitHubClient;
  private algernon: AlgernonDispatcher;
  private telegram: TelegramNotifier;
  private config = loadConfig();

  constructor() {
    const { notionToken, githubPat, telegramToken, telegramChatId } = this.config;
    
    this.notion = new NotionClient(notionToken);
    this.github = new GitHubClient(githubPat);
    this.algernon = new AlgernonDispatcher();
    this.telegram = new TelegramNotifier(telegramToken, telegramChatId);
  }

  async initialize(): Promise<void> {
    console.log('🔍 Checking Algernon availability...');
    if (!await this.algernon.isAvailable()) {
      throw new Error('Algernon not available for dispatch');
    }
    console.log('✅ Algernon ready');
  }

  async processProjects(): Promise<void> {
    const projects = await this.notion.getQueuedProjects();

    for (const project of projects) {
      console.log(`📋 Processing project: ${project.name}`);
      
      await this.telegram.sendNotification('start', project.name);
      await this.notion.updateStatus(project.id, 'Active', 'project');

      try {
        // Projects require PRD completion
        console.log(`📝 Filling PRD for: ${project.name}`);
        
        const task: AlgernonTask = {
          project: project.name,
          task: 'create PRD template',
          repoUrl: project.repoUrl || '',
          branch: `project/${project.name.toLowerCase().replace(/\s+/g, '-')}`,
          taskId: project.id,
          taskNotes: project.description
        };

        const result = await this.algernon.dispatchTask(task);
        
        await this.telegram.sendNotification('complete', project.name, result);
        await this.notion.updateStatus(project.id, 'Active', 'project');

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        await this.telegram.sendNotification('error', project.name, undefined, message);
        await this.notion.updateStatus(project.id, 'Queued', 'project');
      }
    }
  }

  async processTasks(): Promise<void> {
    const tasks = await this.notion.getQueuedTasks();

    for (const task of tasks) {
      console.log(`🛠️ Processing task: ${task.name}`);
      
      await this.telegram.sendNotification('start', task.name);
      await this.notion.updateStatus(task.id, 'In Progress', 'task');

      try {
        const algernonTask: AlgernonTask = {
          project: task.projectName || '',
          task: task.name,
          repoUrl: task.projectId, // Will fetch from project
          branch: `task/${task.name.toLowerCase().replace(/\s+/g, '-')}`,
          taskId: task.id,
          taskNotes: task.notes
        };

        const result = await this.algernon.dispatchTask(algernonTask);
        
        // Extract PR URL from result - algernon should return it
        const prMatch = result.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);
        const prUrl = prMatch ? prMatch[0] : '';

        if (prUrl) {
          await this.notion.updatePRLink(task.id, prUrl);
          await this.telegram.sendNotification('complete', task.name, prUrl);
          await this.notion.updateStatus(task.id, 'In Review', 'task');
        } else {
          throw new Error('PR URL not found in response');
        }

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        await this.telegram.sendNotification('error', task.name, undefined, message);
        await this.notion.updateStatus(task.id, 'Queued', 'task');
      }
    }
  }

  async start(): Promise<void> {
    console.log('🚀 Starting orchestrator...');
    await this.initialize();

    setInterval(async () => {
      try {
        console.log('⏰ Checking for queued work...');
        await this.processProjects();
        await this.processTasks();
      } catch (error) {
        console.error('❌ Error:', error);
      }
    }, this.config.pollIntervalMs);
  }
}