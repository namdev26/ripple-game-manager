import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createHostedWorker } from '../worker/index.mjs';

const sqlite = await import('node:sqlite').catch(() => null);
const url = 'https://workspace.example/api/workspace';

async function database(t) {
  const db = new sqlite.DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(await readFile(new URL('../drizzle/0000_workspace.sql', import.meta.url), 'utf8'));
  return {
    prepare(sql) {
      const statement = db.prepare(sql);
      return { bind: (...values) => ({
        first: async () => statement.get(...values),
        run: async () => ({ meta: { changes: statement.run(...values).changes } })
      }) };
    }
  };
}

function call(worker, env, identity, extra = {}) {
  return worker.fetch(new Request(url, {
    ...extra, headers: { ...extra.headers, ...(identity ? { 'oai-authenticated-user-id': identity } : {}) }
  }), env);
}

test('a hosted workspace API requires a signed-in identity and rejects cross-origin writes', async () => {
  const worker = createHostedWorker({});
  assert.equal((await call(worker, {}, '')).status, 401);
  assert.equal((await call(worker, {}, 'owner', {
    method: 'PUT', headers: { Origin: 'https://unrelated.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ revision: 0, projects: [] })
  })).status, 403);
});

test('hosted changes persist per account and stale writes cannot replace them', { skip: !sqlite }, async t => {
  const worker = createHostedWorker({});
  const env = { DB: await database(t) };
  const write = revision => call(worker, env, 'owner', {
    method: 'PUT', headers: { Origin: new URL(url).origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ revision, projects: [] })
  });
  assert.equal((await write(0)).status, 200);
  assert.equal((await write(0)).status, 409);
  assert.equal((await write(1)).status, 200);
  const state = await (await call(worker, env, 'owner')).json();
  assert.deepEqual(state, { version: 1, revision: 2, projects: [], storage: 'cloud' });
  const separate = await (await call(worker, env, 'other')).json();
  assert.equal(separate.revision, 0);
  assert.ok(separate.projects.length > 0);
});
