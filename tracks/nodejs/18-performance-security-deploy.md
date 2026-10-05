---
level: "operations-advanced"
order: 18
title: "Hiệu năng, bảo mật & deploy"
est: "6-7 giờ"
checklist:
  - "Nhận biết và tránh chặn event loop; đo được event loop lag"
  - "Dùng cluster/PM2 hoặc container scaling để tận dụng nhiều CPU"
  - "Áp dụng bảo mật cơ bản: helmet, rate limit, CORS chặt, ẩn lỗi nội bộ"
  - "Tránh các lỗ hổng OWASP thường gặp trong Node (injection, secret lộ, dependency CVE)"
  - "Viết được Dockerfile multi-stage tối ưu cho Node/TS"
  - "Cấu hình graceful shutdown và health check cho production"
related:
  - "skill:nta-security-audit"
  - "skill:nta-perf-audit"
  - "skill:nta-docker-gen"
  - "skill:nta-devops-security"
---

## Hiệu năng: event loop là nút cổ chai

Nhớ bài 4: Node đơn luồng cho JS. Nút thắt hiệu năng số một là **chặn event loop** — một
thao tác đồng bộ nặng làm **mọi** request khác phải chờ.

```typescript
// ❌ chặn event loop: JSON khổng lồ, vòng lặp lớn, crypto đồng bộ
const hash = crypto.pbkdf2Sync(pw, salt, 100000, 64, "sha512");  // chặn!

// ✅ bản bất đồng bộ: giao ra thread pool, event loop rảnh
const hash = await promisify(crypto.pbkdf2)(pw, salt, 100000, 64, "sha512");
```

Đo **event loop lag** (độ trễ vòng lặp) để phát hiện chặn:

```typescript
import { monitorEventLoopDelay } from "node:perf_hooks";
const h = monitorEventLoopDelay(); h.enable();
setInterval(() => console.log("lag p99 (ms):", h.percentile(99) / 1e6), 5000);
```

> Lag tăng đều = có gì đó đang chặn event loop. Việc CPU nặng → Worker Threads, job nền
> (bài 14), hoặc dịch vụ riêng. Skill `/nta-perf-audit` tìm bottleneck tự động.

## Tận dụng nhiều CPU: cluster / scaling

Một tiến trình Node chỉ dùng **một CPU core**. Máy 4 core → chạy nhiều tiến trình:

```typescript
// PM2 (đơn giản nhất): pm2 start dist/index.js -i max
// -i max = một tiến trình mỗi core, PM2 tự cân tải + restart khi crash
```

Trong Kubernetes/Docker: thường chạy **một tiến trình mỗi container**, scale bằng nhiều
container (replica) — để orchestrator lo cân tải. Đừng làm cả hai (cluster trong container
đã scale) trừ khi có lý do.

## Bảo mật: Node an toàn khi bạn không tự phá

```typescript
import helmet from "helmet";
import rateLimit from "express-rate-limit";

app.use(helmet());                              // header bảo mật (CSP, HSTS, nosniff...)
app.use(cors({ origin: env.ALLOWED_ORIGINS })); // CHỈ cho domain tin cậy, đừng "*"
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));  // chặn brute-force / lạm dụng
app.use(express.json({ limit: "100kb" }));      // giới hạn body chống payload khổng lồ
```

| Lỗ hổng OWASP | Trong Node | Cách tránh |
|---------------|-----------|-----------|
| Injection | Nối chuỗi vào query DB/shell | ORM (Prisma) tham số hóa; không `exec` với input |
| Secret lộ | Hard-code / commit `.env` | Biến môi trường + `.gitignore` (bài 10) |
| Dependency CVE | Package lỗi thời có lỗ hổng | `npm audit`, `/nta-dep-audit` định kỳ |
| Broken auth | Token không hết hạn, không check quyền | JWT ngắn hạn + authorize (bài 12) |
| Lộ thông tin | Trả stack trace cho client | Ẩn chi tiết ở production (bài 11) |

```bash
npm audit                    # quét CVE trong dependency
npm audit fix                # vá tự động khi có bản an toàn
```

> Chạy `/nta-security-audit` (OWASP Top 10) và `/nta-dep-audit` (CVE) trước khi lên
> production. Đa số lỗ hổng Node đến từ **input không kiểm tra** và **dependency lỗi thời**.

## Dockerfile multi-stage cho Node/TS

Build TS trong một stage, chỉ copy kết quả sang image production gọn nhẹ:

```dockerfile
# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                      # cài cả devDependencies để build
COPY . .
RUN npm run build               # tsc → dist/

# ---- Stage 2: production ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev           # CHỈ dependencies production
COPY --from=build /app/dist ./dist
USER node                       # không chạy bằng root (bảo mật)
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

![Dockerfile multi-stage cho Node: stage build cài đầy đủ dependency và chạy tsc ra dist/, stage production chỉ copy dist/ + cài dependencies production, cho image nhỏ và an toàn hơn](/images/nodejs-docker-build.png)

> Multi-stage cho image **nhỏ** (không có source TS, không có devDependencies) và **an
> toàn** hơn (ít thứ để tấn công, chạy bằng user `node` không phải root). Skill
> `/nta-docker-gen` sinh Dockerfile này, `/nta-devops-security` quét image.

## Graceful shutdown & health check

```typescript
const server = app.listen(port);

// Khi nhận tín hiệu dừng (deploy, scale down): xử lý nốt request rồi mới thoát
process.on("SIGTERM", () => {
  server.close(() => {          // ngừng nhận request mới, chờ request đang chạy xong
    prisma.$disconnect();
    process.exit(0);
  });
});

// Health check cho load balancer / K8s
app.get("/health", (req, res) => res.json({ status: "ok" }));
```

> Không graceful shutdown → deploy/scale cắt ngang request đang xử lý (mất dữ liệu, lỗi
> client). Health check để orchestrator biết instance nào sống mà định tuyến.

## Cạm bẫy hay gặp

- Dùng hàm `...Sync`/CPU nặng trên đường request → chặn event loop, cả app chậm.
- CORS mở `origin: "*"` cho API có cookie/auth → bất kỳ site nào cũng gọi được.
- Không giới hạn kích thước body / rate limit → dễ bị DoS.
- Chạy container bằng root, copy cả `node_modules` dev vào production → image nặng, rủi ro.
- Bỏ qua `npm audit` → deploy kèm dependency có CVE đã biết.
- Không graceful shutdown → mỗi lần deploy làm rớt request đang chạy.

## Ghi nhớ

Hiệu năng Node xoay quanh **đừng chặn event loop** (đo lag, đẩy CPU nặng ra ngoài) và scale
theo core (PM2/replica). Bảo mật là **đừng tự phá** cái Node/framework đang bảo vệ: helmet,
rate limit, CORS chặt, ẩn lỗi nội bộ, `npm audit`. Deploy bằng **Docker multi-stage** (image
nhỏ, không root) với **graceful shutdown** và **health check**. Chạy `/nta-security-audit`
và `/nta-perf-audit` trước khi lên production.
</content>
