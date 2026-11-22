import { action, escape, externalUrl, icon } from './ui.mjs';

export function filledFields(project, group) {
  return group.fields.filter(([key]) => project.fields[key]).map(([key, label, shortLabel]) => ({
    label, shortLabel: shortLabel ?? label, value: project.fields[key]
  }));
}

export function fieldActions({ label, value }, compact = false) {
  const url = externalUrl(value);
  return `<div class="field-actions${compact ? ' field-actions-compact' : ''}">
    ${url ? `<a class="button icon-button" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Mở ${escape(label)}" title="Mở ${escape(label)}">${icon('arrow-up-right')}</a>` : ''}
    ${action('copy', `Sao chép ${label}`, 'copy', { compact: true, payload: value })}
  </div>`;
}
