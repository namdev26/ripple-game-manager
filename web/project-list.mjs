import { fieldGroups, statuses } from './catalog.mjs';
import { fieldActions, filledFields } from './project-fields.mjs';
import { projectVisual } from './project-visual.mjs';
import { action, empty, encode, escape, externalUrl, icon } from './ui.mjs';

function searchText(value) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd');
}

export function matches(project, query) {
  const content = searchText([
    project.name, project.type, project.description, statuses[project.status], ...Object.values(project.fields),
    ...project.customFields.flatMap(field => [field.label, field.value])
  ].join(' '));
  return searchText(query).trim().split(/\s+/).every(part => content.includes(part));
}

export const statusBadge = status => `<span class="status status-${status}"><i></i>${statuses[status]}</span>`;

function sheetFields(fields, showLinks = false) {
  if (!fields.length) return '<span class="missing" title="Chưa có dữ liệu" aria-label="Chưa có dữ liệu">—</span>';
  return `<dl class="sheet-fields">${fields.map(field => {
    const isLink = showLinks && externalUrl(field.value);
    return `<div class="sheet-field"><div class="sheet-field-value">
      <dt${isLink ? ` title="${escape(field.value)}"` : ''}>${escape(field.shortLabel ?? field.label)}</dt>
      ${isLink ? `<dd title="${escape(field.value)}">${escape(isLink)}</dd>` : `<dd><code>${escape(field.value)}</code></dd>`}</div>${fieldActions(field, true)}</div>`;
  }).join('')}</dl>`;
}

function projectRow(project) {
  const { id, name, status, type, customFields } = project;
  return `<tr>
    <th scope="row" class="sheet-game"><a href="#project/${encode(id)}" class="game-link">${projectVisual(project)}<span>${escape(name)}${type ? `<small>${escape(type)}</small>` : ''}</span></a>
      <div class="game-options">${statusBadge(status)}${action('edit-project', `Sửa ${name}`, 'pencil-simple', { compact: true, payload: id })}</div></th>
    ${fieldGroups.map(group => `<td${group.key === 'links' ? ' class="sheet-links"' : ''}>${sheetFields(filledFields(project, group), group.key === 'links')}</td>`).join('')}
    <td>${sheetFields(customFields.filter(field => field.value))}</td>
  </tr>`;
}

export function projectList(projects, { query, status }) {
  const filter = status === 'working' ? ['active', 'testing'] : Object.hasOwn(statuses, status) ? [status] : [];
  const results = projects.filter(project => (!filter.length || filter.includes(project.status)) && matches(project, query));
  const visible = results.length;
  const count = visible === projects.length ? `${visible} dự án` : `${visible} / ${projects.length} dự án`;
  return `<div class="sheet-meta"><p class="sheet-count" role="status">${count}</p>${visible ? '<span class="sheet-scroll-hint">Cuộn ngang để xem thêm</span>' : ''}</div>${visible ? `<div class="sheet-scroll" role="region" aria-label="Bảng thông tin dự án" tabindex="0">
      <table class="project-sheet"><thead><tr><th scope="col">${icon('game-controller')}Game</th>
        ${fieldGroups.map(group => `<th scope="col" class="column-${group.key}">${icon(group.icon)}${group.title}</th>`).join('')}
        <th scope="col" class="column-custom">${icon('file-text')}Khác</th></tr></thead>
        <tbody>${results.map(projectRow).join('')}</tbody></table>
      </div>` : empty('folder-simple', projects.length ? 'Không tìm thấy dự án' : 'Chưa có dự án',
    projects.length ? 'Thử từ khóa khác hoặc đổi trạng thái lọc.' : 'Thêm một game để lưu ID và các thông tin phát hành.')}`;
}
