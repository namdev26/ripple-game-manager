import { backups } from './backups.mjs';
import { statuses } from './catalog.mjs';
import { details } from './details.mjs';
import { Editor } from './editor.mjs';
import { saveProject } from './project-edits.mjs';
import { projectList } from './project-list.mjs';
import { empty, icon } from './ui.mjs';
import { WorkspaceApi } from './workspace-api.mjs';

const content = document.querySelector('#content');
const registryHeader = document.querySelector('#registryHeader');
const search = document.querySelector('#search');
const filter = document.querySelector('#statusFilter');
const navLinks = document.querySelectorAll('.nav a');
const importFile = document.querySelector('#importFile');
const notice = document.querySelector('#notice');
const api = new WorkspaceApi();
let state;
let saving = false;
let toastTimeout;

for (const [value, label] of Object.entries({ working: 'Đang làm / test', ...statuses })) filter.add(new Option(label, value));
filter.parentElement.insertAdjacentHTML('beforeend', icon('caret-down'));

function currentRoute() {
  const [path, params] = location.hash.slice(1).split('?');
  const [candidate, rawId] = path.split('/');
  let projectId;
  try { projectId = decodeURIComponent(rawId ?? ''); } catch { projectId = ''; }
  const page = ['backup', 'project'].includes(candidate) ? candidate : 'projects';
  const status = new URLSearchParams(params).get('status');
  return { page, projectId, status: status === 'working' || Object.hasOwn(statuses, status) ? status : '' };
}

function render() {
  const { page, projectId, status } = currentRoute();
  const selected = page === 'project' ? 'projects' : page;
  for (const link of navLinks) {
    if (link.dataset.page === selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  registryHeader.hidden = !state || page !== 'projects';
  if (!state) return;
  const { projects } = state;
  if (page === 'projects') {
    filter.value = status;
    content.innerHTML = projectList(projects, { query: search.value, status });
  } else if (page === 'backup') {
    content.innerHTML = backups(projects);
  } else {
    const project = projects.find(item => item.id === projectId);
    content.innerHTML = project ? details(project) : empty('folder-simple', 'Không tìm thấy dự án', 'Dự án này có thể đã được xóa.', '<a class="button" href="#projects">Quay về danh sách</a>');
  }
}

function toast(message, error = false) {
  clearTimeout(toastTimeout);
  notice.innerHTML = icon(error ? 'x' : 'check-circle');
  notice.append(document.createTextNode(message));
  notice.classList.toggle('toast-error', error);
  notice.hidden = false;
  toastTimeout = setTimeout(() => { notice.hidden = true; }, 4200);
}

async function persist(projects) {
  if (saving) throw new Error('Workspace đang lưu. Thử lại sau khi lưu xong.');
  saving = true;
  try {
    state = await api.save(state.revision, projects);
    render();
  } finally {
    saving = false;
  }
}

const editor = new Editor(document.querySelector('#editor'), async (project, data) => {
  await persist(saveProject(state.projects, project, data));
  if (!project) {
    search.value = '';
    location.hash = '#projects';
    render();
  }
  toast('Đã lưu thay đổi.');
}, async project => {
  await persist(state.projects.filter(item => item.id !== project.id));
  location.hash = '#projects';
  toast('Đã xóa dự án.');
});

function download() {
  const data = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ripple-workspace-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Đã tạo bản sao JSON.');
}

async function run(button) {
  const { action, payload } = button.dataset;
  const projects = state.projects;
  if (action === 'new-project') editor.open();
  if (action === 'edit-project') {
    const project = projects.find(item => item.id === payload);
    if (project) editor.open(project);
  }
  if (action === 'copy') {
    await navigator.clipboard.writeText(payload);
    toast('Đã sao chép.');
  }
  if (action === 'export') download();
  if (action === 'import') importFile.click();
  if (action === 'clear-demo' && confirm('Xóa tất cả dự án mẫu?')) {
    await persist(projects.filter(item => !item.demo));
    toast('Đã xóa dự án mẫu.');
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (state && button && !button.closest('dialog')) run(button).catch(error => toast(error.message, true));
  if (event.target.closest('.topbar a[href="#projects"]') && search.value) {
    search.value = '';
    render();
  }
});

importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  importFile.value = '';
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('File dữ liệu lớn hơn 5 MB.');
    const backup = JSON.parse((await file.text()).replace(/^\uFEFF/, ''));
    if (backup?.version !== 1 || !Array.isArray(backup.projects)) throw new Error('File này không phải bản sao Ripple Workspace.');
    if (!confirm(`Thay dữ liệu hiện tại bằng ${backup.projects.length} dự án trong bản sao?`)) return;
    await persist(backup.projects);
    toast('Đã khôi phục dữ liệu.');
  } catch (error) {
    toast(error instanceof SyntaxError ? 'Không đọc được JSON.' : error.message, true);
  }
});

search.addEventListener('input', render);
filter.addEventListener('change', () => { location.hash = filter.value ? `#projects?status=${filter.value}` : '#projects'; });
window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});
document.addEventListener('keydown', event => {
  if (!registryHeader.hidden && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !document.querySelector('#editor').open) {
    event.preventDefault();
    search.focus();
    search.select();
  }
});

render();
try {
  state = await api.read();
  if (state.storage === 'cloud') document.querySelector('#storageStatus').textContent = 'Dữ liệu lưu trên web';
  render();
} catch (error) {
  content.innerHTML = empty('database', 'Không mở được workspace', error.message, '<a class="button" href="/">Tải lại trang</a>');
}
