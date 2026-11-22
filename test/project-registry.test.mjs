import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matches, projectList } from '../web/project-list.mjs';
import { saveProject } from '../web/project-edits.mjs';

const project = {
  id: 'cat', name: 'Ghép ô mèo', status: 'active', color: 'mint', type: 'Puzzle', description: '',
  fields: { package: 'com.example.cat', firebase: 'cat-firebase', admob: 'example~app', rewarded: 'example/reward', keystore: 'keys/cat.jks' },
  customFields: [{ id: 'unity', label: 'Unity Project ID', value: 'unity-cat' }],
  members: [{ id: 'member', name: 'Người cũ', role: 'Dev', contact: '' }],
  tasks: [{ id: 'task', title: 'Việc cũ', done: false, due: '', memberId: 'member' }]
};

test('the registry shows project metadata in a single copyable row', () => {
  const view = projectList([project], { query: '', status: '' });
  assert.match(view, /<table\b/);
  for (const value of [...Object.values(project.fields), 'unity-cat']) {
    assert.ok(view.includes(`data-payload="${value}"`), `Missing copy action for ${value}`);
  }
  assert.doesNotMatch(view, /Người cũ|Việc cũ|Tiến độ/);
});

test('editing metadata preserves previously stored project data', () => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: project.name, status: project.status, color: project.color, 'field-rewarded': 'new/reward' })) {
    data.set(key, value);
  }
  const [updated] = saveProject([project], project, data);
  assert.equal(updated.fields.rewarded, 'new/reward');
  assert.deepEqual(updated.members, project.members);
  assert.deepEqual(updated.tasks, project.tasks);
});

test('project lookup matches Vietnamese names and stored identifiers', () => {
  assert.ok(matches(project, 'ghep o cat-firebase'));
  assert.ok(matches(project, 'example/reward'));
  assert.ok(matches(project, 'unity-cat'));
  assert.ok(!matches(project, 'nguoi cu'));
});
