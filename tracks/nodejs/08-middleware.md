---
level: "express-foundation"
order: 8
title: "Middleware"
est: "3-4 giờ"
checklist:
  - "Giải thích được middleware là gì và vai trò của next()"
  - "Viết được middleware tùy chỉnh (log request, gắn dữ liệu vào req)"
  - "Hiểu thứ tự middleware quan trọng thế nào (chạy theo thứ tự khai báo)"
  - "Phân biệt middleware toàn cục (app.use) và middleware cho route cụ thể"
  - "Dùng được middleware phổ biến: cors, helmet, express.static"
  - "Viết middleware xử lý lỗi (4 tham số err, req, res, next) đặt cuối cùng"
related:
  - "glossary:middleware"
  - "skill:nta-code-review"
---

## Middleware là gì

Middleware là **hàm chạy giữa lúc nhận request và lúc trả response**. Mỗi middleware nhận
`(req, res, next)`: nó có thể đọc/sửa `req`/`res`, rồi gọi `next()` để chuyển sang
middleware kế tiếp — hoặc kết thúc bằng cách gửi response. Toàn bộ Express là **một chuỗi
middleware**; kể cả route handler cũng là middleware cuối chuỗi.

```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);   // làm việc gì đó
  next();                                     // → chuyển tiếp; QUÊN next() = request treo
});
```

> **`next()` là mấu chốt.** Không gọi `next()` và cũng không gửi response → request treo
> mãi, client chờ timeout. Gọi `next()` sau khi đã `res.send()` → lỗi "headers already sent".

## Middleware tùy chỉnh — gắn dữ liệu vào req

Middleware hay dùng để chuẩn bị dữ liệu cho handler phía sau (vd: xác thực gắn `req.user`):

```typescript
import { Request, Response, NextFunction } from "express";

// Gắn thời điểm bắt đầu để đo thời gian xử lý
function requestTimer(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} — ${Date.now() - start}ms`);
  });
  next();
}

app.use(requestTimer);
```

## Thứ tự middleware quyết định tất cả

```typescript
app.use(express.json());     // 1. parse body TRƯỚC
app.use(requestTimer);       // 2. rồi mới log
app.use("/admin", requireAuth); // 3. auth chỉ cho /admin
app.use("/posts", postsRouter); // 4. route

// SAI thứ tự: nếu để postsRouter trước express.json() → handler nhận req.body undefined
```

Express chạy middleware **đúng thứ tự khai báo**, từ trên xuống. Body parser phải đứng
trước route cần đọc body; auth phải đứng trước route cần bảo vệ.

## Toàn cục vs theo route

```typescript
// Toàn cục: chạy cho MỌI request
app.use(requestTimer);

// Theo prefix: chỉ request bắt đầu bằng /admin
app.use("/admin", requireAuth);

// Cho đúng 1 route: chèn middleware giữa path và handler
app.post("/posts", requireAuth, validateBody, createPost);
//                  └── chạy lần lượt: auth → validate → handler
```

## Middleware phổ biến

```typescript
import cors from "cors";
import helmet from "helmet";

app.use(helmet());                    // set header bảo mật (xem bài 18)
app.use(cors({ origin: "https://app.example.com" }));  // cho phép frontend gọi API
app.use(express.static("public"));    // phục vụ file tĩnh (ảnh, css) từ thư mục public/
app.use(express.json({ limit: "1mb" }));  // giới hạn kích thước body chống tấn công
```

| Middleware | Việc |
|------------|------|
| `express.json()` | Parse body JSON → `req.body` |
| `cors` | Cho phép trình duyệt từ domain khác gọi API |
| `helmet` | Thêm header bảo mật (CSP, HSTS...) |
| `express.static` | Trả file tĩnh trực tiếp |

## Middleware xử lý lỗi — 4 tham số, đặt CUỐI

Express nhận diện error handler qua **4 tham số** `(err, req, res, next)` và phải đặt
**sau tất cả** route:

```typescript
// Đặt SAU mọi app.use / route
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err instanceof AppError ? err.statusCode : 500;
  res.status(status).json({ error: err.message });
});
```

Trong handler async, lỗi cần được chuyển tới đây bằng `next(err)` hoặc dùng Express 5
(tự bắt Promise reject). Chi tiết ở bài 11.

## Cạm bẫy hay gặp

- Quên gọi `next()` → request treo mãi, không có response.
- Gọi `next()` **sau** khi đã gửi response → "Cannot set headers after they are sent".
- Đặt `express.json()` sau route cần body → `req.body` undefined.
- Error handler thiếu tham số `err` (chỉ 3 tham số) → Express coi là middleware thường,
  không bắt lỗi.
- Đặt error handler ở đầu thay vì cuối → không bao giờ được gọi.

## Ghi nhớ

Middleware là chuỗi hàm `(req, res, next)` chạy theo thứ tự khai báo — nhớ gọi `next()`
hoặc gửi response, không cả hai. Body parser và auth phải đứng đúng chỗ trong chuỗi. Error
handler có **4 tham số** và đặt **cuối cùng**. Hiểu chuỗi này là hiểu cách Express hoạt động.
</content>
