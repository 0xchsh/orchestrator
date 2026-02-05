import { spawn } from 'child_process';
import { AlgernonTask } from './types.js';

export class AlgernonDispatcher {
  async dispatchTask(task: AlgernonTask): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = 'npx';
      const args = [
        'openclaw',
        'sessions_spawn',
        '--task',
        JSON.stringify(task),
        '--label',
        `task-${task.taskId}`,
        '--run-timeout-seconds',
        '1800'
      ];

      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const match = output.match(/completed successfully/);
          resolve(output.trim());
        } else {
          reject(new Error(`Algernon failed: ${errorOutput || output}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn Algernon: ${error.message}`));
      });

      // 30 minute timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Algernon task timed out after 30 minutes'));
      }, 30 * 60 * 1000);
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const child = spawn('which', ['openclaw']);
      
      return new Promise((resolve) => {
        child.on('close', (code) => resolve(code === 0));
        child.on('error', () => resolve(false));
      });
    } catch {
      return false;
    }
  }
}