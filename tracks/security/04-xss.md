---
level: "sec-webvuln"
order: 4
title: "XSS (Cross-Site Scripting)"
est: "3-4 giờ"
checklist:
  - "Giải thích được XSS là gì và 3 loại: stored, reflected, DOM-based"
  - "Dùng output encoding theo ngữ cảnh; ưu tiên textContent thay vì innerHTML"
  - "Hiểu vì sao dangerouslySetInnerHTML / v-html là điểm nguy hiểm"
  - "Biết dùng thư viện sanitize (DOMPurify) khi buộc phải render HTML từ người dùng"
  - "Áp dụng lớp bổ sung: Content-Security-Policy và HttpOnly cookie"
related:
  - "glossary:dev"
---

## Vì sao quan trọng

**XSS** là **injection phía trình duyệt**: kẻ tấn công nhét được đoạn JavaScript **chạy
trong browser của nạn nhân**. Hậu quả: đánh cắp session/cookie, giả mạo hành động dưới danh
nghĩa nạn nhân, đọc trộm dữ liệu trên trang, keylog. Đây là bản áp dụng của cùng nguyên tắc
ở bài 02: **dữ liệu xuất ra HTML mà không encode → bị hiểu là mã**.

## Ba loại XSS

| Loại | Dữ liệu độc đi qua đâu | Ví dụ |
|------|------------------------|-------|
| **Stored** | Lưu vào DB rồi hiển thị cho người khác | Comment chứa `<script>` hiện cho mọi người |
| **Reflected** | Phản chiếu ngay từ request | `?q=<script>...` in thẳng vào trang kết quả |
| **DOM-based** | JS phía client tự nhét input vào DOM | `innerHTML = location.hash` |

## Phòng thủ số 1: output encoding theo ngữ cảnh

Đây là **áp dụng lại bài 02** — làm dữ liệu vô hại đúng theo nơi nó được đặt vào (HTML/
attribute/URL/JS). Trong JS phía client, cách đơn giản và an toàn nhất là **không dùng
`innerHTML`** với dữ liệu người dùng:

```javascript
// ❌ Nhét dữ liệu thô vào HTML → chạy được <script>/<img onerror>
el.innerHTML = "Xin chào " + userName;

// ✅ textContent coi input là VĂN BẢN, không phải HTML
el.textContent = "Xin chào " + userName;
```

Phía server, **framework template hiện đại tự escape** khi in biến ra HTML (Django, Blade,
Thymeleaf, React JSX...). Chỉ cần **đừng tắt** cơ chế đó.

## Cạm bẫy: các cửa "bỏ escape"

Mỗi framework có một cửa để in HTML thô — đó chính là chỗ XSS hay lọt:

```jsx
// ❌ React: bỏ qua escape mặc định của JSX
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```
```html
<!-- ❌ Vue: v-html render thẳng HTML -->
<div v-html="userInput"></div>
```

React JSX/`{}` **tự escape** nên an toàn mặc định; rủi ro chỉ đến khi bạn chủ động dùng
`dangerouslySetInnerHTML` (React) hay `v-html` (Vue). Chỉ dùng khi **thật sự** cần render
HTML do người dùng nhập — và khi đó phải **sanitize**:

```javascript
// ✅ Nếu buộc phải hiển thị HTML người dùng, làm sạch trước
import DOMPurify from 'dompurify';
el.innerHTML = DOMPurify.sanitize(userHtml);
```

## Lớp phòng thủ bổ sung

- **Content-Security-Policy (CSP)**: header giới hạn nguồn script được phép chạy → dù có
  XSS, script lạ vẫn bị chặn. Là **lớp bổ sung**, không thay được encoding.
- **HttpOnly cookie**: cookie session đặt `HttpOnly` → **JavaScript không đọc được**, nên
  XSS không đánh cắp được session cookie.
- `SameSite` + `Secure` cho cookie như phòng thủ chung.

## Cạm bẫy hay gặp

- Chỉ chặn chuỗi `<script>` → còn `<img onerror=...>`, `<svg>`, event handler... vô số cách.
- "Đã validate input khi lưu rồi" → sai ngữ cảnh output vẫn dính (stored XSS); phải encode lúc ra.
- Tự viết hàm "lọc HTML" thay vì dùng thư viện sanitize đã kiểm chứng → dễ bỏ sót.
- Nhét dữ liệu vào thuộc tính/URL/JS mà chỉ HTML-encode → sai ngữ cảnh, vẫn thủng.
- Dùng `innerHTML`/`v-html`/`dangerouslySetInnerHTML` cho tiện → mở cửa XSS.

## Ghi nhớ

**XSS** = kẻ tấn công nhét **JavaScript chạy trong trình duyệt nạn nhân** (stored/reflected/
DOM). Phòng thủ số 1: **output encoding theo ngữ cảnh** — ưu tiên `textContent`, để template
tự escape, **tránh** `innerHTML`/`v-html`/`dangerouslySetInnerHTML`; nếu buộc phải render
HTML người dùng thì **sanitize (DOMPurify)**. Lớp bổ sung: **CSP** và **HttpOnly cookie**.
