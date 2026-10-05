---
level: "sec-webvuln"
order: 5
title: "CSRF & SSRF"
est: "2-3 giờ"
checklist:
  - "Giải thích được CSRF lợi dụng cookie tự đính kèm như thế nào"
  - "Áp dụng phòng thủ CSRF: anti-CSRF token và/hoặc SameSite cookie"
  - "Không dùng GET cho hành động đổi trạng thái (state-changing)"
  - "Giải thích được SSRF: server bị lừa gọi tới đích nội bộ"
  - "Phòng SSRF bằng allowlist đích, không cho user tự do quyết định URL server gọi"
related:
  - "glossary:dev"
  - "skill:nta-security-audit"
---

## Vì sao quan trọng

Hai lỗ hổng này khai thác **niềm tin** theo hướng ngược nhau. **CSRF** lợi dụng việc trình
duyệt nạn nhân **được server tin** (cookie tự đính kèm). **SSRF** lợi dụng việc server **được
mạng nội bộ tin**. Cả hai đều nằm trong nhóm rủi ro OWASP và DEV hay bỏ sót vì cơ chế "gián
tiếp", không đến từ input hiển nhiên.

## CSRF — Cross-Site Request Forgery

Khi bạn đăng nhập một trang, trình duyệt lưu **cookie session** và **tự động gửi kèm** cookie
đó cho mọi request tới trang đó — kể cả request do **trang khác** kích hoạt. Kẻ tấn công lợi
dụng điều này: dụ bạn mở một trang độc, trang đó ngầm gửi request tới ngân hàng của bạn.

```html
<!-- Trang độc: nạn nhân đang đăng nhập bank.com sẽ vô tình chuyển tiền -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">
```

Vì cookie tự đính kèm, server tưởng đây là request hợp lệ của bạn.

**Phòng thủ:**

| Biện pháp | Cách làm |
|-----------|----------|
| **Anti-CSRF token** | Server phát token bí mật gắn vào form; request phải kèm đúng token. Trang lạ không biết token. |
| **SameSite cookie** | Đặt cookie `SameSite=Lax` (hoặc `Strict`) → không gửi cookie cho request từ site khác. |
| **Dùng đúng HTTP method** | **GET không được đổi trạng thái**; hành động ghi phải là POST/PUT/DELETE. |
| **Kiểm Origin/Referer** | Với request đổi state, xác minh nguồn đúng domain. |

```
// ✅ Cookie session an toàn trước CSRF cơ bản
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax
```

Nhiều framework có sẵn CSRF protection — **bật lên**, đừng tắt vì "cho tiện".

## SSRF — Server-Side Request Forgery

Xảy ra khi ứng dụng **gọi tới một URL do người dùng cung cấp** mà không kiểm soát. Kẻ tấn
công đưa URL trỏ vào **mạng nội bộ** hoặc **metadata endpoint của cloud** — nơi chỉ server
truy cập được — để đọc trộm dữ liệu (ví dụ credential cloud).

```python
# ❌ Server gọi thẳng URL người dùng đưa
def fetch(url):
    return requests.get(url)          # url = "http://169.254.169.254/..." → lộ metadata cloud
```

**Phòng thủ:**

```python
# ✅ Allowlist host được phép; chặn IP nội bộ/link-local
ALLOWED = {"api.partner.com", "cdn.example.com"}
host = urlparse(url).hostname
if host not in ALLOWED:
    raise ValueError("host không được phép")
```

- **Allowlist** đích được phép gọi, thay vì để user tự do quyết định URL.
- Chặn dải IP nội bộ (`10.x`, `192.168.x`, `127.x`) và link-local (`169.254.x`).
- Không trả nguyên văn response nội bộ về client; giới hạn method/scheme (chỉ `https`).

## Cạm bẫy hay gặp

- Tắt CSRF protection của framework "cho đỡ vướng" khi dev → quên bật lại lúc lên prod.
- Dùng GET cho hành động xóa/đổi (ví dụ `/delete?id=5`) → dính CSRF dễ dàng.
- SSRF: validate URL bằng chuỗi (chặn "localhost") nhưng quên `127.0.0.1`, IPv6, redirect, DNS rebinding.
- Cho phép user nhập URL webhook/ảnh mà không allowlist → cửa SSRF điển hình.
- Nghĩ "SameSite=Lax là đủ tuyệt đối" → vẫn nên có token cho hành động nhạy cảm (nhiều lớp).

## Ghi nhớ

**CSRF** lợi dụng **cookie tự đính kèm** để khiến trình duyệt nạn nhân gửi request ngoài ý
muốn — phòng bằng **anti-CSRF token**, **SameSite cookie**, và **GET không đổi state**.
**SSRF** khiến **server** gọi tới đích nội bộ/metadata cloud — phòng bằng **allowlist đích**,
chặn IP nội bộ, không để user tự do quyết định URL server gọi. Cả hai đến từ **niềm tin ngầm**
— luôn hỏi "request/URL này thực sự đáng tin không". Dùng `/nta-security-audit` để rà.
