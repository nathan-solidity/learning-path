---
level: "intermediate"
order: 14
title: "Dự án nhỏ — củng cố Intermediate"
est: "12-16 giờ"
checklist:
  - "Thiết kế schema có quan hệ và tránh được N+1 khi truy vấn danh sách"
  - "Xử lý race condition (đặt hàng/trừ kho) bằng optimistic hoặc pessimistic lock"
  - "Bảo mật API bằng JWT và phân quyền theo ownership"
  - "Tổ chức code layered + map DTO, không để entity lọt ra API"
  - "Chạy tác vụ nền (email/notification) và job dọn dữ liệu định kỳ đúng cách"
  - "Đạt test coverage tầng service >= 70% với test có ý nghĩa"
related:
  - "skill:nta-test-gen"
  - "skill:nta-code-review"
---

## Mục tiêu

Bài này **không có kiến thức mới** — bạn ghép mọi thứ đã học ở Intermediate (JPA nâng cao,
Security, thiết kế code, async) vào **một dự án chạy được**. Đây là bước biến "hiểu lý
thuyết" thành "làm được".

Đề xuất: **Order Service** (hệ thống đặt hàng đơn giản) — đủ nhỏ để hoàn thành, đủ phức tạp
để chạm vào mọi chủ đề Intermediate.

## Phạm vi dự án

```
User ──< Order ──< OrderItem >── Product
                                    │
                                (tồn kho — stock)
```

Chức năng:
- Đăng ký / đăng nhập (JWT).
- Xem danh sách sản phẩm (phân trang, tìm kiếm, lọc).
- Đặt hàng: tạo order gồm nhiều item, **trừ tồn kho**.
- Xem lịch sử đơn của **chính mình** (không xem được đơn người khác).
- Admin: quản lý sản phẩm, xem mọi đơn.
- Gửi email xác nhận đơn (nền), job dọn đơn "pending" quá hạn (định kỳ).

## Áp dụng từng chủ đề Intermediate

**JPA nâng cao — tránh N+1**
Khi list order kèm item, dùng `@EntityGraph` hoặc fetch join để không bắn N+1:
```java
@EntityGraph(attributePaths = {"items", "items.product"})
List<Order> findByUserId(Long userId);
```
Trả về **DTO/projection**, không trả entity thô.

**Race condition — trừ kho an toàn**
Hai người mua sản phẩm cuối cùng cùng lúc → có thể bán âm kho. Xử lý:
```java
// Optimistic lock: @Version trên Product, retry khi OptimisticLockException
@Version private Long version;

// Hoặc pessimistic khi tranh chấp cao
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
Product findForUpdate(@Param("id") Long id);
```
Bọc toàn bộ thao tác đặt hàng trong `@Transactional` để trừ kho + tạo order là **một khối**.

**Security — JWT + ownership**
```java
@GetMapping("/api/orders/{id}")
@PreAuthorize("@orderSecurity.isOwner(#id, authentication.name) or hasRole('ADMIN')")
public OrderResponse get(@PathVariable Long id) { ... }
```
Không để user A xem đơn user B (IDOR).

**Thiết kế code**
- Layered: Controller → Service → Repository, phụ thuộc 1 chiều.
- MapStruct map Order/Product ↔ DTO.
- Mã lỗi nghiệp vụ thống nhất (`OUT_OF_STOCK`, `ORDER_NOT_FOUND`) qua
  `@RestControllerAdvice`.

**Async & scheduled**
```java
@TransactionalEventListener(phase = AFTER_COMMIT)
public void onOrderCreated(OrderCreatedEvent e) {
    emailService.sendConfirmation(e.orderId());   // gửi nền, chỉ sau khi commit
}

@Scheduled(cron = "0 */30 * * * *")
@SchedulerLock(name = "cancelStaleOrders")        // ShedLock chống chạy trùng
public void cancelStaleOrders() { ... }
```

## Tiêu chí "dự án đạt yêu cầu"

Coi như xong Intermediate khi:

- [ ] Đặt hàng đồng thời **không bán âm kho** (test bằng nhiều request song song).
- [ ] List đơn + item **không phát sinh N+1** (kiểm bằng `show-sql` / log SQL count).
- [ ] User **không truy cập được** dữ liệu người khác (test 403/404 cho IDOR).
- [ ] Không có entity nào lọt ra response JSON (chỉ DTO).
- [ ] Email xác nhận **không gửi** khi transaction rollback.
- [ ] Job định kỳ chạy **1 lần** dù deploy nhiều instance.
- [ ] Test tầng service coverage ≥ 70%, gồm cả case lỗi (hết hàng, không quyền).

## Cạm bẫy hay gặp

- **Trừ kho ngoài transaction** hoặc không lock → oversell khi tải cao.
- **List kèm quan hệ mà quên fetch join** → N+1 làm chậm khi dữ liệu lớn.
- **Kiểm tra quyền chỉ "đã đăng nhập"** → quên ownership.
- **Gửi email trong transaction** → gửi cả khi rollback.
- **Test chỉ happy path** → bỏ sót case hết hàng / trùng / không quyền (chính là chỗ hay
  vỡ ở production).

## Ghi nhớ

Dự án này là "bài thi thực hành" Intermediate. Nếu bạn xử lý được **race condition khi trừ
kho**, **tránh N+1**, **chặn IDOR**, và **tác vụ nền an toàn** — bạn đã đủ trình làm feature
thật trong dự án production. Xong bài này, sang Advanced để học cách hệ thống lớn được thiết
kế và vận hành.
