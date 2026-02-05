export interface Project {
  id: string;
  name: string;
  status: string;
  repoUrl?: string;
  description: string;
}

export interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  projectId: string;
  projectName?: string;
  prLink?: string;
  notes: string;
}

export interface OrchestratorConfig {
  notionToken: string;
  githubPat: string;
  telegramToken: string;
  telegramChatId: string;
  pollIntervalMs: number;
}

export interface AlgernonTask {
  project: string;
  task: string;
  repoUrl: string;
  branch: string;
  taskId: string;
  taskNotes: string;
}

export type NotificationType = 'start' | 'complete' | 'error' | 'clarification';