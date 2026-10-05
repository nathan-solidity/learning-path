---
level: "nestjs-architecture"
order: 17
title: "Kiến trúc backend"
est: "5-6 giờ"
checklist:
  - "Phân tầng rõ: controller → service → repository, mỗi tầng một trách nhiệm"
  - "Tách business logic khỏi framework (không để logic phụ thuộc Express/Nest)"
  - "Áp dụng dependency injection để đảo phụ thuộc (phụ thuộc vào abstraction)"
  - "Giải thích được khi nào cần layered/clean architecture, khi nào là over-engineer"
  - "Tổ chức project theo feature (module) thay vì theo loại file"
  - "Nhận biết được các code smell thường gặp và cách tách"
related:
  - "skill:nta-refactor"
  - "skill:nta-code-review"
  - "glossary:clean-architecture"
---

## Vì sao cần kiến trúc

App nhỏ nhét mọi thứ vào controller vẫn chạy. Nhưng khi lớn: logic lẫn lộn giữa HTTP,
business, DB → sửa một chỗ vỡ ba chỗ, không test được, người mới không hiểu. Kiến trúc là
**cách chia trách nhiệm** để code lớn mà vẫn bảo trì được. Nguyên tắc chung: **đơn giản
nhất có thể, phức tạp khi thật sự cần**.

## Phân tầng: controller → service → repository

```typescript
// Controller — CHỈ lo HTTP: đọc request, gọi service, trả response
@Post()
create(@Body() dto: CreatePostDto) {
  return this.postsService.create(dto);      // không có business logic ở đây
}

// Service — business logic, KHÔNG biết gì về HTTP
@Injectable()
export class PostsService {
  constructor(private readonly repo: PostsRepository) {}

  async create(dto: CreatePostDto) {
    if (await this.repo.existsByTitle(dto.title))
      throw new ConflictException("Tiêu đề đã tồn tại");   // quy tắc nghiệp vụ
    return this.repo.create(dto);
  }
}

// Repository — CHỈ lo truy cập dữ liệu, không có business logic
@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: CreatePostDto) { return this.prisma.post.create({ data }); }
  existsByTitle(title: string) { return this.prisma.post.count({ where: { title } }).then(Boolean); }
}
```

| Tầng | Trách nhiệm | KHÔNG được làm |
|------|-------------|----------------|
| Controller | Nhận/trả HTTP, validate đầu vào | Business logic, query DB |
| Service | Quy tắc nghiệp vụ, điều phối | Biết về `req`/`res`, viết SQL |
| Repository | Truy cập dữ liệu (DB) | Quy tắc nghiệp vụ |

![Kiến trúc phân tầng backend: request vào controller (tầng HTTP) → gọi service (tầng business logic) → gọi repository (tầng truy cập dữ liệu) → database; mỗi tầng chỉ gọi xuống tầng dưới, không nhảy cóc](/images/nodejs-layered-arch.png)

## Tách business logic khỏi framework

Logic nghiệp vụ **không nên** phụ thuộc Express/Nest. Kiểm tra: nếu mai đổi từ Express sang
Fastify, phần logic có phải viết lại không? Nếu có → logic đang lẫn vào tầng HTTP.

```typescript
// ❌ logic dính chặt HTTP — không test được nếu không dựng cả request
function handler(req, res) {
  if (req.body.age < 18) return res.status(400).json({ error: "..." });
  // ... 50 dòng logic tính giá trộn với res.json
}

// ✅ logic thuần, nhận/trả dữ liệu — test bằng gọi hàm, không cần HTTP
class OrderService {
  calculateTotal(items: Item[], coupon?: Coupon): number { /* logic thuần */ }
}
```

## Đảo phụ thuộc (DI) — phụ thuộc vào abstraction

Service phụ thuộc vào **interface** repository, không vào Prisma cụ thể → đổi DB hay mock
để test không đụng service:

```typescript
interface PostsRepository {
  create(data: CreatePostDto): Promise<Post>;
}
// PrismaPostsRepository implements PostsRepository
// Test: InMemoryPostsRepository implements PostsRepository — không cần DB thật
```

Đây là chữ "D" trong SOLID (Dependency Inversion). NestJS DI hỗ trợ sẵn qua provider token.

## Tổ chức theo feature, không theo loại

```
# ❌ theo loại file — sửa 1 tính năng phải nhảy 4 thư mục
src/controllers/  src/services/  src/repositories/  src/dtos/

# ✅ theo feature — mọi thứ của "posts" ở một chỗ
src/posts/  posts.controller.ts  posts.service.ts  posts.repository.ts  dto/
src/users/  ...
```

## Đừng over-engineer

| App | Kiến trúc phù hợp |
|-----|-------------------|
| Script, prototype, CRUD nhỏ | Controller + service là đủ, khỏi repository |
| App vừa, một team | Layered (controller/service/repo) |
| App lớn, nhiều team, logic phức tạp | Clean/Hexagonal, tách domain |

> Clean Architecture, DDD, CQRS... mạnh nhưng **đắt**. Áp cho CRUD nhỏ là tự làm khổ mình
> (nhiều lớp abstraction cho ít lợi ích). Bắt đầu đơn giản, tách khi thấy đau thật sự. Skill
> `/nta-refactor` giúp tách dần khi code phình.

## Cạm bẫy hay gặp

- Business logic nằm trong controller → không test được, không tái dùng.
- Repository chứa quy tắc nghiệp vụ (hoặc service viết SQL) → tầng lẫn lộn.
- Nhảy cóc tầng (controller gọi thẳng Prisma) → khó thay đổi, khó test.
- Áp Clean Architecture cho app 3 endpoint → over-engineer, chậm tiến độ.
- Tổ chức theo loại file → sửa một tính năng phải mở nhiều thư mục rời rạc.

## Ghi nhớ

Chia trách nhiệm: controller (HTTP) → service (business) → repository (data), mỗi tầng một
việc, không nhảy cóc. Business logic tách khỏi framework để test được và đổi được. Tổ chức
theo **feature**, không theo loại file. Và quan trọng nhất: **đơn giản trước, phức tạp khi
cần** — đừng over-engineer.
</content>
