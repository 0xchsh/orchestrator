import { Client } from '@notionhq/client';

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
  prLink?: string;
  notes: string;
}

export class NotionClient {
  private client: Client;
  private projectDB = '793326f4-ea77-4657-9b9d-9b90136e1ed4';
  private taskDB = '2fd4ae89-6ea6-807a-b23e-000be87419c3';

  constructor(token: string) {
    this.client = new Client({ auth: token });
  }

  async getQueuedProjects(): Promise<Project[]> {
    const response = await this.client.databases.query({
      database_id: this.projectDB,
      filter: {
        property: 'Status',
        select: { equals: 'Queued' }
      }
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name.title[0]?.text.content || '',
      status: page.properties.Status.select.name,
      repoUrl: page.properties['Repo URL']?.url,
      description: page.properties.Description.rich_text[0]?.text.content || ''
    }));
  }

  async getQueuedTasks(): Promise<Task[]> {
    const response = await this.client.databases.query({
      database_id: this.taskDB,
      filter: {
        property: 'Status',
        status: { equals: 'Queued' }
      }
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name.title[0]?.text.content || '',
      status: page.properties.Status.status.name,
      priority: page.properties.Priority.select?.name || 'Medium',
      projectId: page.properties.Project.relation[0]?.id || '',
      prLink: page.properties['PR Link']?.url,
      notes: page.properties.Notes.rich_text[0]?.text.content || ''
    }));
  }

  async updateStatus(id: string, status: string, table: 'projects' | 'tasks'): Promise<void> {
    let properties: any = {};
    
    if (table === 'projects') {
      properties.Status = { select: { name: status } };
    } else {
      properties.Status = { status: { name: status } };
    }

    await this.client.pages.update({
      page_id: id,
      properties
    });
  }

  async updatePRLink(taskId: string, prUrl: string): Promise<void> {
    await this.client.pages.update({
      page_id: taskId,
      properties: {
        'PR Link': { url: prUrl }
      }
    });
  }
}