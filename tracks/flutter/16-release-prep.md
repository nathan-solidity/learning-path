---
level: "advanced"
order: 16
title: "Chuẩn bị phát hành — icon, splash, flavor & biến môi trường"
est: "5-6 giờ"
checklist:
  - "Đặt tên app, bundle id / application id, và số phiên bản đúng cách"
  - "Sinh app icon & splash screen cho iOS/Android"
  - "Tách môi trường dev/staging/prod bằng flavor (Android) & scheme (iOS)"
  - "Quản lý biến môi trường/secret bằng `--dart-define`, không hard-code"
  - "Kiểm tra checklist trước khi build release (log, endpoint, quyền)"
---

## Định danh & phiên bản

Trước khi lên store, xác định các định danh **không đổi được sau khi phát hành**:

- **Android `applicationId`** (`android/app/build.gradle`) và **iOS Bundle Identifier**
  (Xcode → Signing) — thường dạng `com.congty.tenapp`. **Đổi = app khác** trên store.
- **Version**: trong `pubspec.yaml` dạng `version: 1.2.0+15`.
  - `1.2.0` = **versionName** (người dùng thấy).
  - `+15` = **build number** (versionCode iOS/Android) — **phải tăng mỗi lần upload**, nếu
    không store từ chối "bản build đã tồn tại".

```yaml
# pubspec.yaml
version: 1.0.0+1
```

## App icon & splash

Dùng package sinh tự động cho mọi kích thước:

```bash
flutter pub add flutter_launcher_icons --dev
flutter pub add flutter_native_splash --dev
```

```yaml
# pubspec.yaml
flutter_launcher_icons:
  image_path: "assets/icon.png"      # nên ≥ 1024x1024, nền đầy đủ
  android: true
  ios: true

flutter_native_splash:
  color: "#ffffff"
  image: assets/splash.png
```

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

> **Lưu ý iOS**: icon **không được có kênh alpha/trong suốt** — App Store từ chối. Dùng ảnh
> nền đặc. Android 8+ dùng **adaptive icon** (lớp nền + lớp foreground).

## Flavor — tách môi trường dev/staging/prod

App thật cần nhiều môi trường: URL API khác nhau, icon/tên khác để cài song song.

- **Android**: khai báo `productFlavors` trong `build.gradle` (dev/staging/prod), mỗi flavor
  có `applicationIdSuffix` riêng (`.dev`) để cài cùng lúc.
- **iOS**: tạo **scheme** + **configuration** tương ứng trong Xcode.

```bash
flutter run --flavor dev -t lib/main_dev.dart
flutter build appbundle --flavor prod -t lib/main_prod.dart
```

Mỗi entrypoint (`main_dev.dart`...) nạp cấu hình môi trường tương ứng.

## Biến môi trường & secret — `--dart-define`

**Không hard-code** API key/URL trong source (lộ khi decompile, lộ khi commit). Truyền lúc build:

```bash
flutter build appbundle \
  --dart-define=API_URL=https://api.prod.com \
  --dart-define=SENTRY_DSN=xxx
```

```dart
const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost');
```

Gọn hơn: đặt trong file `--dart-define-from-file=env/prod.json` (nhớ **gitignore** file chứa secret).

> **Cảnh báo bảo mật**: key nhúng trong app client **luôn** có thể bị trích xuất — đừng đặt
> secret backend thật (khóa admin, DB password) vào app. Key client (Firebase, Maps) thì
> giới hạn quyền/domain ở phía dịch vụ.

## Checklist trước khi build release

- [ ] Gỡ hết `print`/log debug lộ dữ liệu; tắt banner debug.
- [ ] Endpoint trỏ **production**, không phải localhost/staging.
- [ ] Version + build number đã tăng.
- [ ] Icon/splash/tên app đúng thương hiệu.
- [ ] Quyền (camera, vị trí...) đều có chuỗi lý do; xin runtime đầy đủ.
- [ ] Secret truyền qua `--dart-define`, không nằm trong source.
- [ ] Đã test bản **release** trên thiết bị thật (không chỉ debug).

## Ghi nhớ

Trước khi lên store: chốt **bundle id/application id** (không đổi được), **tăng build number
mỗi lần**, sinh **icon/splash** (iOS không alpha), tách **flavor** cho môi trường, và đưa
**secret qua `--dart-define`** thay vì hard-code. Chạy qua checklist release — đây là bước
đệm trước hai bài build & publish iOS/Android.
