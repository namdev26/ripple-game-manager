import { action, icon } from './ui.mjs';

export function backups(projects) {
  return `<header class="page-heading"><div><h1>Sao lưu</h1><p>Tải hoặc khôi phục dữ liệu workspace bằng file JSON.</p></div></header>
    <div class="info-grid">
      <section class="panel backup-panel"><span class="section-icon">${icon('download-simple')}</span><h2>Xuất dữ liệu</h2><p>Tải bản sao của ${projects.length} dự án.</p>${action('export', 'Tải file JSON', 'download-simple', { kind: 'primary' })}</section>
      <section class="panel backup-panel"><span class="section-icon">${icon('upload-simple')}</span><h2>Nhập dữ liệu</h2><p>Khôi phục workspace từ file JSON. Bản nhập sẽ thay thế dữ liệu hiện tại.</p>${action('import', 'Chọn file JSON', 'upload-simple')}</section>
      ${projects.some(project => project.demo) ? `<section class="panel backup-panel"><span class="section-icon">${icon('archive')}</span><h2>Dữ liệu mẫu</h2><p>Dọn các dự án mẫu và giữ các dự án bạn đã thêm hoặc chỉnh sửa.</p>${action('clear-demo', 'Xóa dữ liệu mẫu', 'trash', { kind: 'danger' })}</section>` : ''}
    </div>`;
}
