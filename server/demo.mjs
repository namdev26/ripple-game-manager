const example = (id, name, status, color, type, description, details) => ({
  id, name, status, color, type, description, customFields: [], demo: true, members: [], tasks: [], ...details
});

export const demo = { projects: [
  example('demo-cat', 'Cat Tiles', 'active', 'mint', 'Puzzle', 'Game giải đố ghép ô với các bé mèo.', {
    fields: {
      gameId: 'CAT-001', package: 'com.example.cattiles', version: '0.8.0', firebase: 'cat-tiles-demo',
      firebaseApp: '1:123456789000:android:example', admob: 'ca-app-pub-0000000000000000~1000000001',
      rewarded: 'ca-app-pub-0000000000000000/1000000002', keystore: 'cat-tiles-release.jks', alias: 'release'
    },
    customFields: [{ id: 'demo-unity', label: 'Unity Project ID', value: 'unity-cat-tiles-demo' }]
  }),
  example('demo-snake', 'Snake Out: Escape Puzzle', 'released', 'lavender', 'Logic Puzzle', 'Tìm thứ tự để đưa các chú rắn ra khỏi mê cung.', {
    artwork: 'snake-out',
    fields: { package: 'com.ripplegame.snakeoutescapepuzzle', store: 'https://play.google.com/store/apps/details?id=com.ripplegame.snakeoutescapepuzzle' }
  }),
  example('demo-kitchen', 'Cozy Kitchen', 'planning', 'peach', 'Simulation', 'Mini game nấu ăn theo nhịp độ thư giãn.', {
    fields: { gameId: 'COZY-001', firebase: 'cozy-kitchen-demo' }
  }),
  example('demo-jigsaw', 'Jigsaw Studio', 'released', 'blue', 'Jigsaw', 'Bộ sưu tập tranh ghép dành cho mobile.', {
    fields: { package: 'com.example.jigsawstudio', version: '1.2.0', keystore: 'jigsaw-studio.jks' }
  })
] };
