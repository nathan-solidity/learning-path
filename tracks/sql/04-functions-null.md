---
level: "sql-basics"
order: 4
title: "Hàm cơ bản & xử lý NULL"
est: "3-4 giờ"
checklist:
  - "Dùng hàm chuỗi cơ bản: UPPER/LOWER, LENGTH, TRIM, nối chuỗi"
  - "Dùng hàm số: ROUND, ABS, và phép tính trên cột"
  - "Lấy ngày giờ hiện tại và trích phần ngày/tháng/năm"
  - "Thay NULL bằng giá trị mặc định với COALESCE"
  - "Rẽ nhánh giá trị bằng CASE WHEN ... THEN ... END"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Dữ liệu thô hiếm khi ở đúng dạng bạn cần: chuỗi lẫn hoa thường, ngày cần tách tháng, `NULL`
cần thay bằng mặc định, giá trị cần phân loại. **Hàm** và `CASE` biến đổi dữ liệu ngay trong
truy vấn — không cần kéo về code xử lý.

## Hàm chuỗi

```sql
SELECT
    UPPER(name)          AS ten_hoa,      -- chữ hoa
    LOWER(email)         AS email_thuong, -- chữ thường
    LENGTH(name)         AS do_dai,       -- số ký tự
    TRIM(name)           AS bo_khoang_trang,
    CONCAT(name, ' - ', city) AS mo_ta    -- nối chuỗi
FROM customers;
```

Nối chuỗi: `CONCAT()` (mọi CSDL) hoặc `||` (PostgreSQL/SQLite/Oracle).

## Hàm số & tính toán

```sql
SELECT
    total_amount,
    ROUND(total_amount, 0)        AS lam_tron,  -- làm tròn về 0 lẻ
    total_amount * 1.1            AS them_10_phan_tram,
    ABS(balance)                  AS gia_tri_tuyet_doi
FROM orders;
```

Có thể tính trực tiếp trên cột: `price * quantity AS thanh_tien`.

## Hàm ngày giờ

```sql
SELECT
    CURRENT_DATE                    AS hom_nay,
    CURRENT_TIMESTAMP               AS bay_gio,
    EXTRACT(YEAR  FROM created_at)  AS nam,   -- trích năm
    EXTRACT(MONTH FROM created_at)  AS thang  -- trích tháng
FROM orders;
```

Hàm ngày **khác nhau nhiều giữa các CSDL** (MySQL có `YEAR()`, `DATE_FORMAT()`; SQLite dùng
`strftime()`). Tra tài liệu CSDL đang dùng.

## COALESCE — thay NULL bằng mặc định

```sql
-- Nếu phone là NULL thì hiển thị 'chưa có'
SELECT name, COALESCE(phone, 'chưa có') AS so_dien_thoai FROM customers;

-- Lấy giá trị đầu tiên khác NULL trong danh sách
SELECT COALESCE(nickname, name, 'Ẩn danh') AS ten_hien_thi FROM customers;
```

`COALESCE` cực hữu ích khi báo cáo — tránh cột hiện "null" trống trơn cho người đọc.

## CASE — rẽ nhánh giá trị

```sql
SELECT
    name,
    age,
    CASE
        WHEN age < 18 THEN 'trẻ em'
        WHEN age < 60 THEN 'người lớn'
        ELSE 'cao tuổi'
    END AS nhom_tuoi
FROM customers;
```

`CASE` như if/else trong SQL — chạy từ trên xuống, khớp nhánh đầu tiên. `ELSE` là mặc định
(thiếu `ELSE` thì trả `NULL` khi không khớp).

## Cạm bẫy hay gặp

- Phép tính có `NULL` → kết quả `NULL` (`5 + NULL = NULL`); bọc `COALESCE` trước khi tính.
- Hàm ngày giờ giả định dùng chung mọi CSDL → sai; kiểm tra cú pháp của CSDL đang dùng.
- Dùng hàm lên cột trong `WHERE` (`WHERE UPPER(name) = 'AN'`) làm **mất index** → chậm (bài 13).
- Nhầm `CONCAT` bỏ qua NULL vs `||` trả NULL khi một vế NULL (khác nhau giữa CSDL).
- Quên `ELSE` trong `CASE` → hàng không khớp nhánh nào ra `NULL` ngoài ý muốn.

## Ghi nhớ

Hàm biến đổi dữ liệu ngay trong truy vấn: chuỗi (`UPPER`/`LOWER`/`TRIM`/`CONCAT`), số
(`ROUND`/`ABS`), ngày (`EXTRACT`, `CURRENT_DATE`). **`COALESCE`** thay `NULL` bằng mặc định.
**`CASE WHEN`** là if/else của SQL để phân loại. Cẩn thận: tính toán với `NULL` luôn ra
`NULL`, và bọc hàm lên cột trong `WHERE` làm mất index.
