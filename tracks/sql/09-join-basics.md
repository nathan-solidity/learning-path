---
level: "sql-join-aggregate"
order: 9
title: "JOIN — nối nhiều bảng"
est: "5-6 giờ"
checklist:
  - "Giải thích được vì sao dữ liệu tách nhiều bảng và nối qua khóa ngoại"
  - "Viết INNER JOIN nối 2 bảng đúng điều kiện ON"
  - "Phân biệt INNER JOIN và LEFT JOIN (giữ hàng không khớp → NULL)"
  - "Dùng RIGHT JOIN / FULL OUTER JOIN và biết CSDL nào không hỗ trợ"
  - "JOIN từ 3 bảng trở lên và dùng self join nối bảng với chính nó"
related:
  - "glossary:db"
---

## Vì sao quan trọng

CSDL quan hệ **cố ý tách dữ liệu ra nhiều bảng** để tránh lặp: thông tin khách để bảng
`customers`, đơn hàng để bảng `orders`, mỗi đơn chỉ giữ `customer_id` trỏ về khách. Đây gọi
là **khóa ngoại** (foreign key). Muốn xem "đơn này của khách nào", bạn phải **JOIN** hai
bảng lại theo khóa. Không biết JOIN thì chỉ đọc được từng bảng rời rạc — vô dụng với dữ
liệu thật.

Giả sử có hai bảng:

```sql
-- customers(id, name, city, age)
-- orders(id, customer_id, total_amount, status, created_at)
-- Liên kết: orders.customer_id = customers.id
```

## INNER JOIN — chỉ hàng khớp cả hai bên

```sql
-- Lấy tên khách kèm số tiền từng đơn
SELECT c.name, o.total_amount, o.status
FROM customers AS c
INNER JOIN orders AS o
    ON o.customer_id = c.id;   -- điều kiện nối: khóa ngoại = khóa chính
```

`INNER JOIN` chỉ giữ hàng **khớp ở CẢ hai bảng**. Khách chưa có đơn nào → không xuất hiện.
Đơn có `customer_id` không tồn tại trong `customers` → cũng bị loại.

> Đặt **alias** (`c`, `o`) cho bảng giúp câu JOIN gọn và rõ cột thuộc bảng nào. Khi hai bảng
> có cột trùng tên (vd cả hai đều có `id`), **bắt buộc** ghi rõ `c.id` / `o.id`.

## LEFT JOIN — giữ hết bảng bên trái

```sql
-- Mọi khách, kèm đơn nếu có; khách chưa mua vẫn hiện (cột đơn = NULL)
SELECT c.name, o.total_amount
FROM customers AS c
LEFT JOIN orders AS o
    ON o.customer_id = c.id;
```

Đây là điểm phân biệt quan trọng nhất: `LEFT JOIN` giữ **toàn bộ hàng bảng bên trái**
(`customers`), kể cả không khớp — khi đó các cột bảng phải sẽ là `NULL`.

```sql
-- Ứng dụng kinh điển: tìm khách CHƯA có đơn nào
SELECT c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.id IS NULL;   -- không khớp đơn nào → cột o.id là NULL
```

## RIGHT JOIN & FULL OUTER JOIN

```sql
-- RIGHT JOIN: giữ hết bảng bên phải (ngược với LEFT)
SELECT c.name, o.total_amount
FROM customers AS c
RIGHT JOIN orders AS o ON o.customer_id = c.id;

-- FULL OUTER JOIN: giữ hết cả hai bên, bên nào thiếu thì NULL
SELECT c.name, o.total_amount
FROM customers AS c
FULL OUTER JOIN orders AS o ON o.customer_id = c.id;
```

> **Khác biệt CSDL**: MySQL **không hỗ trợ** `FULL OUTER JOIN` (phải giả lập bằng
> `LEFT JOIN` UNION `RIGHT JOIN`). PostgreSQL/SQL Server/Oracle có đủ. `RIGHT JOIN` ít dùng
> — đa số người ta viết lại thành `LEFT JOIN` cho dễ đọc.

## So sánh 4 loại JOIN

![Các loại JOIN](/images/sql-joins.png)

| Loại | Giữ hàng nào | Dùng khi |
|------|--------------|----------|
| `INNER JOIN` | Chỉ hàng khớp cả hai bên | Chỉ cần dữ liệu có quan hệ đầy đủ |
| `LEFT JOIN` | Toàn bộ bảng trái + khớp bên phải | Giữ hết bên trái, kể cả chưa có liên kết |
| `RIGHT JOIN` | Toàn bộ bảng phải + khớp bên trái | Hiếm dùng; thường viết lại thành LEFT |
| `FULL OUTER JOIN` | Toàn bộ cả hai bên | Đối chiếu hai bảng, tìm hàng lệch hai phía |

## JOIN nhiều bảng & self join

```sql
-- JOIN 3 bảng: khách → đơn → sản phẩm (qua bảng trung gian order_items)
SELECT c.name, p.name AS product, oi.quantity
FROM customers AS c
INNER JOIN orders      AS o  ON o.customer_id = c.id
INNER JOIN order_items AS oi ON oi.order_id   = o.id
INNER JOIN products    AS p  ON p.id          = oi.product_id;

-- Self join: nối bảng với CHÍNH NÓ (vd nhân viên và người quản lý)
SELECT e.name AS nhan_vien, m.name AS quan_ly
FROM employees AS e
LEFT JOIN employees AS m ON e.manager_id = m.id;   -- alias khác nhau là bắt buộc
```

## Cạm bẫy hay gặp

- Quên `ON` (hoặc điều kiện sai) → **cross join** sinh tích Descartes: mọi hàng nhân mọi hàng, kết quả nổ số lượng.
- Dùng `INNER JOIN` khi cần `LEFT JOIN` → **âm thầm mất** hàng chưa có liên kết (khách chưa mua).
- Đặt điều kiện lọc bảng phải vào `WHERE` thay vì `ON` với `LEFT JOIN` → biến nó thành INNER JOIN ngoài ý muốn.
- Cột trùng tên giữa hai bảng mà không ghi rõ `c.id`/`o.id` → lỗi "ambiguous column".
- Dùng `FULL OUTER JOIN` trên MySQL → lỗi cú pháp; MySQL không hỗ trợ, phải giả lập.

## Ghi nhớ

Dữ liệu tách nhiều bảng, nối qua **khóa ngoại** bằng **JOIN ... ON**. **`INNER JOIN`** chỉ
giữ hàng khớp cả hai bên; **`LEFT JOIN`** giữ **toàn bộ bảng trái**, bên phải không khớp thì
`NULL` — mẹo `WHERE o.id IS NULL` tìm hàng "chưa có liên kết". Luôn đặt **alias** và ghi rõ
`bảng.cột`. Quên `ON` là ra **cross join** nổ dữ liệu.
