import { membersView, tasksView } from './collections.mjs';
import { backups, details } from './details.mjs';
import { Editor } from './editor.mjs';
import { overview } from './overview.mjs';
import { deleteRecord, saveRecord, toggleTask } from './project-edits.mjs';
import { projectList } from './project-list.mjs';
import { empty, encode, icon } from './ui.mjs';
import { WorkspaceApi } from './workspace-api.mjs';

const pages = {
  overview: ['Tổng quan', 'squares-four'], projects: ['Dự án', 'folder-simple'], tasks: ['Công việc', 'list-checks'],
  team: ['Thành viên', 'users'], backup: ['Sao lưu', 'database']
};
const content = document.querySelector('#content');
const search = document.querySelector('#search');
const nav = document.querySelector('.nav');
const importFile = document.querySelector('#importFile');
const notice = document.querySelector('#notice');
const addProject = document.querySelector('#addProject');
const api = new WorkspaceApi();
let state;
let saving = false;
let toastTimeout;

function currentRoute() {
  const [path, filter] = location.hash.slice(1).split('?');
  const [candidate, rawId, tab] = path.split('/');
  let projectId;
  try { projectId = decodeURIComponent(rawId ?? ''); } catch { projectId = ''; }
  const page = candidate === 'project' || Object.hasOwn(pages, candidate) ? candidate : 'overview';
  return { page, projectId, tab: ['tasks', 'team'].includes(tab) ? tab : 'info', status: new URLSearchParams(filter).get('status') ?? '' };
}

function render() {
  const { page, projectId, tab, status } = currentRoute();
  const selected = page === 'project' ? 'projects' : page;
  nav.innerHTML = `<div class="nav-group">${Object.entries(pages).filter(([key]) => key !== 'backup').map(([key, [label, glyph]]) => navLink(key, label, glyph, selected)).join('')}</div>
    <div class="nav-group nav-storage">${navLink('backup', ...pages.backup, selected)}</div>`;
  document.querySelector('#topTitle').textContent = pages[selected][0];
  if (!state) return;
  const { projects } = state;
  const project = projects.find(item => item.id === projectId);
  const views = {
    overview: () => overview(projects), projects: () => projectList(projects, { query: search.value, status }),
    tasks: () => tasksView(projects), team: () => membersView(projects), backup: () => backups(projects),
    project: () => project ? details(project, tab) : empty('folder-simple', 'Không tìm thấy dự án', 'Dự án này có thể đã được xóa.', '<a class="button" href="#projects">Quay về danh sách</a>')
  };
  content.innerHTML = views[page]();
}

function navLink(key, label, glyph, selected) {
  return `<a href="#${key}" ${key === selected ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span></a>`;
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

const editor = new Editor(document.querySelector('#editor'), async (context, data) => {
  const result = saveRecord(state.projects, context, data);
  await persist(result.projects);
  if (context.kind === 'project' && !context.project) location.hash = `#project/${encode(result.target)}`;
  toast('Đã lưu thay đổi.');
}, async context => {
  await persist(deleteRecord(state.projects, context));
  if (context.kind === 'project') location.hash = '#projects';
  toast('Đã xóa.');
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
  const { action, payload, record } = button.dataset;
  const projects = state.projects;
  const project = projects.find(item => item.id === payload);
  if (action === 'new-project' || action === 'edit-project') editor.open({ kind: 'project', project });
  if (action === 'edit-task') editor.open({ kind: 'task', project, projects, entry: project?.tasks.find(item => item.id === record) });
  if (action === 'edit-member') editor.open({ kind: 'member', project, projects, entry: project?.members.find(item => item.id === record) });
  if (action === 'toggle-task' && project) {
    button.disabled = true;
    try { await persist(toggleTask(projects, project, record)); } finally { button.disabled = false; }
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
  if (event.target.closest('a[href="#projects"]') && search.value) {
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

search.addEventListener('input', () => {
  if (currentRoute().page !== 'projects') location.hash = '#projects';
  else render();
});
content.addEventListener('change', event => {
  if (event.target.id === 'statusFilter') location.hash = event.target.value ? `#projects?status=${event.target.value}` : '#projects';
});
window.addEventListener('hashchange', () => {
  if (currentRoute().page !== 'projects') search.value = '';
  render();
  window.scrollTo(0, 0);
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !document.querySelector('#editor').open) {
    event.preventDefault();
    search.focus();
    search.select();
  }
});

render();
addProject.disabled = true;
try {
  state = await api.read();
  addProject.disabled = false;
  render();
} catch (error) {
  content.innerHTML = empty('database', 'Không mở được workspace', error.message, '<a class="button" href="/">Tải lại trang</a>');
}
