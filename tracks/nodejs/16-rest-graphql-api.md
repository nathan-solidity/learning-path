---
level: "nestjs-architecture"
order: 16
title: "REST nâng cao & GraphQL"
est: "5-6 giờ"
checklist:
  - "Thiết kế REST endpoint theo chuẩn: danh từ số nhiều, method đúng nghĩa, status đúng"
  - "Làm versioning API (v1/v2) và phân trang/lọc nhất quán"
  - "Dùng guard và interceptor trong NestJS (auth, transform response, logging)"
  - "Sinh tài liệu API tự động bằng Swagger/OpenAPI"
  - "Giải thích được khi nào chọn GraphQL thay vì REST (và ngược lại)"
  - "Viết được một GraphQL resolver cơ bản trong NestJS"
related:
  - "glossary:graphql"
---

## REST cho đúng chuẩn

REST không chỉ là "trả JSON". Endpoint tốt tuân theo quy ước để client đoán được:

```
GET    /api/v1/posts           # danh sách (danh từ SỐ NHIỀU)
GET    /api/v1/posts/:id       # một tài nguyên
POST   /api/v1/posts           # tạo → 201
PATCH  /api/v1/posts/:id       # sửa một phần → 200
DELETE /api/v1/posts/:id       # xóa → 204
GET    /api/v1/posts/:id/comments   # tài nguyên lồng nhau
```

| Nguyên tắc | Đúng | Sai |
|-----------|------|-----|
| Danh từ số nhiều | `/posts` | `/getPost`, `/post` |
| Method mang nghĩa | `DELETE /posts/1` | `GET /deletePost?id=1` |
| Filter qua query | `/posts?status=published&page=2` | `/publishedPosts` |
| Versioning | `/api/v1/...` | Đổi breaking không version |

> Đừng nhét động từ vào URL (`/createPost`). HTTP method **là** động từ.

## Guard & Interceptor trong NestJS

NestJS tách các mối quan tâm chéo (auth, log, transform) thành **guard** và **interceptor**
— sạch hơn middleware Express dồn một chỗ:

```typescript
// Guard: quyết định CHO PHÉP request đi tiếp hay không (auth, role)
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    return Boolean(req.headers.authorization);   // đơn giản hóa; thực tế verify JWT
  }
}

@Get("secret")
@UseGuards(JwtAuthGuard)          // gắn guard cho route
getSecret() { return { ok: true }; }
```

```typescript
// Interceptor: bọc trước/sau handler (transform response, đo thời gian, log)
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => ({ data, timestamp: Date.now() })));
  }
}
```

| Cơ chế | Việc | Chạy khi |
|--------|------|----------|
| Guard | Cho/chặn request (auth, role) | Trước handler |
| Interceptor | Bọc, biến đổi response, log | Trước & sau handler |
| Pipe | Validate/transform input (DTO) | Trước handler, trên tham số |

## Tài liệu tự động với Swagger

```typescript
// main.ts
const config = new DocumentBuilder().setTitle("My API").setVersion("1.0").build();
const doc = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("docs", app, doc);        // mở /docs xem UI tương tác
```

Thêm decorator `@ApiProperty()` vào DTO → Swagger sinh tài liệu + form thử API ngay trên
trình duyệt.

## Khi nào GraphQL, khi nào REST

| | REST | GraphQL |
|---|------|---------|
| Lấy dữ liệu | Nhiều endpoint cố định | Một endpoint, client chọn field |
| Over/under-fetching | Hay bị (trả thừa/thiếu) | Client lấy đúng cái cần |
| Caching HTTP | Dễ (theo URL) | Khó hơn |
| Độ phức tạp | Thấp | Cao hơn (schema, resolver) |
| Hợp khi | API công khai, CRUD đơn giản | Client đa dạng, dữ liệu quan hệ sâu (mobile) |

> Đừng theo trend. GraphQL giải quyết over-fetching cho client phức tạp (nhiều loại app
> dùng chung API), nhưng thêm chi phí. Đa số API nội bộ/CRUD thì REST là đủ và đơn giản hơn.

## GraphQL resolver cơ bản (NestJS)

```typescript
@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post])                 // truy vấn: posts
  posts() { return this.postsService.findAll(); }

  @Mutation(() => Post)                // thay đổi: createPost
  createPost(@Args("input") input: CreatePostInput) {
    return this.postsService.create(input);
  }
}
```

Client tự chọn field cần: `{ posts { id title } }` → chỉ trả `id` và `title`.

## Cạm bẫy hay gặp

- Nhét động từ vào URL REST (`/getPosts`) → không đúng chuẩn, client khó đoán.
- Đổi API phá vỡ tương thích mà không version → client cũ sập.
- Dùng GraphQL vì "hot" cho API CRUD đơn giản → phức tạp thừa.
- GraphQL không giới hạn độ sâu query → client hỏi lồng vô tận, tấn công DoS.
- Không tài liệu hóa API → mỗi lần frontend cần là phải hỏi; dùng Swagger tự sinh.

## Ghi nhớ

REST: danh từ số nhiều, method mang nghĩa, status đúng, có version + phân trang. NestJS
tách concern bằng **guard** (auth), **interceptor** (transform/log), **pipe** (validate).
Tài liệu tự sinh bằng Swagger. GraphQL mạnh cho client phức tạp nhưng đắt hơn — chọn theo
nhu cầu thật, không theo trend.
</content>
