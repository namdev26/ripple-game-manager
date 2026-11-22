import { covers, fieldGroups } from './catalog.mjs';
import { membersView, tasksView } from './collections.mjs';
import { statusBadge } from './project-list.mjs';
import { action, encode, escape, externalUrl, icon } from './ui.mjs';

function fieldRow(label, value) {
  const url = externalUrl(value);
  return `<div class="field-row"><div><dt>${escape(label)}</dt><dd>${value ? escape(value) : '<span class="muted">Chưa thêm</span>'}</dd></div>
    ${value ? `<div class="row-actions">${action('copy', `Sao chép ${label}`, 'copy', { compact: true, payload: value })}
    ${url ? `<a class="button icon-button" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Mở ${escape(label)}" title="Mở link">${icon('arrow-up-right')}</a>` : ''}</div>` : ''}</div>`;
}

function settings(project) {
  const groups = fieldGroups.map(group => {
    const filled = group.fields.filter(([key]) => project.fields[key]);
    return `<section class="panel info-panel"><h2>${icon(group.icon)}${group.title}</h2>${filled.length ?
      `<dl>${filled.map(([key, label]) => fieldRow(label, project.fields[key])).join('')}</dl>` : '<p class="muted">Chưa thêm thông tin.</p>'}</section>`;
  });
  return `<div class="info-grid">${groups.join('')}
    <section class="panel info-panel"><h2>${icon('file-text')}Thông tin bổ sung</h2>
      ${project.customFields.length ? `<dl>${project.customFields.map(field => fieldRow(field.label, field.value)).join('')}</dl>` : '<p class="muted">Thêm trường riêng như Figma, tài khoản quản lý hoặc ghi chú bàn giao.</p>'}
      ${action('edit-project', 'Chỉnh sửa thông tin', 'pencil-simple', { payload: project.id, kind: 'quiet' })}</section>
    </div>`;
}

export function details(project, tab) {
  const route = `#project/${encode(project.id)}`;
  const tabs = { info: 'Thông tin', tasks: 'Công việc', team: 'Thành viên' };
  return `<a class="back-link" href="#projects">${icon('arrow-left')} Tất cả dự án</a>
    <header class="page-heading detail-heading"><div class="detail-identity"><span class="project-icon theme-${project.color}">${icon(covers[project.color])}</span><div>
      <div class="detail-title"><h1>${escape(project.name)}</h1>${statusBadge(project.status)}</div>
      <p>${escape([project.type, project.description].filter(Boolean).join(' · '))}</p></div></div>
      ${action('edit-project', 'Sửa dự án', 'pencil-simple', { kind: 'primary', payload: project.id })}</header>
    <nav class="tabs" aria-label="Chi tiết dự án">${Object.entries(tabs).map(([key, label]) => `<a href="${route}/${key}" ${key === tab ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    <div class="detail-content">${tab === 'tasks' ? tasksView([project], true) : tab === 'team' ? membersView([project], true) : settings(project)}</div>`;
}

export function backups(projects) {
  return `<header class="page-heading"><div><h1>Sao lưu</h1><p>Tải hoặc khôi phục dữ liệu workspace bằng file JSON.</p></div></header>
    <div class="info-grid">
      <section class="panel backup-panel"><span class="stat-icon theme-mint">${icon('download-simple')}</span><h2>Xuất dữ liệu</h2><p>Tải bản sao của ${projects.length} dự án, gồm các thông tin, công việc và thành viên.</p>${action('export', 'Tải file JSON', 'download-simple', { kind: 'primary' })}</section>
      <section class="panel backup-panel"><span class="stat-icon theme-lavender">${icon('upload-simple')}</span><h2>Nhập dữ liệu</h2><p>Khôi phục workspace từ một file JSON đã xuất. Bản nhập sẽ thay thế dữ liệu hiện tại.</p>${action('import', 'Chọn file JSON', 'upload-simple')}</section>
      ${projects.some(project => project.demo) ? `<section class="panel backup-panel"><span class="stat-icon theme-peach">${icon('archive')}</span><h2>Dữ liệu mẫu</h2><p>Dọn các dự án mẫu để tập trung vào những dự án bạn đã tạo.</p>${action('clear-demo', 'Xóa dữ liệu mẫu', 'trash', { kind: 'danger' })}</section>` : ''}
    </div>`;
}
