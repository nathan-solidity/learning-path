---
level: "sec-webvuln"
order: 3
title: "Injection: SQL, command, và các loại khác"
est: "3-4 giờ"
checklist:
  - "Giải thích được nguyên tắc gốc của mọi injection: input bị hiểu là code"
  - "Luôn dùng prepared statement / parameterized query cho SQL"
  - "Với command: truyền tham số dạng mảng, không ghép chuỗi qua shell"
  - "Nhận ra ORM/raw query vẫn dính injection nếu ghép chuỗi"
  - "Biết injection còn có ở NoSQL, LDAP, template — cùng một nguyên tắc phòng"
related:
  - "glossary:db"
---

## Vì sao quan trọng

**Injection** là một trong những nhóm nguy hiểm nhất OWASP Top 10 suốt nhiều năm. Cơ chế
luôn giống nhau: **input người dùng bị trộn vào một "câu lệnh"** (SQL, lệnh shell, truy vấn
LDAP/NoSQL, template) và bị interpreter **hiểu là code** thay vì dữ liệu. Hiểu nguyên tắc
gốc này thì phòng được **mọi loại injection**, không phải học vẹt từng ca.

> **Nguyên tắc gốc**: luôn **tách câu lệnh (code) khỏi dữ liệu**. Dữ liệu người dùng không
> bao giờ được nối chuỗi để trở thành một phần cấu trúc câu lệnh.

## SQL injection — kinh điển nhất

```python
# ❌ Ghép chuỗi input vào SQL
query = "SELECT * FROM users WHERE name = '" + name + "'"
```

Với `name = ' OR '1'='1`, câu lệnh thành `... WHERE name = '' OR '1'='1'` → trả về **toàn
bộ** user. Input `'; DROP TABLE users; --` có thể xóa cả bảng.

Phòng thủ số 1 — **prepared statement / parameterized query**: placeholder giữ dữ liệu tách
khỏi câu lệnh, DB không bao giờ hiểu input là SQL.

```python
# ✅ Python
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))
```
```java
// ✅ Java JDBC
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE name = ?");
ps.setString(1, name);
```
```javascript
// ✅ Node.js (pg)
db.query('SELECT * FROM users WHERE name = $1', [name]);
```

## Command injection — nguy hiểm không kém

Xảy ra khi input bị ghép vào **lệnh hệ điều hành**. Phòng: gọi chương trình bằng **API
truyền tham số dạng mảng**, không đi qua shell.

```python
# ❌ Ghép chuỗi vào shell — input "8.8.8.8; rm -rf /" thành lệnh xóa
os.system("ping " + host)

# ✅ Truyền tham số dạng mảng, không qua shell
subprocess.run(["ping", "-c", "1", host])   # shell=False (mặc định)
```

`host` giờ chỉ là **một tham số** của `ping`, không thể tách thành lệnh mới.

## Các loại injection khác — cùng một nguyên tắc

| Loại | Bối cảnh | Phòng thủ |
|------|----------|-----------|
| SQL | Truy vấn CSDL | Prepared statement |
| Command / OS | Gọi lệnh shell | Tham số dạng mảng, `shell=False` |
| NoSQL | MongoDB... nhận object từ JSON | Ép kiểu, validate schema; không nhét object thô vào query |
| LDAP | Truy vấn thư mục | Escape/tham số hóa theo API LDAP |
| Template (SSTI) | Render template với input | Không nhét input vào template string; dùng biến |

## Cạm bẫy: ORM cũng dính nếu ghép chuỗi

Dùng ORM **không tự động an toàn**. Chỗ hay thủng là **raw query / search / sort động**:

```python
# ❌ ORM nhưng lại ghép chuỗi vào raw SQL
User.objects.raw("SELECT * FROM users WHERE name = '%s'" % name)

# ✅ Truyền tham số cho ORM
User.objects.raw("SELECT * FROM users WHERE name = %s", [name])
```

Sort/filter động (ví dụ `ORDER BY {cột}` từ input) không tham số hóa được → dùng
**allowlist** tên cột hợp lệ, không ghép thẳng input.

## Cạm bẫy hay gặp

- "Input này là số/nội bộ, chắc an toàn" → vẫn tham số hóa, không ngoại lệ.
- Tưởng escape ký tự `'` là đủ → dễ bỏ sót; tham số hóa mới chắc.
- Dùng ORM nhưng chèn raw SQL ghép chuỗi ở chỗ khó (search động) → lỗ hổng quay lại.
- Command injection bị quên vì ít gặp hơn SQL → bất kỳ chỗ nào gọi shell đều phải soi.
- Nhét input vào template engine (SSTI) → có thể dẫn tới thực thi code phía server.

## Ghi nhớ

Mọi **injection** đều cùng một gốc: **input bị hiểu là code**. Phòng thủ là **tách câu lệnh
khỏi dữ liệu** — SQL dùng **prepared statement**, command dùng **tham số dạng mảng
(shell=False)**, các loại khác dùng API tham số hóa/escape đúng ngữ cảnh. **ORM vẫn dính**
nếu ghép chuỗi ở raw query hay sort/filter động (dùng allowlist tên cột). Track SQL có bài
SQL injection chi tiết hơn; bài này bao quát injection nói chung.
