import { avatar } from './project-list.mjs';
import { action, dateLabel, empty, encode, escape, icon } from './ui.mjs';

export function people(projects) {
  const result = new Map();
  for (const project of projects) {
    for (const member of project.members) {
      const key = (member.contact || member.name).trim().toLocaleLowerCase('vi');
      if (!result.has(key)) result.set(key, { ...member, projects: [] });
      result.get(key).projects.push({ project, role: member.role, id: member.id });
    }
  }
  return Array.from(result.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

function taskRow(project, task, showProject) {
  const member = project.members.find(person => person.id === task.memberId);
  return `<div class="record task-record${task.done ? ' task-done' : ''}">
    <button class="task-toggle" type="button" data-action="toggle-task" data-payload="${escape(project.id)}" data-record="${escape(task.id)}" aria-label="${task.done ? 'Mở lại' : 'Hoàn thành'} ${escape(task.title)}" aria-pressed="${task.done}">${task.done ? icon('check') : ''}</button>
    <div class="record-copy"><strong>${escape(task.title)}</strong><small>${showProject ? `<a href="#project/${encode(project.id)}/tasks">${escape(project.name)}</a>${member ? ' · ' : ''}` : ''}${member ? escape(member.name) : showProject ? '' : 'Chưa phân công'}</small></div>
    ${task.due ? `<time datetime="${task.due}">${icon('calendar-blank')}${dateLabel(task.due)}</time>` : ''}
    <button class="button icon-button" type="button" data-action="edit-task" data-payload="${escape(project.id)}" data-record="${escape(task.id)}" aria-label="Sửa ${escape(task.title)}" title="Sửa công việc">${icon('pencil-simple')}</button>
  </div>`;
}

export function tasksView(projects, focused = false) {
  const entries = projects.flatMap(project => project.tasks.map(task => ({ project, task })))
    .sort((a, b) => Number(a.task.done) - Number(b.task.done) || (a.task.due || '9999').localeCompare(b.task.due || '9999'));
  const add = projects.length ? action('edit-task', 'Thêm công việc', 'plus', { kind: 'primary', payload: focused ? projects[0].id : '' }) : '';
  return `<header class="${focused ? 'section-heading' : 'page-heading'}"><div><${focused ? 'h2' : 'h1'}>Công việc</${focused ? 'h2' : 'h1'}><p>${entries.filter(({ task }) => !task.done).length} việc chưa xong</p></div>${add}</header>
    ${entries.length ? `<div class="panel records">${entries.map(({ project, task }) => taskRow(project, task, !focused)).join('')}</div>` : empty('list-checks', 'Chưa có công việc', projects.length ? 'Thêm công việc để theo dõi tiến độ.' : 'Tạo dự án để bắt đầu theo dõi công việc.')}`;
}

export function membersView(projects, focused = false) {
  const members = focused ? projects[0].members.map(member => ({ ...member, projects: [{ project: projects[0], role: member.role, id: member.id }] })) : people(projects);
  const add = projects.length ? action('edit-member', 'Thêm thành viên', 'user-plus', { kind: 'primary', payload: focused ? projects[0].id : '' }) : '';
  return `<header class="${focused ? 'section-heading' : 'page-heading'}"><div><${focused ? 'h2' : 'h1'}>Thành viên</${focused ? 'h2' : 'h1'}><p>${members.length} thành viên</p></div>${add}</header>
    ${members.length ? `<div class="panel records">${members.map((member, index) => `<div class="record member-record">
      ${avatar(member.name, index)}<div class="record-copy"><strong>${escape(member.name)}</strong><small>${escape([focused ? member.role : '', member.contact].filter(Boolean).join(' · '))}</small></div>
      ${focused ? `<button class="button icon-button" type="button" data-action="edit-member" data-payload="${escape(projects[0].id)}" data-record="${escape(member.id)}" aria-label="Sửa ${escape(member.name)}" title="Sửa thành viên">${icon('pencil-simple')}</button>` : `<div class="member-projects">${member.projects.map(({ project, role }) => `<a href="#project/${encode(project.id)}/team" title="${escape(role)}">${escape(project.name)}</a>`).join('')}</div>`}
    </div>`).join('')}</div>` : empty('users', 'Chưa có thành viên', projects.length ? 'Thêm người tham gia dự án và vai trò của họ.' : 'Tạo dự án để bắt đầu thêm thành viên.')}`;
}
