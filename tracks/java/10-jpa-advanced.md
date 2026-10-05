---
level: "intermediate"
order: 10
title: "JPA / Hibernate nâng cao"
est: "8-10 giờ"
checklist:
  - "Giải thích được entity lifecycle: transient, managed, detached, removed"
  - "Nhận ra LazyInitializationException và biết ít nhất 2 cách xử lý đúng"
  - "Phát hiện N+1 query từ log SQL và fix bằng fetch join hoặc @EntityGraph"
  - "Viết được projection/DTO query để không load cả entity khi chỉ cần vài cột"
  - "Chọn đúng giữa optimistic lock (@Version) và pessimistic lock cho race condition"
  - "Cấu hình được batch insert và giải thích được HikariCP pool sizing"
  - "Thêm được index và đọc EXPLAIN để xác nhận query dùng index"
related:
  - "skill:nta-perf-audit"
  - "skill:nta-db-review"
---

## Vì sao JPA nâng cao quan trọng

Với CRUD cơ bản, `findAll()` và `save()` là đủ. Nhưng app thật có **quan hệ nhiều bảng**
và **dữ liệu lớn** — lúc đó JPA/Hibernate lộ ra vô số cạm bẫy hiệu năng. Phần này là ranh
giới giữa "dev biết dùng JPA" và "dev viết JPA làm sập production". Trọng tâm là **N+1
query** — bug hiệu năng phổ biến nhất khi làm việc với ORM.

## Persistence Context & entity lifecycle

Persistence Context là "vùng nhớ" của một `EntityManager` (thường gắn với một transaction).
Mọi entity nằm trong đó được Hibernate **theo dõi** (dirty checking) — sửa field là tự
sinh UPDATE khi flush, không cần gọi `save()`.

| Trạng thái | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| **transient** | Mới `new`, chưa biết tới DB | `new User()` |
| **managed** | Đang được persistence context theo dõi | vừa `save()` hoặc `findById()` trong transaction |
| **detached** | Từng managed, giờ context đã đóng | entity trả ra ngoài `@Transactional` |
| **removed** | Đánh dấu xoá, chờ flush | vừa gọi `delete()` |

```java
@Transactional
public void demo() {
    User u = new User("an@x.com");   // transient
    userRepository.save(u);          // managed — được theo dõi
    u.setName("An");                 // KHÔNG cần save() lại: dirty checking tự UPDATE
}                                    // hết transaction → flush → detached
```

![Vòng đời entity JPA: transient → (persist) managed → (transaction đóng) detached → (merge) managed; managed → (remove) removed → flush DELETE](/images/java-jpa-lifecycle.png)

> **Cạm bẫy dirty checking**: nhiều người gọi `save()` sau khi sửa entity managed vì
> "cho chắc". Không sai, nhưng hiểu rằng UPDATE xảy ra do dirty checking, không phải do
> `save()`. Ngược lại, sửa một entity **detached** thì không có gì xảy ra cho tới khi bạn
> `merge()` nó lại.

## Lazy vs Eager & LazyInitializationException

Quan hệ `@OneToMany`/`@ManyToMany` mặc định **LAZY** (chỉ load khi truy cập),
`@ManyToOne`/`@OneToOne` mặc định **EAGER**. Nên để **tất cả LAZY** và load rõ ràng khi
cần — EAGER dễ kéo theo cả cây dữ liệu ngoài ý muốn.

```java
@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)   // ép LAZY, đừng để EAGER mặc định
    private Customer customer;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();
}
```

Vấn đề kinh điển: truy cập quan hệ LAZY **sau khi** transaction đã đóng:

```java
Order order = orderService.findById(1L);   // @Transactional kết thúc ở đây
order.getItems().size();                    // 💥 LazyInitializationException
```

Cách xử lý đúng (theo thứ tự ưu tiên):
1. **Load sẵn dữ liệu cần** trong transaction bằng fetch join / `@EntityGraph` (xem dưới).
2. **Trả DTO** ra ngoài, không trả entity — buộc phải quyết định cần field nào.
3. Giữ transaction mở đủ lâu (`@Transactional` ở tầng service bao trọn logic).

> **Đừng** dùng `spring.jpa.open-in-view=true` (Spring bật mặc định) để "chữa" lỗi này.
> Nó giữ session mở tới tận view, che giấu N+1 và giữ connection lâu. Nên tắt:
> `spring.jpa.open-in-view=false`.

## N+1 query — phần quan trọng nhất

