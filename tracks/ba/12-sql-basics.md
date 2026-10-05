---
level: "technical"
order: 12
title: "SQL cho BA — tự truy vấn dữ liệu"
est: "5-6 giờ"
checklist:
  - "Viết được câu SELECT có WHERE, ORDER BY, LIMIT để lấy dữ liệu cần xem"
  - "Dùng được các hàm tổng hợp COUNT/SUM/AVG kèm GROUP BY"
  - "Hiểu và viết được JOIN 2 bảng để đối chiếu dữ liệu liên quan"
  - "Đọc hiểu được một ERD đơn giản để biết bảng nào nối bảng nào"
  - "Phân biệt được các loại quan hệ: 1:1, 1:n, n:n, optional (0:1/0:n), self-referencing"
  - "Tự thử được một truy vấn trong SQL Playground và đọc được kết quả"
  - "Biết vì sao BA chỉ nên chạy truy vấn READ-ONLY và không tự ý sửa dữ liệu"
related:
  - "glossary:db"
---

## Vì sao BA cần SQL

Khi cần trả lời "thực tế có bao nhiêu đơn ở trạng thái này?", "dữ liệu khách gửi có khớp
với hệ thống không?", BA biết SQL thì **tự lấy câu trả lời trong vài phút** thay vì chờ
dev nửa ngày. SQL cũng giúp verify giả thuyết khi phân tích yêu cầu.

> **Nguyên tắc an toàn số 1**: BA chỉ chạy truy vấn **đọc** (`SELECT`). Không `UPDATE`,
> `DELETE`, `INSERT` trên dữ liệu thật. Luôn hỏi trước khi chạy trên môi trường production.

## SELECT — lấy dữ liệu

```sql
SELECT id, customer_name, status, total_amount
FROM orders
WHERE status = 'pending'
  AND created_at >= '2026-01-01'
ORDER BY total_amount DESC
LIMIT 20;
```

Đọc: lấy 4 cột, từ bảng `orders`, chỉ đơn đang `pending` tạo từ đầu 2026, sắp theo số
tiền giảm dần, lấy 20 dòng đầu.

## Tổng hợp — COUNT / SUM / GROUP BY

Trả lời "mỗi trạng thái có bao nhiêu đơn, tổng tiền bao nhiêu":

```sql
SELECT status, COUNT(*) AS so_don, SUM(total_amount) AS tong_tien
FROM orders
GROUP BY status;
```

`GROUP BY` gom các dòng cùng `status` lại, hàm tổng hợp tính trên mỗi nhóm.

## JOIN — nối bảng để đối chiếu

Dữ liệu nằm ở nhiều bảng. Muốn xem đơn kèm tên khách (ở bảng khác):

```sql
SELECT o.id, c.full_name, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'pending';
```

`ON o.customer_id = c.id` là **điều kiện nối**: nối mỗi đơn với đúng khách của nó. Muốn
biết nối theo cột nào → đọc ERD.

## Đọc ERD để biết đường nối

ERD (Entity Relationship Diagram) cho thấy bảng nào liên kết bảng nào qua khóa ngoại
(foreign key). Ví dụ đơn giản:

![ERD customers - orders - order_items](/images/ba-sql-erd.png)

Ký hiệu crow's foot `||──o{` nghĩa là **một–nhiều**: một khách (`customers`) có nhiều đơn
(`orders`), một đơn có nhiều dòng hàng (`order_items`). `PK` là khóa chính, `FK` là khóa
ngoại — chính `FK` cho biết `JOIN ... ON` theo cột nào (vd `orders.customer_id = customers.id`).

## Các loại quan hệ giữa bảng

Không chỉ có 3 loại cơ bản. Khi đọc ERD, BA cần nhận ra đầy đủ các dạng sau — mỗi dạng
ảnh hưởng cách viết `JOIN` và cách hiểu nghiệp vụ:

| Loại | Ký hiệu | Ý nghĩa | Ví dụ trong Playground |
|------|---------|---------|------------------------|
| **1:1** | `||──||` | Mỗi dòng bên này khớp đúng 1 dòng bên kia | `users` ↔ `profiles` (nếu bắt buộc có profile) |
| **1:n** | `||──o{` | Một dòng bên này có nhiều dòng bên kia | Một `users` có nhiều `orders` |
| **n:n** | `}o──o{` | Nhiều–nhiều, cần **bảng trung gian** | `students` ↔ `courses` qua `enrollments` |
| **0:1 (optional 1:1)** | `||──o|` | Có thể **không có** dòng khớp bên kia | `users` → `profiles`: khách mới chưa tạo profile |
| **0:n (optional 1:n)** | `||──o{` | Bên "nhiều" có thể **rỗng** | `users` chưa đặt đơn nào → 0 `orders` |
| **Self-referencing** | `||──o{` (tự nối) | Bảng **tự nối chính nó** | `categories.parent_id → categories.id` (danh mục cha–con) |

**Vì sao BA cần phân biệt?**

- **optional (0:1 / 0:n)** → khi JOIN phải cân nhắc `LEFT JOIN` thay vì `JOIN`. Nếu dùng
  `JOIN` thường, các dòng **không có** bên kia (vd user chưa có profile) sẽ **bị loại khỏi
  kết quả** — dễ đếm thiếu.
- **n:n** → không nối trực tiếp 2 bảng được, phải đi qua bảng trung gian (junction table).
  Ví dụ đếm "mỗi khóa học có bao nhiêu sinh viên" phải JOIN qua `enrollments`.
- **self-referencing** → cùng một bảng xuất hiện 2 lần trong câu SQL, phải đặt **alias**
  khác nhau (`c1`, `c2`) để phân biệt cha và con.

> **INNER JOIN vs LEFT JOIN**: `JOIN` (inner) chỉ giữ dòng có khớp cả 2 bên. `LEFT JOIN`
> giữ **mọi** dòng bảng trái, bên phải thiếu thì để `NULL`. Với quan hệ optional, chọn sai
> loại JOIN là nguyên nhân đếm sai số phổ biến nhất.

## SQL Playground — tự thử ngay

Dưới đây là một cơ sở dữ liệu mẫu chạy **ngay trong trình duyệt** (không đụng DB thật).
Dùng **Query Builder** để chọn bảng/cột và tự sinh câu SQL, hoặc gõ SQL tự do vào ô, bấm
**Chạy** để xem kết quả. Chỉ chạy được truy vấn **đọc** (`SELECT`) — đúng nguyên tắc an toàn của BA.

[[sql-playground]]

## Cạm bẫy hay gặp

- Quên `WHERE` → lấy toàn bộ bảng (chậm, tràn kết quả).
- `JOIN` thiếu điều kiện `ON` → tích Descartes, số dòng nổ ra khổng lồ.
- So sánh ngày/giờ quên timezone → lệch kết quả.
- `COUNT(*)` vs `COUNT(cột)`: cái sau bỏ qua `NULL`.
