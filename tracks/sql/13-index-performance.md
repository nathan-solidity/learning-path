---
level: "sql-advanced"
order: 13
title: "Index & tối ưu truy vấn"
est: "5-6 giờ"
checklist:
  - "Giải thích được index giúp truy vấn nhanh thế nào (giống mục lục sách)"
  - "Tạo index cho cột hay lọc/join và biết đánh đổi (chậm ghi, tốn dung lượng)"
  - "Đọc được EXPLAIN để biết truy vấn có dùng index hay quét toàn bảng"
  - "Nhận ra các cách viết query làm mất index (hàm lên cột, LIKE '%x')"
  - "Nhận diện và tránh vấn đề N+1 query"
related:
  - "glossary:db"
  - "skill:nta-perf-audit"
---

## Vì sao quan trọng

Query đúng nhưng **chậm** vẫn là query hỏng khi dữ liệu lớn lên. Khác biệt giữa 10ms và
10 giây thường chỉ là **một index**. Đây là kỹ năng phân biệt người viết SQL chạy được với
developer làm DB production.

## Index là gì

Index như **mục lục sách**: thay vì đọc từng trang (quét toàn bảng — *full table scan*),
CSDL nhảy thẳng tới chỗ cần. Không index, tìm 1 hàng trong bảng triệu hàng phải duyệt cả
triệu.

```sql
-- Tạo index cho cột hay lọc
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Index nhiều cột (thứ tự quan trọng: lọc theo status trước rồi created_at)
CREATE INDEX idx_orders_status_date ON orders (status, created_at);

-- Index duy nhất (vừa tăng tốc vừa ép không trùng)
CREATE UNIQUE INDEX idx_customers_email ON customers (email);
```

## Đánh đổi — không phải cứ nhiều index là tốt

| Lợi | Hại |
|-----|-----|
| `SELECT`/`JOIN`/`WHERE` nhanh hơn nhiều | `INSERT`/`UPDATE`/`DELETE` chậm hơn (phải cập nhật index) |
| Ép ràng buộc duy nhất (unique index) | Tốn thêm dung lượng đĩa |

Nguyên tắc: index cho cột **hay xuất hiện trong `WHERE`, `JOIN`, `ORDER BY`** — không phải
mọi cột. Khóa chính đã tự có index.

## EXPLAIN — xem CSDL chạy query thế nào

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;
-- Tìm trong kết quả:
--   "Index Scan"  → tốt, đang dùng index
--   "Seq Scan" / "Full table scan" → đang quét toàn bảng (nghi ngờ thiếu index)
```

PostgreSQL: `EXPLAIN ANALYZE` chạy thật và đo thời gian. MySQL: `EXPLAIN`. Đây là công cụ
số 1 để chẩn đoán query chậm.

## Những cách viết làm MẤT index

```sql
-- ❌ Hàm lên cột → index vô dụng, phải quét toàn bảng
WHERE UPPER(name) = 'AN';
-- ✅ Chuẩn hóa dữ liệu khi lưu, hoặc dùng functional index

-- ❌ LIKE bắt đầu bằng % → không dùng được index
WHERE name LIKE '%an';
-- ✅ LIKE 'an%' (mẫu cố định ở đầu) vẫn dùng được index

-- ❌ Ép kiểu ngầm (so cột số với chuỗi) cũng có thể mất index
WHERE customer_id = '42';
```

## N+1 query — sát thủ hiệu năng trong ORM

Lấy 100 đơn rồi lặp từng đơn để query khách hàng → **1 + 100 = 101 query** thay vì 1.

```sql
-- ❌ N+1: trong vòng lặp app gọi 100 lần
SELECT * FROM customers WHERE id = ?;

-- ✅ Một query JOIN hoặc IN
SELECT o.*, c.name
FROM orders o JOIN customers c ON c.id = o.customer_id;
```

Trong ORM (SQLAlchemy, JPA, ActiveRecord, Prisma) đây là lỗi phổ biến nhất — bật eager
loading / `JOIN` thay vì lazy load trong vòng lặp. Dùng `/nta-perf-audit` để phát hiện.

## Cạm bẫy hay gặp

- Tạo index cho **mọi** cột → ghi chậm, tốn đĩa; chỉ index cột hay lọc/join.
- Bọc hàm lên cột trong `WHERE` (`UPPER(name)`, `DATE(created_at)`) → index thành vô dụng.
- `LIKE '%x'` (wildcard đầu) → luôn quét toàn bảng; đảo được thành `'x%'` thì nên đảo.
- Không đọc `EXPLAIN` mà đoán mò tại sao chậm → mất thời gian; luôn xem plan trước.
- N+1 query ẩn trong ORM → nhìn thấy 1 dòng code nhưng bắn hàng trăm query; bật eager load.

## Ghi nhớ

**Index** = mục lục, biến quét toàn bảng thành nhảy thẳng tới hàng cần — nhưng làm **ghi
chậm hơn**, nên chỉ index cột hay `WHERE`/`JOIN`/`ORDER BY`. Đọc **`EXPLAIN`** để biết query
dùng index (`Index Scan`) hay quét toàn bảng (`Seq Scan`). Tránh **hàm lên cột** và `LIKE
'%x'` (mất index). Cảnh giác **N+1 query** trong ORM — thay bằng một `JOIN`.
