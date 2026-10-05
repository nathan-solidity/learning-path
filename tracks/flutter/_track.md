---
track: "flutter"
role: "dev-flutter"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "Flutter (Dart)"
variant_desc: "Từ Dart căn bản đến kỹ sư Flutter thực chiến: ngôn ngữ, widget & layout, state (Riverpod), gọi API & lưu trữ, native & performance, tới build ký và publish lên App Store & Google Play."
title: "Flutter Developer"
icon: "💙"
summary: "Lộ trình từ Dart căn bản đến kỹ sư Flutter thực chiến: ngôn ngữ Dart, widget/layout, quản lý state với Riverpod, gọi API & lưu trữ cục bộ, async/Stream, testing, Firebase, tới platform channel, tối ưu hiệu năng, và build–ký–publish ứng dụng lên iOS App Store & Google Play."
levels:
  - key: "beginner"
    title: "Beginner"
    desc: "Dart ngôn ngữ (cú pháp, null safety, OOP, async) và Flutter cơ bản (widget, layout, state cục bộ, navigation, form) — đủ để dựng một app nhiều màn hình chạy được."
  - key: "intermediate"
    title: "Intermediate"
    desc: "Quản lý state với Riverpod, gọi REST API (http/Dio), lưu trữ cục bộ, async/Future/Stream nâng cao, Firebase (auth/Firestore/FCM), và testing (unit/widget/integration)."
  - key: "advanced"
    title: "Advanced"
    desc: "Platform channel & code native, tối ưu hiệu năng & render, chuẩn bị release (icon/splash/flavor), rồi build–ký–publish lên iOS App Store và Google Play, cùng CI/CD tự động hóa."
---

## Về lộ trình này

Lộ trình dành cho người học **Flutter** từ chưa biết Dart đến làm được ứng dụng di động
**đưa lên App Store và Google Play**. Thiết kế theo hướng **học đến đâu code được đến đó**:
mỗi cấp độ đều có bài thực hành, kết thúc bằng việc bạn tự build và phát hành được app thật.

Học tuần tự **Beginner → Intermediate → Advanced**. Mỗi bài có checklist tự đánh giá — tick
khi bạn tự tin đã nắm và **code được**, không chỉ hiểu lý thuyết. Tiến độ tính theo số item
đã tick.

### Vì sao học theo thứ tự này

Flutter dựng UI bằng **widget lồng nhau** và cập nhật giao diện dựa trên **state**. Nếu
nhảy thẳng vào các package state management (Riverpod, Bloc) mà chưa chắc Dart và cơ chế
`setState`/rebuild, bạn sẽ **copy code mà không hiểu vì sao UI cập nhật** và bí khi lỗi.
Nắm Dart (null safety, `Future`/`async`) và widget tree trước giúp đọc được lỗi build và
tự debug. Phần triển khai iOS/Android để **cuối cùng** vì nó cần một app hoàn chỉnh để đẩy
lên store — học sớm sẽ không có gì để publish.

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Beginner | Viết Dart thành thạo và dựng app nhiều màn hình có layout, form, điều hướng |
| Intermediate | Quản lý state với Riverpod, gọi API, lưu dữ liệu, tích hợp Firebase, viết test |
| Advanced | Gọi code native, tối ưu hiệu năng, và **build–ký–publish lên App Store & Google Play** |

### Môi trường & tài nguyên

- Cài **Flutter SDK** (bao gồm Dart) — quản lý version bằng **FVM** cho dễ đổi. Chạy
  `flutter doctor` để kiểm tra môi trường.
- **iOS**: cần **macOS + Xcode** và tài khoản **Apple Developer** ($99/năm) để publish.
  **Android**: cần **Android Studio** (SDK, emulator) và tài khoản **Google Play** ($25 một lần).
- Editor: **VS Code** (+ extension Flutter/Dart) hoặc **Android Studio**.
- Tài liệu chính thức: [flutter.dev/docs](https://docs.flutter.dev),
  [dart.dev](https://dart.dev/guides), [pub.dev](https://pub.dev) (package).
- Mỗi bài có ví dụ code chạy được — nên gõ lại và chạy thử trên emulator/thiết bị thật.

Nội dung liên kết với `term-glossary` (tra thuật ngữ) — gặp thuật ngữ lạ thì mở glossary.
