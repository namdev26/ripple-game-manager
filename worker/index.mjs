import { responseHeaders } from '../server/web-response.mjs';
import { HostedWorkspaceStore } from './workspace-store.mjs';

const capacity = 1_800_000;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: responseHeaders('application/json') });

async function readPayload(request) {
  const reader = request.body?.getReader();
  if (!reader) return { error: 'Không đọc được JSON.' };
  const decoder = new TextDecoder();
  let text = '';
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > capacity) {
      await reader.cancel();
      return { error: 'Dữ liệu vượt quá 1,8 MB.' };
    }
    text += decoder.decode(value, { stream: true });
  }
  try {
    return { value: JSON.parse(text + decoder.decode()) };
  } catch {
    return { error: 'Không đọc được JSON.' };
  }
}

async function workspace(request, database, origin) {
  const owner = request.headers.get('oai-authenticated-user-id');
  if (!owner) return json(401, { error: 'Đăng nhập vào đúng tài khoản ChatGPT để mở workspace.' });
  if (request.method === 'GET') return json(200, await new HostedWorkspaceStore(database, owner).read());
  if (request.method !== 'PUT') return json(405, { error: 'Phương thức không được hỗ trợ.' });
  if (request.headers.get('origin') !== origin || request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return json(403, { error: 'Yêu cầu lưu phải đến từ trang workspace.' });
  }
  const payload = await readPayload(request);
  if (payload.error) return json(400, { error: payload.error });
  const { status, body } = await new HostedWorkspaceStore(database, owner).save(payload.value);
  return json(status, body);
}

export function createHostedWorker(assets) {
  return {
    async fetch(request, env) {
      const { pathname, origin } = new URL(request.url);
      try {
        if (pathname === '/api/workspace') return await workspace(request, env.DB, origin);
        if (pathname === '/api/health' && request.method === 'GET') {
          await env.DB.prepare('SELECT revision FROM workspace LIMIT 0').first();
          return json(200, { app: 'ripple-workspace', storage: 'cloud' });
        }
        const file = pathname === '/' ? '/index.html' : pathname;
        if (!['GET', 'HEAD'].includes(request.method) || !Object.hasOwn(assets, file)) {
          return json(404, { error: 'Không tìm thấy trang.' });
        }
        const [type, base64] = assets[file];
        const body = request.method === 'HEAD' ? null : Uint8Array.from(atob(base64), byte => byte.charCodeAt(0));
        return new Response(body, { headers: responseHeaders(type) });
      } catch (error) {
        console.error(error.message);
        return json(500, { error: 'Không đọc hoặc lưu được dữ liệu trên web. Thử lại sau.' });
      }
    }
  };
}
