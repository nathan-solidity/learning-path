---
level: "sec-hardening"
order: 10
title: "Dependency & supply-chain: thư viện bên thứ ba"
est: "2-3 giờ"
checklist:
  - "Hiểu vì sao thư viện có CVE = ứng dụng có lỗ hổng"
  - "Quét CVE dependency định kỳ (npm audit, pip-audit, Dependabot...)"
  - "Dùng lockfile và pin version; cập nhật có kiểm soát"
  - "Nhận ra rủi ro supply-chain: typosquatting, package độc hại"
  - "Kiểm tra package trước khi thêm; giảm dependency thừa"
related:
  - "glossary:dev"
---

## Vì sao quan trọng

Phần lớn code chạy trong app của bạn **không phải do bạn viết** — nó đến từ dependency (thư
viện npm/pip/maven...). Nếu một thư viện có lỗ hổng, **app của bạn có lỗ hổng** dù code bạn
viết hoàn hảo. Đây là nhóm **Vulnerable & Outdated Components** trong OWASP Top 10, và là một
trong những nguyên nhân sự cố bị xem nhẹ nhất.

## Hai loại rủi ro

**1. Dependency có CVE (lỗ hổng đã biết).** Thư viện bạn dùng có lỗ hổng được công bố (CVE);
kẻ tấn công biết chính xác cách khai thác. Ví dụ nổi tiếng: Log4Shell (Log4j) khiến hàng
triệu hệ thống dính RCE chỉ vì một thư viện log phổ biến.

**2. Supply-chain attack (chuỗi cung ứng bị đầu độc).** Chính package bị biến thành độc hại:

| Kiểu | Mô tả |
|------|-------|
| Typosquatting | Package tên gần giống (`reqeusts` thay `requests`) chứa mã độc |
| Account bị chiếm | Maintainer bị hack, đẩy version độc hại |
| Dependency confusion | Trùng tên package nội bộ, kéo nhầm package công khai |
| Transitive dep | Lỗ hổng nằm ở dependency của dependency (bạn không trực tiếp cài) |

## DEV làm gì để phòng

**1. Quét CVE định kỳ và trong CI.** Đừng đợi sự cố — tự động quét:

```bash
npm audit                 # Node
pip-audit                 # Python
```

Bật **Dependabot** (GitHub) hoặc dùng **Snyk/Trivy** để nhận cảnh báo và PR cập nhật tự
động. Đưa bước audit vào CI để build **fail** khi có lỗ hổng nghiêm trọng.

**2. Lockfile + pin version.** Commit lockfile (`package-lock.json`, `poetry.lock`,
`Gemfile.lock`...) để mọi môi trường cài **đúng version đã kiểm**, không tự nhảy lên version
mới (có thể độc hại) khi deploy.

```
✅ Commit lockfile → build tái lập được, không "tự dưng" kéo version lạ
```

**3. Cập nhật có kiểm soát.** Vá lỗ hổng là quan trọng, nhưng cập nhật phải **qua test** —
đừng auto-merge mọi bump. Ưu tiên bản vá bảo mật; theo dõi changelog cho breaking change.

**4. Kiểm package trước khi thêm.** Trước khi `install` một package mới, nhìn: số lượt
download, lần cập nhật gần nhất, số maintainer, issue mở, có phải tên đúng không (coi chừng
typosquatting). Một dependency lạ ít người dùng là rủi ro.

**5. Giảm dependency thừa.** Mỗi package là một bề mặt tấn công. Đừng thêm cả thư viện lớn
chỉ để dùng một hàm nhỏ. Ít dependency = ít CVE phải theo dõi.

## Cạm bẫy hay gặp

- "Code mình an toàn là đủ" → quên rằng đa số bề mặt tấn công nằm ở dependency.
- Không commit lockfile → mỗi lần deploy kéo version khác, khó tái lập và dễ dính version độc.
- Bỏ qua cảnh báo `npm audit` vì "nhiều quá" → lỗ hổng nghiêm trọng bị chôn giữa cảnh báo nhỏ.
- Copy tên package từ nguồn không tin cậy → dính typosquatting.
- Ngại cập nhật vì sợ hỏng → dependency cũ tích tụ CVE, càng để lâu càng khó vá.

## Ghi nhớ

Thư viện bên thứ ba có lỗ hổng thì **app bạn có lỗ hổng** (OWASP: Vulnerable & Outdated
Components). Phòng thủ: **quét CVE định kỳ và trong CI** (npm audit, pip-audit, Dependabot),
dùng **lockfile + pin version**, **cập nhật có kiểm soát**, và **kiểm package trước khi
thêm** (coi chừng typosquatting/supply-chain). Giảm dependency thừa để thu nhỏ bề mặt tấn
công.
