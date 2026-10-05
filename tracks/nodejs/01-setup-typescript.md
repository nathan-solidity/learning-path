---
level: "node-core"
order: 1
title: "Môi trường & TypeScript cơ bản"
est: "3-4 giờ"
checklist:
  - "Cài Node.js bằng nvm và kiểm tra đúng version LTS đang dùng"
  - "Khởi tạo project với package.json và cài TypeScript + tsx"
  - "Giải thích được vai trò của tsconfig.json và các option quan trọng (target, module, strict)"
  - "Khai báo được biến với kiểu cơ bản: string, number, boolean, array, object, và interface"
  - "Chạy được file .ts trực tiếp bằng tsx và build bằng tsc"
  - "Hiểu khác biệt giữa chạy dev (tsx) và build production (tsc → .js)"
related:
  - "skill:nta-code-review"
  - "glossary:typescript"
---

## Vì sao dùng nvm và TypeScript

Mỗi dự án Node có thể cần **version Node khác nhau**. Cài Node thẳng vào hệ thống thì đổi
dự án là xung đột. **nvm** (Node Version Manager) cho phép mỗi dự án dùng một version riêng.

**TypeScript** là JavaScript có thêm kiểu tĩnh. Trình biên dịch bắt lỗi type **trước khi
chạy** — thay vì phát hiện `undefined is not a function` lúc production. Đa số team Node
thực tế dùng TS.

```bash
# Cài nvm rồi cài Node LTS
nvm install --lts          # cài bản LTS mới nhất
nvm use --lts
node -v                    # => v22.x.x (hoặc bản LTS hiện tại)

# Khóa version cho riêng 1 dự án (tạo file .nvmrc)
echo "22" > .nvmrc
nvm use                    # đọc .nvmrc, chuyển đúng version
```

> Ưu tiên bản **LTS** (số chẵn: 20, 22...) cho production — được hỗ trợ lâu, ổn định. Bản
> lẻ (21, 23) là "current", có tính năng mới nhưng đời ngắn.

## Khởi tạo project

```bash
mkdir my-api && cd my-api
npm init -y                # tạo package.json mặc định
npm install -D typescript tsx @types/node
npx tsc --init             # tạo tsconfig.json
```

- `typescript` — trình biên dịch `tsc`.
- `tsx` — chạy file `.ts` trực tiếp khi dev (không cần build trước).
- `@types/node` — định nghĩa kiểu cho API của Node (fs, path, process...).
- `-D` (`--save-dev`) — gói chỉ dùng lúc dev/build, không đóng gói vào production.

## tsconfig.json — cấu hình biên dịch

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",        // cú pháp JS đầu ra (bản Node hiện đại hỗ trợ ES2022)
    "module": "NodeNext",      // hệ module (xem bài 3)
    "moduleResolution": "NodeNext",
    "outDir": "./dist",        // build ra thư mục dist/
    "rootDir": "./src",        // source ở src/
    "strict": true,            // BẬT — bắt lỗi type nghiêm ngặt, đừng tắt
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

> **`strict: true` là bạn, không phải kẻ thù.** Nó bật một loạt kiểm tra (null check,
> implicit any...) giúp bắt bug sớm. Người mới hay tắt cho "đỡ phiền" — đó là tự bỏ đi lý
> do chính để dùng TS.

## Kiểu dữ liệu cơ bản

```typescript
let name: string = "Nhân";
let age: number = 30;
let active: boolean = true;
let tags: string[] = ["node", "ts"];       // mảng string

// object có hình dạng cố định → dùng interface
interface User {
  id: number;
  name: string;
  email?: string;        // ? = optional, có thể thiếu
}

const user: User = { id: 1, name: "Nhân" };  // OK, email optional
// const bad: User = { id: 1 };               // ❌ lỗi: thiếu 'name'
```

Điểm mạnh: nếu bạn gõ `user.emial` (sai chính tả), TS báo lỗi ngay tại editor, không đợi
đến lúc chạy.

## Chạy & build

```jsonc
// package.json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",   // chạy dev, tự reload khi sửa file
    "build": "tsc",                     // build ra dist/*.js
    "start": "node dist/index.js"       // chạy bản đã build (production)
  }
}
```

```bash
npm run dev      # phát triển: tsx chạy .ts trực tiếp, auto-reload
npm run build    # đóng gói: tsc dịch .ts → .js vào dist/
npm start        # production: chạy .js thuần bằng node
```

| Việc | Lệnh | Dùng khi |
|------|------|----------|
| Dev | `tsx` | Đang code, cần reload nhanh, không cần build |
| Build | `tsc` | Chuẩn bị deploy, dịch TS → JS |
| Run production | `node dist/...` | Trên server, chạy JS đã build (nhanh, không cần TS) |

## Cạm bẫy hay gặp

- Chạy `node src/index.ts` trực tiếp → lỗi, vì Node thuần không hiểu TS (dùng `tsx` khi
  dev, hoặc build ra `.js` trước).
- Quên cài `@types/node` → TS báo không tìm thấy `process`, `fs`, `Buffer`...
- Tắt `strict` để "đỡ đỏ" → mất phần lớn lợi ích của TS, bug type lọt ra runtime.
- Commit thư mục `dist/` và `node_modules/` vào git → thêm `.gitignore` cho cả hai.
- Nhầm `dependencies` với `devDependencies` → build tool lọt vào production (nặng, rủi ro).

## Ghi nhớ

nvm quản version, TypeScript bắt lỗi sớm, `strict: true` luôn bật. Khi dev dùng `tsx` cho
nhanh, khi deploy thì `tsc` build ra `.js` rồi chạy bằng `node`. Nắm chắc vòng
dev → build → run là nền cho mọi bài sau.
</content>
