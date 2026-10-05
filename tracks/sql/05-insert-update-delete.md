---
level: "sql-modify"
order: 5
title: "INSERT / UPDATE / DELETE"
est: "4-5 giờ"
checklist:
  - "Thêm một và nhiều hàng bằng INSERT INTO ... VALUES"
  - "Sửa dữ liệu bằng UPDATE ... SET ... WHERE đúng phạm vi"
  - "Xóa dữ liệu bằng DELETE ... WHERE và biết khác biệt với TRUNCATE"
  - "Luôn chạy SELECT kiểm tra điều kiện WHERE trước khi UPDATE/DELETE"
  - "Dùng RETURNING (PostgreSQL) để lấy lại hàng vừa thay đổi"
related:
  - "glossary:db"
---

## Vì sao quan trọng

`SELECT` chỉ đọc; ba lệnh `INSERT`/`UPDATE`/`DELETE` mới **thay đổi dữ liệu thật**. Đây là
nhóm lệnh nguy hiểm nhất: một câu `UPDATE` hay `DELETE` **quên `WHERE`** sẽ đổi hoặc xóa
**toàn bộ bảng** — không có "Ctrl+Z". Hiểu và cẩn trọng với nhóm này là kỹ năng sống còn.

## INSERT — thêm hàng

```sql
-- Thêm một hàng: liệt kê cột rõ ràng (an toàn hơn bỏ trống)
INSERT INTO customers (name, city, age, email)
VALUES ('An', 'Hà Nội', 25, 'an@example.com');

-- Thêm NHIỀU hàng trong một câu (nhanh hơn nhiều câu riêng lẻ)
INSERT INTO customers (name, city, age) VALUES
    ('Bình', 'Đà Nẵng', 30),
    ('Chi',  'Hà Nội',  28),
    ('Dũng', 'Huế',     35);
```

> Luôn **liệt kê cột** (`(name, city, ...)`). Bỏ danh sách cột thì phải điền đúng thứ tự
> mọi cột của bảng — dễ sai và vỡ ngay khi bảng thêm cột mới.

## UPDATE — sửa hàng

```sql
-- Đổi trạng thái đúng một đơn
UPDATE orders SET status = 'shipped' WHERE id = 101;

-- Sửa nhiều cột cùng lúc
UPDATE customers
SET city = 'Hồ Chí Minh', age = age + 1
WHERE id = 5;
```

> **QUÊN `WHERE` = SỬA TOÀN BỘ BẢNG.** `UPDATE orders SET status = 'shipped';` sẽ đổi
> **mọi đơn** thành shipped. Không có cách hoàn tác nếu chưa mở transaction (bài 15).

## DELETE — xóa hàng

```sql
-- Xóa đúng phạm vi
DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2024-01-01';
```

> **QUÊN `WHERE` = XÓA SẠCH BẢNG.** `DELETE FROM orders;` xóa mọi hàng.

## Quy tắc vàng: SELECT trước, đổi sau

```sql
-- BƯỚC 1: chạy SELECT với ĐÚNG điều kiện WHERE để xem sẽ đụng bao nhiêu hàng
SELECT * FROM orders WHERE status = 'cancelled';

-- BƯỚC 2: khi chắc chắn đúng hàng, đổi WHERE y hệt sang DELETE/UPDATE
DELETE FROM orders WHERE status = 'cancelled';
```

Thói quen này chặn gần như mọi tai nạn xóa/sửa nhầm.

## TRUNCATE vs DELETE

```sql
DELETE FROM logs;     -- xóa từng hàng, ghi log, có thể rollback, chậm với bảng lớn
TRUNCATE TABLE logs;  -- xóa sạch tức thì, reset lại, thường không rollback được
```

| Tiêu chí | `DELETE` | `TRUNCATE` |
|----------|----------|------------|
| Điều kiện `WHERE` | có | không (xóa hết) |
| Tốc độ trên bảng lớn | chậm | rất nhanh |
| Rollback trong transaction | được | thường không (tùy CSDL) |
| Reset bộ đếm auto-increment | không | có |

## RETURNING — lấy lại hàng vừa thay đổi (PostgreSQL)

```sql
-- Lấy luôn id vừa sinh sau khi INSERT (rất tiện cho code ứng dụng)
INSERT INTO customers (name, city) VALUES ('Ế', 'Cần Thơ')
RETURNING id, name;

UPDATE orders SET status = 'shipped' WHERE id = 101 RETURNING id, status;
```

MySQL không có `RETURNING` (dùng `LAST_INSERT_ID()`); SQLite hỗ trợ từ bản mới.

## Cạm bẫy hay gặp

- `UPDATE`/`DELETE` **quên `WHERE`** → đổi/xóa toàn bộ bảng; luôn `SELECT` kiểm tra trước.
- `INSERT` bỏ danh sách cột → phải đúng thứ tự mọi cột, vỡ khi schema thêm cột; luôn liệt kê cột.
- Chạy `UPDATE`/`DELETE` trên production ngoài transaction → không rollback được nếu sai (bài 15).
- Dùng `TRUNCATE` tưởng rollback được như `DELETE` → nhiều CSDL không cho rollback TRUNCATE.
- Chèn chuỗi input người dùng thẳng vào câu lệnh → lỗ hổng SQL injection; dùng prepared statement (bài 16).

## Ghi nhớ

`INSERT INTO ... VALUES` thêm hàng (**luôn liệt kê cột**, chèn nhiều hàng một câu cho nhanh).
`UPDATE ... SET ... WHERE` sửa, `DELETE ... WHERE` xóa — **quên `WHERE` là đụng cả bảng**.
Quy tắc vàng: **`SELECT` kiểm tra `WHERE` trước, rồi mới đổi**. `TRUNCATE` xóa sạch nhanh
nhưng thường không rollback; `RETURNING` (Postgres) lấy lại hàng vừa thay đổi.
