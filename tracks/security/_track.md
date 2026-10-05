---
track: "security"
role: "dev-security"
group: "dev"
group_title: "Developer"
group_icon: "💻"
group_summary: "Lộ trình cho lập trình viên — chọn ngôn ngữ/framework bạn muốn học chuyên sâu."
variant: "Secure Coding (Bảo mật)"
variant_desc: "Bảo mật ứng dụng cho DEV: hiểu lỗ hổng xảy ra thế nào và — quan trọng nhất — viết code thế nào để hạn chế tối đa lỗi bảo mật. Xoay quanh OWASP Top 10 và thói quen an toàn hằng ngày, không phải pentest/forensics."
title: "Secure Coding cho Developer"
icon: "🔒"
summary: "Lộ trình bảo mật ứng dụng dành cho lập trình viên: từ tư duy bảo mật & input validation, qua các lỗ hổng phổ biến nhất (injection, XSS, CSRF, auth, access control) đến quản lý secret, dependency/supply-chain và đưa bảo mật vào quy trình dev. Trọng tâm là DEV cần LÀM GÌ trong code để hạn chế tối đa lỗi bảo mật."
levels:
  - key: "sec-mindset"
    title: "Nền tảng & tư duy"
    desc: "Tư duy tin cậy (không tin input), phân biệt lỗ hổng phổ biến, và kỹ năng nền: input validation, output encoding — thứ ngăn phần lớn lỗ hổng ngay từ gốc."
  - key: "sec-webvuln"
    title: "Lỗ hổng web thường gặp"
    desc: "Các lỗ hổng DEV hay tạo ra nhất: injection (SQL/command), XSS, CSRF, authentication yếu, và broken access control — hiểu cơ chế + cách phòng thủ trong code."
  - key: "sec-hardening"
    title: "Bảo mật hệ thống & quy trình"
    desc: "Quản lý secret/credential, HTTPS & mã hóa dữ liệu nhạy cảm, bảo mật dependency & supply chain, header/CORS/cấu hình an toàn, và đưa bảo mật vào vòng đời dev (review, tool, logging, checklist)."
---

## Về lộ trình này

Lộ trình này trả lời đúng một câu hỏi: **lập trình viên cần làm gì để code ít lỗ hổng bảo
mật nhất?** Không phải để trở thành pentester hay chuyên gia SOC — mà để **DEV bình thường
viết code an toàn theo thói quen**, bắt được nguy cơ khi tự review, và không tạo ra lỗ hổng
do thiếu hiểu biết.

Nội dung xoay quanh **OWASP Top 10** — danh sách lỗ hổng web nguy hiểm & phổ biến nhất do
cộng đồng bảo mật tổng hợp — vì đại đa số sự cố bảo mật thực tế rơi vào các nhóm này. Mỗi
bài đi theo cùng một khung: **lỗ hổng xảy ra thế nào → hậu quả → DEV làm gì trong code để
phòng**, kèm ví dụ code sai (❌) và đúng (✅).

Học tuần tự **Nền tảng & tư duy → Lỗ hổng web thường gặp → Bảo mật hệ thống & quy trình**.
Mỗi bài có checklist tự đánh giá — tick khi bạn tự tin **áp dụng được vào code thật**, không
chỉ đọc hiểu. Tiến độ tính theo số item đã tick.

### Vì sao học theo thứ tự này

Hầu hết lỗ hổng bắt nguồn từ một sai lầm tư duy: **tin tưởng dữ liệu từ bên ngoài**. Vì vậy
bài đầu tiên là tư duy "không bao giờ tin input", rồi hai kỹ năng nền chặn phần lớn lỗ hổng
tại gốc — **input validation** (kiểm dữ liệu vào) và **output encoding** (an toàn khi hiển
thị ra). Nắm hai kỹ năng này trước thì các bài lỗ hổng sau (injection, XSS...) chỉ là **áp
dụng lại nguyên tắc gốc vào từng ngữ cảnh**, không phải học vẹt từng ca riêng lẻ.

Sau khối lỗ hổng, khối cuối nói về những thứ **nằm ngoài một dòng code** nhưng gây sự cố lớn
không kém: **secret bị lộ** (hard-code API key, commit `.env`), **dependency có CVE**
(supply-chain), **cấu hình sai** (thiếu HTTPS, header), và **quy trình** để lỗi được chặn
trước khi lên production.

| Cấp độ | Bạn làm được gì sau khi xong |
|--------|------------------------------|
| Nền tảng & tư duy | Nhận diện dữ liệu không tin cậy; validate input & encode output đúng chỗ |
| Lỗ hổng web thường gặp | Phòng được injection, XSS, CSRF; làm auth & phân quyền an toàn |
| Bảo mật hệ thống & quy trình | Quản lý secret, kiểm dependency, cấu hình an toàn, đưa bảo mật vào quy trình dev |

### Cách dùng lộ trình

- **Không phụ thuộc ngôn ngữ**: nguyên tắc bảo mật giống nhau ở PHP, Python, Node, Java,
  Ruby... Ví dụ code minh họa bằng nhiều ngôn ngữ; điều cần nhớ là **nguyên tắc**, không
  phải cú pháp một framework.
- Mỗi bài có ví dụ **❌ code sai → ✅ code đúng**. Đừng chỉ đọc — soi lại code project bạn
  đang làm xem có dính mẫu sai không.
- Bảo mật là **phòng thủ nhiều lớp**: không kỹ thuật nào đủ một mình. Học đủ các lớp để khi
  một lớp thủng, lớp khác vẫn đỡ.

### Tài nguyên tham khảo

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — chuẩn tham chiếu chính.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — hướng dẫn phòng thủ chi tiết theo từng chủ đề.
- [W3Schools Cybersecurity](https://www.w3schools.com/cybersecurity/) — nền tảng khái niệm.
- Gặp thuật ngữ lạ mở `term-glossary`.
