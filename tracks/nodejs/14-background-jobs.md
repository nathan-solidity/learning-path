---
level: "express-application"
order: 14
title: "Background Job & tác vụ nền"
est: "4-5 giờ"
checklist:
  - "Giải thích được vì sao việc nặng/chậm không nên chạy trong request handler"
  - "Đẩy được một tác vụ sang hàng đợi bằng BullMQ (producer)"
  - "Viết được worker xử lý job từ hàng đợi (consumer)"
  - "Cấu hình retry và backoff cho job thất bại"
  - "Dùng job định kỳ (repeatable/cron) cho tác vụ theo lịch"
  - "Hiểu vì sao truyền id thay vì cả object vào job"
related:
  - "glossary:message-queue"
---

## Vì sao cần job nền

Việc chậm (gửi email, xử lý ảnh/video, gọi API bên thứ ba, xuất báo cáo) **không nên** chạy
trong request handler: user phải chờ, và nếu tốn CPU thì **chặn event loop** làm đơ cả
server (nhớ bài 4). Giải pháp: đẩy việc sang **hàng đợi (queue)**, trả response ngay, rồi
**worker** xử lý ở tiến trình nền.

## BullMQ + Redis

**BullMQ** là thư viện queue phổ biến nhất cho Node, chạy trên **Redis**. Có 2 vai:
**producer** (đẩy job vào queue) và **worker** (lấy job ra xử lý).

```bash
npm install bullmq
# cần một Redis đang chạy (docker run -p 6379:6379 redis)
```

```typescript
// queue.ts — producer
import { Queue } from "bullmq";
const connection = { host: "localhost", port: 6379 };

export const emailQueue = new Queue("email", { connection });
```

```typescript
// Trong request handler: đẩy job rồi trả NGAY, không chờ gửi email xong
app.post("/register", asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  await emailQueue.add("welcome", { userId: user.id });   // vào hàng đợi
  res.status(201).json({ id: user.id });                  // trả ngay, không chờ email
}));
```

## Worker — xử lý job

```typescript
// worker.ts — chạy như tiến trình RIÊNG (node dist/worker.js)
import { Worker } from "bullmq";

new Worker("email", async (job) => {
  if (job.name === "welcome") {
    const user = await prisma.user.findUnique({ where: { id: job.data.userId } });
    await sendEmail(user!.email, "Chào mừng!");           // việc chậm chạy ở đây
  }
}, { connection });
```

> Worker thường chạy **tiến trình riêng** với web server. Web server đẩy job và trả
> response nhanh; worker gánh việc nặng — scale độc lập (thêm worker khi job dồn).

## Retry & backoff

Job gọi API ngoài có thể fail tạm thời (mạng chập chờn). Cấu hình thử lại:

```typescript
await emailQueue.add("welcome", { userId }, {
  attempts: 3,                                  // thử tối đa 3 lần
  backoff: { type: "exponential", delay: 2000 }, // chờ 2s, 4s, 8s giữa các lần
});
```

Job thất bại hết số lần → chuyển sang **failed** để kiểm tra sau, không mất âm thầm.

## Job định kỳ (cron)

```typescript
// Chạy dọn dẹp mỗi ngày 2h sáng
await cleanupQueue.add("daily-cleanup", {}, {
  repeat: { pattern: "0 2 * * *" },   // cú pháp cron
});
```

## Truyền id, không truyền cả object

```typescript
// ❌ truyền cả object user vào job
await emailQueue.add("welcome", { user });   // object bị serialize JSON, có thể cũ/thiếu

// ✅ truyền id, worker tự lấy bản mới nhất từ DB
await emailQueue.add("welcome", { userId: user.id });
```

> Dữ liệu job bị serialize thành JSON và có thể xử lý **muộn** (vài phút sau). Truyền `id`
> để worker đọc trạng thái mới nhất từ DB, tránh làm việc trên dữ liệu cũ. Cũng nhẹ hơn.

## Cạm bẫy hay gặp

- Làm việc nặng thẳng trong handler → user chờ lâu, CPU nặng chặn event loop.
- Quên chạy worker (chỉ chạy web server) → job vào queue rồi kẹt mãi, không ai xử lý.
- Truyền cả object thay vì id → xử lý trên dữ liệu cũ/không serialize được.
- Không cấu hình retry → lỗi mạng tạm thời làm mất job vĩnh viễn.
- Job không idempotent (chạy lại gây tác dụng phụ kép) → retry gửi email 2 lần; thiết kế
  để chạy lại an toàn.

## Ghi nhớ

Việc chậm/nặng → đẩy sang **queue (BullMQ + Redis)**, trả response ngay, **worker** riêng
xử lý nền. Cấu hình **retry + backoff** cho lỗi tạm thời, truyền **id** không truyền object.
Thiết kế job **idempotent** để retry an toàn. Đây là cách giữ API phản hồi nhanh dù việc
thật rất nặng.
</content>
