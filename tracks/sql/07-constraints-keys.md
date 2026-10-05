---
level: "sql-modify"
order: 7
title: "Constraint & Khóa chính/ngoại"
est: "4-5 giờ"
checklist:
  - "Dùng NOT NULL, UNIQUE, DEFAULT, CHECK để ràng buộc dữ liệu hợp lệ"
  - "Khai báo PRIMARY KEY định danh duy nhất mỗi hàng"
  - "Khai báo FOREIGN KEY để liên kết bảng và giữ toàn vẹn tham chiếu"
  - "Chọn đúng hành vi ON DELETE: CASCADE / RESTRICT / SET NULL"
  - "Giải thích vì sao ràng buộc ở tầng DB an toàn hơn chỉ validate ở app"
related:
  - "glossary:db"
---

## Vì sao quan trọng

Constraint là **luật CSDL tự bắt buộc** — dữ liệu sai không thể lọt vào, bất kể lỗi ở app,
script nhập tay, hay nhiều service cùng ghi. Nếu chỉ validate ở tầng ứng dụng, chỉ cần một
đường ghi bỏ qua validation là dữ liệu bẩn lọt vào và **hỏng vĩnh viễn**. Constraint là
tuyến phòng thủ cuối cùng, đáng tin nhất.

## Ràng buộc trên cột

```sql
CREATE TABLE customers (
    id      INTEGER GENERATED ALWAYS AS IDENTITY,
    name    VARCHAR(100) NOT NULL,          -- bắt buộc có giá trị
    email   VARCHAR(255) UNIQUE,            -- không trùng email
    age     INTEGER CHECK (age >= 0),       -- điều kiện hợp lệ
    city    VARCHAR(100) DEFAULT 'Hà Nội',  -- giá trị mặc định khi không truyền
    is_active BOOLEAN DEFAULT TRUE
);
```

| Constraint | Ý nghĩa |
|------------|---------|
| `NOT NULL` | Cột bắt buộc có giá trị, không được để trống |
| `UNIQUE` | Không có hai hàng trùng giá trị cột này |
| `DEFAULT x` | Tự điền `x` khi INSERT không truyền cột này |
| `CHECK (đk)` | Chỉ nhận giá trị thỏa điều kiện |

## PRIMARY KEY — khóa chính

```sql
CREATE TABLE customers (
    id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
```

`PRIMARY KEY` = định danh **duy nhất** mỗi hàng. Nó ngầm là `NOT NULL` + `UNIQUE`, và CSDL
tự tạo index cho nó (tra cứu theo id rất nhanh). Mỗi bảng nên có đúng một khóa chính.

## FOREIGN KEY — khóa ngoại & toàn vẹn tham chiếu

Khóa ngoại liên kết bảng con với bảng cha, đảm bảo **không có bản ghi mồ côi**:

```sql
CREATE TABLE orders (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    total_amount DECIMAL(12, 2),
    status      VARCHAR(20),
    -- customer_id phải trỏ tới một id có thật trong bảng customers
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

Nhờ khóa ngoại:
- Không thể tạo `order` với `customer_id` không tồn tại (chặn dữ liệu mồ côi).
- Không thể xóa `customer` khi vẫn còn `order` trỏ tới (trừ khi khai báo hành vi khác).

![Sơ đồ quan hệ bảng](/images/sql-erd.png)

## ON DELETE — chuyện gì xảy ra khi xóa bản ghi cha

```sql
-- Xóa customer thì xóa luôn mọi order của họ
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
-- Chặn xóa customer nếu còn order (mặc định, an toàn nhất)
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
-- Xóa customer thì đặt customer_id của order về NULL
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
```

| Hành vi | Khi xóa hàng cha |
|---------|------------------|
| `RESTRICT` / `NO ACTION` | Chặn xóa nếu còn hàng con (mặc định) |
| `CASCADE` | Xóa luôn mọi hàng con — mạnh, dùng cẩn thận |
| `SET NULL` | Cột khóa ngoại ở hàng con thành `NULL` (phải cho phép NULL) |

> `CASCADE` tiện nhưng nguy hiểm: xóa một `customer` có thể quét sạch dữ liệu liên quan
> trên nhiều bảng. Mặc định nên `RESTRICT` và xóa có chủ đích.

## Vì sao constraint ở DB > chỉ validate ở app

```sql
-- Dù app quên kiểm tra, DB vẫn từ chối:
INSERT INTO customers (name, email) VALUES ('An', NULL);  -- ❌ NOT NULL chặn
INSERT INTO orders (customer_id) VALUES (99999);          -- ❌ FK chặn (không có customer 99999)
```

- Validation ở app có thể bị **bỏ qua** bởi script nhập tay, migration, service khác, hoặc bug.
- Constraint ở DB áp dụng cho **mọi** đường ghi — không có ngoại lệ.
- Nên có **cả hai**: app báo lỗi thân thiện sớm, DB là lưới an toàn cuối cùng.

## Cạm bẫy hay gặp

- Chỉ validate ở app, không có constraint DB → một đường ghi lọt là dữ liệu bẩn vĩnh viễn.
- Dùng `ON DELETE CASCADE` bừa → xóa một hàng cha quét sạch dữ liệu con ngoài ý muốn.
- Quên `FOREIGN KEY` → sinh bản ghi mồ côi (order trỏ tới customer không tồn tại).
- `UNIQUE` trên cột cho phép NULL → nhiều CSDL coi mỗi NULL là khác nhau, vẫn chèn được nhiều NULL.
- Đổi/thêm `NOT NULL` trên bảng đã có dữ liệu NULL → migration lỗi; phải xử lý dữ liệu cũ trước.

## Ghi nhớ

Constraint là luật CSDL **tự bắt buộc**, đáng tin hơn validate ở app: `NOT NULL`, `UNIQUE`,
`DEFAULT`, `CHECK`. **`PRIMARY KEY`** định danh duy nhất mỗi hàng; **`FOREIGN KEY`** giữ
**toàn vẹn tham chiếu** (không có bản ghi mồ côi). Chọn `ON DELETE` cẩn thận — mặc định
`RESTRICT` an toàn, `CASCADE` mạnh nhưng dễ xóa nhầm hàng loạt. Tốt nhất: validate ở app
**và** constraint ở DB.
