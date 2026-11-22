import { demo } from '../server/demo.mjs';
import { validProjects } from '../server/validate.mjs';

export class HostedWorkspaceStore {
  constructor(database, owner) {
    this.database = database.withSession?.('first-primary') ?? database;
    this.owner = owner;
  }

  async read() {
    const row = await this.database.prepare('SELECT revision, projects FROM workspace WHERE owner_id = ?')
      .bind(this.owner).first();
    return { version: 1, revision: row?.revision ?? 0, projects: row ? JSON.parse(row.projects) : demo.projects, storage: 'cloud' };
  }

  async save(input) {
    if (!Number.isSafeInteger(input?.revision) || input.revision < 0 || !validProjects(input.projects)) {
      return { status: 400, body: { error: 'Dữ liệu dự án không đúng định dạng.' } };
    }
    const { revision, projects } = input;
    const payload = JSON.stringify(projects);
    const statement = revision === 0 ? this.database.prepare(
      'INSERT INTO workspace (owner_id, revision, projects) VALUES (?, 1, ?) ON CONFLICT(owner_id) DO NOTHING'
    ).bind(this.owner, payload) : this.database.prepare(
      'UPDATE workspace SET revision = revision + 1, projects = ? WHERE owner_id = ? AND revision = ?'
    ).bind(payload, this.owner, revision);
    const result = await statement.run();
    if (result.meta.changes === 0) {
      return { status: 409, body: { error: 'Dữ liệu vừa thay đổi ở cửa sổ hoặc thiết bị khác. Tải lại trang trước khi lưu.' } };
    }
    return { status: 200, body: { version: 1, revision: revision + 1, projects, storage: 'cloud' } };
  }
}
