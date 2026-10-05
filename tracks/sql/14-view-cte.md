---
level: "sql-advanced"
order: 14
title: "View & CTE"
est: "3-4 giờ"
checklist:
  - "Tạo VIEW để đặt tên và tái dùng một truy vấn phức tạp"
  - "Phân biệt view thường và materialized view (lưu sẵn kết quả)"
  - "Dùng CTE (WITH) để tách truy vấn nhiều tầng cho dễ đọc"
  - "Viết được recursive CTE cho dữ liệu phân cấp (cây)"
  - "Biết khi nào dùng view/CTE thay vì lồng subquery"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Query thật hay dài và lồng nhiều tầng subquery — khó đọc, khó sửa. **View** và **CTE** đặt
tên cho từng phần, biến một khối rối thành các bước rõ ràng. View còn giúp **giấu độ phức
tạp** và **kiểm soát quyền truy cập** dữ liệu.

## VIEW — truy vấn có tên, tái dùng

```sql
-- Định nghĩa một lần
CREATE VIEW active_orders AS
SELECT o.id, c.name, o.total_amount, o.created_at
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'active';

-- Dùng như một bảng
SELECT * FROM active_orders WHERE total_amount > 1000;
```

View **không lưu dữ liệu** — mỗi lần truy vấn nó chạy lại query gốc. Lợi ích: tái dùng logic,
giấu JOIN phức tạp, và cấp quyền xem view mà không lộ toàn bộ bảng gốc.

## Materialized view — lưu sẵn kết quả

```sql
-- Kết quả được LƯU LẠI (nhanh khi đọc, nhưng có thể cũ)
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT EXTRACT(MONTH FROM created_at) AS thang, SUM(total_amount) AS doanh_thu
FROM orders GROUP BY 1;

-- Phải làm mới thủ công/định kỳ khi dữ liệu gốc đổi
REFRESH MATERIALIZED VIEW monthly_revenue;
```

| | View thường | Materialized view |
|--|-------------|-------------------|
| Lưu dữ liệu | Không (chạy lại mỗi lần) | Có (lưu kết quả) |
| Tốc độ đọc | Bằng query gốc | Nhanh |
| Độ mới | Luôn mới | Có thể cũ tới lần REFRESH |

MySQL không có materialized view sẵn (phải mô phỏng bằng bảng + job).

## CTE — WITH ... AS

CTE (Common Table Expression) đặt tên một truy vấn con, đọc trên xuống như các bước:

```sql
WITH high_value AS (
    SELECT customer_id, SUM(total_amount) AS tong
    FROM orders
    GROUP BY customer_id
    HAVING SUM(total_amount) > 5000
)
SELECT c.name, h.tong
FROM high_value h
JOIN customers c ON c.id = h.customer_id
ORDER BY h.tong DESC;
```

Dễ đọc hơn nhiều so với nhét subquery vào `FROM`. Có thể khai báo nhiều CTE nối tiếp bằng
dấu phẩy.

## Recursive CTE — dữ liệu phân cấp

```sql
-- Duyệt cây nhân viên - quản lý
WITH RECURSIVE org AS (
    SELECT id, name, manager_id, 1 AS level
    FROM employees WHERE manager_id IS NULL   -- gốc
    UNION ALL
    SELECT e.id, e.name, e.manager_id, org.level + 1
    FROM employees e
    JOIN org ON e.manager_id = org.id         -- nối tầng tiếp theo
)
SELECT * FROM org ORDER BY level;
```

Dùng cho cây thư mục, cây danh mục, sơ đồ tổ chức — thứ SQL thường không làm được.

## Cạm bẫy hay gặp

- Tưởng view lưu dữ liệu → view thường chạy lại query gốc mỗi lần, không nhanh hơn tự nhiên.
- Materialized view quên `REFRESH` → đọc phải dữ liệu cũ mà không biết.
- Lồng view trên view nhiều tầng → query gốc phình to, khó tối ưu và debug.
- Recursive CTE thiếu điều kiện dừng (gốc/`WHERE`) → vòng lặp vô hạn.
- Dùng CTE ở nơi cần hiệu năng cao: một số CSDL không tối ưu tốt CTE bằng subquery — đo trước.

## Ghi nhớ

**View** đặt tên & tái dùng một truy vấn (không lưu dữ liệu, giấu phức tạp, kiểm soát quyền).
**Materialized view** lưu sẵn kết quả — nhanh nhưng phải `REFRESH`. **CTE (`WITH`)** tách
query nhiều tầng cho dễ đọc; **recursive CTE** duyệt dữ liệu phân cấp (cây). Chọn view/CTE
thay vì subquery lồng sâu để code dễ đọc, dễ sửa.
