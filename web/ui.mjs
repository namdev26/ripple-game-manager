const glyphs = {
  'squares-four': 'e464', 'folder-simple': 'e25a', 'list-checks': 'eadc', users: 'e4d6', database: 'e1de',
  'magnifying-glass': 'e30c', plus: 'e3d4', 'caret-down': 'e136', 'arrow-up-right': 'e092',
  'arrow-right': 'e06c', 'arrow-left': 'e058', 'github-logo': 'e576', fire: 'e242', key: 'e2d6',
  copy: 'e1cc', check: 'e182', x: 'e4f6', 'download-simple': 'e20c', 'upload-simple': 'e4c0',
  archive: 'e00c', 'pencil-simple': 'e3b4', 'game-controller': 'e26e', cat: 'e748', spiral: 'e9fa',
  'cooking-pot': 'e764', 'puzzle-piece': 'e596', 'calendar-blank': 'e10a', clock: 'e19a',
  'file-text': 'e23a', 'link-simple': 'e2e6', trash: 'e4a6', stack: 'e466',
  'check-circle': 'e184', 'circle-notch': 'eb44', 'folder-simple-plus': 'e25e', 'user-plus': 'e4d0'
};

export const icon = name => `<span class="icon" aria-hidden="true">&#x${glyphs[name] ?? glyphs['file-text']};</span>`;
export const escape = value => String(value ?? '').replace(/[&<>"']/g, part => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[part]);
export const encode = value => encodeURIComponent(value);
export const id = () => crypto.randomUUID();
export const dateLabel = value => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`)) : '';
export const initials = name => name.trim().split(/\s+/).slice(-2).map(word => word[0]).join('').toLocaleUpperCase('vi');

export function action(name, label, glyph, options = {}) {
  const { kind = '', payload = '', compact = false } = options;
  return `<button type="button" class="button ${kind}${compact ? ' icon-button' : ''}" data-action="${name}" data-payload="${escape(payload)}"${compact ? ` aria-label="${escape(label)}" title="${escape(label)}"` : ''}>${icon(glyph)}${compact ? '' : escape(label)}</button>`;
}

export function empty(glyph, title, description, control = '') {
  return `<div class="empty panel">${icon(glyph)}<h2>${escape(title)}</h2><p>${escape(description)}</p>${control}</div>`;
}

export function externalUrl(value) {
  try {
    const link = new URL(value);
    return ['http:', 'https:'].includes(link.protocol) && !link.username && !link.password ? link.href : '';
  } catch {
    return '';
  }
}