Đoạn này trông vô hại nhưng là **thảm hoạ hiệu năng**:

```java
List<Order> orders = orderRepository.findAll();   // 1 query lấy orders
for (Order o : orders) {
    System.out.println(o.getCustomer().getName()); // mỗi vòng = 1 query lấy customer
}
```

Với 100 order → 1 query orders + 100 query customer = **101 query**. Bật log SQL để thấy:

```properties
# application.properties — bật lúc dev để soi query
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
```

Log sẽ đầy dòng `select ... from customer where id=?` lặp lại — dấu hiệu N+1 rõ nhất.

**Cách fix 1 — fetch join trong JPQL** (1 query duy nhất):

```java
@Query("SELECT o FROM Order o JOIN FETCH o.customer WHERE o.status = :status")
List<Order> findByStatusWithCustomer(@Param("status") OrderStatus status);
```

**Cách fix 2 — @EntityGraph** (khai báo, không cần viết JPQL):

```java
@EntityGraph(attributePaths = {"customer", "items"})
List<Order> findByStatus(OrderStatus status);
```

| Cách | Khi dùng | Lưu ý |
|------|----------|-------|
| `JOIN FETCH` | Cần kiểm soát query, filter phức tạp | Không phân trang được nhiều collection cùng lúc |
| `@EntityGraph` | Muốn khai báo gọn, tái dùng | Dựa trên method name của Spring Data |
| `@BatchSize(size=n)` | Không tránh được lazy, gom lại | Biến N query thành N/n query (đỡ, không hết) |

> **Cạm bẫy MultipleBagFetchException**: `JOIN FETCH` **hai** collection kiểu `List` cùng
> lúc sẽ lỗi. Giải pháp: đổi `List` thành `Set`, hoặc fetch từng collection ở query riêng.

## Cascade, orphanRemoval, mappedBy

```java
@OneToMany(mappedBy = "order",           // "order" = tên field ở phía OrderItem
           cascade = CascadeType.ALL,     // lưu/xoá Order → lan sang items
           orphanRemoval = true)          // gỡ item khỏi list → DELETE item đó
private List<OrderItem> items = new ArrayList<>();
```

- `mappedBy` chỉ ra **bên nào giữ FK** (bên kia là chủ quan hệ). Thiếu nó → Hibernate tạo
  bảng join thừa hoặc cột lạ.
- `cascade = ALL` lan mọi thao tác. Cẩn thận với `REMOVE` — xoá cha xoá luôn con.
- `orphanRemoval = true` khác cascade: xoá con khi con bị **tách khỏi** cha, kể cả không
  xoá cha.

## Query: JPQL, Criteria, Specification, native

| Kiểu | Khi dùng |
|------|----------|
| **Derived query** (`findByStatusAndCustomerId`) | Query đơn giản, đọc từ tên method |
| **JPQL** (`@Query`) | Query vừa, viết theo entity không theo bảng |
| **Criteria / Specification** | Query **động** (filter tuỳ chọn, search form nhiều điều kiện) |
| **Native query** | Cần đặc thù DB (window function, CTE, hint) mà JPQL không diễn đạt được |

```java
// Specification — ghép điều kiện động
public static Specification<Order> hasStatus(OrderStatus s) {
    return (root, query, cb) -> s == null ? null : cb.equal(root.get("status"), s);
}
// dùng: orderRepository.findAll(hasStatus(status).and(createdAfter(date)));
```

## Projection / DTO query — đừng load cả entity

Khi chỉ cần vài cột (vd danh sách hiển thị), load cả entity là lãng phí. Dùng **DTO
projection**:

```java
public record OrderSummary(Long id, String customerName, BigDecimal total) {}

@Query("""
    SELECT new com.app.dto.OrderSummary(o.id, o.customer.name, o.total)
    FROM Order o WHERE o.status = :status
    """)
List<OrderSummary> findSummaries(@Param("status") OrderStatus status);
```

Query này chỉ SELECT đúng 3 cột, không kích hoạt lazy loading, không cần `@Transactional`
để đọc quan hệ. Đây cũng là cách **né LazyInitializationException** gọn nhất.

## Transaction: propagation, isolation, readOnly

```java
@Transactional(readOnly = true)          // báo Hibernate không dirty-check → nhanh hơn
public List<OrderSummary> list() { ... }

@Transactional(propagation = Propagation.REQUIRES_NEW)  // luôn mở transaction mới
public void writeAuditLog(...) { ... }
```

