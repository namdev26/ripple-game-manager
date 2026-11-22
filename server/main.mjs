import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { demo } from './demo.mjs';
import { createWorkspaceServer } from './http.mjs';

const address = '127.0.0.1';
const port = 4173;
const url = `http://${address}:${port}`;
const workspace = fileURLToPath(new URL('../data/workspace.json', import.meta.url));
const server = createWorkspaceServer(workspace, demo);
const open = process.argv.includes('--open');

function openBrowser() {
  const [command, ...args] = process.platform === 'win32' ? ['explorer.exe', url] :
    process.platform === 'darwin' ? ['open', url] : ['xdg-open', url];
  const browser = spawn(command, args, { stdio: 'ignore', detached: true, windowsHide: true });
  browser.on('error', () => console.log(`Mở trình duyệt tại ${url}`));
  browser.unref();
}

server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    const existing = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(2000) })
      .then(response => response.json()).catch(() => null);
    if (existing?.app === 'ripple-workspace') {
      console.log(`Ripple Workspace đang mở tại ${url}`);
      if (open) openBrowser();
      return;
    }
  }
  console.error(error);
  process.exitCode = 1;
});

server.listen(port, address, () => {
  console.log(`Ripple Workspace: ${url}`);
  if (open) openBrowser();
});
