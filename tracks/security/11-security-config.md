---
level: "sec-hardening"
order: 11
title: "Security misconfiguration: header, CORS, cấu hình an toàn"
est: "2-3 giờ"
checklist:
  - "Không bật debug / stack trace chi tiết trên production"
  - "Đổi default credential; tắt dịch vụ/cổng/tính năng không cần"
  - "Cấu hình CORS bằng allowlist origin, không dùng '*' cho API có credential"
  - "Thêm security header: CSP, HSTS, X-Content-Type-Options, X-Frame-Options"
  - "Không trả lỗi chi tiết ra client; mặc định an toàn, prod khác dev"
related:
  - "glossary:dev"
  - "skill:nta-devops-security"
---

## Vì sao quan trọng

**Security Misconfiguration** là nhóm OWASP Top 10 xảy ra không phải vì code sai, mà vì **cấu
hình sai** — bật cái không nên bật, để mặc định không an toàn, thiếu lớp bảo vệ. Đây là lỗi
dễ mắc và dễ sửa nhất, nhưng bị bỏ qua vì "code vẫn chạy".

## Các lỗi cấu hình phổ biến

**1. Debug/stack trace bật trên production.** Trang lỗi chi tiết lộ đường dẫn file, version
framework, câu SQL, cả biến môi trường — bản đồ vàng cho kẻ tấn công.

```
❌ DEBUG = True trên production (Django/Flask...) → lộ stack trace, config
✅ DEBUG = False; trang lỗi chung chung; log chi tiết ở server, không ra client
```

**2. Default credential không đổi.** Tài khoản admin/admin, mật khẩu mặc định của DB, panel
quản trị, thiết bị — kẻ tấn công thử đầu tiên.

**3. Dịch vụ/cổng/tính năng thừa mở.** Mỗi thứ bật thêm là một bề mặt tấn công: cổng DB mở
ra internet, endpoint debug, directory listing, tính năng không dùng.

**4. CORS cấu hình quá rộng.** `Access-Control-Allow-Origin: *` (đặc biệt kèm credential)
cho **mọi** website gọi API của bạn bằng phiên đăng nhập của người dùng.

```javascript
// ❌ Cho mọi origin + credential — bất kỳ site nào cũng gọi API thay người dùng
app.use(cors({ origin: '*', credentials: true }));

// ✅ Allowlist origin cụ thể
app.use(cors({ origin: ['https://app.example.com'], credentials: true }));
```

## Security header nên có

Vài header đơn giản chặn được nhiều lớp tấn công:

| Header | Chống |
|--------|-------|
| `Content-Security-Policy` | XSS, chèn script lạ (giới hạn nguồn tài nguyên) |
| `Strict-Transport-Security` | Ép HTTPS (chống hạ cấp về HTTP) |
| `X-Content-Type-Options: nosniff` | Trình duyệt đoán sai kiểu file → XSS |
| `X-Frame-Options: DENY` | Clickjacking (nhúng trang bạn vào iframe lừa click) |
| `Referrer-Policy` | Rò rỉ URL nhạy cảm qua Referer |

Dùng middleware sẵn có (như **helmet** cho Express) để set các header này một lần, thay vì
tự nhớ từng cái.

## Không lộ thông tin qua lỗi

Thông báo lỗi ra client phải **chung chung**; chi tiết (stack trace, câu query, tên bảng)
chỉ **log ở server**. Lỗi chi tiết giúp kẻ tấn công dò cấu trúc hệ thống — nối tiếp với các
lỗ hổng khác.

```
❌ 500: "SQLSTATE... column users.password_hash ..."  → lộ schema
✅ 500: "Đã có lỗi xảy ra. Vui lòng thử lại."          → log chi tiết ở server
```

## Nguyên tắc: mặc định an toàn, prod khác dev

- **Tắt cái không cần** (secure by default): chỉ bật tính năng/cổng thực sự dùng.
- **Prod ≠ dev**: config debug, CORS lỏng, seed data... chỉ cho dev — đừng để rò sang prod.
- **Hạ tầng như code**: quản cấu hình bằng file (IaC) để rà soát và tái lập, tránh chỉnh tay
  quên chỗ.

## Cạm bẫy hay gặp

- Quên tắt `DEBUG` khi lên prod → lộ toàn bộ nội tình khi có lỗi.
- Copy config CORS `*` từ ví dụ trên mạng cho nhanh → mở API cho mọi site.
- Để nguyên mật khẩu mặc định của DB/panel admin.
- Trả nguyên văn exception ra client "cho dễ debug" → lộ schema/đường dẫn.
- Thiếu security header vì "chạy vẫn được" → mất các lớp phòng thủ miễn phí.

## Ghi nhớ

**Security Misconfiguration** = cấu hình sai chứ không phải code sai: **tắt debug/stack trace
trên prod**, đổi **default credential**, **tắt dịch vụ/cổng thừa**, cấu hình **CORS bằng
allowlist** (không `*` với credential), thêm **security header** (CSP, HSTS, nosniff,
X-Frame-Options — dùng helmet), và **không lộ lỗi chi tiết** ra client. Nguyên tắc: **mặc
định an toàn, prod tách khỏi dev**. Dùng `/nta-devops-security` để quét cấu hình.
