import { spawn } from 'child_process';

export interface AlgernonTask {
  project: string;
  task: string;
  repoUrl: string;
  branch: string;
}

export class AlgernonDispatcher {
  async dispatchTask(task: AlgernonTask): Promise<number> {
    return new Promise((resolve, reject) => {
      const child = spawn('openclaw', [
        'sessions_spawn',
        '--task',
        JSON.stringify(task),
        '--label',
        `orchestrator-${Date.now()}`
      ]);

      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Algernon failed: ${output}`));
        }
      });

      // 30 minute timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Algernon task timed out after 30 minutes'));
      }, 30 * 60 * 1000);
    });
  }
}