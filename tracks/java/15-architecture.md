---
level: "advanced"
order: 15
title: "Kiến trúc hệ thống"
est: "5-6 giờ"
checklist:
  - "Vẽ được sơ đồ Clean/Hexagonal cho một service và chỉ ra hướng phụ thuộc vào trong"
  - "Phân biệt entity, value object, aggregate, repository và biết đặt ranh giới aggregate"
  - "Quyết định modular monolith hay microservices dựa trên tiêu chí, không theo trend"
  - "Thiết kế REST API chuẩn: versioning, pagination, error contract thống nhất"
  - "Chọn được REST / gRPC / GraphQL đúng ngữ cảnh và giải thích đánh đổi"
  - "Viết migration DB thêm cột/đổi cột theo hướng zero-downtime"
related:
  - "skill:nta-diagram-gen"
  - "skill:nta-api-design-review"
---

## Hướng phụ thuộc — trái tim của Clean/Hexagonal

Vấn đề của layered kiểu cũ: business logic phụ thuộc vào JPA, vào framework, vào DB. Đổi
DB hay đổi framework là đụng vào cả tầng nghiệp vụ. **Clean Architecture / Hexagonal
(port & adapter)** đảo ngược điều đó: mọi phụ thuộc **hướng vào trong**, tầng domain
không biết gì về thế giới bên ngoài.

```
   [Web Controller]  [Kafka Listener]  [Scheduler]   ← adapters (driving)
            \              |              /
             v            v             v
              ┌─────────────────────────┐
              │   Application (use case) │  ← orchestrate, không có tech
              │   ┌───────────────────┐  │
              │   │   Domain (core)   │  │  ← entity, rule, value object
              │   └───────────────────┘  │
              └─────────────────────────┘
             ^            ^             ^
            /             |              \
   [JPA Repository]  [REST Client]  [S3 Adapter]      ← adapters (driven)
```

Domain định nghĩa **port** (interface), adapter ngoài **implement** nó:

```java
// domain/port — do domain sở hữu, không import gì của Spring/JPA
public interface OrderRepository {
    Optional<Order> findById(OrderId id);
    void save(Order order);
}

// adapter/persistence — implement port, ở đây mới có JPA
@Repository
class JpaOrderRepository implements OrderRepository {
    private final OrderJpaEntityRepository jpa; // Spring Data
    // map giữa Order (domain) và OrderJpaEntity (persistence) ở đây
}
```

> **Cạm bẫy**: dùng thẳng `@Entity` JPA làm domain entity. Nó kéo lazy-loading, dirty
> checking, annotation persistence vào tận core. Với hệ nhỏ chấp nhận được; hệ lớn nên
> tách entity domain và entity persistence, map thủ công.

## DDD ở mức đủ dùng

| Khái niệm | Là gì | Ví dụ |
|-----------|-------|-------|
| Entity | Có identity, sống theo thời gian | `Order` (có `orderId`) |
| Value Object | Không identity, so sánh theo giá trị, immutable | `Money`, `Address` |
| Aggregate | Cụm object có 1 root, giao dịch nhất quán qua root | `Order` + `OrderLine` |
| Repository | Cổng lưu/lấy **aggregate root** | `OrderRepository` |
| Bounded Context | Ranh giới nơi 1 model có nghĩa nhất quán | "Sales" vs "Billing" |

`Money` là value object điển hình — dùng nó thay vì `BigDecimal` trần để tránh trộn lẫn
đơn vị tiền:

```java
public record Money(BigDecimal amount, Currency currency) {
    public Money {
        if (amount.scale() > currency.getDefaultFractionDigits())
            throw new IllegalArgumentException("scale không hợp lệ");
    }
    public Money add(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalStateException("khác loại tiền");
        return new Money(amount.add(other.amount), currency);
    }
}
```

**Ranh giới aggregate** là quyết định khó nhất: aggregate quá to → khóa nhiều dòng, contention
cao; quá nhỏ → không giữ được invariant. Nguyên tắc: **một transaction chỉ sửa một
aggregate**, aggregate khác tham chiếu nhau qua **id**, không qua object reference.

## Modular monolith hay microservices?

Đây là bẫy tốn tiền nhất của offshore: khách nói "microservices cho hiện đại" rồi team
3 người ôm 8 service, mỗi deploy là một cơn ác mộng.

| Tiêu chí | Nghiêng monolith | Nghiêng microservices |
|----------|-----------------|----------------------|
| Quy mô team | 1-2 team nhỏ | Nhiều team độc lập |
| Ranh giới nghiệp vụ | Chưa rõ, còn thay đổi | Đã ổn định, tách bạch |
| Scale | Toàn app cùng mức tải | Từng phần tải rất khác nhau |
| Vận hành | Chưa có CI/CD, observability mạnh | Đã có K8s, tracing, on-call |

> **Cạm bẫy**: chọn microservices **trước khi** hiểu domain. Bạn sẽ đặt sai ranh giới,
> rồi mọi thay đổi cắt ngang nhiều service — "distributed monolith", tệ hơn cả monolith.
> Lời khuyên thực chiến: **bắt đầu bằng modular monolith** (module tách rõ, phụ thuộc một
> chiều), khi nào một module thực sự cần scale/deploy riêng thì mới tách ra.

