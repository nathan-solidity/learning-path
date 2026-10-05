---
level: "sec-mindset"
order: 2
title: "Input validation & output encoding"
est: "3-4 giờ"
checklist:
  - "Phân biệt được validation (dữ liệu vào) và encoding (dữ liệu ra)"
  - "Ưu tiên allowlist (chỉ chấp nhận cái hợp lệ) thay vì denylist (chặn cái xấu)"
  - "Validate ở server-side, không tin validation phía client"
  - "Encode output đúng theo ngữ cảnh (HTML, URL, JS, SQL...) thay vì lọc chung chung"
  - "Hiểu vì sao validation & encoding là hai lớp phòng thủ khác nhau, cần cả hai"
related:
  - "glossary:dev"
---

## Vì sao quan trọng

Hai kỹ năng **input validation** và **output encoding** chặn phần lớn lỗ hổng ngay tại gốc.
Nắm chắc hai kỹ năng này thì injection, XSS... ở các bài sau chỉ là **áp dụng lại** vào từng
ngữ cảnh. Điểm mấu chốt: đây là **hai việc khác nhau**, ở **hai thời điểm khác nhau** — và
cần **cả hai**, không thay thế nhau.

## Validation vs Encoding — đừng nhầm

| | Input validation | Output encoding |
|--|------------------|-----------------|
| Khi nào | Lúc dữ liệu **đi vào** hệ thống | Lúc dữ liệu **đi ra** (hiển thị/gửi đi) |
| Làm gì | Từ chối dữ liệu không đúng dạng | Làm dữ liệu **vô hại** trong ngữ cảnh đích |
| Ví dụ | "Email phải đúng định dạng" | "Ký tự `<` thành `&lt;` khi in ra HTML" |
| Chống được | Dữ liệu rác, vượt ngưỡng, sai kiểu | XSS, injection theo ngữ cảnh |

Một dữ liệu có thể **hợp lệ** (qua validation) nhưng vẫn **nguy hiểm** khi hiển thị sai chỗ.
Ví dụ tên `<script>` là chuỗi hợp lệ, nhưng in thẳng vào HTML thì thành XSS. Vì vậy cần cả
hai lớp.

## Validation: ưu tiên allowlist

**Allowlist** (chỉ chấp nhận thứ hợp lệ) mạnh hơn **denylist** (chặn thứ xấu) rất nhiều —
vì bạn không bao giờ liệt kê hết được cái xấu, nhưng liệt kê được cái đúng.

```python
# ❌ Denylist — dễ bỏ sót, kẻ tấn công luôn tìm được biến thể mới
if "<script>" in name:
    reject()

# ✅ Allowlist — chỉ cho ký tự cho phép
import re
if not re.fullmatch(r"[A-Za-z0-9 ]{1,50}", name):
    reject()
```

Validate theo: **kiểu** (số/chuỗi/ngày), **độ dài**, **định dạng** (regex/schema), **phạm
vi** (min/max), và **giá trị cho phép** (enum). Dùng thư viện schema có sẵn (Zod, Pydantic,
Joi, Bean Validation...) thay vì tự viết tay từng field.

> **Validation phải ở server-side.** Kiểm tra phía client (JS) chỉ để **trải nghiệm tốt**
> — kẻ tấn công gọi thẳng API, bỏ qua toàn bộ UI. Không có validation server = không có
> validation.

## Encoding: đúng theo từng ngữ cảnh

"An toàn" phụ thuộc **nơi dữ liệu được đặt vào**. Cùng một chuỗi cần encode khác nhau:

| Ngữ cảnh đích | Cách xử lý an toàn |
|---------------|--------------------|
| Nội dung HTML | HTML-encode (`<` → `&lt;`) — thường framework template tự làm |
| Thuộc tính HTML | Encode theo attribute + luôn đặt trong dấu ngoặc kép |
| URL / query param | URL-encode (`encodeURIComponent`) |
| Câu SQL | **Prepared statement / tham số hóa** (không phải "escape") |
| Lệnh shell | Truyền tham số dạng mảng, không ghép chuỗi vào shell |
| JavaScript | Tránh nhét dữ liệu vào JS; nếu buộc phải, JSON-encode |

```javascript
// ❌ Nhét dữ liệu thô vào HTML → XSS
el.innerHTML = "Xin chào " + userName;

// ✅ Dùng API an toàn theo ngữ cảnh
el.textContent = "Xin chào " + userName;   // textContent tự vô hại hóa
```

Lý do phải "theo ngữ cảnh": lọc chung chung (kiểu "xóa hết dấu `<`") vừa **bỏ sót** vừa
**làm hỏng dữ liệu hợp lệ**. Encode đúng ngữ cảnh mới vừa an toàn vừa giữ nguyên dữ liệu.

## Kết hợp cả hai lớp

```
Input  ──►  [Validation]  ──►  Lưu/Xử lý  ──►  [Encoding]  ──►  Output
           chỉ nhận cái đúng                   vô hại hóa theo đích
```

Ví dụ một comment: **validate** khi nhận (độ dài ≤ 1000, không rỗng) → **lưu nguyên văn** →
khi hiển thị thì **HTML-encode**. Không "làm sạch" dữ liệu lúc lưu để tránh mất thông tin và
tránh phụ thuộc vào một lần lọc duy nhất.

## Cạm bẫy hay gặp

- Chỉ validate ở client → vô dụng về mặt bảo mật; luôn phải có ở server.
- Dùng denylist ("chặn từ khóa xấu") làm phòng thủ chính → luôn có biến thể lọt.
- "Làm sạch" input một lần rồi tin tưởng mãi → sai ngữ cảnh output vẫn dính (stored XSS).
- Encode sai ngữ cảnh (HTML-encode nhưng lại đặt vào URL) → vẫn thủng.
- Tự viết regex/escape phức tạp thay vì dùng thư viện chuẩn → dễ có lỗ hổng tinh vi.

## Ghi nhớ

**Validation** kiểm dữ liệu **lúc vào** (ưu tiên **allowlist**, bắt buộc **server-side**);
**encoding** làm dữ liệu vô hại **lúc ra**, **đúng theo ngữ cảnh đích** (HTML/URL/SQL/
shell...). Đây là **hai lớp khác nhau, cần cả hai** — dữ liệu hợp lệ vẫn có thể nguy hiểm
nếu xuất sai chỗ. Ưu tiên thư viện chuẩn thay vì tự lọc tay. Đây là nền cho mọi bài lỗ hổng
tiếp theo.
