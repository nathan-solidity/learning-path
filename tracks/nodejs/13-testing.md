---
level: "express-application"
order: 13
title: "Testing"
est: "5-6 giờ"
checklist:
  - "Viết được unit test bằng Jest (hoặc Vitest): describe/it/expect"
  - "Test một endpoint HTTP bằng Supertest (kiểm tra status và body)"
  - "Dùng mock để cô lập unit khỏi phụ thuộc ngoài (DB, API)"
  - "Viết test theo Arrange-Act-Assert, tên test mô tả rõ scenario"
  - "Hiểu tháp test: nhiều unit (nhanh), ít e2e (chậm)"
  - "Chạy test với coverage và đọc được báo cáo coverage"
related:
  - "skill:nta-test-gen"
  - "skill:nta-code-review"
  - "glossary:unit-test"
---

## Vì sao test

Không có test, mỗi lần sửa code là đánh cược "không vỡ chỗ khác". Test là **lưới an toàn**:
refactor không sợ, và test chính là tài liệu sống mô tả code làm gì. Với Node/TS phổ biến
nhất là **Jest** (đầy đủ) hoặc **Vitest** (nhanh, hợp dự án dùng ESM/Vite).

## Cấu trúc test cơ bản

```typescript
// src/utils/price.ts
export function applyDiscount(price: number, percent: number): number {
  if (percent < 0 || percent > 100) throw new Error("percent phải 0-100");
  return Math.round(price * (1 - percent / 100));
}
```

```typescript
// src/utils/price.test.ts
import { describe, it, expect } from "@jest/globals";
import { applyDiscount } from "./price.js";

describe("applyDiscount", () => {
  it("giảm giá đúng khi percent hợp lệ", () => {
    // Arrange - Act - Assert
    const result = applyDiscount(1000, 10);
    expect(result).toBe(900);
  });

  it("ném lỗi khi percent ngoài khoảng", () => {
    expect(() => applyDiscount(1000, 150)).toThrow("percent phải 0-100");
  });
});
```

```bash
npm install -D jest ts-jest @types/jest    # hoặc: npm install -D vitest
npx jest                                    # chạy toàn bộ test
```

`describe` gom nhóm, `it` là một kỳ vọng, `expect` là assertion. Tên test mô tả **scenario**
("giảm giá đúng khi..."), không phải tên hàm.

## Test endpoint với Supertest

```typescript
import request from "supertest";
import { app } from "../app.js";

describe("POST /posts", () => {
  it("trả 201 và post mới khi dữ liệu hợp lệ", async () => {
    const res = await request(app)
      .post("/posts")
      .send({ title: "Hello", body: "..." })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Hello");
  });

  it("trả 400 khi thiếu title", async () => {
    const res = await request(app).post("/posts").send({ body: "..." });
    expect(res.status).toBe(400);
  });
});
```

Supertest gọi app qua HTTP thật (không cần server chạy port) → test được cả chuỗi
middleware + route + validation.

## Mock — cô lập unit

Unit test không nên đụng DB/API thật (chậm, không ổn định). Thay bằng **mock**:

```typescript
import { jest } from "@jest/globals";

// Giả lập module DB
jest.mock("../db.js", () => ({
  prisma: { post: { findMany: jest.fn().mockResolvedValue([{ id: 1, title: "X" }]) } },
}));

it("trả danh sách post từ service", async () => {
  const posts = await getPosts();
  expect(posts).toHaveLength(1);
});
```

> **Test behavior, không test implementation.** Kiểm tra "gọi endpoint trả đúng gì", đừng
> khóa chặt vào "hàm nào gọi hàm nào" — nếu không, refactor nhẹ là test đỏ dù code vẫn đúng.

## Tháp test

```
        /\        E2E (ít) — chậm, bao luồng quan trọng qua toàn hệ thống
       /  \
      /----\      Integration — API + DB thật (test container)
     /------\
    /--------\    Unit (nhiều) — hàm/logic thuần, nhanh, rẻ
```

| Loại | Kiểm tra | Tốc độ |
|------|----------|--------|
| Unit | Hàm/logic thuần | Nhanh nhất |
| Integration | API + DB (Supertest + DB test) | Trung bình |
| E2E | Luồng user qua toàn app | Chậm — chỉ luồng quan trọng |

![Tháp test: nhiều unit test ở đáy (nhanh, rẻ), tầng integration ở giữa, ít E2E ở đỉnh (chậm, đắt)](/images/nodejs-test-pyramid.png)

## Coverage

```bash
npx jest --coverage      # sinh báo cáo % dòng/nhánh được test chạy qua
```

Coverage cao **không** đảm bảo không bug, nhưng coverage thấp (< 50% ở logic quan trọng) là
dấu hiệu thiếu lưới an toàn. Đừng chạy theo 100% một cách máy móc — ưu tiên phủ logic
nghiệp vụ và các nhánh lỗi. Skill `/nta-test-gen` sinh test scaffold, `/nta-code-review`
rà coverage.

## Cạm bẫy hay gặp

- Test phụ thuộc lẫn nhau (dùng data test trước để lại) → dọn/tạo mới dữ liệu mỗi test.
- Lạm dụng e2e cho thứ unit test được → CI chậm, tháp test ngược.
- Mock quá sâu tới mức test chỉ kiểm tra mock → test xanh nhưng code thật vẫn lỗi.
- Tên test kiểu `test1`, `works` → khi đỏ không biết hỏng gì; mô tả scenario cụ thể.
- Không tách DB test khỏi DB dev → test xóa nhầm dữ liệu đang làm việc.

## Ghi nhớ

Viết test ngay khi viết code, đừng để "test sau". Arrange-Act-Assert, tên test mô tả
scenario. Nhiều unit (nhanh) + vài integration (Supertest) + ít e2e (chậm). Mock để cô lập,
nhưng test behavior chứ đừng khóa vào implementation. Coverage là chỉ báo, không phải mục
tiêu tự thân.
</content>
