---
level: "sql-advanced"
order: 16
title: "Bảo mật SQL & chống injection"
est: "4-5 giờ"
checklist:
  - "Giải thích được SQL injection xảy ra thế nào và hậu quả"
  - "Luôn dùng prepared statement / parameterized query thay vì ghép chuỗi"
  - "Nhận ra code có nguy cơ injection khi review"
  - "Áp dụng nguyên tắc least privilege cho tài khoản DB của ứng dụng"
  - "Biết các phòng thủ bổ sung: validate input, không lộ lỗi SQL ra ngoài"
related:
  - "glossary:db"
  - "skill:nta-security-audit"
---

## Vì sao quan trọng

**SQL injection** đứng đầu OWASP Top 10 suốt nhiều năm và vẫn là nguyên nhân rò rỉ dữ liệu
phổ biến. Nó xảy ra khi input người dùng bị **ghép thẳng vào câu SQL** — kẻ tấn công gửi
chuỗi đặc biệt để đổi ý nghĩa truy vấn, đọc trộm hoặc xóa toàn bộ dữ liệu. Đây là kỹ năng
bảo mật **bắt buộc** với mọi developer chạm vào DB.

## Lỗ hổng: ghép chuỗi input vào SQL

```python
# ❌ CỰC KỲ NGUY HIỂM — ghép chuỗi trực tiếp
user_input = request.get("name")
query = "SELECT * FROM users WHERE name = '" + user_input + "'"
```

Nếu `user_input` là `' OR '1'='1`, câu SQL thành:

```sql
SELECT * FROM users WHERE name = '' OR '1'='1';   -- luôn đúng → trả về TOÀN BỘ users
```

Tệ hơn, input `'; DROP TABLE users; --` có thể **xóa cả bảng**. Kẻ tấn công cũng dùng
`UNION` để đọc trộm bảng khác (mật khẩu, thẻ...).

## Phòng thủ số 1: Prepared statement (parameterized query)

Tách **câu lệnh** khỏi **dữ liệu** — CSDL không bao giờ hiểu input là mã SQL:

```python
# ✅ Python (dùng ? hoặc %s tùy driver)
cursor.execute("SELECT * FROM users WHERE name = %s", (user_input,))
```

```java
// ✅ Java JDBC
PreparedStatement ps = conn.prepareStatement(
    "SELECT * FROM users WHERE name = ?");
ps.setString(1, userInput);
```

```javascript
// ✅ Node.js (pg / mysql2)
db.query('SELECT * FROM users WHERE name = $1', [userInput]);
```

Placeholder (`?`, `%s`, `$1`) là **cách đúng duy nhất** để đưa dữ liệu vào query. ORM
(SQLAlchemy, JPA, ActiveRecord, Prisma) làm điều này tự động khi bạn không tự ghép chuỗi.

> **Quy tắc vàng**: dữ liệu người dùng **không bao giờ** đi vào câu SQL bằng nối chuỗi.
> Không có ngoại lệ — kể cả khi "chắc chắn input là số".

## Least privilege — giảm thiệt hại nếu bị đột nhập

Tài khoản DB của ứng dụng chỉ nên có quyền **vừa đủ**:

```sql
-- Tài khoản app chỉ đọc/ghi dữ liệu, KHÔNG có quyền DROP/ALTER
GRANT SELECT, INSERT, UPDATE, DELETE ON app_db.* TO 'app_user'@'%';
-- Không cấp: DROP, ALTER, GRANT, quyền admin
```

Nếu bị injection, kẻ tấn công cũng không `DROP TABLE` được vì tài khoản không có quyền đó.

## Phòng thủ nhiều lớp

| Lớp | Biện pháp |
|-----|-----------|
| Truy vấn | **Prepared statement** (bắt buộc) |
| Input | Validate kiểu/độ dài/định dạng ở tầng app (bổ sung, không thay thế) |
| Quyền | Least privilege cho tài khoản DB |
| Lỗi | **Không** trả nguyên văn lỗi SQL ra client (lộ cấu trúc bảng) |
| Giám sát | Log & cảnh báo truy vấn bất thường |

Validate input là **lớp bổ sung**, không phải thay thế prepared statement — đừng dựa vào
"lọc ký tự đặc biệt" làm phòng thủ chính (dễ bỏ sót).

## Cạm bẫy hay gặp

- Ghép chuỗi vì "input này là số/nội bộ, chắc an toàn" → vẫn dính; luôn tham số hóa.
- Tưởng chỉ cần escape/lọc ký tự `'` là đủ → dễ bỏ sót; prepared statement mới chắc.
- Dùng ORM nhưng lại chèn raw SQL ghép chuỗi ở chỗ khó (search, sort động) → lỗ hổng quay lại.
- Tài khoản app dùng quyền admin/root DB → một lỗ hổng nhỏ thành thảm họa toàn bảng.
- Trả lỗi SQL nguyên văn ra client → lộ tên bảng/cột, giúp kẻ tấn công dò cấu trúc.

## Ghi nhớ

**SQL injection** = input người dùng bị **ghép chuỗi** vào SQL, đổi ý nghĩa truy vấn — có
thể lộ hoặc xóa toàn bộ dữ liệu. Phòng thủ số 1 và bắt buộc: **prepared statement /
parameterized query** (placeholder `?`/`$1`/`%s`), **không bao giờ nối chuỗi**. Bổ sung:
**least privilege** cho tài khoản DB, validate input, và **không lộ lỗi SQL** ra ngoài.
Dùng `/nta-security-audit` để rà lỗ hổng.
