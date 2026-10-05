---
level: "advanced"
order: 14
title: "Tương tác native — platform channel & plugin"
est: "6-7 giờ"
checklist:
  - "Giải thích khi nào cần code native và khi nào chỉ cần package pub.dev"
  - "Gọi native qua `MethodChannel` (Dart ↔ Kotlin/Swift)"
  - "Nhận luồng sự kiện native qua `EventChannel`"
  - "Đọc/ghi cấu hình native: `Info.plist` (iOS), `AndroidManifest.xml`"
  - "Xin quyền runtime (camera, vị trí...) bằng `permission_handler`"
---

## Khi nào cần đụng tới native

Phần lớn nhu cầu đã có **package sẵn trên pub.dev** (camera, geolocator, share...). Chỉ tự
viết native khi:

- cần API hệ điều hành **chưa có package** hoặc package không đủ,
- tích hợp **SDK native** của bên thứ ba (thanh toán, bản đồ đặc thù),
- cần **hiệu năng native** cho một tác vụ riêng.

> Nguyên tắc: **tìm package trước**, tự viết native sau. Đừng viết lại thứ cộng đồng đã làm tốt.

## MethodChannel — gọi native một lần

`MethodChannel` là cầu Dart ↔ native theo kiểu **request/response**.

**Dart:**

```dart
const channel = MethodChannel('com.example/battery');

Future<int> getBatteryLevel() async {
  final level = await channel.invokeMethod<int>('getBatteryLevel');
  return level ?? -1;
}
```

**Android (Kotlin) — `MainActivity.kt`:**

```kotlin
MethodChannel(flutterEngine!!.dartExecutor.binaryMessenger, "com.example/battery")
  .setMethodCallHandler { call, result ->
    if (call.method == "getBatteryLevel") {
      result.success(readBatteryLevel())
    } else result.notImplemented()
  }
```

**iOS (Swift) — `AppDelegate.swift`:**

```swift
let channel = FlutterMethodChannel(name: "com.example/battery",
                                   binaryMessenger: controller.binaryMessenger)
channel.setMethodCallHandler { call, result in
  if call.method == "getBatteryLevel" { result(self.batteryLevel()) }
  else { result(FlutterMethodNotImplemented) }
}
```

## EventChannel — luồng sự kiện native

Khi native **phát liên tục** (cảm biến, trạng thái pin, sự kiện Bluetooth), dùng `EventChannel`
→ nhận thành `Stream` bên Dart:

```dart
const events = EventChannel('com.example/sensor');
Stream<double> get sensorStream =>
    events.receiveBroadcastStream().map((e) => e as double);
```

## Cấu hình native

Nhiều tính năng yêu cầu khai báo trong file cấu hình native:

- **iOS `Info.plist`**: chuỗi lý do xin quyền (bắt buộc, App Store từ chối nếu thiếu):

```xml
<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần camera để chụp ảnh hồ sơ</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Ứng dụng cần vị trí để hiển thị cửa hàng gần bạn</string>
```

- **Android `AndroidManifest.xml`**: khai báo permission:

```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

## Xin quyền runtime

Khai báo trong manifest/plist là **chưa đủ** — Android 6+ và iOS yêu cầu **hỏi người dùng
lúc chạy**. Dùng `permission_handler`:

```bash
flutter pub add permission_handler
```

```dart
final status = await Permission.camera.request();
if (status.isGranted) {
  // mở camera
} else if (status.isPermanentlyDenied) {
  await openAppSettings();   // người dùng đã chặn → mở Cài đặt
}
```

> **Cạm bẫy App Store**: thiếu chuỗi mô tả `NS...UsageDescription` trong `Info.plist` khi có
> xin quyền → Apple **từ chối** hoặc app **crash** lúc xin quyền. Luôn khai báo lý do rõ ràng.

## Cạm bẫy hay gặp

- Đặt sai tên channel (khác nhau giữa Dart và native) → gọi rơi vào hư vô.
- Quên `result.notImplemented()`/`FlutterMethodNotImplemented` cho method không xử lý.
- Chỉ khai báo permission trong manifest mà quên xin runtime → thao tác thất bại im lặng.
- Viết native nhưng chỉ làm cho một nền tảng → nền tảng kia crash "MissingPluginException".

## Ghi nhớ

Ưu tiên package pub.dev; tự viết native khi thật cần. `MethodChannel` cho gọi một lần,
`EventChannel` cho luồng sự kiện. Nhớ **hai lớp quyền**: khai báo (plist/manifest) **và** xin
runtime (`permission_handler`) — thiếu chuỗi lý do trên iOS là lý do bị App Store từ chối phổ biến.