- `readOnly = true` cho query thuần đọc: bỏ dirty checking, gợi ý driver tối ưu.
- **Propagation** `REQUIRED` (mặc định) dùng lại transaction đang có; `REQUIRES_NEW` tách
  riêng (vd ghi log audit vẫn commit dù nghiệp vụ chính rollback).
- **Isolation** mặc định theo DB (thường READ_COMMITTED). Nâng lên chỉ khi thật cần —
  càng chặt càng dễ deadlock và giảm throughput.

## Optimistic lock vs Pessimistic lock

Cùng chống **race condition** (2 request sửa 1 record) nhưng hai triết lý khác nhau:

```java
@Entity
public class Product {
    @Id private Long id;
    private int stock;

    @Version                 // Hibernate tự tăng mỗi update, thêm vào WHERE
    private Long version;
}
```

- **Optimistic** (`@Version`): không khoá. Khi UPDATE, Hibernate thêm `WHERE version = ?`.
  Nếu ai đó đã sửa trước → 0 dòng bị update → `OptimisticLockException`, mình retry. Hợp
  với **conflict hiếm** (đa số case).
- **Pessimistic** (`SELECT ... FOR UPDATE`): khoá dòng ngay khi đọc, request khác chờ. Hợp
  với **conflict thường xuyên** (vd trừ tồn kho lúc flash sale).

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
Optional<Product> findByIdForUpdate(@Param("id") Long id);
```

## Batch insert & HikariCP

Insert 10.000 record từng cái = 10.000 round-trip. Gom lại bằng batch:

```properties
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

> Batch **không hoạt động** với `GenerationType.IDENTITY` (vì cần lấy id ngay từng dòng).
> Muốn batch insert thật, dùng `SEQUENCE` hoặc gán id thủ công.

HikariCP là connection pool mặc định của Spring Boot. Pool sizing: pool nhỏ hơn bạn nghĩ.
Công thức tham khảo: `connections ≈ (số core * 2) + số disk`. Đặt 200 connection cho DB
chỉ tổ nghẽn.

```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=30000
```

## Index & EXPLAIN

Cột trong `WHERE`, `JOIN`, `ORDER BY` phải có index, không thì DB **full scan**:

```java
@Entity
@Table(indexes = {
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_customer", columnList = "customer_id")
})
public class Order { ... }
```

Xác nhận query có dùng index bằng `EXPLAIN` (PostgreSQL/MySQL):

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'PAID';
-- Nhìn "Seq Scan" (xấu, full scan) vs "Index Scan" (tốt)
```

## Cache & soft delete / audit

Cache tầng 2 với Redis cho dữ liệu ít đổi:

```java
@Cacheable(value = "products", key = "#id")
public Product findById(Long id) { ... }

@CacheEvict(value = "products", key = "#product.id")   // invalidate khi sửa
public void update(Product product) { ... }
```

Đặt TTL để dữ liệu không cũ mãi (cấu hình ở `RedisCacheConfiguration`). Nhớ **invalidate**
khi ghi — cache sai còn tệ hơn không cache.

Soft delete + audit field dùng chung base class:

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @CreatedDate  private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;
    private boolean deleted = false;   // soft delete: đánh dấu thay vì xoá thật
}
```

Bật `@EnableJpaAuditing` ở class config để `@CreatedDate` tự điền.

## Cạm bẫy hay gặp

- N+1 không lộ khi test với 2-3 record, chỉ bùng khi data thật lớn → **luôn xem log SQL**.
- Trả entity ra API → dính LazyInitializationException hoặc lộ field nhạy cảm. Dùng DTO.
- `cascade = ALL` + `orphanRemoval` vô ý → xoá cha xoá sạch con ngoài mong đợi.
- Batch insert bật config nhưng dùng `IDENTITY` → batch không chạy, vẫn insert từng dòng.
- Cache không invalidate khi ghi → user thấy dữ liệu cũ.
- `open-in-view=true` che giấu N+1 → tắt để lỗi lộ ra lúc dev.

## Ghi nhớ

JPA giúp bạn viết ít SQL, nhưng đổi lại phải hiểu nó sinh SQL thế nào. Mỗi khi lặp qua
một collection và gọi `.getSomething()`, hỏi ngay: "đây có phải N+1 không?". Bật log SQL
khi dev, trả DTO thay vì entity, và dùng `EXPLAIN` để chắc query dùng index. Skill
`/nta-perf-audit` quét được N+1 và slow query trong code.
