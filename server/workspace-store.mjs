import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { validProjects } from './validate.mjs';

export class WorkspaceStore {
  #queue = Promise.resolve();

  constructor(path, seed) {
    this.path = path;
    this.seed = { version: 1, revision: 0, projects: seed.projects };
  }

  async read() {
    let file;
    try {
      file = await readFile(this.path, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return this.seed;
      throw error;
    }
    const state = JSON.parse(file.replace(/^\uFEFF/, ''));
    if (state?.version !== 1 || !Number.isSafeInteger(state.revision) || state.revision < 0 || !validProjects(state.projects)) {
      throw new Error('File dữ liệu không đúng định dạng.');
    }
    return state;
  }

  save(input) {
    const task = this.#queue.then(async () => {
      if (!Number.isSafeInteger(input?.revision) || !validProjects(input.projects)) {
        return { status: 400, body: { error: 'Dữ liệu dự án không đúng định dạng.' } };
      }
      const current = await this.read();
      if (input.revision !== current.revision) {
        return { status: 409, body: { error: 'Dữ liệu vừa thay đổi ở cửa sổ khác. Tải lại trang trước khi lưu.' } };
      }
      const state = { version: 1, revision: current.revision + 1, projects: input.projects };
      await mkdir(dirname(this.path), { recursive: true });
      const temporary = `${this.path}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
        await rename(temporary, this.path);
      } finally {
        await rm(temporary, { force: true }).catch(() => {});
      }
      return { status: 200, body: state };
    });
    this.#queue = task.catch(() => {});
    return task;
  }
}
