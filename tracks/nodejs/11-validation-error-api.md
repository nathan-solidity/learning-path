---
level: "express-foundation"
order: 11
title: "Validation & xử lý lỗi API"
est: "4-5 giờ"
checklist:
  - "Validate request body/query bằng Zod và trả lỗi 400 khi dữ liệu sai"
  - "Suy ra kiểu TypeScript từ schema Zod (một nguồn sự thật cho cả validate và type)"
  - "Viết được async handler mà lỗi tự chuyển tới error middleware"
  - "Trả về format lỗi nhất quán (status, message, chi tiết) cho toàn API"
  - "Map custom error (NotFound/Validation) sang đúng HTTP status"
  - "Không để lộ stack trace/chi tiết nội bộ cho client ở production"
related:
  - "glossary:validation"
---

## Vì sao validate ở biên

Mọi dữ liệu từ client là **không đáng tin**: thiếu field, sai kiểu, cố tình phá. Validate
ngay ở biên (đầu vào API) giúp: (1) chặn dữ liệu rác trước khi vào DB, (2) trả lỗi rõ ràng
cho client, (3) code phía sau yên tâm dữ liệu đã đúng. Bỏ validate là mở cửa cho bug và lỗ
hổng.

## Zod — validate + suy kiểu một lần

```typescript
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// Suy KIỂU TS thẳng từ schema — không khai báo interface trùng lặp
type CreatePostInput = z.infer<typeof createPostSchema>;
```

> Điểm mạnh của Zod: schema vừa **kiểm tra lúc chạy** vừa **sinh kiểu TS lúc biên dịch**.
> Một nguồn sự thật — sửa schema thì kiểu tự đổi theo, không lệch.

## Middleware validate dùng lại

```typescript
import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ",
        details: result.error.issues,   // chỉ rõ field nào sai, sai gì
      });
    }
    req.body = result.data;             // dữ liệu đã parse & ép kiểu
    next();
  };

app.post("/posts", validate(createPostSchema), createPost);
```

## Async handler & chuyển lỗi tới error middleware

Trong Express 4, lỗi trong hàm async **không tự** tới error handler — phải bắt và gọi
`next(err)`. Bọc lại một lần cho gọn:

```typescript
import { RequestHandler } from "express";

// Bọc handler async: Promise reject → tự next(err)
const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get("/posts/:id", asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
  if (!post) throw new NotFoundError("Post không tồn tại");   // → tới error handler
  res.json(post);
}));
```

> **Express 5** (đã ổn định) tự bắt Promise reject từ async handler — không cần
> `asyncHandler`. Nhưng nhiều dự án còn Express 4, nên nắm cách bọc này.

## Format lỗi nhất quán + error handler tập trung

```typescript
// Đặt CUỐI cùng, sau mọi route (xem bài 8)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;

  // Log đầy đủ ở server...
  if (status >= 500) logger.error({ err }, "lỗi server");

  // ...nhưng chỉ trả client thông tin an toàn
  res.status(status).json({
    error: {
      message: status >= 500 && env.NODE_ENV === "production"
        ? "Lỗi hệ thống"          // GIẤU chi tiết nội bộ ở production
        : err.message,
      code: err.name,
    },
  });
});
```

| HTTP status | Khi nào |
|-------------|---------|
| 400 Bad Request | Input sai định dạng/validation fail |
| 401 Unauthorized | Chưa đăng nhập / token sai |
| 403 Forbidden | Đã đăng nhập nhưng không đủ quyền |
| 404 Not Found | Tài nguyên không tồn tại |
| 422 Unprocessable | Đúng định dạng nhưng vi phạm nghiệp vụ |
| 500 Internal | Bug/lỗi ngoài dự kiến — **ẩn chi tiết với client** |

## Cạm bẫy hay gặp

- Tin dữ liệu client, đưa thẳng vào DB → dữ liệu rác, lỗ hổng.
- Quên bọc async handler ở Express 4 → lỗi biến mất, request treo hoặc crash.
- Trả stack trace/`err.message` gốc cho client ở production → lộ cấu trúc DB, đường dẫn nội bộ.
- Mỗi endpoint trả format lỗi khác nhau → frontend phải xử lý loạn; thống nhất một format.
- Định nghĩa interface TS riêng rồi lại viết schema Zod riêng → lệch nhau; dùng `z.infer`.

## Ghi nhớ

Validate mọi input ở biên bằng Zod, suy kiểu bằng `z.infer` (một nguồn sự thật). Bọc async
handler để lỗi tới **error middleware tập trung**. Trả format lỗi **nhất quán** với đúng
HTTP status, và **ẩn chi tiết nội bộ** với client ở production. Đây là chuẩn cho API sạch.
</content>
