---
level: "express-application"
order: 12
title: "Xác thực & phân quyền (JWT)"
est: "5-6 giờ"
checklist:
  - "Băm mật khẩu bằng bcrypt trước khi lưu, không bao giờ lưu plaintext"
  - "Tạo và verify JWT (access token) cho luồng đăng nhập"
  - "Viết middleware xác thực gắn req.user từ token"
  - "Phân quyền theo role bằng middleware (authorize)"
  - "Hiểu khác biệt access token và refresh token, vì sao cần cả hai"
  - "Biết các rủi ro lưu token (localStorage vs httpOnly cookie) và chống XSS/CSRF"
related:
  - "glossary:jwt"
  - "glossary:authentication"
---

## Xác thực vs Phân quyền

- **Authentication (xác thực)**: bạn là ai? → đăng nhập, kiểm tra mật khẩu.
- **Authorization (phân quyền)**: bạn được làm gì? → user thường không xóa được bài người khác.

Hai việc khác nhau, làm ở hai tầng khác nhau. Nhầm lẫn dẫn tới lỗ hổng "đăng nhập rồi làm
được mọi thứ".

## Băm mật khẩu — không bao giờ lưu plaintext

```typescript
import bcrypt from "bcrypt";

// Khi đăng ký: băm rồi lưu hash
const hash = await bcrypt.hash(plainPassword, 12);   // 12 = cost, càng cao càng chậm/an toàn
await prisma.user.create({ data: { email, passwordHash: hash } });

// Khi đăng nhập: so sánh (KHÔNG giải mã ngược được — bcrypt một chiều)
const ok = await bcrypt.compare(plainPassword, user.passwordHash);
if (!ok) throw new AppError("Sai email hoặc mật khẩu", 401);
```

> **Không bao giờ** lưu mật khẩu dạng thô, cũng đừng dùng md5/sha256 (nhanh → dễ brute
> force). bcrypt (hoặc argon2) cố tình **chậm** để chống dò. Báo lỗi mơ hồ "sai email hoặc
> mật khẩu" — đừng tiết lộ email nào tồn tại.

## JWT — token đăng nhập

JWT là chuỗi ký tự chứa thông tin (payload) đã **ký** bằng secret. Server phát khi đăng
nhập, client gửi kèm mỗi request để chứng minh danh tính:

```typescript
import jwt from "jsonwebtoken";

// Phát token khi đăng nhập thành công
const token = jwt.sign(
  { sub: user.id, role: user.role },   // payload — ĐỪNG nhét dữ liệu nhạy cảm
  env.JWT_SECRET,
  { expiresIn: "15m" }                 // hết hạn ngắn cho access token
);

// Verify ở middleware
const payload = jwt.verify(token, env.JWT_SECRET);   // sai/hết hạn → ném lỗi
```

> Payload JWT **chỉ được ký, không được mã hóa** — ai cũng đọc được (base64). Đừng nhét
> mật khẩu hay dữ liệu nhạy cảm vào. Ký để chống **sửa đổi**, không phải để **giấu**.

## Middleware xác thực & phân quyền

```typescript
// Xác thực: đọc token, gắn req.user
const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;         // "Bearer <token>"
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AppError("Chưa đăng nhập", 401);

  const payload = jwt.verify(token, env.JWT_SECRET) as { sub: number; role: string };
  req.user = { id: payload.sub, role: payload.role };
  next();
};

// Phân quyền: chỉ cho role nhất định
const authorize = (...roles: string[]): RequestHandler => (req, res, next) => {
  if (!roles.includes(req.user!.role)) throw new AppError("Không đủ quyền", 403);
  next();
};

// Dùng:
app.delete("/posts/:id", authenticate, authorize("admin"), deletePost);
```

## Access token & refresh token

Access token nên **hết hạn ngắn** (15 phút) để giảm thiệt hại nếu lộ. Nhưng bắt user đăng
nhập lại mỗi 15 phút thì phiền → dùng **refresh token** (sống lâu, lưu an toàn) để xin
access token mới:

| Token | Sống | Lưu ở | Việc |
|-------|------|-------|------|
| Access | 15 phút | Bộ nhớ / header | Gửi kèm mỗi request |
| Refresh | 7-30 ngày | httpOnly cookie / DB | Xin access token mới khi hết hạn |

![Luồng JWT: client đăng nhập → server verify mật khẩu (bcrypt) → phát access + refresh token → client gửi access token mỗi request → middleware verify → khi access hết hạn dùng refresh token xin cái mới](/images/nodejs-jwt-flow.png)

## Lưu token ở đâu — bẫy bảo mật

| Cách | Rủi ro |
|------|--------|
| `localStorage` | JS đọc được → **XSS** đánh cắp token dễ dàng |
| `httpOnly` cookie | JS không đọc được (chống XSS) nhưng cần chống **CSRF** (SameSite) |

> Không có lựa chọn hoàn hảo. Nhiều app dùng **httpOnly + Secure + SameSite cookie** cho
> refresh token và giữ access token trong bộ nhớ. Điều quan trọng: hiểu đánh đổi, đừng
> nhét token nhạy cảm vào `localStorage` một cách vô tư.

## Cạm bẫy hay gặp

- Lưu mật khẩu plaintext hoặc hash nhanh (md5/sha) → lộ DB là lộ hết mật khẩu.
- Nhét dữ liệu nhạy cảm vào payload JWT tưởng "được mã hóa" → ai cũng đọc được.
- Access token không hết hạn (hoặc hạn quá dài) → lộ là dùng được mãi.
- Verify token nhưng quên kiểm tra **quyền** → user thường gọi được endpoint admin.
- Dùng cùng `JWT_SECRET` yếu/mặc định giữa các môi trường → giả mạo token.

## Ghi nhớ

Băm mật khẩu bằng bcrypt (một chiều, chậm có chủ đích). JWT được **ký, không mã hóa** —
đừng nhét bí mật vào. Tách rõ **xác thực** (bạn là ai) và **phân quyền** (được làm gì) bằng
hai middleware. Access token ngắn hạn + refresh token dài hạn. Hiểu đánh đổi khi lưu token.
</content>
