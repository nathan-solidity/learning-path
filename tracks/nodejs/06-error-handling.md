---
level: "node-core"
order: 6
title: "Xử lý lỗi & debug"
est: "3-4 giờ"
checklist:
  - "Bắt lỗi đồng bộ bằng try/catch và lỗi bất đồng bộ trong hàm async"
  - "Tạo được lớp Error tùy chỉnh (custom error) để phân loại lỗi"
  - "Phân biệt lỗi có thể xử lý (operational) và bug lập trình (programmer error)"
  - "Bắt được unhandledRejection và uncaughtException ở tầng process"
  - "Dùng debugger (node --inspect / VS Code) đặt breakpoint thay vì console.log mọi nơi"
  - "Ghi log có cấu trúc bằng một logger (pino/winston) thay vì console.log"
related:
  - "glossary:stack-trace"
---

## Vì sao xử lý lỗi là kỹ năng riêng

Trong Node, lỗi đến từ nhiều hướng: đồng bộ, Promise reject, event, callback. Một
`unhandled rejection` không bắt có thể **làm sập cả process** — mất toàn bộ request đang
xử lý. Xử lý lỗi đúng là ranh giới giữa "app crash lúc 2h sáng" và "app log lỗi rồi chạy
tiếp".

## try/catch cho đồng bộ và async

```typescript
// Đồng bộ
try {
  JSON.parse("{ sai json");
} catch (err) {
  console.error("JSON hỏng:", (err as Error).message);
}

// Bất đồng bộ — try/catch BAO quanh await
async function loadUser(id: number) {
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User không tồn tại");
    return user;
  } catch (err) {
    // xử lý hoặc ném lại cho tầng trên
    throw err;
  }
}
```

> `try/catch` **không** bắt được lỗi trong callback bất đồng bộ kiểu cũ (`setTimeout`,
> event) — chỉ bắt được `await`. Với callback, lỗi phải xử lý ngay trong callback đó.

## Custom Error — phân loại lỗi

Ném lỗi có kiểu giúp tầng trên (Express error handler, bài 11) biết trả HTTP status nào:

```typescript
class AppError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = this.constructor.name;   // để stack trace hiện đúng tên lớp
  }
}

class NotFoundError extends AppError {
  constructor(message = "Không tìm thấy") { super(message, 404); }
}
class ValidationError extends AppError {
  constructor(message: string) { super(message, 400); }
}

// Dùng:
throw new NotFoundError("User #5 không tồn tại");   // → sau này map thành HTTP 404
```

## Operational error vs Programmer error

| Loại | Ví dụ | Cách xử lý |
|------|-------|-----------|
| **Operational** (dự đoán được) | DB mất kết nối, input sai, 404 | Bắt, trả lỗi lịch sự, retry — **app tiếp tục sống** |
| **Programmer** (bug) | `undefined is not a function`, sai logic | Log đầy đủ, **để process chết & restart** — vá code |

> Đừng cố `try/catch` nuốt mọi thứ. Bug lập trình nên để lộ ra (fail fast) và dựa vào
> process manager (PM2, K8s) restart — che giấu bug làm app chạy sai âm thầm còn tệ hơn.

## Lưới an toàn ở tầng process

```typescript
process.on("unhandledRejection", (reason) => {
  console.error("Promise không được catch:", reason);
  // log rồi thoát để process manager restart sạch
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Lỗi không bắt được:", err);
  process.exit(1);
});
```

Đây là **lưới cuối cùng**, không phải chỗ xử lý lỗi chính. Mục tiêu: log đầy đủ rồi thoát
sạch để được restart, không phải "cố sống tiếp" trong trạng thái hỏng.

## Debug bằng debugger, đừng chỉ console.log

```bash
node --inspect dist/index.js      # mở cổng debug, gắn Chrome DevTools / VS Code
```

Trong VS Code: đặt breakpoint, chạy "Node.js: Attach", xem giá trị biến từng bước — nhanh
hơn rải `console.log` khắp nơi rồi xóa.

## Log có cấu trúc

```typescript
import pino from "pino";
const logger = pino();

logger.info({ userId: 5, action: "login" }, "user đăng nhập");
logger.error({ err }, "query thất bại");
```

`console.log` ổn khi học, nhưng production cần log **JSON có cấu trúc** (pino/winston) để
máy phân tích được: lọc theo `userId`, gắn request-id, đẩy lên hệ thống log tập trung.
`console.log` đồng bộ còn có thể chặn event loop khi log nhiều.

## Cạm bẫy hay gặp

- Quên `try/catch` quanh `await` → unhandled rejection, có thể sập process.
- `try/catch` nuốt lỗi rồi không làm gì (`catch (e) {}`) → bug ẩn, cực khó debug.
- Ném string thay vì `Error` (`throw "lỗi"`) → mất stack trace; luôn `throw new Error()`.
- Dùng `unhandledRejection` để "cứu" app và chạy tiếp trong trạng thái hỏng.
- Rải `console.log` khắp nơi để debug rồi commit nhầm → dùng debugger + logger có level.

## Ghi nhớ

`try/catch` quanh `await`, ném `Error` (hoặc custom error có statusCode) chứ đừng ném
string. Phân biệt lỗi vận hành (bắt & sống tiếp) với bug (fail fast & restart). Đặt lưới
`unhandledRejection`/`uncaughtException` để thoát sạch. Debug bằng breakpoint, log bằng
logger có cấu trúc — không phải `console.log` rải rác.
</content>
