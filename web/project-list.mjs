import { covers, statuses } from './catalog.mjs';
import { action, empty, encode, escape, icon, initials } from './ui.mjs';

function searchText(value) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd');
}

export function matches(project, query) {
  const content = searchText([
    project.name, project.type, project.description, ...Object.values(project.fields),
    ...project.customFields.flatMap(field => [field.label, field.value]), ...project.members.map(member => member.name)
  ].join(' '));
  return searchText(query).trim().split(/\s+/).every(part => content.includes(part));
}

export const statusBadge = status => `<span class="status status-${status}"><i></i>${statuses[status]}</span>`;
export const avatar = (name, index = 0) => `<span class="avatar avatar-${index % 4}" title="${escape(name)}">${escape(initials(name))}</span>`;

export function projectCard(project) {
  const { id, name, color, status, type, description, tasks, members } = project;
  const done = tasks.filter(task => task.done).length;
  const progress = tasks.length ? Math.round(100 * done / tasks.length) : 0;
  return `<a class="project-card panel" href="#project/${encode(id)}">
    <div class="card-top"><span class="project-icon theme-${color}">${icon(covers[color])}</span>${statusBadge(status)}</div>
    <div class="card-copy"><h3>${escape(name)}</h3><p>${escape(type || 'Dự án game')}${description ? ` <span>·</span> ${escape(description)}` : ''}</p></div>
    <div class="card-progress"><span>Tiến độ</span><strong>${done}/${tasks.length} việc</strong></div>
    <div class="progress-bar theme-${color}" role="progressbar" aria-label="Tiến độ ${escape(name)}" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
    <div class="card-bottom"><div class="card-team"><span class="avatars">${members.slice(0, 3).map(member => avatar(member.name, member.name.length)).join('')}</span><span>${members.length} thành viên</span></div><span class="open-card">${icon('arrow-up-right')}</span></div>
  </a>`;
}

export function projectGrid(projects) {
  return `<div class="project-grid">${projects.map(projectCard).join('')}</div>`;
}

export function projectList(projects, { query, status }) {
  const filter = status === 'working' ? ['active', 'testing'] : Object.hasOwn(statuses, status) ? [status] : [];
  const results = projects.filter(project => (!filter.length || filter.includes(project.status)) && matches(project, query));
  return `<header class="page-heading"><div><h1>Dự án</h1><p>Thông tin phát hành, công việc và nhân sự theo từng game.</p></div></header>
    <div class="list-toolbar"><p>${results.length} dự án</p>
      <label class="select-wrap"><select id="statusFilter" aria-label="Lọc theo trạng thái">
        <option value="">Tất cả trạng thái</option>${Object.entries({ working: 'Đang làm / test', ...statuses }).map(([value, label]) => `<option value="${value}" ${value === status ? 'selected' : ''}>${label}</option>`).join('')}
      </select>${icon('caret-down')}</label>
    </div>
    ${results.length ? projectGrid(results) : empty('folder-simple', projects.length ? 'Không tìm thấy dự án' : 'Chưa có dự án', projects.length ? 'Thử từ khóa khác hoặc đổi trạng thái lọc.' : 'Thêm một game để bắt đầu lưu thông tin và công việc.', projects.length ? '' : action('new-project', 'Tạo dự án', 'plus', { kind: 'primary' }))}`;
}
