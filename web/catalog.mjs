export const statuses = {
  active: 'Đang làm', testing: 'Đang test', planning: 'Lên kế hoạch', released: 'Đã phát hành', paused: 'Tạm dừng'
};

export const projectIcons = {
  yellow: ['Tay cầm', 'game-controller'], mint: ['Mèo', 'cat'], lavender: ['Xoắn ốc', 'spiral'],
  peach: ['Nồi nấu ăn', 'cooking-pot'], blue: ['Mảnh ghép', 'puzzle-piece']
};
export const artworks = {
  'snake-out': { title: 'Snake Out: Escape Puzzle', src: '/assets/games/snake-out/feature.jpg' }
};

export const fieldGroups = [
  { key: 'app', title: 'ID ứng dụng', icon: 'stack', fields: [
    ['gameId', 'Game ID nội bộ', 'Game ID'], ['package', 'Package / Bundle ID', 'Package / Bundle'],
    ['iosBundle', 'iOS Bundle ID', 'iOS Bundle'], ['appleId', 'Apple App ID'], ['version', 'Phiên bản']
  ] },
  { key: 'firebase', title: 'Firebase', icon: 'fire', fields: [
    ['firebase', 'Firebase Project ID', 'Project ID'], ['firebaseApp', 'Firebase App ID', 'App ID'],
    ['firebaseIos', 'Firebase App ID iOS', 'App ID iOS']
  ] },
  { key: 'ads', title: 'AdMob', icon: 'lightning', fields: [
    ['admob', 'AdMob App ID', 'App ID'], ['admobIos', 'AdMob App ID iOS', 'App ID iOS'],
    ['banner', 'Banner Ad Unit ID', 'Banner'], ['interstitial', 'Interstitial Ad Unit ID', 'Interstitial'],
    ['rewarded', 'Rewarded Ad Unit ID', 'Rewarded'], ['appOpen', 'App Open Ad Unit ID', 'App Open']
  ] },
  { key: 'keystore', title: 'Keystore', icon: 'key', fields: [
    ['keystore', 'Tên file / đường dẫn', 'File / đường dẫn'], ['alias', 'Key alias', 'Alias'], ['fingerprint', 'SHA-1 / SHA-256']
  ] },
  { key: 'links', title: 'Liên kết', icon: 'link-simple', fields: [
    ['repo', 'Link repo', 'Repo'], ['store', 'Link cửa hàng', 'Google Play / Store'], ['iosStore', 'Link App Store', 'App Store'],
    ['drive', 'Google Drive / tài liệu', 'Tài liệu'], ['build', 'Link bản build', 'Bản build']
  ] }
];
