import { fieldGroups } from './catalog.mjs';
import { id } from './ui.mjs';

const field = (data, key) => String(data.get(key) ?? '').trim();
const replace = (items, item) => items.some(existing => existing.id === item.id) ?
  items.map(existing => existing.id === item.id ? item : existing) : [...items, item];
const without = (items, id) => items.filter(item => item.id !== id);

export function saveRecord(projects, context, data) {
  const { kind, project, entry } = context;
  if (kind === 'project') {
    const name = field(data, 'name');
    if (!name) throw new Error('Nhập tên game để lưu dự án.');
    const fields = { ...project?.fields };
    for (const [key] of fieldGroups.flatMap(group => group.fields)) {
      const value = field(data, `field-${key}`);
      if (value) fields[key] = value;
      else delete fields[key];
    }
    const customValues = data.getAll('customValue');
    const customFields = data.getAll('customLabel').map((label, index) => ({ id: id(), label: label.trim(), value: customValues[index].trim() }));
    if (customFields.some(item => !item.label && item.value)) throw new Error('Nhập tên cho các trường bổ sung có giá trị.');
    const item = { id: project?.id ?? id(), name, status: field(data, 'status'), color: field(data, 'color'),
      type: field(data, 'type'), description: field(data, 'description'), fields, demo: false,
      customFields: customFields.filter(item => item.label), members: project?.members ?? [], tasks: project?.tasks ?? [] };
    const artwork = field(data, 'artwork');
    if (artwork) item.artwork = artwork;
    return { projects: project ? replace(projects, item) : [item, ...projects], target: item.id };
  }
  const target = project?.id ?? field(data, 'project');
  const current = projects.find(item => item.id === target);
  if (!current) throw new Error('Chọn một dự án để lưu.');
  const itemId = entry?.id ?? id();
  if (kind === 'member') {
    const name = field(data, 'name');
    if (!name) throw new Error('Nhập họ và tên thành viên.');
    const members = replace(current.members, { id: itemId, name, role: field(data, 'role'), contact: field(data, 'contact') });
    return { projects: replace(projects, { ...current, members, demo: false }), target };
  }
  const title = field(data, 'title');
  if (!title) throw new Error('Nhập tên công việc.');
  const tasks = replace(current.tasks, { id: itemId, title, due: field(data, 'due'), memberId: field(data, 'memberId'), done: data.has('done') });
  return { projects: replace(projects, { ...current, tasks, demo: false }), target };
}

export function deleteRecord(projects, { kind, project, entry }) {
  if (kind === 'project') return without(projects, project.id);
  if (kind === 'task') return replace(projects, { ...project, tasks: without(project.tasks, entry.id), demo: false });
  const tasks = project.tasks.map(task => task.memberId === entry.id ? { ...task, memberId: '' } : task);
  return replace(projects, { ...project, members: without(project.members, entry.id), tasks, demo: false });
}

export function toggleTask(projects, project, taskId) {
  const tasks = project.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task);
  return replace(projects, { ...project, tasks, demo: false });
}
