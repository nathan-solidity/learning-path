---
level: "basic"
order: 2
title: "Container hóa với Docker"
est: "4-5 giờ"
checklist:
  - "Phân biệt được image và container; giải thích image là read-only template, container là instance đang chạy"
  - "Viết được Dockerfile có multi-stage build và hiểu cơ chế layer/cache"
  - "Dùng docker-compose dựng nhiều service (app + db) với network và volume"
  - "Áp dụng ít nhất 3 best practice làm image nhỏ và an toàn (base slim, non-root, .dockerignore)"
  - "Chạy container không dùng root và biết vì sao điều đó quan trọng"
---

## Image vs Container

- **Image**: bản mẫu **read-only**, đóng gói app + dependencies + OS libs. Giống "file cài đặt".
- **Container**: một **instance đang chạy** của image, có lớp ghi (writable layer) riêng.
  Giống "chương trình đã mở lên".

Một image → chạy được nhiều container. Xóa container không mất image.

```bash
docker build -t myapp:1.0 .      # build image từ Dockerfile
docker run -d -p 8080:80 myapp:1.0   # chạy container, map port 8080→80
docker ps                        # container đang chạy
docker logs -f <container_id>    # xem log
docker exec -it <container_id> sh    # vào trong container
```

## Dockerfile & cơ chế layer

Mỗi lệnh trong Dockerfile tạo một **layer** được cache. Docker chỉ build lại từ layer thay
đổi trở đi — nên **thứ tự lệnh quyết định tốc độ build**.

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./       # copy manifest TRƯỚC
RUN npm ci                  # layer này cache lại nếu package.json không đổi
COPY . .                    # copy source SAU (source đổi thường xuyên)
CMD ["node", "server.js"]
```

> Nếu `COPY . .` đặt trước `npm ci`, thì mỗi lần sửa 1 dòng code sẽ phải cài lại toàn bộ
> dependencies. Copy manifest trước, source sau — đây là mẹo tăng tốc build kinh điển.

## Multi-stage build — image nhỏ hơn

Tách **stage build** (nặng, chứa compiler) khỏi **stage runtime** (chỉ chứa artifact cần chạy):

```dockerfile
# Stage 1: build
FROM golang:1.22 AS builder
WORKDIR /src
COPY . .
RUN go build -o /app/server ./cmd/server

# Stage 2: runtime — chỉ copy binary, bỏ toàn bộ toolchain
FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

Image cuối chỉ vài MB thay vì hàng trăm MB — nhanh hơn khi pull, ít bề mặt tấn công hơn.

## docker-compose — nhiều service

Compose mô tả nhiều container liên quan trong một file, kèm **network** (giao tiếp nội bộ)
và **volume** (giữ dữ liệu khi container bị xóa):

```yaml
services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      DB_HOST: db            # gọi service "db" qua tên, không cần IP
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}   # lấy từ .env, KHÔNG hard-code
    volumes:
      - pgdata:/var/lib/postgresql/data   # dữ liệu sống sót khi container tái tạo

volumes:
  pgdata:
```

```bash
docker compose up -d      # dựng toàn bộ stack
docker compose down       # gỡ (volume vẫn giữ)
```

## Best practice: image nhỏ & an toàn

| Việc | Vì sao |
|------|--------|
| Base **slim/alpine/distroless** | Giảm dung lượng & bề mặt tấn công |
| **Multi-stage build** | Bỏ toolchain khỏi image runtime |
| **`.dockerignore`** | Không copy `node_modules`, `.git`, secret vào image |
| Chạy **non-root** (`USER`) | Container bị hack thì không có quyền root |
| **Pin version** base (`node:20-slim` không phải `node:latest`) | Build lặp lại được |
| Không nhét secret vào image | Ai pull image cũng đọc được layer |

> **Đừng bao giờ** `COPY .env` hay hard-code password trong Dockerfile — mọi layer đều bị
> `docker history` đọc ra được, kể cả khi bạn xóa file ở layer sau.

## Cạm bẫy hay gặp

- **Dùng `:latest`** → mỗi lần build ra một version khác nhau, không tái hiện được bug.
- **Chạy container bằng root** (mặc định) → rủi ro bảo mật khi bị escape.
- **Không có `.dockerignore`** → image phình to, lỡ nhét cả `.git`/secret.
- **Copy source trước khi cài dependencies** → phá cache, build chậm.
- **Lưu dữ liệu DB trong container không volume** → `docker compose down` là mất sạch data.

## Ghi nhớ

**Image** là template read-only, **container** là instance đang chạy. Dockerfile build theo
**layer có cache** — copy manifest trước, source sau. Dùng **multi-stage build** + base
**slim/distroless** + chạy **non-root** để image vừa nhỏ vừa an toàn. Dùng **compose** cho
nhiều service, **volume** để giữ data, và **không bao giờ** nhét secret vào image.
