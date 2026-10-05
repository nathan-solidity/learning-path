---
level: "express-foundation"
order: 7
title: "Express: server, routing & request/response"
est: "4-5 giờ"
checklist:
  - "Dựng được Express server tối thiểu chạy trên một port và trả về response"
  - "Định nghĩa được route cho các HTTP method: GET, POST, PUT, PATCH, DELETE"
  - "Lấy được dữ liệu từ req.params, req.query và req.body"
  - "Trả về JSON đúng status code với res.status().json()"
  - "Tổ chức route theo express.Router thay vì nhồi hết vào app"
  - "Vẽ lại được luồng một request đi qua Express: request → middleware → route handler → response"
related:
  - "glossary:rest-api"
---

## Vì sao Express

Node lõi có module `http` để dựng server, nhưng viết tay rất cực (tự parse URL, body,
method). **Express** là framework tối giản, phổ biến nhất — thêm routing, middleware,
tiện ích request/response mà không áp đặt cấu trúc. Nắm Express rồi học framework có kiến
trúc (NestJS, bài 15) sẽ nhẹ nhàng.

## Server tối thiểu

```typescript
import express from "express";

const app = express();
app.use(express.json());          // middleware: parse body JSON → req.body

app.get("/", (req, res) => {
  res.json({ message: "Xin chào Express" });
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
```

```bash
npm install express
npm install -D @types/express     # kiểu cho TS
```

> `express.json()` **bắt buộc** nếu muốn đọc body JSON — thiếu nó thì `req.body` là
> `undefined`. Đây là lỗi kinh điển khi POST mà "không nhận được data".

## Route cho từng HTTP method

REST dùng method để diễn tả hành động trên tài nguyên:

```typescript
app.get("/posts", (req, res) => { /* lấy danh sách */ });
app.get("/posts/:id", (req, res) => { /* lấy 1 post */ });
app.post("/posts", (req, res) => { /* tạo mới */ });
app.put("/posts/:id", (req, res) => { /* thay toàn bộ */ });
app.patch("/posts/:id", (req, res) => { /* sửa 1 phần */ });
app.delete("/posts/:id", (req, res) => { /* xóa */ });
```

| Method | Ý nghĩa | Status thành công |
|--------|---------|-------------------|
| GET | Đọc, không đổi dữ liệu | 200 |
| POST | Tạo mới | 201 Created |
| PUT | Thay thế toàn bộ | 200 |
| PATCH | Sửa một phần | 200 |
| DELETE | Xóa | 204 No Content |

## Ba nguồn dữ liệu vào: params, query, body

```typescript
// GET /posts/42?sort=new
app.get("/posts/:id", (req, res) => {
  const id = req.params.id;        // "42"  — phần động trong path
  const sort = req.query.sort;     // "new" — sau dấu ?
  res.json({ id, sort });
});

// POST /posts  với body JSON { "title": "Hello" }
app.post("/posts", (req, res) => {
  const title = req.body.title;    // "Hello" — cần express.json()
  res.status(201).json({ id: 1, title });
});
```

| Nguồn | Ở đâu | Ví dụ | Dùng cho |
|-------|-------|-------|----------|
| `req.params` | Phần `:x` trong path | `/posts/42` → id=42 | Định danh tài nguyên |
| `req.query` | Sau `?` | `?page=2&sort=new` | Lọc, phân trang, sắp xếp |
| `req.body` | Thân request (POST/PUT) | `{ title: "..." }` | Dữ liệu tạo/sửa |

> `req.params` và `req.query` **luôn là string** (kể cả `?page=2` → `"2"`). Muốn dùng như
> số phải `Number(...)`. Validation ở bài 11 sẽ ép kiểu và kiểm tra giúp.

## Router — tách route ra file riêng

Nhồi hết route vào `app` sẽ thành file khổng lồ. Dùng `express.Router` gom theo tài nguyên:

```typescript
// routes/posts.ts
import { Router } from "express";
const router = Router();

router.get("/", listPosts);       // GET  /posts
router.post("/", createPost);     // POST /posts
router.get("/:id", getPost);      // GET  /posts/:id
export default router;

// index.ts
import postsRouter from "./routes/posts.js";
app.use("/posts", postsRouter);   // gắn prefix /posts cho toàn router
```

## Luồng một request

```
Client  →  Express app  →  middleware (json, log, auth...)  →  route handler
                                                                     ↓
Client  ←────────────────  res.json() / res.status()  ←──────  xử lý + gọi DB
```

Mọi request đi qua **hàng middleware theo thứ tự khai báo** rồi tới route handler khớp
method + path. Handler gọi logic/DB rồi trả response. Middleware là chủ đề bài 8.

![Luồng request trong Express: request đi qua chuỗi middleware theo thứ tự (json → log → auth), tới route handler khớp method+path, handler trả response về client](/images/nodejs-express-flow.png)

## Cạm bẫy hay gặp

- Quên `app.use(express.json())` → `req.body` là `undefined` khi POST JSON.
- Quên `return` sau khi `res.json()` rồi chạy tiếp → "Cannot set headers after they are sent".
- Coi `req.params.id` là số mà không ép kiểu → so sánh/tính toán sai.
- Nhồi mọi route vào `index.ts` → file phình to; tách theo `Router` sớm.
- Trả sai status (tạo mới trả 200 thay vì 201, xóa trả 200 thay vì 204) → client khó xử lý.

## Ghi nhớ

`express.json()` để đọc body, route theo method + path, ba nguồn dữ liệu params/query/body
(đều là string với params/query). Tách route bằng `Router` từ sớm. Nhớ luồng: request →
middleware → handler → response. Đây là khung cho mọi API bạn viết tiếp theo.
</content>