Modular monolith = 1 deploy nhưng module có ranh giới cứng (Maven module riêng, package
`sales` không được import `billing.internal`). Tách service sau này rẻ vì ranh giới đã có.

## REST API — hợp đồng phải nhất quán

```
GET    /api/v1/orders?page=0&size=20&sort=createdAt,desc
POST   /api/v1/orders
GET    /api/v1/orders/{id}
PATCH  /api/v1/orders/{id}
```

Nguyên tắc:
- **Versioning** qua path (`/v1/`) — đơn giản, dễ route ở gateway. Chỉ tăng major khi
  breaking change.
- **Pagination** trả metadata, đừng trả mảng trần:

```json
{
  "content": [ /* ... */ ],
  "page": 0, "size": 20, "totalElements": 137, "totalPages": 7
}
```

- **Error contract thống nhất** — dùng `RFC 7807 Problem Details` (Spring Boot 3 hỗ trợ sẵn):

```java
@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail handle(OrderNotFoundException ex) {
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setType(URI.create("https://api.example.com/errors/order-not-found"));
        pd.setProperty("orderId", ex.getOrderId());
        return pd;
    }
}
```

Client parse **một** format lỗi cho mọi endpoint, không phải mỗi API một kiểu.

## gRPC & GraphQL — khi nào hợp hơn REST

| Giao thức | Hợp khi | Đánh đổi |
|-----------|---------|----------|
| REST/JSON | API public, CRUD, cần cache HTTP, debug dễ | Payload lớn, over/under-fetch |
| gRPC | Service-to-service nội bộ, latency thấp, streaming | Khó debug bằng browser, cần proto |
| GraphQL | Client cần lấy chính xác field, nhiều màn hình khác nhau | Phức tạp caching, N+1 ở resolver, phân quyền field khó |

Thực chiến: **REST cho public + BFF**, **gRPC giữa các service nội bộ**, **GraphQL khi
frontend phức tạp** (nhiều loại client cần data shape khác nhau). Đừng dùng GraphQL chỉ
vì "nghe hay" — nó chuyển gánh nặng phức tạp từ client sang server.

## Thiết kế DB & migration zero-downtime

Với app đang chạy production, migration **không được khóa bảng lâu** và phải tương thích
với cả code cũ lẫn code mới trong lúc deploy rolling. Đổi tên/xóa cột trực tiếp = downtime.

Quy tắc **expand → migrate → contract** (ví dụ đổi `name` thành `full_name`):

```sql
-- Bước 1 (expand): thêm cột mới, KHÔNG đụng cột cũ. Code cũ vẫn chạy.
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Bước 2 (migrate): backfill theo batch, tránh 1 UPDATE khổng lồ khóa bảng
UPDATE users SET full_name = name WHERE full_name IS NULL LIMIT 5000; -- lặp

-- Deploy code ghi cả 2 cột, đọc cột mới.

-- Bước 3 (contract): sau khi mọi instance đã lên bản mới, mới drop cột cũ
ALTER TABLE users DROP COLUMN name;
```

Về **normalization**: chuẩn hóa (3NF) để tránh dữ liệu trùng lặp/anomaly; chỉ
denormalize có chủ đích khi đo được vấn đề đọc, và chấp nhận trách nhiệm đồng bộ.

## Multi-tenancy — schema hay discriminator column

| Cách | Ưu | Nhược |
|------|----|-------|
| Discriminator column (`tenant_id` mỗi bảng) | Đơn giản, 1 schema, rẻ | Rò rỉ nếu quên filter; khó isolate |
| Schema riêng mỗi tenant | Cách ly tốt, backup riêng | Migration nhân số schema; nặng vận hành |
| Database riêng mỗi tenant | Cách ly mạnh nhất, cho khách lớn | Chi phí và vận hành cao nhất |

> **Cạm bẫy**: dùng discriminator column mà quên filter `tenant_id` ở **một** query →
> tenant A thấy dữ liệu tenant B. Ép filter ở tầng chung (Hibernate `@Filter` bật global,
> hoặc row-level security của Postgres), đừng tin từng query nhớ tự thêm.

## Cạm bẫy hay gặp

- Dùng `@Entity` JPA làm domain model → tech leak vào core, khó test thuần.
- Chọn microservices trước khi hiểu domain → distributed monolith, tách sai ranh giới.
- Aggregate quá to → lock contention; tham chiếu aggregate khác bằng object thay vì id.
- Mỗi endpoint một format lỗi khác nhau → client khổ. Thống nhất `ProblemDetail`.
- `ALTER TABLE ... DROP/RENAME COLUMN` thẳng trên production → downtime. Dùng expand/contract.
- Multi-tenant discriminator mà quên filter `tenant_id` → rò rỉ dữ liệu chéo tenant.

## Ghi nhớ

Kiến trúc tốt là kiến trúc **hoãn quyết định tốn kém** lại được: hướng phụ thuộc vào trong
để đổi tech không đụng nghiệp vụ, modular monolith để tách service khi thực sự cần chứ
không phải khi vừa nghe trend. Dùng `/nta-diagram-gen` để vẽ ranh giới context/service
trước khi code, và `/nta-api-design-review` soi lại hợp đồng API cho nhất quán.
