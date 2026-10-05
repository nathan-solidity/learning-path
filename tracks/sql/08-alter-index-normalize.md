---
level: "sql-modify"
order: 8
title: "ALTER TABLE & chuẩn hóa"
est: "4-5 giờ"
checklist:
  - "Sửa cấu trúc bảng bằng ALTER TABLE: thêm/xóa/đổi cột"
  - "Thêm constraint vào bảng đã tồn tại bằng ALTER TABLE ADD CONSTRAINT"
  - "Giải thích 1NF/2NF/3NF ở mức khái niệm để tránh lặp dữ liệu"
  - "Tách một bảng phình to thành các bảng liên kết bằng khóa ngoại"
  - "Nhận biết khi nào cân nhắc denormalize để tối ưu đọc"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Bảng không đứng yên — yêu cầu đổi thì cấu trúc phải đổi theo, đó là việc của `ALTER TABLE`.
Nhưng đổi thế nào cho **đúng** thì cần hiểu **chuẩn hóa** (normalization): cách tách dữ liệu
để không lặp lại, không mâu thuẫn. Thiết kế lặp dữ liệu là nguồn của lỗi "cập nhật một chỗ,
quên chỗ kia" khiến dữ liệu tự mâu thuẫn.

## ALTER TABLE — sửa cấu trúc bảng

```sql
-- Thêm cột mới
ALTER TABLE customers ADD COLUMN loyalty_points INTEGER DEFAULT 0;

-- Xóa cột
ALTER TABLE customers DROP COLUMN phone;

-- Đổi kiểu / ràng buộc cột (cú pháp khác nhau giữa CSDL)
ALTER TABLE customers ALTER COLUMN age TYPE BIGINT;        -- PostgreSQL
-- ALTER TABLE customers MODIFY COLUMN age BIGINT;          -- MySQL

-- Đổi tên cột
ALTER TABLE customers RENAME COLUMN name TO full_name;
```

### Thêm constraint vào bảng đã có

```sql
ALTER TABLE orders
    ADD CONSTRAINT fk_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE customers ADD CONSTRAINT uq_email UNIQUE (email);
```

> Thêm `NOT NULL`/`UNIQUE`/`FOREIGN KEY` vào bảng đã có dữ liệu sẽ **lỗi nếu dữ liệu cũ vi
> phạm**. Phải làm sạch dữ liệu cũ trước, và trên production nên chạy trong migration có kiểm soát.

## Chuẩn hóa (Normalization) — tránh lặp dữ liệu

Xét bảng đơn thiết kế **kém** (mọi thứ nhồi một bảng):

| order_id | customer_name | customer_city | product | price |
|----------|---------------|---------------|---------|-------|
| 1 | An | Hà Nội | Bàn phím | 500 |
| 2 | An | Hà Nội | Chuột | 200 |
| 3 | Bình | Đà Nẵng | Bàn phím | 500 |

Vấn đề: tên/thành phố của An **lặp mỗi đơn**; An đổi thành phố phải sửa nhiều dòng, sót một
dòng là dữ liệu mâu thuẫn.

**Chuẩn hóa** = tách thành các bảng liên kết bằng khóa ngoại:

```sql
-- customers: mỗi khách một hàng duy nhất
CREATE TABLE customers (
    id   INTEGER PRIMARY KEY,
    name VARCHAR(100),
    city VARCHAR(100)
);
-- orders: chỉ tham chiếu customer_id, không lặp lại tên/thành phố
CREATE TABLE orders (
    id          INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    product     VARCHAR(100),
    price       DECIMAL(12, 2)
);
```

### Ba mức chuẩn hóa thường gặp (khái niệm)

| Dạng chuẩn | Ý tưởng cốt lõi |
|------------|-----------------|
| **1NF** | Mỗi ô một giá trị nguyên tử — không nhồi danh sách vào một cột (`'bàn phím, chuột'`) |
| **2NF** | 1NF + mọi cột phụ thuộc **toàn bộ** khóa chính (tách khi khóa gồm nhiều cột) |
| **3NF** | 2NF + cột không khóa không phụ thuộc cột không khóa khác (tách `city` khỏi `customer_name`) |

Thực tế: nhắm tới **3NF** cho hầu hết thiết kế nghiệp vụ — mỗi sự thật lưu đúng **một chỗ**.

## Khi nào cân nhắc denormalize

Denormalize = **cố ý lặp lại dữ liệu** để đọc nhanh hơn (đỡ JOIN nhiều bảng):

- Báo cáo/analytics đọc rất nhiều, ghi rất ít → chấp nhận lặp để truy vấn nhanh.
- Cột tổng hợp tính sẵn (ví dụ `order_count` trên `customers`) để tránh COUNT mỗi lần.

> Đánh đổi: đọc nhanh hơn **nhưng** phải tự đồng bộ khi dữ liệu gốc đổi (dễ lệch). Mặc định
> **chuẩn hóa trước**, chỉ denormalize khi đã đo được vấn đề hiệu năng thật — không đoán mò.

## Cạm bẫy hay gặp

- Thêm `NOT NULL`/`UNIQUE`/FK vào bảng đã có dữ liệu vi phạm → migration lỗi; làm sạch dữ liệu trước.
- Chạy `ALTER TABLE` nặng trên bảng lớn giờ cao điểm → khóa bảng, downtime; làm ngoài giờ/migration có kiểm soát.
- Nhồi nhiều giá trị vào một cột (`'a, b, c'`) → vi phạm 1NF, không query/JOIN được; tách bảng.
- Lặp dữ liệu khắp nơi (không chuẩn hóa) → cập nhật sót chỗ, dữ liệu tự mâu thuẫn.
- Denormalize sớm khi chưa đo được vấn đề → phức tạp hóa vô ích và dễ lệch dữ liệu.

## Ghi nhớ

`ALTER TABLE` thêm/xóa/đổi cột và thêm constraint — nhưng đổi trên bảng có dữ liệu phải cẩn
thận (làm sạch trước, tránh khóa bảng lúc cao điểm). **Chuẩn hóa** (nhắm **3NF**) để mỗi sự
thật lưu **một chỗ**, tránh lặp dữ liệu gây mâu thuẫn; tách bảng và nối bằng khóa ngoại.
**Denormalize** chỉ khi đã đo được vấn đề đọc thật — mặc định chuẩn hóa trước.
