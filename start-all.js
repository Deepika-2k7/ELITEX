import { spawn } from 'child_process';
import process from 'process';

console.log('==================================================');
console.log('Starting ELITEX Hackathon 2026 (Backend + Frontend)');
console.log('Backend Port:  http://localhost:5000');
console.log('Frontend Port: http://localhost:3000');
console.log('==================================================\n');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';
const nodeCmd = isWindows ? 'node.exe' : 'node';

// 1. Start Backend Server
const backend = spawn(nodeCmd, ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// 2. Start Frontend Vite Dev Server
const frontend = spawn(npxCmd, ['vite', '--port', '3000', '--host'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

const cleanup = () => {
  console.log('\nShutting down ELITEX servers...');
  try { backend.kill(); } catch {}
  try { frontend.kill(); } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
