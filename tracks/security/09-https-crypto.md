---
level: "sec-hardening"
order: 9
title: "HTTPS, mã hóa & dữ liệu nhạy cảm"
est: "2-3 giờ"
checklist:
  - "Hiểu vì sao HTTPS bắt buộc và HSTS làm gì"
  - "Phân biệt được hashing, encryption và encoding (encoding KHÔNG bảo mật)"
  - "Không tự chế thuật toán mã hóa; dùng thư viện chuẩn"
  - "Không dùng thuật toán yếu/lỗi thời (MD5/SHA1 cho mật khẩu, DES)"
  - "Mã hóa dữ liệu nhạy cảm khi truyền (in transit) và khi lưu (at rest)"
related:
  - "glossary:dev"
  - "skill:nta-security-audit"
---

## Vì sao quan trọng

Nhóm **Cryptographic Failures** trong OWASP Top 10 nói về dữ liệu nhạy cảm (mật khẩu, token,
thẻ, PII) **bị lộ do không mã hóa hoặc mã hóa sai cách**. Không cần là chuyên gia mật mã —
DEV chỉ cần **dùng đúng công cụ chuẩn cho đúng việc** và tránh vài lỗi kinh điển.

## Ba khái niệm hay bị nhầm

Nhầm ba thứ này là nguồn gốc nhiều lỗ hổng:

| Khái niệm | Mục đích | Đảo ngược được? | Ví dụ |
|-----------|----------|-----------------|-------|
| **Encoding** | Đổi định dạng để truyền tải | Có, ai cũng đảo được | Base64, URL-encode |
| **Hashing** | Kiểm tra/lưu bí mật một chiều | Không (một chiều) | bcrypt, SHA-256 |
| **Encryption** | Bảo mật, giải mã lại được bằng khóa | Có, nếu có khóa | AES, RSA (TLS) |

> **Encoding KHÔNG phải bảo mật.** `base64` một mật khẩu **không** che giấu gì cả — ai cũng
> giải mã trong một giây. Đây là hiểu lầm phổ biến và nguy hiểm.

```python
# ❌ Tưởng base64 là "mã hóa" — vô dụng về bảo mật
token = base64.b64encode(password.encode())

# ✅ Băm mật khẩu (một chiều), mã hóa dữ liệu bằng thư viện chuẩn
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```

## HTTPS: bắt buộc, không phải tùy chọn

Dữ liệu gửi qua **HTTP** đi dạng **văn bản thô** — ai đứng giữa (Wi-Fi công cộng, ISP, proxy)
đều đọc được mật khẩu, cookie, token. **HTTPS (TLS)** mã hóa toàn bộ đường truyền, chống nghe
lén và **MITM** (man-in-the-middle).

- Dùng HTTPS cho **mọi** trang, không chỉ trang login.
- Bật **HSTS** (`Strict-Transport-Security`) để trình duyệt **luôn** dùng HTTPS, không cho
  hạ xuống HTTP.
- Chuyển hướng HTTP → HTTPS; đặt cookie `Secure` để không gửi qua HTTP.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Đừng tự chế mật mã

Quy tắc vàng: **không tự viết thuật toán mã hóa**. Mật mã tự chế gần như luôn có lỗ. Dùng:

- **TLS** cho truyền tải (thư viện/hệ điều hành lo, đừng tự implement handshake).
- **Thư viện chuẩn** của ngôn ngữ cho encrypt/decrypt (AES qua libsodium, `cryptography`,
  JCA...).
- **Hàm băm mật khẩu chuyên dụng** (bcrypt/argon2/scrypt) — xem bài Authentication.

## Tránh thuật toán yếu/lỗi thời

| Đừng dùng | Vì | Dùng thay |
|-----------|-----|-----------|
| MD5, SHA1 cho mật khẩu | Vỡ, băm quá nhanh → brute-force dễ | bcrypt / argon2 |
| DES, RC4 | Lỗi thời, đã bị bẻ | AES-256 |
| TLS 1.0/1.1 | Đã deprecated | TLS 1.2+ |
| Khóa/IV hard-code, tái dùng | Lộ là mất tất cả | Khóa từ secret manager, IV ngẫu nhiên |

## Mã hóa cả in transit và at rest

- **In transit**: HTTPS/TLS như trên.
- **At rest**: dữ liệu nhạy cảm lưu trong DB/file nên được mã hóa (mã hóa cột, disk
  encryption). Nếu ổ đĩa/backup bị lộ, dữ liệu vẫn an toàn.
- Mật khẩu **không mã hóa mà băm** (một chiều) — không bao giờ cần "giải mã" mật khẩu.

## Cạm bẫy hay gặp

- Coi `base64`/`encoding` là bảo mật → dữ liệu thực chất để trần.
- Chỉ bật HTTPS ở trang login, phần còn lại HTTP → cookie/token vẫn lộ.
- Tự viết hàm mã hóa "cho nhẹ" → gần như chắc chắn có lỗ hổng.
- Băm mật khẩu bằng MD5/SHA-256 trần (không salt, quá nhanh) → dễ bị dò.
- Hard-code khóa mã hóa trong source → lộ source là lộ toàn bộ dữ liệu.

## Ghi nhớ

**Cryptographic Failures** = dữ liệu nhạy cảm bị lộ do không/mã hóa sai. Nhớ: **encoding
không phải bảo mật**; **hashing** một chiều (mật khẩu), **encryption** cần khóa (TLS/AES).
**HTTPS bắt buộc** cho mọi trang + **HSTS**. **Đừng tự chế mật mã** — dùng thư viện chuẩn;
tránh **MD5/SHA1/DES**. Mã hóa cả **in transit** (TLS) lẫn **at rest**. Dùng
`/nta-security-audit` để rà điểm truyền/lưu dữ liệu nhạy cảm không mã hóa.
