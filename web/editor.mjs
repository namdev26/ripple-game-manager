import { artworks, fieldGroups, projectIcons, statuses } from './catalog.mjs';
import { action, escape, icon } from './ui.mjs';

const input = (name, label, value = '', props = '') => `<label class="form-field"><span>${escape(label)}</span><input name="${name}" value="${escape(value)}" ${props}></label>`;
const option = (id, label, selected) => `<option value="${escape(id)}"${id === selected ? ' selected' : ''}>${escape(label)}</option>`;
const select = (name, label, options) => `<label class="form-field"><span>${label}</span><span class="select-wrap"><select name="${name}">${options}</select>${icon('caret-down')}</span></label>`;

function customRow(field = {}) {
  return `<div class="custom-row"><input type="hidden" name="customId" value="${escape(field.id)}">${input('customLabel', 'Tên trường', field.label, 'placeholder="Ví dụ Unity Project ID"')}${input('customValue', 'Giá trị', field.value, 'placeholder="ID, liên kết hoặc nội dung"')}${action('remove-custom', 'Bỏ trường này', 'x', { compact: true })}</div>`;
}

function projectForm(project = {}) {
  return `<div class="form-grid">${input('name', 'Tên game', project.name, 'required maxlength="120"')}${input('type', 'Thể loại', project.type, 'placeholder="Ví dụ Puzzle" maxlength="80"')}
    ${select('status', 'Trạng thái', Object.entries(statuses).map(([key, label]) => option(key, label, project.status ?? 'planning')).join(''))}
    ${select('color', 'Biểu tượng', Object.entries(projectIcons).map(([key, [label]]) => option(key, label, project.color ?? 'yellow')).join(''))}
    ${select('artwork', 'Ảnh bìa', option('', 'Dùng biểu tượng', project.artwork ?? '') + Object.entries(artworks).map(([key, artwork]) => option(key, artwork.title, project.artwork)).join(''))}
    <label class="form-field full"><span>Mô tả / ghi chú</span><textarea name="description" rows="3">${escape(project.description)}</textarea></label></div>
    ${fieldGroups.map(group => `<details class="form-group" ${group.key === 'app' || group.fields.some(([key]) => project.fields?.[key]) ? 'open' : ''}><summary>${icon(group.icon)}${group.title}${icon('caret-down')}</summary>
      <div class="form-grid">${group.fields.map(([key, label]) => input(`field-${key}`, label, project.fields?.[key])).join('')}</div></details>`).join('')}
    <details class="form-group" ${project.customFields?.length ? 'open' : ''}><summary>${icon('file-text')}Thông tin bổ sung${icon('caret-down')}</summary>
      <div class="custom-fields" data-custom-fields>${(project.customFields ?? []).map(customRow).join('')}</div>
      ${action('add-custom', 'Thêm trường', 'plus', { kind: 'quiet' })}</details>`;
}

export class Editor {
  constructor(element, onSave, onRemove) {
    this.element = element;
    element.addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.target;
      await this.#run(() => onSave(this.project, new FormData(form)), form);
    });
    element.addEventListener('click', async event => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const form = element.querySelector('form');
      const command = button.dataset.action;
      if (command === 'close-editor') element.close();
      if (command === 'add-custom') {
        const list = element.querySelector('[data-custom-fields]');
        list.insertAdjacentHTML('beforeend', customRow());
        list.lastElementChild.querySelector('[name="customLabel"]').focus();
      }
      if (command === 'remove-custom') {
        const row = button.closest('.custom-row');
        const nextFocus = row.nextElementSibling?.querySelector('[name="customLabel"]') ?? row.closest('details').querySelector('[data-action="add-custom"]');
        row.remove();
        nextFocus.focus();
      }
      if (command === 'delete-project' && confirm(`Xóa dự án ${this.project.name}?`)) await this.#run(() => onRemove(this.project), form);
    });
    element.addEventListener('cancel', event => {
      if (element.querySelector('fieldset')?.disabled) event.preventDefault();
    });
  }

  open(project) {
    this.project = project;
    const title = project ? 'Sửa thông tin dự án' : 'Thêm dự án';
    this.element.innerHTML = `<form><fieldset><header class="editor-header"><h2 id="dialogTitle">${title}</h2>${action('close-editor', 'Đóng', 'x', { compact: true })}</header>
      <div class="editor-body">${projectForm(project)}<p class="form-error" role="alert" hidden></p></div>
      <footer class="editor-footer">${project ? action('delete-project', 'Xóa dự án', 'trash', { kind: 'danger' }) : ''}<span></span>${action('close-editor', 'Hủy', 'x', { kind: 'quiet' })}<button class="button primary" type="submit">${icon('check')}Lưu</button></footer>
      </fieldset></form>`;
    this.element.showModal();
    this.element.querySelector('input:not([type="hidden"]), select')?.focus();
  }

  async #run(operation, form) {
    const fields = form.querySelector('fieldset');
    const error = form.querySelector('.form-error');
    if (fields.disabled) return;
    error.hidden = true;
    try {
      const task = operation();
      fields.disabled = true;
      await task;
      this.element.close();
    } catch (failure) {
      error.textContent = failure.message;
      error.hidden = false;
      error.scrollIntoView({ block: 'nearest' });
    } finally {
      fields.disabled = false;
    }
  }
}
