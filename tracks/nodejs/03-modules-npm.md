---
level: "node-core"
order: 3
title: "Module & quản lý package"
est: "3-4 giờ"
checklist:
  - "Import/export được bằng ES Modules (import/export) đúng cú pháp"
  - "Giải thích được khác biệt ESM và CommonJS (require/module.exports)"
  - "Đọc hiểu được package.json: dependencies, scripts, type, main"
  - "Phân biệt dependencies và devDependencies, biết khi nào cài loại nào"
  - "Hiểu vai trò package-lock.json và vì sao phải commit nó"
  - "Dùng npx chạy được package mà không cài global"
related:
  - "glossary:npm"
  - "skill:nta-dep-audit"
---

## Vì sao có hai hệ module

Node ra đời trước khi JavaScript có module chuẩn, nên dùng **CommonJS** (`require`). Sau này
JS chuẩn hóa **ES Modules** (`import`/`export`) — nay là mặc định khuyến nghị. Bạn sẽ gặp
cả hai trong thực tế, nên cần đọc hiểu được cả hai.

```typescript
// ES Modules (ESM) — hiện đại, dùng cho code mới
// math.ts
export function add(a: number, b: number) { return a + b; }
export const PI = 3.14;
export default function sub(a: number, b: number) { return a - b; }

// index.ts
import sub, { add, PI } from "./math.js";   // default + named
import * as math from "./math.js";           // gom tất cả vào 1 object
```

```javascript
// CommonJS (CJS) — cũ, còn nhiều trong package/legacy
// math.js
function add(a, b) { return a + b; }
module.exports = { add };

// index.js
const { add } = require("./math");
```

> **Trong TS + NodeNext, import file local phải ghi đuôi `.js`** (không phải `.ts`) — vì
> đó là đường dẫn file **sau khi build**. Nghe ngược đời nhưng đúng chuẩn ESM.

## Bật ESM cho project

```jsonc
// package.json
{
  "type": "module"      // báo Node: file .js là ESM (dùng import, không require)
}
```

Không có `"type": "module"` → Node coi `.js` là CommonJS. Đây là nguồn lỗi kinh điển
"Cannot use import statement outside a module".

| | CommonJS | ES Modules |
|---|---|---|
| Import | `require()` | `import` |
| Export | `module.exports` | `export` / `export default` |
| Nạp | Đồng bộ, lúc chạy | Tĩnh, phân tích trước |
| `package.json` | mặc định | cần `"type": "module"` |
| Xu hướng | Legacy, đang giảm | **Khuyến nghị cho code mới** |

## package.json — trái tim của project

```jsonc
{
  "name": "my-api",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",      // entry point khi package bị import
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  },
  "dependencies": {             // gói CẦN để chạy production
    "express": "^4.19.0"
  },
  "devDependencies": {          // gói chỉ cần lúc dev/build
    "typescript": "^5.5.0",
    "tsx": "^4.16.0"
  }
}
```

| Loại | Ví dụ | Cài bằng | Có lên production? |
|------|-------|----------|--------------------|
| `dependencies` | express, prisma, zod | `npm i express` | ✅ Có |
| `devDependencies` | typescript, jest, eslint | `npm i -D jest` | ❌ Không (`npm ci --omit=dev`) |

> Cài nhầm loại là lỗi phổ biến: để `typescript` vào `dependencies` làm image production
> nặng thêm; để `express` vào `devDependencies` làm production thiếu thư viện, sập.

## Semver & package-lock.json

`^4.19.0` là **semver range**: cho phép cập nhật bản vá và minor (`4.x.x`) nhưng không lên
`5.0.0` (breaking). `package-lock.json` ghi **version chính xác** đã cài của toàn bộ cây
phụ thuộc.

```bash
npm install         # cài theo lock nếu có; cập nhật lock nếu thiếu
npm ci              # cài ĐÚNG theo lock, sạch, dùng trên CI/production
```

> **Luôn commit `package-lock.json`.** Nó đảm bảo máy bạn, đồng đội và server chạy đúng
> cùng version — tránh "chạy được ở máy tôi". Dùng `npm ci` trên CI để cài tái lập được.

## npx — chạy không cần cài global

```bash
npx tsc --init            # chạy tsc mà không cài global
npx prisma migrate dev    # chạy CLI của package trong node_modules
```

`npx` tìm package trong `node_modules`, không có thì tải tạm rồi chạy — tránh làm bẩn máy
bằng cài global.

## Cạm bẫy hay gặp

- Thiếu `"type": "module"` mà dùng `import` → "Cannot use import statement outside a module".
- Import local trong TS/NodeNext quên đuôi `.js` → "Cannot find module".
- Không commit `package-lock.json` → mỗi máy cài version khác, bug khó tái hiện.
- Cài package vào nhầm nhóm (dep vs devDep) → production nặng hoặc thiếu thư viện.
- `npm install -g` bừa bãi → xung đột version giữa các dự án; ưu tiên `npx` hoặc dep local.

## Ghi nhớ

Code mới dùng ESM (`import`/`export`) + `"type": "module"`. `dependencies` là thứ chạy
production, `devDependencies` là công cụ. Commit `package-lock.json`, dùng `npm ci` trên CI.
Đây là nền để hiểu vì sao cài Express/Prisma xong nó "tự chạy được".
</content>
