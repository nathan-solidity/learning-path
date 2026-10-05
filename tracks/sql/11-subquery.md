---
level: "sql-join-aggregate"
order: 11
title: "Subquery — truy vấn con"
est: "4-5 giờ"
checklist:
  - "Viết subquery trong WHERE với IN và với so sánh (=, >)"
  - "Dùng scalar subquery trả về 1 giá trị trong SELECT hoặc WHERE"
  - "Hiểu correlated subquery và vì sao nó chạy lặp theo từng hàng"
  - "Dùng subquery trong FROM (derived table) như một bảng tạm"
  - "Chọn đúng giữa EXISTS, IN và JOIN cho từng tình huống"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Nhiều câu hỏi cần **kết quả của một truy vấn làm đầu vào cho truy vấn khác**: "khách có đơn
trên mức trung bình", "sản phẩm chưa từng được đặt". **Subquery** (truy vấn con) là câu
`SELECT` lồng bên trong câu khác — giúp diễn đạt những logic mà một truy vấn phẳng không
làm gọn được.

## Subquery trong WHERE — với IN

```sql
-- Khách đã từng đặt đơn (id nằm trong danh sách customer_id của orders)
SELECT name
FROM customers
WHERE id IN (SELECT customer_id FROM orders);   -- subquery trả về 1 CỘT nhiều giá trị
```

## Subquery so sánh — scalar subquery

Scalar subquery trả về **đúng 1 giá trị**, dùng được ở chỗ cần một giá trị:

```sql
-- Đơn có giá trị cao hơn TRUNG BÌNH toàn bộ
SELECT id, total_amount
FROM orders
WHERE total_amount > (SELECT AVG(total_amount) FROM orders);

-- Scalar subquery trong SELECT: gắn thêm tổng số đơn của mỗi khách
SELECT
    c.name,
    (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS so_don
FROM customers AS c;
```

> Scalar subquery mà **trả về nhiều hơn 1 hàng** sẽ lỗi runtime. Đảm bảo nó chỉ ra 1 giá trị
> (dùng hàm tổng hợp hoặc `LIMIT 1`).

## Correlated subquery — chạy lặp theo từng hàng

Subquery **tham chiếu cột của truy vấn ngoài** (`c.id` ở trên) gọi là **correlated**: nó
được chạy **lại cho từng hàng** của truy vấn ngoài.

```sql
-- Khách có ít nhất 1 đơn > 1 triệu
SELECT c.name
FROM customers AS c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id      -- tham chiếu c → correlated
      AND o.total_amount > 1000000
);
```

Correlated subquery mạnh nhưng **có thể chậm** trên bảng lớn vì lặp nhiều lần — cân nhắc
viết lại bằng JOIN (xem cuối bài).

## Subquery trong FROM — derived table

Dùng kết quả một truy vấn như **một bảng tạm** rồi truy vấn tiếp:

```sql
-- Doanh thu trung bình mỗi khách, chỉ tính khách có tổng > 1 triệu
SELECT AVG(tong) AS doanh_thu_tb
FROM (
    SELECT customer_id, SUM(total_amount) AS tong
    FROM orders
    GROUP BY customer_id
) AS thong_ke          -- derived table BẮT BUỘC có alias
WHERE tong > 1000000;
```

Derived table (subquery trong `FROM`) **bắt buộc phải có alias** (`AS thong_ke`).

## EXISTS vs IN vs JOIN

```sql
-- IN: kiểm tra thuộc danh sách giá trị
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders);

-- EXISTS: kiểm tra "có tồn tại hàng khớp không" (dừng ngay khi tìm thấy)
SELECT name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- JOIN: thường nhanh & rõ nhất khi cần LẤY cột từ bảng kia
SELECT DISTINCT c.name FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;
```

| Tình huống | Nên dùng |
|-----------|----------|
| Chỉ cần biết "có/không có" hàng khớp | `EXISTS` (dừng sớm, thường nhanh) |
| Kiểm tra thuộc một danh sách nhỏ, cố định | `IN (...)` |
| Cần **lấy cột** từ bảng liên quan | `JOIN` |
| Danh sách con **có thể chứa NULL** | Tránh `NOT IN` (lỗi logic) → dùng `NOT EXISTS` |

> **Cạm bẫy `NOT IN` + NULL**: nếu subquery của `NOT IN` trả về dù chỉ một `NULL`, cả điều
> kiện thành "unknown" → **0 hàng**. Với phủ định, ưu tiên `NOT EXISTS`.

## Khi nào JOIN tốt hơn subquery

- Cần **lấy dữ liệu** từ bảng kia (không chỉ kiểm tra tồn tại) → JOIN rõ và nhanh hơn.
- Correlated subquery chạy chậm trên bảng lớn → thường viết lại thành JOIN + GROUP BY.
- Nhưng subquery dễ đọc hơn khi diễn đạt "so với giá trị tổng hợp" (như `> AVG(...)`).

## Cạm bẫy hay gặp

- Scalar subquery trả về nhiều hàng → lỗi runtime; thêm hàm tổng hợp hoặc `LIMIT 1`.
- `NOT IN (subquery)` mà subquery có `NULL` → trả 0 hàng bất ngờ; dùng `NOT EXISTS`.
- Quên alias cho derived table (subquery trong `FROM`) → lỗi cú pháp.
- Correlated subquery trong `SELECT`/`WHERE` chạy lặp từng hàng → chậm; cân nhắc JOIN.
- Lồng nhiều tầng subquery khó đọc → tách bằng CTE `WITH` cho dễ theo dõi (bài 14).

## Ghi nhớ

**Subquery** là `SELECT` lồng bên trong truy vấn khác: trong `WHERE` (với `IN`/so sánh),
trong `SELECT` (**scalar** — 1 giá trị), hay trong `FROM` (**derived table**, bắt buộc
alias). Subquery tham chiếu cột ngoài là **correlated** — chạy lặp từng hàng, dễ chậm.
Chọn công cụ: **`EXISTS`** để hỏi có/không, **`IN`** cho danh sách nhỏ, **`JOIN`** khi cần
lấy cột. Với phủ định luôn ưu tiên **`NOT EXISTS`** thay vì `NOT IN` để tránh bẫy `NULL`.
