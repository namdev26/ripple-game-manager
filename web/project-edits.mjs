import { fieldGroups } from './catalog.mjs';
import { id } from './ui.mjs';

const field = (data, key) => String(data.get(key) ?? '').trim();

export function saveProject(projects, project, data) {
  const name = field(data, 'name');
  if (!name) throw new Error('Nhập tên game để lưu dự án.');

  const fields = { ...project?.fields };
  for (const [key] of fieldGroups.flatMap(group => group.fields)) {
    if (!data.has(`field-${key}`)) continue;
    const value = field(data, `field-${key}`);
    if (value) fields[key] = value;
    else delete fields[key];
  }

  const customIds = data.getAll('customId');
  const customValues = data.getAll('customValue');
  const customFields = data.getAll('customLabel').map((label, index) => ({
    id: customIds[index] || id(), label: label.trim(), value: customValues[index].trim()
  }));
  if (customFields.some(item => !item.label && item.value)) throw new Error('Nhập tên cho các trường bổ sung có giá trị.');

  const item = {
    members: [], tasks: [], ...project, id: project?.id ?? id(), name, status: field(data, 'status'),
    color: field(data, 'color'), type: field(data, 'type'), description: field(data, 'description'),
    fields, customFields: customFields.filter(item => item.label), demo: false
  };
  const artwork = field(data, 'artwork');
  if (artwork) item.artwork = artwork;
  else delete item.artwork;
  return project ? projects.map(existing => existing.id === project.id ? item : existing) : [item, ...projects];
}
