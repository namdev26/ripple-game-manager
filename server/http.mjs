import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { WorkspaceStore } from './workspace-store.mjs';

const root = new URL('../web/', import.meta.url);
const types = {
  '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.woff2': 'font/woff2',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
};
const policy = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";

function send(response, status, body, type = 'application/json') {
  response.writeHead(status, {
    'Content-Type': `${type}${type.startsWith('text/') || type === 'application/json' ? '; charset=utf-8' : ''}`,
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': policy,
    'Cross-Origin-Resource-Policy': 'same-origin'
  });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
}

async function bodyOf(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size <= 5 * 1024 * 1024) chunks.push(chunk);
  }
  if (size > 5 * 1024 * 1024) return { error: 'File dữ liệu lớn hơn 5 MB.' };
  try {
    return { value: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
  } catch {
    return { error: 'Không đọc được JSON.' };
  }
}

async function serveWorkspace(request, response, store, origin) {
  if (request.method === 'GET') return send(response, 200, await store.read());
  if (request.method !== 'PUT') return send(response, 405, { error: 'Phương thức không được hỗ trợ.' });
  if (request.headers.origin !== origin || request.headers['content-type']?.split(';')[0] !== 'application/json') {
    return send(response, 403, { error: 'Yêu cầu lưu phải đến từ trang workspace.' });
  }
  const payload = await bodyOf(request);
  if (payload.error) return send(response, 400, { error: payload.error });
  const result = await store.save(payload.value);
  return send(response, result.status, result.body);
}

export function createWorkspaceServer(dataPath, seed) {
  const store = new WorkspaceStore(dataPath, seed);
  return createServer(async (request, response) => {
    const host = request.headers.host;
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host ?? '')) {
      return send(response, 403, { error: 'Workspace chỉ phục vụ trên máy này.' });
    }
    const origin = `http://${host}`;
    try {
      const path = new URL(request.url, origin).pathname;
      if (path === '/api/workspace') return await serveWorkspace(request, response, store, origin);
      if (path === '/api/health' && request.method === 'GET') return send(response, 200, { app: 'ripple-workspace' });
      const file = path === '/' ? 'index.html' : path.slice(1);
      const type = types[extname(file)];
      if (request.method !== 'GET' || !type || !/^[\w/-]+(?:\.[\w-]+)+$/.test(file)) {
        return send(response, 404, { error: 'Không tìm thấy trang.' });
      }
      return send(response, 200, await readFile(new URL(file, root)), type);
    } catch (error) {
      if (error.code === 'ENOENT') return send(response, 404, { error: 'Không tìm thấy tệp.' });
      console.error(error);
      return send(response, 500, { error: 'Không đọc hoặc lưu được dữ liệu. Kiểm tra cửa sổ chạy workspace.' });
    }
  });
}
