---
level: "express-foundation"
order: 9
title: "Database với Prisma (ORM)"
est: "5-6 giờ"
checklist:
  - "Định nghĩa được schema Prisma với model, field, kiểu và quan hệ (relation)"
  - "Chạy được migration để tạo/đổi bảng từ schema (prisma migrate)"
  - "Thực hiện CRUD bằng Prisma Client: create, findMany, findUnique, update, delete"
  - "Lấy dữ liệu quan hệ bằng include thay vì query nhiều lần (tránh N+1)"
  - "Lọc, sắp xếp, phân trang bằng where/orderBy/skip/take"
  - "Dùng transaction cho thao tác cần toàn vẹn (all-or-nothing)"
related:
  - "glossary:orm"
---

## Vì sao dùng ORM

Viết SQL tay thì dễ dính SQL injection, khó đồng bộ schema, không có gợi ý kiểu. **Prisma**
là ORM hiện đại cho Node/TS: định nghĩa schema một chỗ, sinh **client type-safe** (tự gợi ý
field, bắt lỗi tên cột sai lúc biên dịch), và quản lý migration. Đây là lựa chọn phổ biến
nhất cho project Node/TS mới.

## Schema — nguồn sự thật

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")   // đọc từ .env, không hard-code
}
generator client { provider = "prisma-client-js" }

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
  posts Post[]                     // quan hệ 1-nhiều
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
```

```bash
npm install prisma @prisma/client
npx prisma migrate dev --name init   # sinh SQL migration + tạo bảng + cập nhật client
```

> `prisma migrate dev` làm 3 việc: tạo file SQL migration, chạy nó lên DB, và sinh lại
> Prisma Client theo schema mới. Commit thư mục `prisma/migrations/` vào git.

## CRUD với Prisma Client

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CREATE
const user = await prisma.user.create({
  data: { email: "n@x.com", name: "Nhân" },
});

// READ
const all = await prisma.user.findMany();
const one = await prisma.user.findUnique({ where: { id: 1 } });

// UPDATE
await prisma.user.update({ where: { id: 1 }, data: { name: "Nhân B" } });

// DELETE
await prisma.user.delete({ where: { id: 1 } });
```

Prisma Client **type-safe**: gõ `user.emial` (sai) hay `data: { age: 5 }` (field không có)
đều bị TS báo lỗi ngay — không đợi runtime.

## Quan hệ & tránh N+1

```typescript
// ❌ N+1: lấy posts rồi lặp query author từng cái
const posts = await prisma.post.findMany();
for (const p of posts) {
  const author = await prisma.user.findUnique({ where: { id: p.authorId } }); // query mỗi vòng!
}

// ✅ include: lấy kèm quan hệ trong 1 lần
const posts = await prisma.post.findMany({
  include: { author: true },       // mỗi post đã có post.author
});
```

> N+1 (1 query gốc + N query con) là thủ phạm chậm phổ biến nhất. Prisma `include`/`select`
> gộp lại.

## Lọc, sắp xếp, phân trang

```typescript
const posts = await prisma.post.findMany({
  where: { published: true, title: { contains: "node" } },  // lọc
  orderBy: { createdAt: "desc" },                            // sắp xếp
  skip: 20,                                                   // bỏ 20 (trang 3)
  take: 10,                                                   // lấy 10/trang
  select: { id: true, title: true },                          // chỉ lấy cột cần
});
```

> `select` chỉ lấy cột cần thay vì cả hàng → nhẹ hơn, nhanh hơn khi bảng có cột lớn (text,
> json). Đừng `findMany` không giới hạn trên bảng triệu dòng — luôn phân trang.

## Transaction — all-or-nothing

Khi nhiều thao tác phải cùng thành công hoặc cùng hủy (vd chuyển tiền: trừ A, cộng B):

```typescript
await prisma.$transaction(async (tx) => {
  await tx.account.update({ where: { id: a }, data: { balance: { decrement: 100 } } });
  await tx.account.update({ where: { id: b }, data: { balance: { increment: 100 } } });
  // nếu bất kỳ dòng nào lỗi → cả hai được rollback, không trừ tiền mà không cộng
});
```

## Cạm bẫy hay gặp

- Tạo `new PrismaClient()` nhiều lần (mỗi request) → cạn connection pool; tạo **một
  instance** dùng chung toàn app.
- Quên `include`/`select` rồi lặp query quan hệ → N+1, chậm.
- `findMany` không `take`/phân trang trên bảng lớn → lôi cả triệu dòng, hết RAM.
- Sửa schema mà quên `prisma migrate` → DB thật lệch với code, lỗi lúc chạy.
- Không commit thư mục `migrations/` → đồng đội/CI không dựng lại được DB.

## Ghi nhớ

Schema Prisma là nguồn sự thật → `migrate` để đồng bộ DB → Client type-safe cho CRUD. Lấy
quan hệ bằng `include`/`select` để tránh N+1, luôn phân trang bảng lớn, dùng
`$transaction` cho thao tác toàn vẹn. Một `PrismaClient` dùng chung cả app, đừng tạo mỗi
request.
</content>
