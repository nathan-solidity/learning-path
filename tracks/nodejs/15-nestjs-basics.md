---
level: "nestjs-architecture"
order: 15
title: "NestJS: module, controller, provider & DI"
est: "6-7 giờ"
checklist:
  - "Tạo được app NestJS và giải thích vai trò module/controller/provider"
  - "Hiểu Dependency Injection: khai báo service và inject vào controller qua constructor"
  - "Định nghĩa được controller với decorator route (@Get, @Post, @Param, @Body)"
  - "Validate request bằng DTO + class-validator (ValidationPipe)"
  - "Tổ chức code theo feature module (mỗi tính năng một module)"
  - "Giải thích được khác biệt tư duy giữa Express (tự lắp) và NestJS (có khung)"
related:
  - "glossary:dependency-injection"
---

## Vì sao chuyển sang NestJS

Express cho tự do tối đa — nhưng dự án lớn với nhiều người thì "tự do" thành "mỗi người một
kiểu". **NestJS** áp một khung có sẵn (module, DI, decorator) giống **Spring Boot** (Java)
hay Angular: cấu trúc nhất quán, dễ test, dễ mở rộng. Học Express trước giúp hiểu NestJS
làm gì ngầm bên dưới (nó vẫn dựng trên Express).

## Ba khối cơ bản

```typescript
// posts.controller.ts — nhận request, KHÔNG chứa business logic
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { PostsService } from "./posts.service.js";

@Controller("posts")                          // prefix /posts
export class PostsController {
  constructor(private readonly postsService: PostsService) {}  // DI: Nest tự inject

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.postsService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }
}
```

```typescript
// posts.service.ts — business logic, có thể inject vào nhiều nơi
import { Injectable } from "@nestjs/common";

@Injectable()                                 // đánh dấu là provider (được DI quản lý)
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() { return this.prisma.post.findMany(); }
  findOne(id: number) { return this.prisma.post.findUnique({ where: { id } }); }
  create(dto: CreatePostDto) { return this.prisma.post.create({ data: dto }); }
}
```

```typescript
// posts.module.ts — gom controller + provider của tính năng
import { Module } from "@nestjs/common";

@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```

| Khối | Vai trò | Tương đương Express |
|------|---------|---------------------|
| Controller | Nhận request, trả response | Route handler |
| Provider/Service | Business logic, tái dùng | Hàm/module tự viết |
| Module | Gom nhóm theo tính năng | Cách bạn tự tổ chức thư mục |

## Dependency Injection — điểm cốt lõi

Bạn **không** tự `new PostsService()`. Chỉ khai báo cần nó ở constructor, Nest **tự tạo và
đưa vào** (inject):

```typescript
constructor(private readonly postsService: PostsService) {}
```

Lợi ích: (1) đổi implementation không sửa chỗ dùng, (2) **test dễ** — inject mock thay cho
service thật, (3) Nest quản lý vòng đời (mặc định singleton — một instance dùng chung).

![Dependency Injection trong NestJS: Nest container tạo PostsService (và các phụ thuộc như PrismaService), rồi inject vào constructor của PostsController thay vì controller tự new — tách rời việc tạo và việc dùng](/images/nodejs-nestjs-di.png)

## Validate bằng DTO + class-validator

```typescript
// create-post.dto.ts
import { IsString, IsBoolean, IsOptional, MinLength } from "class-validator";

export class CreatePostDto {
  @IsString() @MinLength(1)
  title!: string;

  @IsString()
  body!: string;

  @IsOptional() @IsBoolean()
  published?: boolean;
}
```

```typescript
// main.ts — bật ValidationPipe toàn cục
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));  // whitelist: bỏ field lạ
```

Giờ body sai kiểu tự trả 400, không cần viết tay như Express. (Zod ở bài 11 là cách tương
đương khi dùng Express thuần.)

## Feature module — tổ chức theo tính năng

```
src/
├── posts/
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   ├── posts.module.ts
│   └── dto/create-post.dto.ts
├── users/          # cùng cấu trúc
├── app.module.ts   # gom các feature module
└── main.ts         # bootstrap
```

> Mỗi tính năng một module tự chứa (controller + service + dto). App lớn thêm module, không
> phình một file. `app.module.ts` chỉ `imports: [PostsModule, UsersModule]`.

## Express vs NestJS — khác tư duy

| | Express | NestJS |
|---|---------|--------|
| Cấu trúc | Tự lắp, tự do | Có khung áp sẵn |
| Business logic | Tùy tổ chức | Tách vào service (DI) |
| Validation | Tự thêm (Zod...) | DTO + Pipe tích hợp |
| Test | Tự setup | DI làm mock dễ |
| Phù hợp | App nhỏ, cần linh hoạt | App lớn, nhiều người, dài hạn |

## Cạm bẫy hay gặp

- Nhồi business logic vào controller → khó test, khó tái dùng; đẩy vào service.
- Tự `new Service()` thay vì để DI → mất lợi ích inject/mock, sai vòng đời.
- Quên đăng ký provider trong `providers: []` → lỗi "can't resolve dependency".
- Quên bật `ValidationPipe` → DTO không được kiểm tra, dữ liệu rác lọt qua.
- Một module khổng lồ chứa mọi thứ → chia theo feature module từ sớm.

## Ghi nhớ

NestJS = khung có sẵn: **controller** nhận request, **service** chứa logic, **module** gom
theo tính năng, **DI** tự lắp phụ thuộc (đừng tự `new`). Validate bằng **DTO +
class-validator**. Tư duy khác Express: đổi từ "tự lắp mọi thứ" sang "điền vào khung" — đổi
lại là cấu trúc nhất quán và test dễ.
</content>
