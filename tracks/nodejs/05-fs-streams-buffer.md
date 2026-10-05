---
level: "node-core"
order: 5
title: "File system, Stream & Buffer"
est: "4-5 giờ"
checklist:
  - "Đọc/ghi file bất đồng bộ bằng fs/promises (không dùng bản Sync)"
  - "Dùng module path để ghép đường dẫn đúng đa nền tảng thay vì nối chuỗi"
  - "Giải thích được Buffer là gì và khi nào gặp nó (dữ liệu nhị phân)"
  - "Hiểu vì sao stream tiết kiệm bộ nhớ hơn đọc cả file vào RAM"
  - "Dùng pipeline để xử lý file lớn qua stream mà không tràn bộ nhớ"
  - "Đọc được biến môi trường và tham số dòng lệnh từ process"
related:
  - "glossary:stream"
  - "skill:nta-perf-audit"
---

## Vì sao cần stream & buffer

Backend liên tục đụng dữ liệu: đọc config, ghi log, upload/download file, xử lý ảnh. Nếu
đọc cả file 2GB vào RAM một lúc → server hết bộ nhớ và sập. **Stream** cho phép xử lý dữ
liệu **từng khối nhỏ (chunk)** khi nó chảy qua — nền tảng cho upload file (bài 12) và
performance (bài 18).

## fs/promises — đọc ghi file

```typescript
import { readFile, writeFile, mkdir } from "node:fs/promises";

async function main() {
  await writeFile("out.txt", "Xin chào Node", "utf8");
  const content = await readFile("out.txt", "utf8");
  console.log(content);                       // "Xin chào Node"

  await mkdir("logs", { recursive: true });   // recursive: không lỗi nếu đã tồn tại
}
```

> Ưu tiên `node:fs/promises` (bản Promise) để dùng `await`, thay vì `fs` callback hoặc
> `fs` bản `Sync`. Tiền tố `node:` báo rõ đây là module lõi của Node, không phải npm.

## path — ghép đường dẫn an toàn

```typescript
import path from "node:path";

// ❌ nối chuỗi: sai trên Windows (dấu \ vs /), dễ lỗi
const bad = "uploads" + "/" + fileName;

// ✅ path.join: đúng trên mọi OS
const good = path.join("uploads", fileName);

path.extname("photo.png");     // => ".png"
path.basename("/a/b/c.txt");   // => "c.txt"
path.resolve("src", "index.ts"); // => đường dẫn tuyệt đối
```

## Buffer — dữ liệu nhị phân

`Buffer` là vùng byte thô — bạn gặp nó khi đọc file **không phải text** (ảnh, PDF), dữ liệu
mạng, mã hóa:

```typescript
const buf = Buffer.from("Nhân", "utf8");
console.log(buf);              // <Buffer 4e 68 c3 a2 6e> — các byte
console.log(buf.length);       // 5 byte (chữ â chiếm 2 byte UTF-8, không phải 4 ký tự!)
console.log(buf.toString("base64"));   // mã hóa base64
```

> Bẫy hay gặp: độ dài Buffer là **số byte**, không phải số ký tự. Ký tự tiếng Việt/emoji
> chiếm nhiều byte — đừng nhầm `buf.length` với `str.length`.

## Stream — xử lý dữ liệu chảy qua

```typescript
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

// Nén file lớn: đọc → gzip → ghi, TỪNG CHUNK, không nạp cả file vào RAM
await pipeline(
  createReadStream("big.log"),   // nguồn: đọc từng khối
  createGzip(),                   // biến đổi: nén
  createWriteStream("big.log.gz") // đích: ghi ra file
);
console.log("nén xong");
```

`pipeline` nối các stream lại và **tự xử lý backpressure** (khi đích ghi chậm hơn nguồn
đọc, nó tự điều tiết) và tự dọn khi lỗi. Đừng tự nối bằng `.pipe()` thủ công cho code mới.

| Cách | Bộ nhớ dùng | Dùng khi |
|------|-------------|----------|
| `readFile` cả file | = kích thước file (2GB → 2GB RAM) | File nhỏ (config, JSON) |
| Stream từng chunk | Chỉ vài chục KB một lúc | File lớn, upload/download, log |

## process — môi trường & tham số

```typescript
// Biến môi trường (config, secret — xem bài 10)
const port = process.env.PORT ?? "3000";
const dbUrl = process.env.DATABASE_URL;

// Tham số dòng lệnh: node script.js --name Nhan
console.log(process.argv);     // [node, script, "--name", "Nhan"]

// Thoát với mã lỗi
if (!dbUrl) {
  console.error("Thiếu DATABASE_URL");
  process.exit(1);             // mã != 0 báo lỗi cho shell/CI
}
```

## Cạm bẫy hay gặp

- Dùng `readFileSync` cho file lớn trên server → chặn event loop, đơ cả app.
- Đọc cả file lớn bằng `readFile` rồi mới xử lý → tràn RAM; dùng stream.
- Nối đường dẫn bằng `+ "/"` → sai trên Windows; dùng `path.join`.
- Nhầm `buffer.length` (byte) với số ký tự khi có tiếng Việt/emoji.
- Hard-code secret trong code thay vì đọc `process.env` → lộ secret khi commit (xem bài 10).

## Ghi nhớ

Dùng `fs/promises` + `await`, ghép path bằng `path.join`. File lớn → **stream + pipeline**
để không tràn RAM. Buffer là byte thô (đo bằng byte, không phải ký tự). Đọc config qua
`process.env`. Đây là nền cho upload file và tối ưu bộ nhớ sau này.
</content>
