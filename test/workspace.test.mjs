import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createWorkspaceServer } from '../server/http.mjs';

async function fixture(t) {
  const folder = await mkdtemp(join(tmpdir(), 'ripple-workspace-test-'));
  const path = join(folder, 'workspace.json');
  const server = createWorkspaceServer(path, { projects: [] });
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await rm(folder, { recursive: true, force: true });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    path,
    read: () => fetch(`${origin}/api/workspace`).then(response => response.json()),
    save: (revision, projects, source = origin) => fetch(`${origin}/api/workspace`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Origin: source },
      body: JSON.stringify({ revision, projects })
    })
  };
}

const project = {
  id: 'sample', name: 'Dự án mèo', status: 'active', color: 'mint',
  type: 'Puzzle', description: '', fields: { firebase: 'ma-bao-cao' },
  customFields: [], members: [], tasks: []
};

test('saved Vietnamese text and metadata are written to a movable JSON file', async t => {
  const app = await fixture(t);
  assert.equal((await app.save(0, [project])).status, 200);
  assert.deepEqual((await app.read()).projects, [project]);
  assert.deepEqual(JSON.parse(await readFile(app.path, 'utf8')).projects, [project]);
});

test('competing writes based on the same revision cannot silently overwrite one another', async t => {
  const app = await fixture(t);
  const responses = await Promise.all([app.save(0, [project]), app.save(0, [])]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
  assert.equal((await app.read()).revision, 1);
});

test('invalid imports and foreign origins preserve saved data', async t => {
  const app = await fixture(t);
  assert.equal((await app.save(0, [project])).status, 200);
  assert.equal((await app.save(1, [{ id: 'bad' }])).status, 400);
  assert.equal((await app.save(1, [], 'https://example.com')).status, 403);
  assert.deepEqual((await app.read()).projects, [project]);
});

test('project artwork is optional and accepts only bundled artwork choices', async t => {
  const app = await fixture(t);
  const illustrated = { ...project, artwork: 'snake-out' };
  assert.equal((await app.save(0, [illustrated])).status, 200);
  assert.equal((await app.save(1, [{ ...project, artwork: 'missing' }])).status, 400);
  assert.equal((await app.read()).projects[0].artwork, 'snake-out');
  assert.equal((await app.save(1, [project])).status, 200);
});
