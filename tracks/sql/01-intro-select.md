---
level: "sql-basics"
order: 1
title: "SQL & SELECT — lấy dữ liệu"
est: "3-4 giờ"
checklist:
  - "Giải thích được CSDL quan hệ là gì: bảng, hàng, cột, khóa"
  - "Viết SELECT chọn cột cụ thể thay vì SELECT * bừa bãi"
  - "Dùng DISTINCT để lấy giá trị không trùng"
  - "Đặt alias cho cột/bảng bằng AS để kết quả dễ đọc"
  - "Chạy được câu SELECT đầu tiên trên một CSDL thật (SQLite/Postgres/MySQL)"
related:
  - "glossary:db"
  - "skill:nta-db-review"
---

## SQL & CSDL quan hệ là gì

**SQL** (Structured Query Language) là ngôn ngữ để **hỏi và thao tác dữ liệu** trong CSDL
quan hệ. **CSDL quan hệ** lưu dữ liệu trong các **bảng** (table) — như một bảng tính: mỗi
**hàng** (row) là một bản ghi, mỗi **cột** (column) là một thuộc tính. Các bảng liên kết
với nhau qua **khóa** (key).

Ví dụ bảng `customers`:

| id | name    | city    | age |
|----|---------|---------|-----|
| 1  | An      | Hà Nội  | 25  |
| 2  | Bình    | Đà Nẵng | 30  |
| 3  | Chi     | Hà Nội  | 28  |

- `id` là **khóa chính** (primary key) — định danh duy nhất mỗi hàng.
- Mỗi cột có một **kiểu dữ liệu** (số, chuỗi, ngày...) — chi tiết ở bài 6.

## SELECT — câu lệnh dùng nhiều nhất

```sql
-- Lấy tất cả cột, tất cả hàng (tránh dùng * trong code thật)
SELECT * FROM customers;

-- Lấy đúng cột cần — rõ ràng, nhanh, ổn định hơn
SELECT name, city FROM customers;
```

> **Vì sao tránh `SELECT *`**: lấy thừa cột → tốn băng thông; và nếu bảng thêm/đổi cột sau
> này, code phụ thuộc thứ tự cột sẽ vỡ. Trong ứng dụng, **luôn liệt kê cột cụ thể**.

## DISTINCT — bỏ giá trị trùng

```sql
-- Các thành phố có khách (không lặp lại)
SELECT DISTINCT city FROM customers;
-- → Hà Nội, Đà Nẵng
```

## Alias với AS — đặt tên dễ đọc

```sql
SELECT
    name AS customer_name,      -- đổi tên cột trong kết quả
    age AS tuoi
FROM customers AS c;            -- đặt bí danh cho bảng (hữu ích khi JOIN)
```

`AS` có thể lược bỏ (`customers c`) nhưng viết rõ dễ đọc hơn.

## Cấu trúc một câu SELECT

```sql
SELECT   <danh sách cột>       -- lấy cột nào
FROM     <bảng>                -- từ bảng nào
WHERE    <điều kiện>           -- lọc hàng (bài 2)
ORDER BY <cột>                 -- sắp xếp (bài 3)
LIMIT    <n>;                  -- giới hạn số hàng (bài 3)
```

Thứ tự viết cố định như trên. Dấu `;` kết thúc câu lệnh (bắt buộc khi chạy nhiều câu).

## Khác biệt giữa các CSDL

| Việc | PostgreSQL / MySQL / SQLite | SQL Server / Oracle |
|------|----------------------------|---------------------|
| Giới hạn số hàng | `LIMIT 10` | `TOP 10` / `FETCH FIRST` |
| Nối chuỗi | `||` hoặc `CONCAT()` | `+` hoặc `CONCAT()` |
| Phân biệt hoa/thường tên | thường không (tùy cấu hình) | tùy hệ |

Lộ trình này mặc định theo **PostgreSQL/MySQL** — ghi rõ khi có khác biệt.

## Cạm bẫy hay gặp

- `SELECT *` trong code ứng dụng — lấy thừa dữ liệu và dễ vỡ khi schema đổi; liệt kê cột.
- Quên `;` khi chạy nhiều câu → lỗi cú pháp khó hiểu.
- Tưởng SQL phân biệt hoa/thường ở **từ khóa** — không; `select` = `SELECT`. Quy ước viết
  hoa từ khóa (`SELECT`, `FROM`) cho dễ đọc.
- Nhầm dấu nháy: chuỗi dùng **nháy đơn** `'Hà Nội'`; nháy kép thường là tên cột/bảng.
- Chạy query nặng (`SELECT *` trên bảng triệu hàng) trên production mà không `LIMIT`.

## Ghi nhớ

**SQL** hỏi dữ liệu trong **CSDL quan hệ** (bảng = hàng × cột, liên kết qua **khóa**).
Câu lệnh xương sống là **SELECT ... FROM**. Trong code thật: **liệt kê cột cụ thể**, không
`SELECT *`. `DISTINCT` bỏ trùng, `AS` đặt bí danh cho dễ đọc. Chuỗi dùng **nháy đơn**.
