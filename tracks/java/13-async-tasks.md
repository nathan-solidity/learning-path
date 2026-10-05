---
level: "intermediate"
order: 13
title: "Bất đồng bộ & tác vụ nền"
est: "6-8 giờ"
checklist:
  - "Dùng ExecutorService/ThreadPool và tính được kích thước pool hợp lý"
  - "Hiểu synchronized/volatile/AtomicXxx và dùng ConcurrentHashMap khi cần"
  - "Chạy song song và xử lý timeout bằng CompletableFuture"
  - "Giải thích Virtual Thread (Java 21) khác thread thường thế nào và khi nào dùng"
  - "Dùng @Async và @Scheduled đúng cách, chống chạy trùng khi scale nhiều instance"
  - "Áp dụng idempotency & retry (Spring Retry) với exponential backoff"
---

## Thread & ExecutorService

Đừng tự `new Thread()` rải rác — dùng **thread pool** qua `ExecutorService` để tái dùng và
kiểm soát số thread:

```java
ExecutorService pool = Executors.newFixedThreadPool(4);

Future<Integer> future = pool.submit(() -> heavyCompute());   // chạy nền
Integer result = future.get();     // chờ & lấy kết quả (blocking)

pool.shutdown();                   // đóng pool khi xong
```

**Kích thước pool** tùy loại tác vụ:

| Loại tác vụ | Công thức gợi ý |
|-------------|-----------------|
| CPU-bound (tính toán) | ≈ số core (`Runtime.getRuntime().availableProcessors()`) |
| IO-bound (gọi API/DB) | nhiều hơn số core (chờ IO nhiều), cần đo thực tế |

> Pool quá nhỏ → nghẽn; quá lớn → tốn RAM, context-switch nhiều. **Đo** rồi chỉnh, đừng
> đoán. Với IO-bound trên Java 21, cân nhắc **virtual thread** (bên dưới).

## Đồng bộ hoá — synchronized, volatile, Atomic

Nhiều thread cùng sửa 1 dữ liệu → **race condition**. Các công cụ:

```java
// synchronized — 1 thread vào block tại 1 thời điểm
private final Object lock = new Object();
synchronized (lock) { balance += amount; }

// volatile — đảm bảo thread thấy giá trị mới nhất (visibility), KHÔNG đảm bảo atomic
private volatile boolean running = true;

// AtomicXxx — thao tác nguyên tử không cần lock, nhanh
AtomicInteger counter = new AtomicInteger();
counter.incrementAndGet();       // an toàn đa thread

// ConcurrentHashMap — Map an toàn đa thread, không lock cả bảng
Map<String, Integer> map = new ConcurrentHashMap<>();
map.merge("key", 1, Integer::sum);
```

> **Cạm bẫy `volatile`**: nó chỉ đảm bảo *nhìn thấy giá trị mới*, KHÔNG đảm bảo `count++`
> nguyên tử (đọc-tăng-ghi là 3 bước). Muốn đếm an toàn dùng `AtomicInteger`, không phải
> `volatile int`.

## CompletableFuture — song song & timeout

```java
CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> callServiceA());
CompletableFuture<String> b = CompletableFuture.supplyAsync(() -> callServiceB());

// Chạy 2 việc SONG SONG rồi gộp kết quả
CompletableFuture<String> combined = a.thenCombine(b, (x, y) -> x + y);

String result = combined
    .orTimeout(3, TimeUnit.SECONDS)          // timeout 3s
    .exceptionally(ex -> "fallback")          // xử lý lỗi/timeout
    .join();
```

`thenApply` (biến đổi kết quả), `thenCompose` (nối future khác), `allOf`/`anyOf` (chờ
nhiều). Dùng khi cần gọi nhiều service độc lập cùng lúc thay vì tuần tự.

## Virtual Thread (Java 21)

Thread thường ("platform thread") ánh xạ 1-1 với thread hệ điều hành → tốn RAM (~1MB/thread),
không tạo được hàng triệu. **Virtual thread** rất nhẹ, JVM quản lý, tạo được hàng triệu — lý
tưởng cho tác vụ **IO-bound** (chờ DB/API).

```java
// Mỗi task một virtual thread — thoải mái vì rất nhẹ
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var task : tasks) {
        executor.submit(() -> callExternalApi(task));
    }
}
```

```yaml
# Spring Boot 3.2+ — bật virtual thread cho web request
spring:
  threads:
    virtual:
      enabled: true
```

