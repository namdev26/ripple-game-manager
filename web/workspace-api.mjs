export class WorkspaceApi {
  async read() {
    return this.request();
  }

  async save(revision, projects) {
    return this.request({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision, projects }) });
  }

  async request(options) {
    let response;
    try {
      response = await fetch('/api/workspace', options);
    } catch {
      throw new Error('Không kết nối được workspace. Tải lại trang để thử lại.');
    }
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Tải lại trang để mở lại phiên làm việc.');
    }
    const body = await response.json();
    if (!response.ok) throw new Error(body.error);
    return body;
  }
}
