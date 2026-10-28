# Welcome to your Expo app 👋

## Đồng bộ trang chủ với web

- Đặt `EXPO_PUBLIC_API_URL` trong `.env.local` trỏ tới **cùng backend với web**; xem `.env.example`. Điện thoại cần truy cập được địa chỉ này qua mạng LAN hoặc HTTPS.
- Đặt `EXPO_PUBLIC_WEBSITE_URL` là địa chỉ web để mở các đường dẫn ảnh tương đối do quản trị viên nhập. Logo và ảnh mặc định được đóng gói sẵn trong app.
- Trang chủ giữ bố cục một màn hình: video nền toàn màn hình, logo, lời chào, nút đăng nhập, nút ngành học và các nút chọn video. Trang ngành học riêng sử dụng API `/public/*` cho thông tin trường, nội dung ngành học, giảng viên và đăng ký tư vấn; hỗ trợ kéo để làm mới và thông báo khi mất kết nối.
- Chạy `npm run sync:website` sau khi đổi video, ảnh hoặc nội dung mặc định trong `../web_dashboard`. Lệnh sao chép đúng các MP4, thứ tự video, logo và dữ liệu mặc định; `npm run check:website` kiểm tra chúng còn khớp byte với web. Nội dung trường chỉnh qua API được lấy trực tiếp, không cần sao chép.
- App dùng `expo-video`. Nếu dùng development build đã có từ trước, cần build lại (`npm run android` hoặc `npm run ios`) để nhận native module, splash mới. Đây là thay đổi mã nguồn, chưa phát hành bản cài đặt.

Kiểm tra thủ công trên thiết bị: chuyển đủ 5 video, tự chuyển sau khi phát hết, tạm dừng khi rời trang/ẩn app; mở bài viết; tìm ngành có/không dấu và lọc nhóm; xem lộ trình; gửi tư vấn và kiểm tra trong hộp thư tư vấn quản trị trên web; thử mất mạng và kéo để tải lại. Nội dung mẫu ở Góc sinh viên luôn được ghi rõ là minh họa khi trường chưa xuất bản câu chuyện.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
