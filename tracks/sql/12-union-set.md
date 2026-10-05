---
level: "sql-join-aggregate"
order: 12
title: "UNION & phép tập hợp"
est: "3-4 giờ"
checklist:
  - "Gộp kết quả nhiều truy vấn bằng UNION và UNION ALL"
  - "Phân biệt UNION (bỏ trùng) và UNION ALL (giữ trùng, nhanh hơn)"
  - "Đảm bảo các truy vấn khớp số cột và kiểu dữ liệu tương thích"
  - "Dùng INTERSECT và EXCEPT/MINUS để lấy phần chung/phần chênh"
  - "Chọn đúng giữa UNION và OR/JOIN cho từng tình huống"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Đôi khi bạn cần **gộp kết quả của nhiều truy vấn thành một danh sách** — ví dụ ghép khách
từ bảng `customers` với khách cũ ở bảng `archived_customers`, hay lấy phần **chung** giữa
hai tập. `JOIN` nối theo **cột** (ngang), còn phép tập hợp gộp theo **hàng** (dọc) — hai
việc khác nhau.

## UNION vs UNION ALL

```sql
-- Gộp email từ hai bảng thành một danh sách
SELECT email FROM customers
UNION
SELECT email FROM archived_customers;   -- UNION: tự động BỎ hàng trùng
```

```sql
-- UNION ALL: GIỮ mọi hàng, kể cả trùng — nhanh hơn vì không phải lọc trùng
SELECT email FROM customers
UNION ALL
SELECT email FROM archived_customers;
```

| | UNION | UNION ALL |
|---|-------|-----------|
| Hàng trùng | **Loại bỏ** (chỉ giữ 1) | **Giữ hết** |
| Tốc độ | Chậm hơn (phải so trùng) | Nhanh hơn |
| Dùng khi | Cần danh sách duy nhất | Chắc chắn không trùng, hoặc muốn giữ trùng |

> **Mẹo hiệu năng**: nếu bạn biết chắc hai tập không giao nhau, dùng `UNION ALL` — tránh chi
> phí khử trùng vô ích. Nhiều người mặc định `UNION` và làm truy vấn chậm không cần thiết.

## Quy tắc bắt buộc: khớp cột

Mọi truy vấn trong phép tập hợp phải:

```sql
-- ĐÚNG: cùng SỐ cột, kiểu TƯƠNG THÍCH, đúng THỨ TỰ
SELECT name, city FROM customers
UNION
SELECT name, city FROM archived_customers;

-- SAI: khác số cột → lỗi
-- SELECT name, city FROM customers
-- UNION
-- SELECT name FROM archived_customers;   -- ❌
```

- **Số cột** phải bằng nhau.
- **Kiểu dữ liệu** từng vị trí phải tương thích (số với số, chuỗi với chuỗi).
- Tên cột kết quả lấy theo **truy vấn đầu tiên**.
- `ORDER BY` chỉ đặt **một lần ở cuối cùng**, áp cho toàn bộ kết quả gộp.

```sql
SELECT name, city FROM customers
UNION ALL
SELECT name, city FROM archived_customers
ORDER BY name;          -- ORDER BY đặt sau cùng, cho cả tập gộp
```

## INTERSECT & EXCEPT — phần chung, phần chênh

```sql
-- INTERSECT: email có ở CẢ hai bảng
SELECT email FROM customers
INTERSECT
SELECT email FROM newsletter_subscribers;

-- EXCEPT: email có ở customers nhưng KHÔNG có ở subscribers
SELECT email FROM customers
EXCEPT
SELECT email FROM newsletter_subscribers;
```

> **Khác biệt CSDL**: PostgreSQL/SQL Server dùng `EXCEPT`; **Oracle** dùng `MINUS` (cùng ý
> nghĩa). **MySQL** (trước 8.0.31) **không hỗ trợ** `INTERSECT`/`EXCEPT` — phải giả lập bằng
> `IN`/`NOT IN` hoặc `EXISTS`/`NOT EXISTS`.

## Khi nào UNION thay vì OR/JOIN

```sql
-- Đôi khi UNION ALL nhanh hơn OR trên các điều kiện dùng index khác nhau:
SELECT * FROM orders WHERE status = 'pending'
UNION ALL
SELECT * FROM orders WHERE total_amount > 5000000;
-- (mỗi nhánh có thể dùng index riêng; nhưng có thể trùng hàng → cân nhắc UNION)
```

- Gộp dữ liệu từ **các bảng/nguồn khác nhau** có cùng cấu trúc → dùng `UNION`.
- Lọc **nhiều điều kiện trên cùng một bảng** → thường `WHERE ... OR ...` gọn hơn.
- Cần **cột từ bảng liên quan** → đó là việc của `JOIN`, không phải UNION.

## Cạm bẫy hay gặp

- Khác số cột giữa các truy vấn → lỗi; đảm bảo cùng số cột đúng thứ tự.
- Mặc định `UNION` khi không cần khử trùng → chậm; dùng `UNION ALL` nếu chắc không trùng.
- Đặt `ORDER BY` ở truy vấn đầu → lỗi/không có tác dụng; chỉ đặt một lần ở cuối.
- Kiểu cột không tương thích (ghép số với chuỗi) → lỗi ép kiểu hoặc kết quả sai.
- Dùng `INTERSECT`/`EXCEPT` trên MySQL cũ → không hỗ trợ; thay bằng `EXISTS`/`NOT EXISTS`.

## Ghi nhớ

Phép tập hợp gộp kết quả theo **hàng** (khác `JOIN` nối theo cột). **`UNION`** bỏ trùng,
**`UNION ALL`** giữ trùng và **nhanh hơn** — dùng `UNION ALL` khi biết chắc không trùng.
Mọi truy vấn phải **cùng số cột, kiểu tương thích**; `ORDER BY` chỉ đặt **một lần ở cuối**.
**`INTERSECT`** lấy phần chung, **`EXCEPT`/`MINUS`** lấy phần chênh — nhưng MySQL cũ không
có, phải giả lập bằng `EXISTS`/`NOT EXISTS`.
