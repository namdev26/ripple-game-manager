const glyphs = {
  'folder-simple': 'e25a', database: 'e1de', plus: 'e3d4', 'caret-down': 'e136', 'arrow-up-right': 'e092',
  'arrow-left': 'e058', fire: 'e242', key: 'e2d6', lightning: 'e2de',
  copy: 'e1cc', check: 'e182', x: 'e4f6', 'download-simple': 'e20c', 'upload-simple': 'e4c0',
  archive: 'e00c', 'pencil-simple': 'e3b4', 'game-controller': 'e26e', cat: 'e748', spiral: 'e9fa',
  'cooking-pot': 'e764', 'puzzle-piece': 'e596',
  'file-text': 'e23a', 'link-simple': 'e2e6', trash: 'e4a6', stack: 'e466',
  'check-circle': 'e184'
};

export const icon = name => `<span class="icon" aria-hidden="true">&#x${glyphs[name] ?? glyphs['file-text']};</span>`;
export const escape = value => String(value ?? '').replace(/[&<>"']/g, part => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[part]);
export const encode = value => encodeURIComponent(value);
export const id = () => crypto.randomUUID();

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
