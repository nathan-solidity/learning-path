---
level: "advanced"
order: 19
title: "CI/CD — tự động build & phát hành"
est: "6-7 giờ"
checklist:
  - "Dựng pipeline CI chạy `flutter analyze` + `flutter test` mỗi push/PR"
  - "Build tự động .aab/.ipa và ký an toàn bằng secret của CI"
  - "So sánh lựa chọn: GitHub Actions, Codemagic, fastlane"
  - "Tự động upload lên TestFlight & Google Play (track internal)"
  - "Quản lý keystore/certificate trong CI không lộ (base64 secret, match)"
related:
  - "skill:nta-cicd-gen"
  - "skill:nta-devops-security"
  - "skill:nta-deploy-checklist"
---

## Vì sao cần CI/CD cho mobile

Build & ký iOS/Android bằng tay (bài 17–18) lặp lại mỗi lần release là chậm và dễ sai. CI/CD
tự động: **mỗi push chạy test → build ký → đẩy lên TestFlight/Play internal** để tester có
bản mới không cần máy dev bật Xcode.

## Chọn công cụ

| Công cụ | Điểm mạnh |
|---------|-----------|
| **GitHub Actions** | Miễn phí cho public/quota riêng, có **macOS runner** để build iOS; cấu hình YAML |
| **Codemagic** | Chuyên Flutter, UI dễ, lo ký iOS/Android sẵn, free tier |
| **fastlane** | Tự động hóa bước store (upload, screenshot, `match` quản cert) — chạy trong Actions/Codemagic |
| **Bitrise** | Chuyên mobile, nhiều step dựng sẵn |

Người mới: **Codemagic** nhanh nhất. Team đã dùng GitHub: **Actions + fastlane**.

## CI cơ bản — test mỗi PR (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { channel: stable }
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage
```

Đây là mức tối thiểu nên có: chặn merge nếu analyze/test fail.

## CD Android — build & upload Play (internal)

```yaml
  android-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      # nạp keystore từ secret (đã encode base64)
      - run: echo "$KEYSTORE_B64" | base64 -d > android/upload.jks
        env: { KEYSTORE_B64: ${{ secrets.KEYSTORE_B64 }} }
      - run: flutter build appbundle --release
        env:
          # mật khẩu ký lấy từ secret, KHÔNG hard-code
          STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}
      # upload lên Play qua fastlane supply hoặc action chuyên dụng
      - uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_SERVICE_ACCOUNT }}
          packageName: com.congty.app
          releaseFiles: build/app/outputs/bundle/release/app-release.aab
          track: internal
```

Cần tạo **service account** trên Google Cloud, cấp quyền trong Play Console → dùng JSON key làm secret.

## CD iOS — cần macOS runner

```yaml
  ios-release:
    runs-on: macos-latest            # iOS phải build trên macOS
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      # fastlane match tải cert/profile từ repo mã hóa
      - run: bundle exec fastlane ios beta
```

**fastlane** cho iOS:

```ruby
# fastlane/Fastfile
platform :ios do
  lane :beta do
    match(type: "appstore", readonly: true)   # đồng bộ cert/profile
    build_app(scheme: "Runner")
    upload_to_testflight                        # đẩy lên TestFlight
  end
end
```

**`fastlane match`** giữ certificate + provisioning profile trong một **git repo mã hóa** →
cả team và CI dùng chung khóa ký, không phải chia sẻ file `.p12` thủ công.

## Quản lý secret an toàn trong CI

- **Không** commit keystore, `.p12`, JSON service account, mật khẩu.
- Encode file nhị phân sang **base64**, lưu làm **secret** của CI, decode lúc chạy (như trên).
- Giới hạn phạm vi service account/API key đúng mức cần.
- Dọn file khóa sau khi build; không in secret ra log.
- Rà soát pipeline bằng `/nta-devops-security` để bắt secret lộ / cấu hình yếu.

## Cạm bẫy hay gặp

- Build iOS trên `ubuntu` → không thể; phải `macos` runner.
- Echo secret ra log (debug) → lộ khóa vĩnh viễn. Tắt log quanh bước ký.
- Quên tăng build number tự động → upload trùng bị từ chối; dùng bước bump number trong CI.
- Cắm cert `.p12` thủ công vào nhiều máy → dùng `fastlane match` cho nhất quán.

## Ghi nhớ

CI/CD mobile: **CI** (analyze + test mỗi PR) là bắt buộc; **CD** tự động build ký và đẩy lên
**TestFlight**/**Play internal**. iOS cần **macOS runner** + **fastlane match** để quản khóa
ký; Android dùng **service account** upload Play. Nguyên tắc xuyên suốt: **secret qua CI
secret + base64**, không bao giờ commit hay log. Sinh nhanh pipeline bằng `/nta-cicd-gen`.