| | Platform thread | Virtual thread |
|---|---|---|
| Chi phí | Nặng (~1MB) | Rất nhẹ (~vài KB) |
| Số lượng | Hàng nghìn | Hàng triệu |
| Hợp cho | CPU-bound | **IO-bound** (chờ nhiều) |

> Virtual thread **không** làm CPU-bound nhanh hơn (vẫn giới hạn số core). Nó giải bài toán
> "nhiều request đang chờ IO cùng lúc". Đừng pool virtual thread — tạo mới mỗi task.

## @Async trong Spring

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        var ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(4); ex.setMaxPoolSize(8); ex.setQueueCapacity(100);
        ex.initialize();
        return ex;
    }
}

@Service
public class NotificationService {
    @Async("taskExecutor")                     // chạy nền, không chặn caller
    public void sendEmail(String to) { ... }
}
```

> **Cạm bẫy `@Async`**: gọi method `@Async` **từ chính class đó** sẽ KHÔNG chạy async (proxy
> bị bỏ qua). Phải gọi qua bean khác. Và dùng **TaskExecutor riêng**, đừng để chạy trên pool
> mặc định không giới hạn.

## @Scheduled & chống chạy trùng khi scale

```java
@Scheduled(cron = "0 0 2 * * *")     // 2h sáng mỗi ngày (giây phút giờ ngày tháng thứ)
public void cleanupOldData() { ... }

@Scheduled(fixedRate = 60_000)        // mỗi 60 giây
public void heartbeat() { ... }
```

> **Cạm bẫy khi scale nhiều instance**: mỗi instance đều chạy job → job chạy N lần! Giải
> pháp: **ShedLock** (khoá phân tán qua DB/Redis) để chỉ 1 instance chạy tại 1 thời điểm.

```java
@Scheduled(cron = "0 0 2 * * *")
@SchedulerLock(name = "cleanupOldData", lockAtMostFor = "10m")
public void cleanupOldData() { ... }
```

## Event & idempotency & retry

`ApplicationEvent` để tách rời (publish sự kiện, listener xử lý):

```java
publisher.publishEvent(new OrderCreatedEvent(order.getId()));

@TransactionalEventListener(phase = AFTER_COMMIT)   // chỉ chạy sau khi transaction commit
public void onOrderCreated(OrderCreatedEvent e) { sendConfirmation(e.orderId()); }
```

> `@TransactionalEventListener(AFTER_COMMIT)` đảm bảo không gửi email khi transaction bị
> rollback — tránh "gửi mail xác nhận cho đơn không tồn tại".

**Idempotency** (chạy nhiều lần cho kết quả như 1 lần) + **retry** cho tác vụ có thể lỗi tạm:

```java
@Retryable(retryFor = ApiException.class, maxAttempts = 3,
           backoff = @Backoff(delay = 1000, multiplier = 2))   // 1s, 2s, 4s
public void callFlakyApi() { ... }

@Recover
public void recover(ApiException e) { log.error("Hết lượt retry", e); }
```

Idempotency key (vd id đơn hàng) chống xử lý trùng khi retry hoặc message tới 2 lần.

## Cạm bẫy hay gặp

- **`volatile` cho bộ đếm** → không nguyên tử. Dùng `AtomicInteger`.
- **Gọi `@Async` trong cùng class** → chạy đồng bộ (proxy bỏ qua). Gọi qua bean khác.
- **`@Scheduled` khi scale N instance** → chạy N lần. Dùng ShedLock.
- **Gửi email/notification trong transaction** rồi rollback → đã gửi nhầm. Dùng
  `@TransactionalEventListener(AFTER_COMMIT)`.
- **Không shutdown ExecutorService** → rò thread, app không tắt được.
- **Pool virtual thread** → sai mục đích; tạo mới mỗi task.

## Ghi nhớ

Dùng **thread pool** (ExecutorService/TaskExecutor), không `new Thread` bừa. Đếm an toàn bằng
**Atomic**, map an toàn bằng **ConcurrentHashMap**. **Virtual thread** (Java 21) cho IO-bound
số lượng lớn. Nhớ 2 cạm bẫy vận hành: **`@Async` self-invocation** và **`@Scheduled` chạy
trùng khi scale** (ShedLock). Tác vụ nền có side-effect → gắn `AFTER_COMMIT` + idempotency +
retry.
