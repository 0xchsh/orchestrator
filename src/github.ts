import { Octokit } from '@octokit/rest';

export interface GitHubRepository {
  name: string;
  full_name: string;
  clone_url: string;
  html_url: string;
}

export class GitHubClient {
  private octokit: Octokit;
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async createPR({ 
    repo, 
    title, 
    head, 
    base = 'main', 
    body 
  }: {
    repo: string;
    title: string;
    head: string;
    base?: string;
    body: string;
  }): Promise<string> {
    const [owner, repoName] = repo.split('/');
    
    const { data: pr } = await this.octokit.rest.pulls.create({
      owner,
      repo: repoName,
      title,
      head,
      base,
      body
    });

    return pr.html_url;
  }

  async getRepo(repo: string): Promise<GitHubRepository> {
    const [owner, repoName] = repo.split('/');
    
    const { data: repository } = await this.octokit.rest.repos.get({
      owner,
      repo: repoName
    });

    return {
      name: repository.name,
      full_name: repository.full_name,
      clone_url: repository.clone_url,
      html_url: repository.html_url
    };
  }

  async listPRs(repo: string, state: 'open' | 'closed' = 'open') {
    const [owner, repoName] = repo.split('/');
    
    const { data: pulls } = await this.octokit.rest.pulls.list({
      owner,
      repo: repoName,
      state
    });

    return pulls.map(pr => ({
      id: pr.id,
      title: pr.title,
      url: pr.html_url,
      state: pr.state
    }));
  }
}