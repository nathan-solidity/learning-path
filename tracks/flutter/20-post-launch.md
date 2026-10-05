---
level: "advanced"
order: 20
title: "Sau phát hành — cập nhật, crash, analytics & dự án tổng kết"
est: "5-6 giờ"
checklist:
  - "Theo dõi crash bằng Crashlytics/Sentry và đọc stack trace đã symbolicate"
  - "Đo hành vi bằng analytics và tôn trọng quyền riêng tư (ATT của Apple)"
  - "Phát hành bản vá: staged rollout, phased release, và khi nào cần hotfix"
  - "Cân nhắc cập nhật động (feature flag, remote config) và giới hạn của nó"
  - "Hoàn thành dự án tổng kết: một app đã lên cả App Store & Google Play"
---

## Vòng đời không kết thúc ở "đã publish"

Lên store là **bắt đầu vận hành**, không phải về đích. App thật cần: theo dõi crash, đo hành
vi, vá lỗi, và cập nhật đều đặn.

## Crash reporting

Trên máy người dùng bạn không debug được — cần công cụ gom crash tự động:

- **Firebase Crashlytics** (miễn phí, tích hợp tốt) hoặc **Sentry** (mạnh, có performance).

```bash
flutter pub add firebase_crashlytics
```

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(...);
  // gom mọi lỗi Flutter chưa bắt
  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
  runApp(const ProviderScope(child: MyApp()));
}
```

> **Nhớ upload symbol/dSYM** (bài 17–18): build release obfuscate, không có symbol thì crash
> hiện toàn địa chỉ vô nghĩa. Có symbol mới đọc được đúng dòng code lỗi.

## Analytics — đo để quyết định

Firebase Analytics/Amplitude cho biết người dùng thật sự dùng gì:

```dart
await FirebaseAnalytics.instance.logEvent(
  name: 'checkout', parameters: {'value': 199000});
```

> **Quyền riêng tư**: iOS 14.5+ yêu cầu **App Tracking Transparency (ATT)** — xin phép trước
> khi theo dõi qua app khác (`NSUserTrackingUsageDescription` + `att` plugin). Khai báo dữ
> liệu thu thập đúng ở **App Privacy**/**Data safety** (bài 17–18). Thu thập lén = bị gỡ app.

## Phát hành bản cập nhật

Quy trình cập nhật lặp lại bài 16–18 với **build number mới**, cộng thêm chiến lược an toàn:

- **Staged rollout** (Android) / **phased release** (iOS): tăng dần % người nhận. Crash tăng
  → **halt/pause** ngay, chỉ ảnh hưởng nhóm nhỏ.
- **Hotfix**: lỗi nghiêm trọng thì build bản vá tối thiểu, ưu tiên review (iOS có
  **expedited review** khi thật khẩn).
- Viết **release note** rõ ràng mỗi bản.

## Cập nhật động — và giới hạn

- **Remote Config / feature flag**: bật/tắt tính năng, đổi tham số **không cần build mới** —
  hữu ích để rollout an toàn hoặc tắt nhanh tính năng lỗi.
- **Giới hạn**: **không** được tải và chạy **code Dart thực thi mới** từ xa để thay đổi hành
  vi chính của app — cả Apple lẫn Google cấm (App Store Guideline 2.5.2). Cập nhật logic thật
  vẫn phải qua store. Remote config chỉ nên đổi **dữ liệu/cờ**, không phải "lách" quy trình review.

## Dự án tổng kết — chốt cả lộ trình

Kết hợp toàn bộ track thành **một app hoàn chỉnh, đã lên cả hai store**. Gợi ý phạm vi:

- **Dart + widget + layout + navigation** (Beginner): nhiều màn hình, form.
- **Riverpod + API + local storage + Firebase auth** (Intermediate): đăng nhập, dữ liệu thật,
  hoạt động offline một phần.
- **Test** (unit + widget + integration) đạt coverage hợp lý.
- **Release prep + build ký + publish** (Advanced): icon/splash, flavor prod, lên **TestFlight
  + Google Play internal**, rồi **Production**.
- **CI/CD** tự động test & đẩy bản beta.
- **Crashlytics + analytics** gắn sẵn để vận hành.

Hoàn thành nghĩa là bạn đã đi trọn **từ chưa biết Dart → có app thật trên App Store và Google
Play, có CI/CD và giám sát** — đúng mục tiêu lộ trình.

## Cạm bẫy hay gặp

- Không gắn crash reporting → mù thông tin khi user gặp lỗi.
- Quên upload dSYM/mapping → crash không đọc được.
- Rollout 100% ngay cho bản lớn → lỗi lan rộng. Dùng staged/phased.
- Lạm dụng remote config để đổi hành vi chính → vi phạm chính sách store.

## Ghi nhớ

Sau publish là **vận hành**: **Crashlytics/Sentry** (nhớ symbol), **analytics** tôn trọng
quyền riêng tư (ATT, khai báo đúng), cập nhật qua **staged/phased rollout** và **hotfix** khi
cần. Cập nhật code chính **phải qua store** — remote config chỉ đổi cờ/dữ liệu. Dự án tổng
kết đưa app lên cả hai store là điểm chốt của toàn lộ trình.
