import { colors, statuses } from '../web/catalog.mjs';

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string';
const required = value => text(value) && value.trim().length > 0;
const entries = (list, valid) => Array.isArray(list) && list.every(item => isObject(item) && valid(item));
const identified = (list, valid) => entries(list, item => required(item.id) && valid(item)) &&
  new Set(list.map(item => item.id)).size === list.length;
const validDate = value => value === '' || (text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  new Date(`${value}T00:00:00Z`).toJSON()?.slice(0, 10) === value);

export function validProjects(projects) {
  return identified(projects, project =>
    required(project.name) && text(project.type) && text(project.description) &&
    text(project.status) && Object.hasOwn(statuses, project.status) && text(project.color) && Object.hasOwn(colors, project.color) &&
    isObject(project.fields) && Object.values(project.fields).every(text) &&
    (project.demo === undefined || typeof project.demo === 'boolean') &&
    identified(project.customFields, field => required(field.label) && text(field.value)) &&
    identified(project.members, member => required(member.name) && text(member.role) && text(member.contact)) &&
    identified(project.tasks, task => required(task.title) && typeof task.done === 'boolean' && validDate(task.due) && typeof task.memberId === 'string' &&
      (task.memberId === '' || project.members.some(member => member.id === task.memberId)))
  );
}
