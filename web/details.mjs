import { fieldGroups } from './catalog.mjs';
import { fieldActions, filledFields } from './project-fields.mjs';
import { statusBadge } from './project-list.mjs';
import { projectVisual } from './project-visual.mjs';
import { action, escape, icon } from './ui.mjs';

function fieldRow(field) {
  return `<div class="field-row"><div><dt>${escape(field.label)}</dt><dd>${escape(field.value)}</dd></div>${fieldActions(field)}</div>`;
}

function infoPanel(title, glyph, fields) {
  return `<section class="panel info-panel"><h2>${icon(glyph)}${title}</h2>${fields.length ?
    `<dl>${fields.map(fieldRow).join('')}</dl>` : '<p class="muted">Chưa thêm thông tin.</p>'}</section>`;
}

export function details(project) {
  return `<a class="back-link" href="#projects">${icon('arrow-left')} Tất cả dự án</a>
    <header class="page-heading detail-heading"><div class="detail-identity">${projectVisual(project)}<div>
      <div class="detail-title"><h1>${escape(project.name)}</h1>${statusBadge(project.status)}</div>
      <p>${escape([project.type, project.description].filter(Boolean).join(' · '))}</p></div></div>
      ${action('edit-project', 'Sửa thông tin', 'pencil-simple', { kind: 'primary', payload: project.id })}</header>
    <div class="info-grid">${fieldGroups.map(group => infoPanel(group.title, group.icon, filledFields(project, group))).join('')}
      ${infoPanel('Thông tin bổ sung', 'file-text', project.customFields.filter(field => field.value))}</div>`;
}
