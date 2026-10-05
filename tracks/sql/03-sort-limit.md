---
level: "sql-basics"
order: 3
title: "ORDER BY & LIMIT — sắp xếp, giới hạn"
est: "3-4 giờ"
checklist:
  - "Sắp xếp kết quả bằng ORDER BY tăng/giảm (ASC/DESC)"
  - "Sắp xếp theo nhiều cột với thứ tự ưu tiên"
  - "Giới hạn số hàng bằng LIMIT và phân trang với OFFSET"
  - "Hiểu vì sao không có ORDER BY thì thứ tự kết quả không đảm bảo"
  - "Xử lý được vị trí của NULL khi sắp xếp"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Không có `ORDER BY`, CSDL **không đảm bảo thứ tự** trả về — hôm nay đúng, mai đổi. Muốn
"5 đơn mới nhất", "khách chi tiêu cao nhất", bạn cần sắp xếp rồi giới hạn. `ORDER BY` +
`LIMIT` cũng là nền của **phân trang** (pagination).

## ORDER BY — sắp xếp

```sql
SELECT name, age FROM customers ORDER BY age;         -- tăng dần (mặc định ASC)
SELECT name, age FROM customers ORDER BY age DESC;    -- giảm dần
SELECT name FROM customers ORDER BY name;             -- chuỗi: theo bảng chữ cái
```

### Sắp xếp nhiều cột

```sql
-- Ưu tiên city (A→Z), trong cùng city thì age giảm dần
SELECT name, city, age
FROM customers
ORDER BY city ASC, age DESC;
```

CSDL sắp theo cột đầu trước; cột sau chỉ phân định khi cột trước bằng nhau.

## LIMIT — giới hạn số hàng

```sql
-- 5 khách lớn tuổi nhất
SELECT name, age FROM customers ORDER BY age DESC LIMIT 5;
```

> **Luôn đi kèm `ORDER BY`**: `LIMIT 5` mà không sắp xếp thì "5 hàng bất kỳ" — không có
> nghĩa "5 hàng đầu" theo tiêu chí nào cả.

## OFFSET — phân trang

```sql
-- Trang 1: 10 hàng đầu
SELECT name FROM customers ORDER BY id LIMIT 10 OFFSET 0;
-- Trang 2: bỏ 10 hàng đầu, lấy 10 tiếp theo
SELECT name FROM customers ORDER BY id LIMIT 10 OFFSET 10;
```

Công thức: `OFFSET = (số_trang - 1) * kích_thước_trang`.

> **Lưu ý hiệu năng**: `OFFSET` lớn (trang 10000) vẫn phải quét qua toàn bộ hàng bị bỏ →
> chậm. Với dữ liệu lớn, dùng **keyset pagination** (`WHERE id > last_id`) thay vì OFFSET (bài 13).

## Vị trí của NULL khi sắp xếp

`NULL` được coi là "lớn nhất" hay "nhỏ nhất" tùy CSDL:

```sql
-- PostgreSQL/Oracle cho phép chỉ định rõ:
SELECT name, age FROM customers ORDER BY age ASC NULLS LAST;
```

- PostgreSQL: mặc định `NULLS LAST` khi `ASC`, `NULLS FIRST` khi `DESC`.
- MySQL: `NULL` xếp trước khi `ASC`. Nếu cần chắc chắn, xử lý rõ ràng.

## Khác biệt giữa các CSDL

| CSDL | Cú pháp giới hạn |
|------|------------------|
| PostgreSQL / MySQL / SQLite | `LIMIT 10 OFFSET 20` |
| SQL Server | `OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY` |
| Oracle (cũ) | `WHERE ROWNUM <= 10` |

## Cạm bẫy hay gặp

- `LIMIT` không kèm `ORDER BY` → "top N" vô nghĩa, kết quả không ổn định giữa các lần chạy.
- Tưởng thứ tự insert = thứ tự trả về → sai; không `ORDER BY` thì thứ tự không đảm bảo.
- `OFFSET` lớn để phân trang sâu → rất chậm; dùng keyset pagination.
- Quên rằng sắp xếp chuỗi số dạng text ('10' < '9') khác sắp xếp số — kiểm tra kiểu cột.
- Vị trí `NULL` khác nhau giữa các CSDL → chỉ định `NULLS FIRST/LAST` khi cần chắc chắn.

## Ghi nhớ

`ORDER BY cột [ASC|DESC]` sắp xếp; nhiều cột thì cột trước ưu tiên. `LIMIT n` lấy n hàng —
**luôn đi cùng `ORDER BY`** để "top N" có nghĩa. `OFFSET` phân trang nhưng chậm khi sâu →
keyset pagination cho bảng lớn. Không `ORDER BY` thì **thứ tự kết quả không được đảm bảo**.
