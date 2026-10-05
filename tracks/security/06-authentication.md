---
level: "sec-webvuln"
order: 6
title: "Authentication an toàn"
est: "3-4 giờ"
checklist:
  - "Luôn hash password bằng bcrypt/argon2/scrypt + salt, không dùng MD5/SHA1"
  - "Không tự chế cơ chế auth/crypto — dùng thư viện/framework đã kiểm chứng"
  - "Chống brute-force: rate limit, khóa tạm, CAPTCHA khi cần"
  - "Cấu hình cookie session an toàn: HttpOnly, Secure, SameSite, hết hạn hợp lý"
  - "Thông báo lỗi đăng nhập không tiết lộ user có tồn tại hay không"
related:
  - "glossary:dev"
---

## Vì sao quan trọng

**Authentication** (xác thực — "bạn là ai") sai sót nằm trong OWASP Top 10 vì hậu quả trực
tiếp: chiếm tài khoản, lộ toàn bộ dữ liệu người dùng. Đây cũng là chỗ DEV **hay tự chế** —
và tự chế auth gần như luôn có lỗ hổng. Nguyên tắc lớn nhất: **dùng cơ chế đã được kiểm
chứng, đừng phát minh lại**.

## Lưu password: hash chuyên dụng + salt

Password **không bao giờ** được lưu dạng plain text, và **không** dùng mã hóa 2 chiều (giải
mã được = lộ hết khi DB rò rỉ). Dùng **hash một chiều chuyên dụng cho password** — loại
**cố tình chậm** để chống dò vét cạn:

```python
# ❌ MD5/SHA1 quá nhanh, không salt → crack hàng loạt trong vài phút
hashed = hashlib.md5(password.encode()).hexdigest()

# ✅ bcrypt tự sinh salt, cố tình chậm
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
# kiểm tra:
bcrypt.checkpw(attempt.encode(), hashed)
```

Dùng **bcrypt / argon2 / scrypt** (argon2 hiện được khuyến nghị nhất). **Salt** (chuỗi ngẫu
nhiên riêng mỗi user) được các thư viện này tự sinh và nhúng vào hash — nên hai người cùng
mật khẩu vẫn ra hash khác nhau, chặn tấn công bằng rainbow table.

> **Không dùng** MD5, SHA1, SHA256 "trần" cho password — chúng nhanh, không có salt, sinh ra
> để hash dữ liệu chứ không phải bảo vệ mật khẩu.

## Chống brute-force

Kẻ tấn công thử hàng loạt mật khẩu. Phòng thủ:

- **Rate limit** số lần đăng nhập theo IP/tài khoản.
- **Khóa tạm** hoặc tăng delay sau nhiều lần sai liên tiếp.
- **CAPTCHA** khi nghi ngờ tự động.
- **MFA** (đa yếu tố) cho tài khoản/hành động nhạy cảm — lớp phòng thủ mạnh nhất khi mật
  khẩu đã lộ.

## Session & token an toàn

Sau khi đăng nhập, server cấp session/token. Cấu hình an toàn:

```
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax; Max-Age=...
```

- **HttpOnly**: JS không đọc được → XSS không cướp được session (nối bài 04).
- **Secure**: chỉ gửi qua HTTPS.
- **SameSite**: giảm CSRF (nối bài 05).
- **Hết hạn hợp lý** và **hủy token khi logout** / đổi mật khẩu.
- Token phải **ngẫu nhiên đủ mạnh** (dùng bộ sinh của thư viện, không tự chế).

## Thông báo lỗi đừng "chỉ điểm"

```python
# ❌ Tiết lộ user có tồn tại → giúp kẻ tấn công dò danh sách tài khoản
if not user:      return "Email không tồn tại"
if not match:     return "Sai mật khẩu"

# ✅ Thông báo chung chung như nhau
return "Email hoặc mật khẩu không đúng"
```

## Cạm bẫy hay gặp

- Hash bằng MD5/SHA1 hoặc quên salt → DB lộ là mất sạch mật khẩu.
- Tự viết cơ chế login/JWT/crypto thay vì dùng thư viện chuẩn → gần như chắc chắn có lỗ hổng.
- Không rate limit → bị dò mật khẩu/credential stuffing thoải mái.
- Token không hết hạn, logout không hủy token → phiên bị đánh cắp dùng được mãi.
- Lưu token/JWT trong `localStorage` không cân nhắc → XSS đọc được (cookie HttpOnly an toàn hơn).

## Ghi nhớ

Password phải **hash bằng bcrypt/argon2/scrypt + salt** (không MD5/SHA1, không mã hóa 2
chiều). **Không tự chế auth/crypto** — dùng thư viện đã kiểm chứng. Chống brute-force bằng
**rate limit / khóa tạm / CAPTCHA / MFA**. Session cookie đặt **HttpOnly + Secure +
SameSite**, hết hạn hợp lý, hủy khi logout. Thông báo lỗi login **không tiết lộ** user tồn
tại hay không. Bài tiếp theo: sau khi biết "bạn là ai", kiểm "bạn được làm gì" (access
control).
