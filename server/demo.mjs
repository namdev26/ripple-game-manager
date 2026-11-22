const person = (id, name, role) => ({ id, name, role, contact: '' });
const task = (id, title, memberId, done = false, due = '') => ({ id, title, memberId, done, due });

function dateAfter(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(part => String(part).padStart(2, '0')).join('-');
}

function example(id, name, status, color, type, description, details) {
  return { id, name, status, color, type, description, customFields: [], demo: true, ...details };
}

export const demo = { projects: [
  example('demo-cat', 'Cat Tiles', 'active', 'mint', 'Puzzle', 'Game giải đố ghép ô với các bé mèo.', {
    fields: { firebase: 'cat-tiles-demo', package: 'com.example.cattiles', version: '0.8.0', keystore: 'cat-tiles-release.jks', alias: 'release' },
    members: [person('demo-mai', 'Mai Anh', 'Game Designer'), person('demo-minh', 'Minh Quân', 'Unity Developer'), person('demo-linh', 'Linh Chi', '2D Artist')],
    tasks: [task('a1', 'Chốt cơ chế ghép ô', 'demo-mai', true), task('a2', 'Tạo prefab bàn chơi', 'demo-minh', true),
      task('a3', 'Hoàn thiện bộ biểu cảm mèo', 'demo-linh', true), task('a4', 'Cân bằng 10 level đầu', 'demo-mai', false, dateAfter(2)),
      task('a5', 'Kiểm tra sự kiện Firebase', 'demo-minh', false, dateAfter(4))]
  }),
  example('demo-snake', 'Snake Trails', 'testing', 'lavender', 'Logic Puzzle', 'Mở đường cho từng chú rắn trong mê cung.', {
    fields: { firebase: 'snake-trails-demo', package: 'com.example.snaketrails', version: '1.0.0-rc.2', keystore: 'snake-trails.jks' },
    members: [person('demo-minh', 'Minh Quân', 'Unity Developer'), person('demo-thu', 'Thu Hà', 'QA')],
    tasks: [task('b1', 'Kiểm thử luồng hướng dẫn', 'demo-thu', true), task('b2', 'Cập nhật icon ứng dụng', 'demo-minh', true),
      task('b3', 'Kiểm tra frame rate', 'demo-thu', true), task('b4', 'Xác minh cấu hình build', 'demo-minh', true),
      task('b5', 'Kiểm tra bản Android cuối', 'demo-thu', false, dateAfter(1))]
  }),
  example('demo-kitchen', 'Cozy Kitchen', 'planning', 'peach', 'Simulation', 'Mini game nấu ăn theo nhịp độ thư giãn.', {
    fields: {}, members: [person('demo-mai', 'Mai Anh', 'Game Designer'), person('demo-linh', 'Linh Chi', '2D Artist')],
    tasks: [task('c1', 'Thu thập tham chiếu hình ảnh', 'demo-linh', true), task('c2', 'Chốt luồng chơi prototype', 'demo-mai', false, dateAfter(6)),
      task('c3', 'Lên danh sách món ăn', 'demo-mai'), task('c4', 'Phác thảo giao diện bếp', 'demo-linh')]
  }),
  example('demo-jigsaw', 'Jigsaw Studio', 'released', 'blue', 'Jigsaw', 'Bộ sưu tập tranh ghép dành cho mobile.', {
    fields: { package: 'com.example.jigsawstudio', version: '1.2.0' }, members: [person('demo-thu', 'Thu Hà', 'QA')],
    tasks: [task('d1', 'Kiểm tra bản phát hành', 'demo-thu', true)]
  })
] };
