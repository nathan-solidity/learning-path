---
level: "sec-mindset"
order: 1
title: "Tư duy bảo mật: không bao giờ tin input"
est: "2-3 giờ"
checklist:
  - "Giải thích được vì sao 'mọi dữ liệu từ bên ngoài đều không đáng tin'"
  - "Liệt kê được các nguồn input không tin cậy (không chỉ form: query, header, cookie, file, API)"
  - "Hiểu 3 nguyên tắc: defense in depth, least privilege, fail securely"
  - "Nhận ra bảo mật là trách nhiệm của DEV, không phải chỉ của team security"
  - "Biết OWASP Top 10 là gì và vì sao dùng nó làm mốc"
related:
  - "glossary:dev"
  - "skill:nta-security-audit"
---

## Vì sao quan trọng

Gần như **mọi lỗ hổng bảo mật** đều bắt nguồn từ một sai lầm tư duy duy nhất: **tin tưởng
dữ liệu mà lẽ ra không được tin**. SQL injection, XSS, upload file độc hại... tất cả chỉ là
các biến thể của cùng một lỗi gốc. Nắm đúng tư duy này trước, các bài lỗ hổng sau chỉ là
áp dụng lại vào từng ngữ cảnh.

Bảo mật **không phải việc của riêng team security** hay của khâu cuối trước khi release. Lỗ
hổng nằm trong **code DEV viết ra**, nên phòng thủ hiệu quả nhất cũng nằm ở đó — ngay lúc gõ.

## Nguyên tắc gốc: mọi input đều không đáng tin

Bất kỳ dữ liệu nào **đến từ bên ngoài tầm kiểm soát của bạn** đều phải coi là **có thể độc
hại** cho đến khi được kiểm tra. Không chỉ form nhập liệu:

| Nguồn input | Ví dụ bị lợi dụng |
|-------------|-------------------|
| Query string / URL param | `?id=1 OR 1=1`, `?redirect=//evil.com` |
| Body request (JSON/form) | Field thừa, kiểu sai, giá trị vượt ngưỡng |
| HTTP header | `User-Agent`, `Referer`, `X-Forwarded-For` giả mạo |
| Cookie | Sửa `role=admin` phía client |
| File upload | File `.php` đội lốt `.jpg`, tên file `../../etc/passwd` |
| Dữ liệu từ API/bên thứ 3 | Không phải cứ "hệ thống bạn" là an toàn |
| Cả dữ liệu **từ chính DB** | Nếu nó từng do người dùng nhập vào (stored XSS) |

> **Ghi nhớ cốt lõi**: không có input nào "chắc chắn an toàn". Kể cả input nội bộ, input là
> số, input từ dropdown — kẻ tấn công gọi thẳng API, không dùng UI của bạn.

## Ba nguyên tắc phòng thủ nền tảng

**1. Defense in depth (phòng thủ nhiều lớp)** — không dựa vào một biện pháp duy nhất. Ví
dụ chống SQL injection: dùng prepared statement (lớp chính) **và** validate input **và**
least privilege cho tài khoản DB. Một lớp thủng, lớp khác vẫn đỡ.

**2. Least privilege (đặc quyền tối thiểu)** — mỗi thành phần chỉ có **đúng quyền cần
thiết**, không hơn. Tài khoản DB của app không cần quyền `DROP TABLE`. Token API chỉ cần
scope đọc thì đừng cấp quyền ghi. Nếu bị đột nhập, thiệt hại bị giới hạn.

**3. Fail securely (lỗi thì khóa lại, đừng mở ra)** — khi có sự cố/exception, hệ thống phải
về trạng thái **an toàn (từ chối)**, không phải trạng thái mở.

```javascript
// ❌ Lỗi khi kiểm quyền → cho qua
try { user = checkPermission(req); }
catch (e) { user = { role: 'guest' }; allow(); }   // fail-open: nguy hiểm

// ✅ Lỗi → từ chối
try { user = checkPermission(req); }
catch (e) { return res.status(403).send('Forbidden'); }  // fail-closed
```

## OWASP Top 10 — bản đồ lỗ hổng cần thuộc

**OWASP Top 10** là danh sách 10 nhóm rủi ro bảo mật web **nguy hiểm và phổ biến nhất**, do
cộng đồng bảo mật (OWASP) tổng hợp và cập nhật vài năm một lần. Đây là **mốc tối thiểu** mọi
DEV nên biết — phần lớn sự cố thực tế rơi vào các nhóm này:

- Broken Access Control (phân quyền hỏng) — thường đứng #1
- Cryptographic Failures (lộ dữ liệu do mã hóa sai/thiếu)
- Injection (SQL, command, LDAP...)
- Insecure Design, Security Misconfiguration
- Vulnerable & Outdated Components (dependency có CVE)
- Identification & Authentication Failures
- Software & Data Integrity Failures (supply chain)
- Security Logging & Monitoring Failures
- Server-Side Request Forgery (SSRF)

Lộ trình này bám theo các nhóm trên. Không cần thuộc lòng thứ tự — cần hiểu **mỗi nhóm là
gì và code thế nào để tránh**.

## Cạm bẫy tư duy hay gặp

- "Người dùng chúng ta không rành kỹ thuật đâu" → kẻ tấn công thì rành, và họ không dùng UI.
- "Cái này chạy nội bộ, không lộ ra ngoài" → threat nội bộ + lỗi cấu hình lộ ra là chuyện thường.
- "Có WAF/firewall lo rồi" → WAF chặn được một phần, không thay được code an toàn.
- "Để cuối dự án làm bảo mật sau" → vá lỗ hổng sau khi đã lên production đắt gấp nhiều lần.
- "Framework tự lo hết" → framework giúp nhiều, nhưng vẫn để bạn tự bắn vào chân nếu dùng sai.

## Ghi nhớ

Nền tảng của mọi kỹ năng bảo mật là **không tin bất kỳ dữ liệu nào từ bên ngoài** — mọi
input đều có thể độc hại đến khi được kiểm tra. Áp dụng ba nguyên tắc: **defense in depth**
(nhiều lớp), **least privilege** (quyền tối thiểu), **fail securely** (lỗi thì từ chối). Lấy
**OWASP Top 10** làm bản đồ các lỗ hổng cần phòng. Bảo mật là **trách nhiệm của DEV ngay lúc
viết code**, không để dồn về cuối. Dùng `/nta-security-audit` để rà soát theo OWASP Top 10.
