---
level: "sql-basics"
order: 2
title: "WHERE — lọc dữ liệu"
est: "4-5 giờ"
checklist:
  - "Lọc bằng WHERE với các toán tử =, <>, >, <, >=, <="
  - "Kết hợp điều kiện bằng AND, OR và dùng ngoặc () đúng thứ tự ưu tiên"
  - "Dùng IN, BETWEEN để lọc theo danh sách/khoảng giá trị"
  - "Tìm chuỗi theo mẫu bằng LIKE với % và _"
  - "Lọc giá trị NULL đúng cách bằng IS NULL / IS NOT NULL"
related:
  - "glossary:db"
  - "skill:nta-data-verify"
---

## Vì sao quan trọng

`WHERE` là mệnh đề **lọc hàng** — quyết định bạn lấy đúng dữ liệu cần hay lấy nhầm. Đây là
nơi hầu hết logic truy vấn nằm, và cũng là nơi dễ sai nhất (đặc biệt với `NULL` và thứ tự
`AND`/`OR`).

## Toán tử so sánh

```sql
SELECT * FROM customers WHERE city = 'Hà Nội';   -- bằng
SELECT * FROM customers WHERE age >= 30;         -- lớn hơn hoặc bằng
SELECT * FROM customers WHERE city <> 'Hà Nội';  -- khác (cũng viết !=)
```

Chuỗi dùng **nháy đơn**; số không có nháy.

## AND / OR / NOT — kết hợp điều kiện

```sql
-- Khách ở Hà Nội VÀ trên 25 tuổi
SELECT * FROM customers WHERE city = 'Hà Nội' AND age > 25;

-- Khách ở Hà Nội HOẶC Đà Nẵng
SELECT * FROM customers WHERE city = 'Hà Nội' OR city = 'Đà Nẵng';

-- Ngoặc để rõ thứ tự: AND ưu tiên cao hơn OR
SELECT * FROM customers
WHERE (city = 'Hà Nội' OR city = 'Đà Nẵng') AND age > 25;
```

> **Cạm bẫy kinh điển**: `AND` được tính trước `OR`. Không ngoặc, `A OR B AND C` nghĩa là
> `A OR (B AND C)` — thường **không** phải ý bạn muốn. Luôn đặt ngoặc khi trộn `AND`/`OR`.

## IN & BETWEEN — gọn hơn

```sql
-- Thay cho city = 'A' OR city = 'B' OR city = 'C'
SELECT * FROM customers WHERE city IN ('Hà Nội', 'Đà Nẵng', 'Huế');

-- Khoảng giá trị (bao gồm cả 2 đầu mút)
SELECT * FROM customers WHERE age BETWEEN 25 AND 30;  -- 25 <= age <= 30

-- Phủ định
SELECT * FROM customers WHERE city NOT IN ('Hà Nội');
```

## LIKE — tìm chuỗi theo mẫu

```sql
SELECT * FROM customers WHERE name LIKE 'A%';    -- bắt đầu bằng A
SELECT * FROM customers WHERE name LIKE '%n';    -- kết thúc bằng n
SELECT * FROM customers WHERE name LIKE '%in%';  -- chứa "in"
SELECT * FROM customers WHERE name LIKE '_n';    -- đúng 2 ký tự, ký tự 2 là n
```

- `%` = **0 hoặc nhiều** ký tự bất kỳ.
- `_` = **đúng 1** ký tự bất kỳ.
- Phân biệt hoa/thường tùy CSDL; PostgreSQL dùng `ILIKE` để bỏ phân biệt.

## NULL — không phải 0, không phải rỗng

`NULL` nghĩa là **"không có giá trị / chưa biết"**. Không so sánh được bằng `=`.

```sql
-- SAI: không bao giờ đúng, kể cả với hàng có email NULL
SELECT * FROM customers WHERE email = NULL;   -- ❌

-- ĐÚNG:
SELECT * FROM customers WHERE email IS NULL;      -- chưa có email
SELECT * FROM customers WHERE email IS NOT NULL;  -- đã có email
```

| Biểu thức | Kết quả |
|-----------|---------|
| `NULL = NULL` | không phải TRUE (là "unknown") |
| `NULL = 5` | unknown → hàng bị loại |
| `x IS NULL` | TRUE nếu x là NULL |

Đây là lỗi thầm lặng số 1 với người mới: hàng có `NULL` **âm thầm bị loại** khỏi kết quả
`WHERE age > 10` vì so sánh với NULL luôn ra "unknown".

## Cạm bẫy hay gặp

- Trộn `AND`/`OR` không ngoặc → kết quả sai vì `AND` ưu tiên hơn `OR`.
- Dùng `= NULL` thay vì `IS NULL` → không bao giờ khớp, mất dữ liệu âm thầm.
- Quên rằng `NOT IN (...)` với danh sách **chứa NULL** có thể ra 0 hàng ngoài ý muốn.
- `LIKE 'A%'` không dùng được index nếu mẫu bắt đầu bằng `%` (`'%A'`) — chậm trên bảng lớn (bài 13).
- Dùng nháy kép cho chuỗi ở PostgreSQL → lỗi (nháy kép là tên cột); chuỗi luôn nháy đơn.

## Ghi nhớ

`WHERE` lọc hàng. Trộn `AND`/`OR` thì **luôn đặt ngoặc** (`AND` tính trước `OR`). `IN`/
`BETWEEN` gọn hơn nhiều `OR`. `LIKE` tìm mẫu với `%` (nhiều ký tự) và `_` (một ký tự).
Quan trọng nhất: **`NULL` phải lọc bằng `IS NULL`/`IS NOT NULL`**, không bao giờ `= NULL`.
