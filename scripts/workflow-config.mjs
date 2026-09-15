import { appendFile } from 'node:fs/promises';
import { loadConfig } from './lib.mjs';

const config = await loadConfig();
if (!process.env.GITHUB_OUTPUT) throw new Error('This command runs inside GitHub Actions.');
await appendFile(process.env.GITHUB_OUTPUT, 'username=' + config.username + '\nsnake_color=' + config.snake.color + '\n');
