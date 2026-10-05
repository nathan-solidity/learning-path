---
level: "sql-join-aggregate"
order: 10
title: "GROUP BY & hàm tổng hợp"
est: "4-5 giờ"
checklist:
  - "Dùng COUNT, SUM, AVG, MIN, MAX để thống kê toàn bảng"
  - "Gom nhóm bằng GROUP BY và tính tổng hợp theo từng nhóm"
  - "Phân biệt WHERE (lọc trước gom) và HAVING (lọc sau gom)"
  - "Hiểu thứ tự thực thi logic của một câu truy vấn"
  - "Phân biệt COUNT(*), COUNT(col) và COUNT(DISTINCT col)"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Câu hỏi thực tế hiếm khi là "liệt kê từng hàng" mà là "**mỗi thành phố có bao nhiêu khách?**",
"**doanh thu mỗi trạng thái đơn là bao nhiêu?**". Đó là bài toán **tổng hợp** (aggregate):
gom hàng thành nhóm rồi tính toán trên từng nhóm. `GROUP BY` + hàm tổng hợp là công cụ trả
lời gần như mọi câu hỏi báo cáo.

## Hàm tổng hợp — tính trên nhiều hàng

```sql
-- Thống kê toàn bảng (không nhóm) → trả về 1 hàng
SELECT
    COUNT(*)          AS so_khach,       -- đếm số hàng
    AVG(age)          AS tuoi_tb,        -- trung bình
    MIN(age)          AS tre_nhat,
    MAX(age)          AS gia_nhat
FROM customers;

-- Trên bảng orders
SELECT SUM(total_amount) AS tong_doanh_thu FROM orders;
```

## GROUP BY — gom nhóm rồi tính từng nhóm

```sql
-- Số khách và tuổi trung bình theo TỪNG thành phố
SELECT
    city,
    COUNT(*)   AS so_khach,
    AVG(age)   AS tuoi_tb
FROM customers
GROUP BY city;
```

Quy tắc vàng: mọi cột trong `SELECT` mà **không** nằm trong hàm tổng hợp thì **phải** có mặt
trong `GROUP BY`. Viết `SELECT city, name, COUNT(*) ... GROUP BY city` sẽ lỗi (hoặc ra kết
quả khó lường ở MySQL) vì `name` không được gom.

```sql
-- Doanh thu theo trạng thái đơn
SELECT status, SUM(total_amount) AS doanh_thu, COUNT(*) AS so_don
FROM orders
GROUP BY status;
```

## WHERE vs HAVING — khác biệt cốt lõi

```sql
-- WHERE lọc TỪNG HÀNG trước khi gom
-- HAVING lọc TỪNG NHÓM sau khi gom
SELECT city, COUNT(*) AS so_khach
FROM customers
WHERE age >= 18                 -- (1) bỏ khách dưới 18 TRƯỚC khi gom
GROUP BY city
HAVING COUNT(*) > 5;            -- (2) chỉ giữ thành phố có TRÊN 5 khách (sau gom)
```

| | WHERE | HAVING |
|---|-------|--------|
| Lọc cái gì | Từng **hàng** | Từng **nhóm** |
| Chạy khi nào | **Trước** GROUP BY | **Sau** GROUP BY |
| Dùng được hàm tổng hợp? | ❌ Không | ✅ Có (`HAVING SUM(...) > 100`) |

> **Nhớ**: không được viết `WHERE COUNT(*) > 5` — tại thời điểm `WHERE` chạy, nhóm chưa được
> tạo nên chưa có `COUNT`. Điều kiện trên kết quả tổng hợp luôn thuộc về `HAVING`.

## Thứ tự thực thi logic

Bạn **viết** theo thứ tự `SELECT → FROM → WHERE → GROUP BY...`, nhưng CSDL **chạy** theo
thứ tự khác:

```text
FROM  →  WHERE  →  GROUP BY  →  HAVING  →  SELECT  →  ORDER BY  →  LIMIT
```

Hiểu điều này giải thích nhiều lỗi: vì sao alias đặt ở `SELECT` thường **không** dùng được
trong `WHERE` (WHERE chạy trước SELECT), và vì sao lọc theo COUNT phải ở HAVING chứ không
phải WHERE.

## COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)

```sql
SELECT
    COUNT(*)                  AS tong_hang,        -- đếm mọi hàng (kể cả NULL)
    COUNT(email)              AS so_co_email,      -- đếm hàng có email KHÁC NULL
    COUNT(DISTINCT city)      AS so_thanh_pho      -- đếm giá trị city KHÁC NHAU
FROM customers;
```

| Cách viết | Đếm gì |
|-----------|--------|
| `COUNT(*)` | Tất cả hàng, kể cả hàng có NULL |
| `COUNT(col)` | Chỉ hàng mà `col` **khác NULL** |
| `COUNT(DISTINCT col)` | Số **giá trị khác nhau** của `col` (bỏ trùng, bỏ NULL) |

## Cạm bẫy hay gặp

- Cho cột không tổng hợp vào `SELECT` mà quên `GROUP BY` nó → lỗi (Postgres) hoặc kết quả sai âm thầm (MySQL cấu hình lỏng).
- Dùng `WHERE COUNT(*) > 5` → lỗi; điều kiện trên hàm tổng hợp phải nằm ở `HAVING`.
- Tưởng `COUNT(col)` đếm cả NULL → không; nó bỏ NULL. Muốn đếm mọi hàng dùng `COUNT(*)`.
- `SUM`/`AVG` **bỏ qua** hàng NULL → mẫu số của AVG có thể khác kỳ vọng; cân nhắc `COALESCE`.
- Dùng alias của `SELECT` trong `WHERE` → lỗi vì WHERE chạy trước SELECT; lặp lại biểu thức hoặc dùng subquery.

## Ghi nhớ

Hàm tổng hợp (**COUNT/SUM/AVG/MIN/MAX**) tính trên nhiều hàng; **`GROUP BY`** chia hàng
thành nhóm để tính riêng từng nhóm. Phân biệt sống còn: **`WHERE` lọc hàng TRƯỚC khi gom,
`HAVING` lọc nhóm SAU khi gom** — điều kiện trên `COUNT`/`SUM` luôn ở `HAVING`. Thứ tự chạy
thật là **FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY**. `COUNT(*)` đếm mọi hàng,
`COUNT(col)` bỏ NULL, `COUNT(DISTINCT col)` đếm giá trị khác nhau.
