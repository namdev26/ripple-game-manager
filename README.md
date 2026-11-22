# Ripple Workspace

Dashboard tiếng Việt để quản lý các dự án game cá nhân, gồm thông tin phát hành, tài liệu, công việc và thành viên.

## Mở trên web

Mở [Ripple Workspace](https://ripple-game-manager.funnyblanket32.chatgpt.site) bằng tài khoản ChatGPT sở hữu site. Dữ liệu của bản web được lưu riêng theo tài khoản và có thể truy cập từ các thiết bị khác bằng cùng tài khoản.

Dùng **Sao lưu** để xuất JSON từ bản trên máy rồi nhập vào bản web khi cần chuyển dữ liệu. `npm ci` và `npm run build:hosted` tạo gói Worker từ mã nguồn và asset trong repo.

## Mở workspace

Cần Node.js 20 trở lên. Trên Windows, mở `Mo Workspace.cmd`. Bạn cũng có thể chạy `npm start` và truy cập `http://127.0.0.1:4173`. Giữ cửa sổ chạy workspace mở trong lúc sử dụng.

Lần đầu, ứng dụng hiển thị các dự án mẫu. Vào **Sao lưu** → **Xóa dữ liệu mẫu** để dọn các dự án mẫu và giữ các dự án tự tạo. Khi chỉnh sửa một dự án mẫu, dự án đó trở thành dự án thường.

## Dữ liệu và chuyển máy

Lần lưu đầu tiên tạo `data/workspace.json`. Để chuyển máy, đóng ứng dụng rồi sao chép thư mục workspace, gồm thư mục `data`. Bạn cũng có thể tải bản sao JSON trong mục **Sao lưu** và nhập trên máy mới. Nhập bản sao sẽ thay thế dữ liệu hiện tại sau khi bạn xác nhận.

Keystore lưu thông tin tham chiếu như tên file, đường dẫn, alias và fingerprint. Cất file ký và mật khẩu của bạn ở nơi lưu trữ dành riêng cho chúng.

`npm test` kiểm tra luồng lưu, phát hiện bản ghi đã thay đổi và từ chối dữ liệu nhập sai định dạng.
