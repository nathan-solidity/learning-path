---
level: "sql-advanced"
order: 15
title: "Transaction & Window function"
est: "5-6 giờ"
checklist:
  - "Dùng BEGIN/COMMIT/ROLLBACK để nhóm nhiều lệnh thành một đơn vị"
  - "Giải thích được ACID và vì sao transaction quan trọng (chuyển tiền)"
  - "Hiểu mức isolation cơ bản và hiện tượng dirty/phantom read"
  - "Dùng window function ROW_NUMBER/RANK với OVER (PARTITION BY ...)"
  - "Tính running total và so sánh với hàng trước/sau bằng LAG/LEAD"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Hai kỹ thuật "người lớn" của SQL: **transaction** đảm bảo nhiều thao tác **hoặc cùng thành
công, hoặc cùng hủy** (không có trạng thái nửa vời — nền của mọi hệ thống tài chính);
**window function** tính toán qua các hàng liên quan mà **không gộp mất chi tiết** như
`GROUP BY`.

## Transaction — tất cả hoặc không gì cả

```sql
BEGIN;                                        -- bắt đầu transaction
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- trừ tiền A
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- cộng tiền B
COMMIT;                                       -- xác nhận: cả hai cùng lưu
-- Nếu giữa chừng lỗi:
-- ROLLBACK;                                  -- hủy tất cả, quay về trạng thái đầu
```

Không có transaction, nếu server chết sau lệnh 1: tiền **biến mất** (đã trừ A, chưa cộng B).
Transaction đảm bảo điều đó không xảy ra.

## ACID — 4 đảm bảo của transaction

| Chữ | Nghĩa | Ví dụ |
|-----|-------|-------|
| **A**tomicity | Nguyên tử: tất cả hoặc không gì | Trừ + cộng tiền cùng xảy ra hoặc cùng hủy |
| **C**onsistency | Nhất quán: dữ liệu luôn hợp lệ ràng buộc | Tổng tiền không tự sinh/mất |
| **I**solation | Cô lập: transaction song song không giẫm nhau | Hai người rút tiền cùng lúc không lỗi |
| **D**urability | Bền: đã COMMIT là còn, kể cả mất điện | Ghi xuống đĩa an toàn |

## Isolation level — cái giá của song song

Chạy nhiều transaction song song có thể sinh hiện tượng lạ:

- **Dirty read**: đọc dữ liệu transaction khác chưa commit (có thể bị rollback).
- **Non-repeatable read**: đọc cùng hàng 2 lần ra kết quả khác (bị người khác sửa giữa chừng).
- **Phantom read**: chạy lại cùng query, xuất hiện hàng mới.

Mức isolation càng cao (`READ COMMITTED` → `REPEATABLE READ` → `SERIALIZABLE`) càng an toàn
nhưng càng chậm. Mặc định thường là `READ COMMITTED` (Postgres) — đủ cho phần lớn ứng dụng.

## Window function — tính qua các hàng, giữ chi tiết

Khác `GROUP BY` (gộp hàng lại), window function tính toán nhưng **giữ nguyên từng hàng**:

```sql
-- Xếp hạng đơn theo giá trị TRONG TỪNG khách hàng
SELECT
    customer_id,
    total_amount,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total_amount DESC) AS thu_tu,
    RANK()       OVER (PARTITION BY customer_id ORDER BY total_amount DESC) AS xep_hang
FROM orders;
```

- `PARTITION BY` chia nhóm (như GROUP BY nhưng không gộp hàng).
- `ORDER BY` trong `OVER` quyết định thứ tự tính.
- `ROW_NUMBER` (1,2,3 duy nhất) vs `RANK` (đồng hạng nhảy số: 1,1,3).

## Running total & LAG/LEAD

```sql
SELECT
    created_at,
    total_amount,
    -- cộng dồn theo thời gian
    SUM(total_amount) OVER (ORDER BY created_at) AS luy_ke,
    -- giá trị đơn NGAY TRƯỚC (so sánh tăng/giảm)
    LAG(total_amount) OVER (ORDER BY created_at) AS don_truoc
FROM orders;
```

`LAG` lấy hàng trước, `LEAD` lấy hàng sau — cực hữu ích cho phân tích chuỗi thời gian.

## Cạm bẫy hay gặp

- Quên `COMMIT` → transaction treo, giữ khóa, chặn người khác; luôn commit hoặc rollback.
- `UPDATE` nhiều bảng không bọc transaction → lỗi giữa chừng để dữ liệu ở trạng thái nửa vời.
- Isolation quá cao ở mọi nơi → deadlock và chậm; chọn mức phù hợp nhu cầu.
- Nhầm window function với `GROUP BY` → window **giữ** từng hàng, GROUP BY **gộp** lại.
- `RANK` vs `ROW_NUMBER`: cần số thứ tự duy nhất mà dùng `RANK` → có số trùng khi đồng hạng.

## Ghi nhớ

**Transaction** (`BEGIN`/`COMMIT`/`ROLLBACK`) nhóm thao tác thành **tất cả hoặc không gì**,
bảo đảm **ACID** — bắt buộc cho chuyển tiền và mọi thao tác nhiều bước. **Isolation level**
đổi an toàn lấy tốc độ. **Window function** (`OVER (PARTITION BY ... ORDER BY ...)`) tính
xếp hạng, lũy kế, so hàng trước/sau mà **không gộp mất chi tiết** như `GROUP BY`.
