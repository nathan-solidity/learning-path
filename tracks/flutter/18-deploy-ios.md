---
level: "advanced"
order: 18
title: "Triển khai iOS — build, ký & publish lên App Store"
est: "7-8 giờ"
checklist:
  - "Hiểu Apple Developer Program, Bundle ID, certificate & provisioning profile"
  - "Cấu hình signing trong Xcode (tự động hoặc thủ công) cho bản release"
  - "Build IPA release bằng `flutter build ipa` (cần macOS + Xcode)"
  - "Tạo app trên App Store Connect, upload bằng Xcode/Transporter"
  - "Phát hành qua TestFlight rồi submit review; xử lý lý do bị từ chối thường gặp"
---

## Điều kiện (khác Android)

- **Bắt buộc macOS + Xcode** — không build/ký iOS được trên Windows/Linux.
- **Apple Developer Program**: **$99/năm** (cá nhân hoặc tổ chức). Tổ chức cần D-U-N-S number.
- App đã qua bài 16 (Bundle ID, version, icon không alpha, secret qua dart-define).

## Khái niệm ký của Apple (phức tạp hơn Android)

| Thành phần | Vai trò |
|------------|---------|
| **Bundle ID** | Định danh app (`com.congty.app`), đăng ký trong Developer portal |
| **Certificate** | Chứng chỉ ký (Distribution) gắn với tài khoản |
| **Provisioning profile** | Ghép Bundle ID + certificate + thiết bị/khả năng được phép |
| **Capabilities** | Push, Sign in with Apple, iCloud... phải bật khớp cả code lẫn portal |

**Automatic signing** trong Xcode lo phần lớn việc này — khuyến nghị cho người mới. Thủ công
chỉ cần khi CI hoặc quy trình team đặc thù (khi đó cân nhắc **fastlane match**).

## Bước 1 — Cấu hình signing trong Xcode

```bash
open ios/Runner.xcworkspace      # mở bằng .xcworkspace, KHÔNG phải .xcodeproj
```

Trong Xcode → target **Runner** → **Signing & Capabilities**:

- Chọn **Team** (tài khoản Apple Developer).
- Bật **Automatically manage signing**.
- Đặt **Bundle Identifier** khớp với đăng ký trên portal.
- Thêm **Capabilities** app cần (Push Notifications, Background Modes cho FCM ở bài 12...).

## Bước 2 — Build IPA release

```bash
flutter build ipa --release \
  --dart-define=API_URL=https://api.prod.com
# kết quả: build/ios/ipa/*.ipa  (+ mở Xcode Organizer để archive/upload)
```

Hoặc build archive rồi thao tác trong Xcode: **Product → Archive** → cửa sổ **Organizer**.

Cho crash đọc được, cũng nên tách symbol:

```bash
flutter build ipa --release --obfuscate --split-debug-info=build/symbols
```

(Upload dSYM lên App Store Connect/Crashlytics để symbolicate crash.)

## Bước 3 — Tạo app trên App Store Connect

Tại [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps → +**:

- Chọn **Bundle ID** đã đăng ký, đặt tên app (**duy nhất toàn App Store**), ngôn ngữ chính, SKU.
- **App information**: category, Privacy Policy URL (bắt buộc).
- **App Privacy**: khai báo dữ liệu thu thập (tương tự Data safety của Android, bắt buộc).

## Bước 4 — Upload build

Ba cách, chọn một:

- **Xcode Organizer**: chọn archive → **Distribute App → App Store Connect → Upload**.
- **Transporter** (app riêng của Apple): kéo file `.ipa` vào.
- **CLI**: `xcrun altool`/`fastlane pilot` (dùng trong CI, bài 19).

Sau upload, build cần **vài phút–1 giờ** để "processing" xong mới hiện trong TestFlight/versions.

## Bước 5 — TestFlight (thử nghiệm trước khi công khai)

**TestFlight** cho tester cài bản beta trước:

- **Internal testing**: tối đa 100 người trong team (có vai trò App Store Connect) — dùng ngay.
- **External testing**: tối đa 10.000 người qua link/email — **cần Apple review** bản beta
  (nhẹ hơn review chính thức).

Test kỹ trên TestFlight giúp bắt lỗi trước khi submit chính thức.

## Bước 6 — Submit review & phát hành

Trong tab **App Store** của app: tạo version, điền **screenshot** (đúng kích thước từng loại
màn hình bắt buộc), **mô tả**, **keywords**, **support URL**, chọn build đã upload, điền
**App Review Information** (tài khoản demo nếu app cần đăng nhập) → **Submit for Review**.

Sau khi được duyệt, chọn phát hành **thủ công** hoặc **tự động**. Có thể **phased release**
(tăng dần theo ngày) như staged rollout của Android.

## Lý do bị App Store từ chối thường gặp

- **Thiếu chuỗi lý do quyền** trong `Info.plist` (camera, vị trí...) — bài 14.
- **Icon có alpha/trong suốt** hoặc thiếu screenshot đúng kích thước.
- App có đăng nhập bên thứ ba (Google/Facebook) nhưng **thiếu Sign in with Apple** (Guideline 4.8).
- App yêu cầu **tài khoản demo** để review mà không cung cấp.
- Nội dung/thanh toán ngoài **In-App Purchase** cho hàng hóa số (Guideline 3.1.1).
- App "trống rỗng"/chỉ là web bọc lại (minimum functionality).

## Cạm bẫy hay gặp

- Mở `Runner.xcodeproj` thay vì `.xcworkspace` → thiếu pods, build lỗi.
- Quên tăng **build number** → App Store Connect từ chối build trùng.
- Provisioning/capabilities lệch giữa code và portal → lỗi ký khó hiểu; ưu tiên automatic signing.
- Thiếu **APNs key** khi dùng FCM → push không chạy trên iOS (bài 12).

## Ghi nhớ

Luồng iOS **cần macOS + Xcode**: **signing (automatic) → `flutter build ipa` → App Store
Connect (app + App Privacy) → upload → TestFlight → Submit for Review**. iOS review **nghiêm
hơn** Android — nắm trước các lý do bị từ chối (quyền, icon alpha, Sign in with Apple, tài
khoản demo). Luôn **tăng build number**.
