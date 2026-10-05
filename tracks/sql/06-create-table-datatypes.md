---
level: "sql-modify"
order: 6
title: "CREATE TABLE & kiểu dữ liệu"
est: "4-5 giờ"
checklist:
  - "Tạo bảng bằng CREATE TABLE với cột và kiểu dữ liệu phù hợp"
  - "Chọn đúng kiểu số, chuỗi, ngày giờ, boolean cho từng cột"
  - "Dùng DECIMAL/NUMERIC cho tiền tệ, KHÔNG dùng FLOAT"
  - "Tạo cột id tự tăng bằng SERIAL/AUTO_INCREMENT/IDENTITY"
  - "Xóa bảng an toàn bằng DROP TABLE (và IF EXISTS)"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Chọn sai kiểu dữ liệu là lỗi thiết kế **đắt nhất** — sửa sau khi bảng đã có triệu hàng rất
khổ. Kiểu đúng giúp dữ liệu chính xác (tiền không bị sai số), tiết kiệm dung lượng, và cho
CSDL tối ưu truy vấn. Bài này học cách khai báo bảng và chọn kiểu chuẩn ngay từ đầu.

## CREATE TABLE

```sql
CREATE TABLE customers (
    id      INTEGER,           -- số nguyên định danh
    name    VARCHAR(100),      -- chuỗi tối đa 100 ký tự
    city    VARCHAR(100),
    age     INTEGER,
    email   VARCHAR(255),
    phone   VARCHAR(20)
);
```

Mỗi dòng là `tên_cột KIỂU_DỮ_LIỆU`. Ràng buộc (khóa, NOT NULL...) thêm ở bài 7.

## Nhóm kiểu dữ liệu chính

### Số

```sql
quantity   INTEGER,        -- số nguyên thường (~ ±2 tỷ)
view_count BIGINT,         -- số nguyên lớn (khi có thể vượt 2 tỷ)
rating     DECIMAL(3, 2),  -- 3 chữ số, 2 sau dấu phẩy: 4.75
```

### Tiền tệ — dùng DECIMAL, KHÔNG dùng FLOAT

```sql
-- ĐÚNG: DECIMAL/NUMERIC lưu chính xác tuyệt đối
total_amount DECIMAL(12, 2),   -- tối đa 10 chữ số nguyên + 2 số lẻ

-- SAI: FLOAT/REAL là số thực xấp xỉ → 0.1 + 0.2 != 0.3, sai lệch tiền
-- total_amount FLOAT   ❌ đừng bao giờ dùng cho tiền
```

> **Quy tắc bất di bất dịch**: tiền tệ luôn `DECIMAL`/`NUMERIC`. `FLOAT`/`REAL` chỉ dùng
> cho đại lượng khoa học chấp nhận sai số (nhiệt độ, tọa độ), không bao giờ cho tiền.

### Chuỗi

```sql
name    VARCHAR(100),   -- chuỗi có giới hạn độ dài — dùng cho hầu hết trường hợp
bio     TEXT,           -- chuỗi dài không giới hạn (mô tả, nội dung bài viết)
code    CHAR(3),        -- độ dài CỐ ĐỊNH (ví dụ mã 'VND', 'USD')
```

### Ngày giờ

```sql
birth_date  DATE,        -- chỉ ngày: 2024-01-15
created_at  TIMESTAMP,   -- ngày + giờ
-- PostgreSQL nên dùng TIMESTAMPTZ (có múi giờ) cho created_at/updated_at
```

### Boolean

```sql
is_active   BOOLEAN,     -- TRUE/FALSE (PostgreSQL). MySQL cũ dùng TINYINT(1)
```

## Cột id tự tăng

```sql
-- PostgreSQL (hiện đại)
id  INTEGER GENERATED ALWAYS AS IDENTITY,
-- PostgreSQL (kiểu SERIAL cũ, vẫn phổ biến)
id  SERIAL,
-- MySQL
id  INT AUTO_INCREMENT,
-- SQLite
id  INTEGER PRIMARY KEY AUTOINCREMENT,
```

CSDL tự sinh giá trị tăng dần cho mỗi hàng mới — không cần tự điền `id`.

| Nhu cầu | Kiểu nên dùng |
|---------|---------------|
| Tiền tệ, giá | `DECIMAL(p, s)` |
| Số đếm nhỏ | `INTEGER` |
| Số rất lớn (lượt xem) | `BIGINT` |
| Tên, email, chuỗi ngắn | `VARCHAR(n)` |
| Nội dung dài | `TEXT` |
| Ngày (không giờ) | `DATE` |
| Mốc thời gian | `TIMESTAMP` / `TIMESTAMPTZ` |
| Cờ đúng/sai | `BOOLEAN` |

## DROP TABLE — xóa bảng

```sql
DROP TABLE customers;             -- lỗi nếu bảng không tồn tại
DROP TABLE IF EXISTS customers;   -- an toàn: không lỗi khi bảng đã không còn
```

> `DROP TABLE` xóa **cả cấu trúc lẫn toàn bộ dữ liệu** — không hoàn tác. Cẩn trọng như
> `DELETE` không `WHERE`.

## Cạm bẫy hay gặp

- Dùng `FLOAT`/`REAL` cho tiền → sai số cộng dồn, lệch số dư; luôn `DECIMAL`/`NUMERIC`.
- `VARCHAR(n)` đặt `n` quá ngắn (`VARCHAR(50)` cho email) → dữ liệu thật bị cắt/lỗi chèn.
- Lưu ngày giờ dưới dạng `VARCHAR` → không so sánh/sắp xếp đúng, mất hàm ngày; dùng `DATE`/`TIMESTAMP`.
- Quên múi giờ với `TIMESTAMP` → lệch giờ giữa server và người dùng; PostgreSQL nên dùng `TIMESTAMPTZ`.
- `DROP TABLE` nhầm bảng còn dùng → mất sạch dữ liệu; kiểm tra kỹ, có backup trước khi drop.

## Ghi nhớ

`CREATE TABLE` khai báo cột + kiểu. Chọn kiểu đúng ngay từ đầu: **tiền tệ luôn `DECIMAL`,
không bao giờ `FLOAT`**; chuỗi ngắn `VARCHAR(n)`, dài `TEXT`; ngày giờ `DATE`/`TIMESTAMP`
(đừng lưu dạng chuỗi); cờ `BOOLEAN`. Cột `id` tự tăng bằng `SERIAL`/`AUTO_INCREMENT`/
`IDENTITY`. `DROP TABLE IF EXISTS` xóa bảng an toàn — nhưng mất sạch dữ liệu, không hoàn tác.
