---
level: "advanced"
order: 17
title: "Microservices & hạ tầng"
est: "8-10 giờ"
checklist:
  - "Cấu hình API Gateway: routing, rate limit, xác thực tại gateway"
  - "Giải thích service discovery và config server, khi nào cần"
  - "Áp dụng Resilience4j: circuit breaker, retry, bulkhead, timeout"
  - "Thiết lập distributed tracing để lần theo 1 request qua nhiều service"
  - "Dùng Redis cho distributed lock / rate limit / cache"
  - "Biết khi nào KHÔNG nên microservices để tránh over-engineer"
---

## Trước khi microservices: cân nhắc

> **Cảnh báo quan trọng**: microservices giải quyết vấn đề **tổ chức & scale**, nhưng thêm
> rất nhiều phức tạp (network, tracing, distributed transaction, deploy). Với team nhỏ / hệ
> vừa, **modular monolith** thường tốt hơn. Chỉ tách service khi có lý do rõ (team độc lập,
> scale khác nhau, công nghệ khác nhau). Đừng tách vì "nghe hiện đại".

## API Gateway

Cửa ngõ duy nhất cho client, đứng trước các service: routing, rate limit, auth, CORS.

```yaml
# Spring Cloud Gateway
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service        # lb:// = load-balanced qua service discovery
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10    # 10 req/s
                redis-rate-limiter.burstCapacity: 20
```

Xác thực **tại gateway** (verify JWID một lần) rồi truyền context xuống service nội bộ —
service nội bộ không cần lộ ra internet.

## Service discovery & config server

- **Service discovery** (Eureka/Consul, hoặc **Kubernetes Service** nếu chạy K8s): service
  đăng ký tên, bên gọi tìm theo tên thay vì hardcode IP/port.
- **Config server**: cấu hình tập trung, đổi không cần build lại; hỗ trợ refresh runtime.

> Nếu deploy trên **Kubernetes**, K8s Service + ConfigMap/Secret đã lo phần discovery &
> config — không cần Eureka/Config Server riêng. Chọn theo hạ tầng thực tế.

## Resilience4j — chịu lỗi

Service phụ thuộc nhau → 1 service chậm/chết có thể kéo sập dây chuyền (cascading failure).
Resilience4j chống điều đó:

```java
@CircuitBreaker(name = "payment", fallbackMethod = "fallback")
@Retry(name = "payment")
@Bulkhead(name = "payment")
@TimeLimiter(name = "payment")
public CompletableFuture<PaymentResult> charge(Order o) { ... }

public CompletableFuture<PaymentResult> fallback(Order o, Throwable t) {
    return CompletableFuture.completedFuture(PaymentResult.pending());
}
```

| Pattern | Chống điều gì |
|---------|--------------|
| **Circuit breaker** | Service lỗi liên tục → "mở mạch", ngừng gọi tạm, tránh dồn tải lên service đang chết |
| **Retry** | Lỗi tạm thời (mạng chớp nhoáng) → thử lại |
| **Bulkhead** | Cô lập tài nguyên → 1 phần lỗi không ăn hết thread pool của cả app |
| **Timeout** | Không chờ vô hạn service chậm |

## Distributed tracing

Một request đi qua Gateway → Order → Payment → Inventory. Khi lỗi, làm sao biết chỗ nào?
**Trace id** gắn xuyên suốt, mỗi service ghi span.

```
Micrometer Tracing → OpenTelemetry → Jaeger / Zipkin (xem timeline request)
```

Spring Boot 3 + Micrometer tự truyền trace id qua HTTP header và đưa vào log (khi cấu hình
log pattern có `traceId`). Nhìn 1 trace thấy được thời gian từng chặng → tìm bottleneck.

## Distributed transaction

Không có transaction ACID xuyên service (đã học ở bài Message Queue). Dùng **saga +
compensating transaction**. Đừng cố dùng 2-phase commit (XA) — chậm và mong manh trong hệ
phân tán hiện đại.

## Spring Batch — xử lý dữ liệu lớn

Cho job batch (import triệu bản ghi, tính toán định kỳ): mô hình **chunk** reader → processor
→ writer, có restart/skip/retry.

```java
@Bean
public Step step(JobRepository repo, PlatformTransactionManager tm) {
    return new StepBuilder("importStep", repo)
        .<InputRow, OutputRow>chunk(1000, tm)     // xử lý 1000 bản ghi mỗi lần commit
        .reader(csvReader()).processor(processor()).writer(dbWriter())
        .build();
}
```

## Redis nâng cao

Ngoài cache, Redis còn dùng cho:

```java
// Distributed lock — chỉ 1 instance làm việc tại 1 thời điểm (dùng Redisson)
RLock lock = redisson.getLock("order:" + id);
if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
    try { process(); } finally { lock.unlock(); }
}
```

- **Rate limiting**: đếm request/khoảng thời gian bằng Redis (INCR + TTL).
- **Pub/Sub**: broadcast nhẹ giữa các instance (không bền như Kafka).

## Full-text search

DB SQL `LIKE '%kw%'` chậm và không xếp hạng liên quan. Cần tìm kiếm nghiêm túc → dùng
**Elasticsearch / OpenSearch**: đánh index văn bản, hỗ trợ relevance, filter, aggregation.
Đồng bộ dữ liệu DB → ES qua event/CDC (đừng để 2 nguồn lệch nhau).

## Cạm bẫy hay gặp

- **Tách microservices quá sớm** → phức tạp gấp bội mà không lợi. Modular monolith trước.
- **Không có circuit breaker** → 1 service chết kéo sập cả hệ (cascading failure).
- **Retry mọi lỗi** kể cả lỗi nghiệp vụ (4xx) → nhân bản lỗi. Chỉ retry lỗi **tạm thời**.
- **Không có distributed tracing** → debug hệ phân tán như mò kim đáy bể.
- **Distributed lock quên timeout** → deadlock khi instance giữ lock chết.
- **2 nguồn dữ liệu (DB + ES) tự đồng bộ tay** → lệch. Dùng event/CDC.

## Ghi nhớ

Microservices là **quyết định tổ chức**, không phải thời trang kỹ thuật — đừng vội. Khi đã
tách: Gateway làm cửa ngõ, discovery/config tập trung (hoặc để K8s lo), **Resilience4j**
chống sập dây chuyền, **distributed tracing** để nhìn xuyên hệ, và **Redis** cho lock/rate
limit/cache. Transaction phân tán = saga, không XA.
