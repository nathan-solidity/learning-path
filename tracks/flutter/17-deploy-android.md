---
level: "advanced"
order: 17
title: "Triển khai Android — build, ký & publish lên Google Play"
est: "6-7 giờ"
checklist:
  - "Tạo keystore và cấu hình ký release (không commit keystore)"
  - "Build `appbundle` (.aab) release và hiểu vì sao dùng AAB thay vì APK"
  - "Bật minify/shrink (R8) và giữ được stack trace bằng mapping file"
  - "Tạo app trên Google Play Console, điền store listing & content rating"
  - "Phát hành qua Internal testing → Closed → Production; hiểu rollout theo %"
related:
  - "skill:nta-deploy-checklist"
  - "skill:nta-checklist"
  - "skill:nta-security-audit"
---

## Điều kiện

- Tài khoản **Google Play Developer** (phí **$25 một lần**), đã xác minh danh tính.
- App đã qua bài 16 (icon, version, applicationId, flavor prod, secret qua dart-define).

## Bước 1 — Tạo keystore (chữ ký phát hành)

Mọi app Android release phải được **ký số**. Chữ ký này **định danh app vĩnh viễn** — mất
keystore = không cập nhật được app nữa (trừ khi bật Play App Signing).

```bash
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Tạo `android/key.properties` (và **gitignore** nó — tuyệt đối không commit):

```properties
storePassword=****
keyPassword=****
keyAlias=upload
storeFile=/Users/ban/upload-keystore.jks
```

## Bước 2 — Cấu hình ký trong Gradle

Trong `android/app/build.gradle`, nạp `key.properties` và dùng cho `buildTypes.release`:

```gradle
def keystoreProperties = new Properties()
def keystoreFile = rootProject.file('key.properties')
if (keystoreFile.exists()) keystoreProperties.load(new FileInputStream(keystoreFile))

android {
  signingConfigs {
    release {
      storeFile file(keystoreProperties['storeFile'])
      storePassword keystoreProperties['storePassword']
      keyAlias keystoreProperties['keyAlias']
      keyPassword keystoreProperties['keyPassword']
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true          // R8: rút gọn & obfuscate
      shrinkResources true        // bỏ resource không dùng
    }
  }
}
```

> **Play App Signing** (khuyến nghị): bạn ký bằng **upload key**, Google giữ **app signing
> key** thật. Lỡ mất upload key vẫn xin cấp lại được → an toàn hơn tự giữ mọi khóa.

## Bước 3 — Build app bundle

```bash
flutter build appbundle --release \
  --dart-define=API_URL=https://api.prod.com
# kết quả: build/app/outputs/bundle/release/app-release.aab
```

- **Dùng `.aab` (Android App Bundle)**, không phải `.apk`: Google Play sinh APK tối ưu riêng
  cho từng thiết bị → tải nhẹ hơn. Google Play **chỉ nhận `.aab`** cho app mới.
- Muốn file cài trực tiếp để test ngoài Play: `flutter build apk --release`.

**Giữ mapping để đọc crash**: build release obfuscate stack trace. Thêm để tách symbol:

```bash
flutter build appbundle --release --obfuscate \
  --split-debug-info=build/symbols
```

Upload `mapping.txt`/symbol lên Play (hoặc Crashlytics) để crash report đọc được.

## Bước 4 — Tạo app trên Play Console & store listing

Tại [play.google.com/console](https://play.google.com/console): **Create app**, rồi hoàn tất
các mục bắt buộc (Play chặn phát hành nếu thiếu):

- **Store listing**: tên, mô tả ngắn/đầy đủ, **screenshot** (điện thoại + tablet nếu hỗ trợ),
  **feature graphic** (1024×500), icon 512×512.
- **Content rating**: điền bảng câu hỏi để được xếp hạng độ tuổi.
- **Data safety**: khai báo app thu thập/chia sẻ dữ liệu gì (bắt buộc, phải trung thực).
- **Target audience**, **Privacy Policy URL** (bắt buộc nếu xin quyền nhạy cảm).

## Bước 5 — Các kênh phát hành (release tracks)

Google Play có nhiều **track** để thử trước khi lên chính thức:

| Track | Dùng để |
|-------|---------|
| **Internal testing** | Tối đa 100 tester, duyệt gần như tức thì — test build nhanh nhất |
| **Closed testing** | Nhóm tester theo email/link — bắt buộc cho tài khoản cá nhân mới (yêu cầu 12+ tester, 14 ngày trước khi lên Production) |
| **Open testing** | Ai cũng tham gia được qua link |
| **Production** | Phát hành công khai |

Quy trình khuyến nghị: **Internal → Closed → Production**. Ở Production dùng **staged rollout**
(vd 10% → 50% → 100%) để phát hiện sớm sự cố và **halt rollout** nếu crash tăng.

## Bước 6 — Upload & review

Tạo release trong track → **upload `.aab`** → điền **release notes** → gửi review. Lần đầu
Google review kỹ hơn (có thể vài ngày). Sau khi được duyệt, app xuất hiện trên Play.

## Cạm bẫy hay gặp

- **Commit keystore/`key.properties`** lên git → lộ khóa ký. Luôn gitignore.
- Quên tăng **versionCode** → Play từ chối "version code đã tồn tại".
- Upload `.apk` cho app mới → không nhận; dùng `.aab`.
- Khai **Data safety** sai với thực tế → Play gỡ app.
- Mất keystore mà không bật Play App Signing → không update được app.

## Ghi nhớ

Luồng Android: **keystore → cấu hình ký trong Gradle → `flutter build appbundle --release`
→ Play Console (listing + data safety + rating) → Internal/Closed → Production (staged rollout)**.
Hai điều sống còn: **giữ keystore an toàn** (bật Play App Signing) và **tăng build number**
mỗi lần. Dùng `/nta-deploy-checklist` để không sót bước.
