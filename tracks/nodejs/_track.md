---
track: "nodejs"
role: "dev-nodejs"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "Node.js / Express / NestJS"
variant_desc: "Từ Node.js core (TypeScript, async, event loop) đến backend developer thực chiến: Express REST API, database, auth, testing, rồi NestJS & kiến trúc, tới vận hành production."
title: "Node.js Backend Developer"
icon: "🟢"
summary: "Lộ trình từ Node.js core đến backend developer thực chiến: nền tảng ngôn ngữ (TypeScript, async/await, event loop, module, stream), Express (routing, middleware, REST API, database, validation), ứng dụng (auth JWT, testing, background job), tới NestJS & kiến trúc (DI, module, REST/GraphQL), và vận hành (performance, security, Docker/deploy)."
levels:
  - key: "node-core"
    title: "Node.js ngôn ngữ"
    desc: "TypeScript & môi trường, module (ESM/CommonJS), async/await & Promise, event loop, npm & package.json, fs/stream/buffer — nền phải chắc trước khi vào framework."
  - key: "express-foundation"
    title: "Express nền tảng"
    desc: "HTTP server, routing, middleware, REST API CRUD, kết nối database (Prisma), validation & error handling — đủ để làm API nhỏ đầu tiên chạy được."
  - key: "express-application"
    title: "Express ứng dụng"
    desc: "Xác thực & phân quyền (JWT/bcrypt), testing (Jest + Supertest), background job (BullMQ/Redis) — biến API thành ứng dụng thực tế có test."
  - key: "nestjs-architecture"
    title: "NestJS & Kiến trúc"
    desc: "NestJS (DI, module, provider, guard/interceptor), REST/GraphQL với NestJS, kiến trúc backend (layered, config, tách concern) — tổ chức code sạch cho hệ thống lớn."
  - key: "operations-advanced"
    title: "Vận hành & nâng cao"
    desc: "Hiệu năng (event loop lag, cluster, stream), bảo mật (OWASP, helmet, rate limit), Docker & deploy, observability — đưa app lên production an toàn."
---

## Về lộ trình này

Lộ trình dành cho người học **Node.js** từ nền tảng ngôn ngữ đến làm được backend
production với **Express** và **NestJS**. Thiết kế theo hướng **học đến đâu code được đến
đó**: mỗi cấp độ đều có bài thực hành/dự án nhỏ, không chỉ đọc lý thuyết.

Học tuần tự **Node.js ngôn ngữ → Express nền tảng → Express ứng dụng → NestJS & Kiến trúc
→ Vận hành & nâng cao**. Mỗi bài có checklist tự đánh giá — tick khi bạn tự tin đã nắm và
**code được**, không chỉ hiểu lý thuyết. Tiến độ tính theo số item đã tick.

### Vì sao học theo thứ tự này

Node.js chạy JavaScript **bất đồng bộ** trên một event loop đơn luồng — mô hình khác hẳn
Java (đa luồng) hay Rails (đồng bộ mặc định). Nếu nhảy thẳng vào Express mà chưa chắc
async/await và event loop, bạn sẽ **viết code chạy sai thứ tự, rò rỉ memory, chặn event
loop** mà không hiểu vì sao. Nắm core trước (Promise, async, module, stream) giúp đọc được
stack trace, hiểu framework làm gì ngầm và tự debug khi lỗi.

Ví dụ code dùng **TypeScript** — thực tế production đa số team Node dùng TS để bắt lỗi type
sớm. Các bài core dùng TS ở mức nhẹ; bài kiến trúc/NestJS khai thác TS sâu hơn.

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Node.js ngôn ngữ | Viết TS/Node thành thạo, hiểu async/event loop, đọc được code framework |
| Express nền tảng | Dựng REST API có DB, validation, error handling chạy được |
| Express ứng dụng | Thêm đăng nhập JWT, phân quyền, viết test, chạy job nền |
| NestJS & Kiến trúc | Tổ chức code sạch với DI/module, build REST/GraphQL API có cấu trúc |
| Vận hành & nâng cao | Đóng Docker, deploy, tối ưu performance & bảo mật, observability |

### Môi trường & tài nguyên

- Node.js cài bằng **nvm** (`nvm install --lts`) để đổi version dễ dàng. Ưu tiên bản
  **LTS** (chẵn: 20, 22...) cho production.
- Package manager: **npm** (mặc định) hoặc **pnpm** (nhanh, tiết kiệm ổ đĩa). Editor:
  **VS Code** (+ ESLint, Prettier).
- TypeScript chạy dev bằng **tsx** hoặc **ts-node**; build production bằng `tsc` hoặc bundler.
- Tài liệu chính thức: [Node.js docs](https://nodejs.org/docs/latest/api/),
  [Express](https://expressjs.com), [NestJS](https://docs.nestjs.com),
  [W3Schools Node.js](https://www.w3schools.com/nodejs/).
- Mỗi bài có ví dụ code chạy được — nên gõ lại và chạy thử, đừng chỉ đọc.

Nội dung liên kết với `term-glossary` (tra thuật ngữ) — gặp thuật ngữ lạ thì mở glossary.
</content>
</invoke>
