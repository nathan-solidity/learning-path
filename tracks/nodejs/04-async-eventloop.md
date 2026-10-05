---
level: "node-core"
order: 4
title: "Bất đồng bộ & Event Loop"
est: "5-6 giờ"
checklist:
  - "Giải thích được vì sao Node đơn luồng nhưng vẫn xử lý được nhiều request cùng lúc"
  - "Viết được code với Promise: then/catch và async/await"
  - "Dùng try/catch bắt lỗi trong hàm async đúng cách"
  - "Chạy song song nhiều tác vụ độc lập bằng Promise.all thay vì await tuần tự"
  - "Phân biệt được blocking (đồng bộ) và non-blocking (bất đồng bộ), tránh chặn event loop"
  - "Hiểu thứ tự chạy: đồng bộ → microtask (Promise) → macrotask (setTimeout)"
related:
  - "glossary:event-loop"
  - "skill:nta-perf-audit"
  - "skill:nta-code-review"
---

## Vì sao đây là bài quan trọng nhất

Đây là điểm Node khác hẳn Java/PHP. Node chạy JavaScript trên **một luồng duy nhất** nhưng
xử lý được hàng nghìn request nhờ mô hình **bất đồng bộ non-blocking**: khi gặp việc chờ
(đọc file, query DB, gọi API), Node **không đứng chờ** mà giao việc đó ra ngoài rồi làm
việc khác, khi xong mới quay lại xử lý kết quả. Không hiểu điều này → viết code chặn event
loop làm cả server đơ.

## Đồng bộ vs Bất đồng bộ

```typescript
import { readFileSync, readFile } from "node:fs";

// ❌ ĐỒNG BỘ (blocking): đứng chờ đọc xong mới chạy dòng sau
const data = readFileSync("big.txt", "utf8");   // cả server đơ khi đọc file lớn
console.log("sau readFileSync");

// ✅ BẤT ĐỒNG BỘ (non-blocking): giao việc, chạy tiếp, xong thì callback
readFile("big.txt", "utf8", (err, data) => {
  console.log("đọc xong");     // chạy SAU, khi file đọc xong
});
console.log("sau readFile");   // chạy NGAY, không chờ
```

> Trên server nhiều request, **một `readFileSync` chặn cả event loop** → mọi request khác
> phải chờ. Quy tắc: trong Node, ưu tiên bản bất đồng bộ; tránh hàm có đuôi `Sync` ở
> đường xử lý request.

## Promise & async/await

Callback lồng nhau nhiều tầng ("callback hell") khó đọc. **Promise** và **async/await** làm
code bất đồng bộ đọc như đồng bộ:

```typescript
import { readFile } from "node:fs/promises";   // bản trả Promise

// Promise: .then / .catch
readFile("a.txt", "utf8")
  .then((data) => console.log(data))
  .catch((err) => console.error(err));

// async/await: đọc tự nhiên hơn, DÙNG CÁI NÀY
async function loadFile() {
  try {
    const data = await readFile("a.txt", "utf8");   // "chờ" nhưng không chặn luồng
    console.log(data);
  } catch (err) {
    console.error("lỗi đọc file:", err);
  }
}
```

`await` tạm dừng **hàm async đó** cho đến khi Promise xong, nhưng event loop vẫn rảnh để xử
lý việc khác. Đây là "chờ mà không chặn".

## Song song với Promise.all

Nếu các tác vụ **độc lập**, đừng `await` tuần tự — chạy song song:

```typescript
// ❌ tuần tự: tổng thời gian = t1 + t2 + t3 (chậm)
const user = await getUser(id);
const posts = await getPosts(id);
const stats = await getStats(id);

// ✅ song song: tổng thời gian = max(t1, t2, t3) (nhanh)
const [user, posts, stats] = await Promise.all([
  getUser(id),
  getPosts(id),
  getStats(id),
]);
```

> `Promise.all` fail ngay khi **một** promise reject. Cần "chạy hết dù có cái lỗi" thì dùng
> `Promise.allSettled` (trả về trạng thái từng cái).

## Thứ tự chạy: đồng bộ → microtask → macrotask

```typescript
console.log("1: đồng bộ");
setTimeout(() => console.log("4: macrotask (setTimeout)"), 0);
Promise.resolve().then(() => console.log("3: microtask (Promise)"));
console.log("2: đồng bộ");

// In ra: 1 → 2 → 3 → 4
```

Event loop chạy: hết code **đồng bộ** trước → dọn sạch **microtask** (Promise callback) →
rồi mới tới **macrotask** (setTimeout, I/O). Vì thế Promise luôn chạy trước `setTimeout(0)`.

![Event loop của Node: call stack chạy code đồng bộ, việc I/O giao ra ngoài, kết quả xếp vào hàng đợi microtask (Promise) và macrotask (timer/I/O), event loop lấy ra chạy khi stack rỗng](/images/nodejs-event-loop.png)

## Đừng chặn event loop bằng CPU nặng

```typescript
// ❌ tính toán nặng đồng bộ chặn cả server
app.get("/hash", (req, res) => {
  let x = 0;
  for (let i = 0; i < 1e10; i++) x += i;   // vòng lặp khổng lồ → server đơ
  res.json({ x });
});
```

Việc **I/O** (file, DB, network) Node xử lý tốt. Nhưng việc **CPU nặng** (mã hóa, xử lý
ảnh, vòng lặp lớn) chạy đồng bộ sẽ chặn event loop. Giải pháp: đẩy sang **Worker Threads**,
background job (bài 14), hoặc dịch vụ riêng.

## Cạm bẫy hay gặp

- Quên `await` → nhận về Promise chưa resolve thay vì dữ liệu (`[object Promise]`).
- Không `try/catch` quanh `await` → unhandled rejection, có thể làm sập process.
- `await` trong vòng lặp cho việc độc lập → chậm gấp N lần; dùng `Promise.all`.
- Dùng hàm `...Sync` (readFileSync, execSync) trong xử lý request → chặn toàn bộ server.
- Tưởng `setTimeout(fn, 0)` chạy ngay → nó là macrotask, chạy SAU mọi Promise đang chờ.

## Ghi nhớ

Node đơn luồng + non-blocking: giao việc chờ ra ngoài, không đứng đợi. Dùng `async/await`
với `try/catch`, chạy song song bằng `Promise.all`. Tuyệt đối tránh hàm `Sync` và vòng lặp
CPU nặng trên đường xử lý request — chúng chặn event loop và làm đơ cả server.
</content>
