---
level: "express-foundation"
order: 10
title: "Cấu hình & biến môi trường"
est: "2-3 giờ"
checklist:
  - "Đọc được cấu hình từ biến môi trường qua process.env"
  - "Dùng file .env cho môi trường dev (dotenv hoặc --env-file)"
  - "Không commit .env chứa secret; commit .env.example làm mẫu"
  - "Validate biến môi trường lúc khởi động và fail fast nếu thiếu"
  - "Tách config theo môi trường: development / test / production"
  - "Hiểu vì sao secret phải đến từ môi trường, không nằm trong code"
related:
  - "glossary:environment-variable"
---

## Vì sao không hard-code config

Cùng một code chạy ở 3 nơi (máy bạn, staging, production) với DB, key, port **khác nhau**.
Nếu nhét thẳng vào code thì mỗi lần đổi phải sửa code + build lại, và **secret bị commit
vào git là lộ vĩnh viễn** (git giữ lịch sử). Nguyên tắc 12-factor: **config sống ở môi
trường, không trong code**.

## Đọc biến môi trường

```typescript
const port = Number(process.env.PORT ?? 3000);
const dbUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV ?? "development";
```

`process.env.X` luôn là **string hoặc undefined** → cần ép kiểu (`Number(...)`) và có giá
trị mặc định hợp lý.

## File .env cho dev

```bash
# .env  — CHỈ dùng ở máy dev, KHÔNG commit
DATABASE_URL="postgresql://localhost:5432/mydb"
JWT_SECRET="doi-secret-nay-o-production"
PORT=3000
```

```typescript
// Node 20.6+ có sẵn, không cần thư viện:
// chạy: node --env-file=.env dist/index.js

// hoặc dùng dotenv (tương thích rộng):
import "dotenv/config";   // nạp .env vào process.env — đặt ở dòng đầu tiên
```

## .gitignore & .env.example

```bash
# .gitignore
.env
.env.local
```

```bash
# .env.example  — COMMIT file này làm mẫu (không có giá trị secret thật)
DATABASE_URL=
JWT_SECRET=
PORT=3000
```

> **Quy tắc vàng**: `.env` (giá trị thật) **không bao giờ** vào git; `.env.example` (danh
> sách key, giá trị rỗng/mẫu) thì commit để đồng đội biết cần khai báo gì.

## Validate lúc khởi động — fail fast

Đừng để app chạy được nửa chừng rồi mới sập vì thiếu `DATABASE_URL`. Kiểm tra ngay khi
khởi động bằng schema (Zod — xem bài 11):

```typescript
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3000),      // "3000" → 3000
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Ném lỗi rõ ràng NGAY nếu thiếu/sai, thay vì lỗi mơ hồ lúc chạy
export const env = envSchema.parse(process.env);
```

Giờ `env.PORT` là `number`, `env.NODE_ENV` là union — type-safe và đã được kiểm tra. Import
`env` này thay vì đọc `process.env` rải rác khắp code.

## Tách theo môi trường

```typescript
if (env.NODE_ENV === "production") {
  app.use(helmet());            // bảo mật chặt ở production
} else {
  app.use(morgan("dev"));       // log chi tiết ở dev
}
```

| Môi trường | `NODE_ENV` | Đặc điểm |
|------------|-----------|----------|
| Development | `development` | Log nhiều, lỗi hiện stack đầy đủ, hot reload |
| Test | `test` | DB riêng, tắt log, chạy nhanh |
| Production | `production` | Log JSON, ẩn stack với client, tối ưu |

## Cạm bẫy hay gặp

- Commit `.env` chứa secret thật → lộ vĩnh viễn trong lịch sử git (phải rotate secret ngay).
- Đọc `process.env.X` rải rác khắp code → khó biết app cần biến nào; gom vào một `env` module.
- Quên ép kiểu `PORT` → so sánh/tính toán trên string sai.
- Không validate → app khởi động "thành công" rồi sập ở request đầu vì thiếu key.
- Nhét secret production vào `.env.example` → coi như commit secret.

## Ghi nhớ

Config đến từ môi trường, không từ code. `.env` cho dev (không commit), `.env.example` làm
mẫu (commit). Validate toàn bộ env lúc khởi động và **fail fast** nếu thiếu. Gom vào một
`env` module type-safe, đừng rải `process.env` khắp nơi. Secret lỡ lộ thì phải đổi ngay.
</content>
