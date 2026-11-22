import { projectGrid } from './project-list.mjs';
import { people } from './collections.mjs';
import { action, dateLabel, empty, encode, escape, icon } from './ui.mjs';

function stat(glyph, value, label, theme, route) {
  return `<a class="stat panel" href="${route}"><span class="stat-icon theme-${theme}">${icon(glyph)}</span><span><strong>${value}</strong><small>${label}</small></span></a>`;
}

function upcoming(projects) {
  const entries = projects.flatMap(project => project.tasks.filter(task => !task.done && task.due).map(task => ({ project, task })))
    .sort((a, b) => a.task.due.localeCompare(b.task.due)).slice(0, 3);
  return entries.length ? `<div class="upcoming-list panel">${entries.map(({ project, task }) =>
    `<a href="#project/${encode(project.id)}/tasks"><span class="upcoming-icon theme-${project.color}">${icon('calendar-blank')}</span><span><strong>${escape(task.title)}</strong><small>${escape(project.name)}</small></span><time datetime="${task.due}">${dateLabel(task.due)}</time></a>`
  ).join('')}</div>` : empty('calendar-blank', 'Chưa có hạn công việc', 'Các công việc có hạn sẽ xuất hiện ở đây.');
}

export function overview(projects) {
  const active = projects.filter(project => ['active', 'testing'].includes(project.status));
  const pending = projects.flatMap(project => project.tasks).filter(task => !task.done);
  const team = people(projects);
  const date = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date());
  return `<section class="hero" aria-labelledby="overviewHeading">
    <div class="hero-copy"><span class="hero-date">${icon('calendar-blank')}${escape(date)}</span><h1 id="overviewHeading">Quản lý dự án<span>.</span></h1><p>Một nơi cho mọi game bạn đang làm.</p></div>
    <div class="hero-graphic" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div><div class="orbit orbit-four"></div><b class="orbit-dot"></b><b class="orbit-star">✦</b><div class="hero-sticker"><img src="/assets/brand/logo.svg" alt="" width="70" height="103"></div></div>
  </section>
  <section class="stats" aria-label="Số liệu workspace">
    ${stat('folder-simple', projects.length, 'Tổng dự án', 'yellow', '#projects')}
    ${stat('circle-notch', active.length, 'Đang làm / test', 'mint', '#projects?status=working')}
    ${stat('list-checks', pending.length, 'Việc chưa xong', 'lavender', '#tasks')}
    ${stat('users', team.length, 'Thành viên', 'peach', '#team')}
  </section>
  <section class="overview-section" aria-labelledby="projectsHeading">
    <div class="section-heading"><div><h2 id="projectsHeading">Dự án của bạn</h2><p>Mở một dự án để xem thông tin, công việc và đội ngũ.</p></div><a class="button quiet" href="#projects">Xem tất cả ${icon('arrow-right')}</a></div>
    ${projects.length ? projectGrid(projects.slice(0, 3)) : empty('folder-simple-plus', 'Chưa có dự án', 'Tạo dự án đầu tiên cho workspace của bạn.', action('new-project', 'Tạo dự án', 'plus', { kind: 'primary' }))}
  </section>
  <section class="overview-section" aria-labelledby="upcomingHeading">
    <div class="section-heading"><div><h2 id="upcomingHeading">Việc có hạn gần nhất</h2></div><a class="button quiet" href="#tasks">Xem công việc ${icon('arrow-right')}</a></div>
    ${upcoming(projects)}
  </section>`;
}
