export const statuses = {
  active: 'Đang làm', testing: 'Đang test', planning: 'Lên kế hoạch', released: 'Đã phát hành', paused: 'Tạm dừng'
};

export const colors = { mint: 'Xanh lá', lavender: 'Tím', peach: 'Cam đào', blue: 'Xanh dương', yellow: 'Vàng' };
export const covers = { mint: 'cat', lavender: 'spiral', peach: 'cooking-pot', blue: 'puzzle-piece', yellow: 'game-controller' };

export const fieldGroups = [
  { title: 'Mã nguồn & tài liệu', icon: 'github-logo', fields: [
    ['repo', 'Link repo'], ['drive', 'Google Drive / tài liệu'], ['build', 'Link bản build']
  ] },
  { title: 'Firebase & ứng dụng', icon: 'fire', fields: [
    ['firebase', 'Firebase Project ID'], ['firebaseApp', 'Firebase App ID'], ['package', 'Package / Bundle ID'],
    ['store', 'Link cửa hàng'], ['version', 'Phiên bản'], ['admob', 'AdMob App ID']
  ] },
  { title: 'Keystore', icon: 'key', fields: [
    ['keystore', 'Tên file / đường dẫn'], ['alias', 'Key alias'], ['fingerprint', 'SHA-1 / SHA-256']
  ] }
];
