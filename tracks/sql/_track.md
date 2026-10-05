---
track: "sql"
role: "dev-sql"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "SQL"
variant_desc: "Cẩm nang SQL từ căn bản đến thực chiến: truy vấn dữ liệu (SELECT/WHERE/ORDER BY), thay đổi dữ liệu & thiết kế bảng (INSERT/UPDATE, constraint), JOIN & tổng hợp (GROUP BY, subquery), tới nâng cao (index, view, transaction, window function, chống SQL injection) — dùng chung cho mọi Developer, mọi ngôn ngữ."
title: "SQL"
icon: "🗃️"
summary: "Lộ trình SQL cho mọi lập trình viên, không phụ thuộc ngôn ngữ: truy vấn dữ liệu (SELECT, WHERE, ORDER BY, LIMIT, hàm), thay đổi & thiết kế dữ liệu (INSERT/UPDATE/DELETE, CREATE TABLE, kiểu dữ liệu, constraint, khóa chính/ngoại), kết nối & tổng hợp nhiều bảng (JOIN, GROUP BY, aggregate, subquery), và nâng cao thực chiến (index & tối ưu, view, transaction/ACID, window function, chống SQL injection)."
levels:
  - key: "sql-basics"
    title: "Truy vấn cơ bản"
    desc: "SQL & CSDL quan hệ là gì, SELECT lấy dữ liệu, lọc bằng WHERE (AND/OR/IN/BETWEEN/LIKE), sắp xếp ORDER BY, giới hạn LIMIT, xử lý NULL và hàm cơ bản — đủ để tự đọc dữ liệu."
  - key: "sql-modify"
    title: "Thay đổi & Thiết kế dữ liệu"
    desc: "Thêm/sửa/xóa dữ liệu (INSERT/UPDATE/DELETE), tạo & sửa bảng (CREATE/ALTER TABLE), kiểu dữ liệu, ràng buộc (NOT NULL/UNIQUE/CHECK/DEFAULT) và khóa chính/khóa ngoại — thiết kế bảng đúng ngay từ đầu."
  - key: "sql-join-aggregate"
    title: "JOIN & Tổng hợp"
    desc: "Nối nhiều bảng (INNER/LEFT/RIGHT/FULL JOIN), gom nhóm & thống kê (GROUP BY, HAVING, COUNT/SUM/AVG), truy vấn con (subquery), gộp kết quả (UNION) — trả lời câu hỏi thật trên dữ liệu nhiều bảng."
  - key: "sql-advanced"
    title: "Nâng cao & Thực chiến"
    desc: "Index & tối ưu truy vấn (đọc EXPLAIN, tránh N+1), view & CTE, transaction & ACID, window function, và bảo mật (chống SQL injection bằng prepared statement) — kỹ năng của developer làm việc với DB thật."
---

## Về lộ trình này

SQL là kỹ năng **bắt buộc** với gần như mọi lập trình viên: web, backend, data, mobile —
chỗ nào có dữ liệu là chỗ đó cần truy vấn. Lộ trình này **không phụ thuộc ngôn ngữ hay
framework** (Python, Java, Node, RoR đều dùng SQL như nhau) — học một lần, dùng cho mọi
dự án. Mục tiêu: **tự đọc và thao tác dữ liệu tự tin**, thiết kế bảng đúng, và viết truy
vấn nhanh — an toàn trên DB thật.

Thiết kế theo hướng **học đến đâu chạy được đến đó**: mỗi bài đều có câu SQL chạy thử được,
không chỉ đọc lý thuyết. Mỗi bài có checklist tự đánh giá — tick khi bạn tự tin **viết được
câu truy vấn**, không chỉ hiểu lý thuyết. Tiến độ tính theo số item đã tick.

### Cách đi lộ trình

Học **tuần tự** — mỗi cấp độ là nền cho cấp sau:

**Truy vấn cơ bản → Thay đổi & Thiết kế → JOIN & Tổng hợp → Nâng cao & Thực chiến**

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Truy vấn cơ bản | Tự lấy đúng dữ liệu cần: lọc, sắp xếp, giới hạn, xử lý NULL |
| Thay đổi & Thiết kế | Thêm/sửa/xóa an toàn, tạo bảng với constraint & khóa đúng chuẩn |
| JOIN & Tổng hợp | Nối nhiều bảng, thống kê theo nhóm, viết subquery trả lời câu hỏi phức tạp |
| Nâng cao & Thực chiến | Tối ưu truy vấn chậm, dùng transaction/view, viết SQL an toàn không dính injection |

### Vì sao học theo thứ tự này

Rất nhiều người viết được `SELECT *` nhưng **không hiểu dữ liệu nằm ở đâu, quan hệ giữa các
bảng thế nào**, nên gặp bài toán nhiều bảng là bó tay hoặc copy query không hiểu. Nắm chắc
truy vấn một bảng (lọc, sắp xếp, NULL) trước, rồi mới đến thiết kế bảng đúng (khóa, constraint),
sau đó JOIN nhiều bảng mới không rối. Phần nâng cao (index, transaction, chống injection) là
thứ **phân biệt người viết query chạy được với developer làm DB production** — đừng bỏ qua.

> **An toàn số 1**: `UPDATE`/`DELETE` mà quên `WHERE` sẽ đổi/xóa **toàn bộ bảng**. Luôn
> `SELECT` kiểm tra điều kiện trước, và không bao giờ ghép chuỗi input người dùng vào câu
> SQL (bài 16 — SQL injection).

### Môi trường & tài nguyên

- **CSDL để luyện**: [SQLite](https://sqlite.org) (không cần cài server, nhẹ nhất để bắt
  đầu), **PostgreSQL** hoặc **MySQL** (phổ biến trong dự án thật). Bản online chạy thử:
  [SQLite Online](https://sqliteonline.com), [DB Fiddle](https://www.db-fiddle.com).
- **Công cụ**: **DBeaver** (đa CSDL, miễn phí), **TablePlus**, hoặc CLI (`psql`, `mysql`,
  `sqlite3`). VS Code có extension SQL để chạy query trực tiếp.
- Cú pháp SQL **gần giống nhau giữa các CSDL** nhưng có khác biệt nhỏ (kiểu dữ liệu, hàm
  chuỗi/ngày, `LIMIT` vs `TOP`). Bài học ghi rõ khi có khác biệt; mặc định theo chuẩn SQL
  và PostgreSQL/MySQL.
- Tài liệu: [W3Schools SQL](https://www.w3schools.com/sql/),
  [PostgreSQL docs](https://www.postgresql.org/docs/),
  [MySQL docs](https://dev.mysql.com/doc/), [Use The Index, Luke](https://use-the-index-luke.com)
  (chuyên sâu index).
- Mỗi bài có ví dụ chạy được — nên gõ lại và chạy trên một DB thật, đừng chỉ đọc.

Nội dung liên kết với `term-glossary` (tra thuật ngữ) và các skill dev
(`/nta-db-review`, `/nta-db-consistency`, `/nta-db-seed`, `/nta-security-audit`,
`/nta-perf-audit`...) — gặp thuật ngữ lạ thì mở glossary, muốn review schema hay audit
truy vấn thì dùng skill tương ứng.
