---
level: "advanced"
order: 14
title: "Accessibility testing"
est: "3-4 giờ"
checklist:
  - "Giải thích accessibility (a11y) và các nhóm người dùng nó phục vụ"
  - "Biết WCAG và bốn nguyên tắc POUR (Perceivable, Operable, Understandable, Robust)"
  - "Test được điều hướng bằng bàn phím và thứ tự focus hợp lý"
  - "Kiểm tương phản màu, text thay thế cho ảnh, và nhãn cho form"
  - "Kết hợp công cụ tự động (axe/Lighthouse) với kiểm tra tay và screen reader"
related:
  - "skill:nta-frontend-checklist"
  - "skill:nta-frontend-review"
---

## Phần mềm dùng được cho tất cả mọi người

**Accessibility (a11y)** = đảm bảo người khuyết tật vẫn dùng được sản phẩm: người khiếm thị dùng
**screen reader**, người không dùng được chuột chỉ dùng **bàn phím**, người khiếm thị màu cần
**tương phản** đủ. Đây là non-functional dễ bị bỏ quên nhất, nhưng ở nhiều thị trường (gồm Nhật,
khu vực công) là **yêu cầu pháp lý**.

> Accessibility không phải "tính năng cho một nhóm nhỏ". Text thay thế cho ảnh cũng giúp khi mạng
> chậm ảnh không tải; điều hướng bàn phím cũng giúp power user; tương phản tốt cũng dễ đọc ngoài
> nắng. Làm tốt a11y thường làm sản phẩm tốt hơn cho **tất cả**, không chỉ người khuyết tật.

## WCAG và bốn nguyên tắc POUR

**WCAG** (Web Content Accessibility Guidelines) là chuẩn tham chiếu, gói trong bốn nguyên tắc:

| Nguyên tắc | Nghĩa | Ví dụ kiểm |
|-----------|-------|-----------|
| **Perceivable** | Cảm nhận được | Ảnh có alt text; video có phụ đề; tương phản đủ |
| **Operable** | Thao tác được | Làm được mọi thứ bằng bàn phím; không bẫy focus |
| **Understandable** | Hiểu được | Nhãn rõ; thông báo lỗi giải thích được; hành vi nhất quán |
| **Robust** | Bền, tương thích | HTML đúng chuẩn để screen reader/trợ năng đọc được |

Mức tuân thủ thường nhắm: **WCAG AA** (đủ cho phần lớn yêu cầu).

## Test bàn phím — nhanh mà lộ nhiều lỗi

Bỏ chuột ra, chỉ dùng `Tab`, `Shift+Tab`, `Enter`, `Space`, phím mũi tên đi hết một luồng:

```
- Tab tới được MỌI thứ tương tác được (link, nút, ô nhập)?
- Thứ tự focus có hợp lý (trái→phải, trên→dưới), không nhảy lộn xộn?
- Có THẤY được ô nào đang focus (viền/highlight rõ)?
- Mở modal xong Tab có bị "thoát" ra sau nền? Đóng bằng Esc được không?
- Không có "bẫy focus" — kẹt ở một chỗ không Tab ra được?
```

> Test bàn phím là bài a11y rẻ nhất và lộ nhiều lỗi nhất. Nếu bạn không dùng chuột mà không hoàn
> tất được một luồng, thì người chỉ dùng bàn phím cũng không — và bạn vừa tìm ra một lỗi
> accessibility nghiêm trọng trong vài phút.

## Vài kiểm tra cụ thể

| Kiểm | Cách |
|------|------|
| **Tương phản màu** | Chữ/nền đạt tỷ lệ tối thiểu (4.5:1 cho text thường) — dùng contrast checker |
| **Alt text** | Ảnh có mô tả; ảnh trang trí thì `alt=""` để screen reader bỏ qua |
| **Nhãn form** | Mỗi input có `<label>` gắn đúng, không chỉ placeholder |
| **Heading** | Cấu trúc H1→H2→H3 hợp lý, không nhảy cóc |
| **Focus nhìn thấy** | Không xóa outline focus mà không thay bằng cái khác |

## Tự động + tay + screen reader

Không có cách nào phủ hết một mình:

- **Công cụ tự động** (axe, Lighthouse): bắt nhanh lỗi máy thấy được — thiếu alt, tương phản
  kém, HTML sai. Nhưng chỉ phủ ~**30-40%** vấn đề.
- **Kiểm tay**: điều hướng bàn phím, thứ tự focus hợp lý, nhãn có *ý nghĩa* — máy không đánh giá được.
- **Screen reader thật** (NVDA/VoiceOver): nghe app đọc lên như người khiếm thị trải nghiệm —
  chỗ này lộ những lỗi hai cách trên bỏ sót.

> Công cụ tự động cần thiết nhưng **không đủ**: nó biết ảnh thiếu alt, nhưng không biết alt
> "image123.png" là vô nghĩa. Nó biết có `<label>`, nhưng không biết nhãn ghi sai. Phần "có ý
> nghĩa hay không" luôn cần con người — a11y không tự động hóa 100% được.

## Cạm bẫy hay gặp

- **Coi a11y là tùy chọn** → vi phạm pháp lý ở nhiều thị trường (gồm khu vực công Nhật).
- **Chỉ chạy công cụ tự động** → bỏ sót 60-70% vấn đề cần kiểm tay/screen reader.
- **Placeholder thay cho label** → screen reader không đọc được, mất chữ khi bắt đầu gõ.
- **Xóa outline focus cho "đẹp"** → người dùng bàn phím không biết đang ở đâu.
- **Alt text vô nghĩa** ("image", tên file) → tệ ngang không có alt.
- **Bẫy focus trong modal** → người dùng bàn phím kẹt, không thoát ra được.

## Ghi nhớ

**Accessibility** đảm bảo **tất cả mọi người** dùng được sản phẩm — và thường là **yêu cầu pháp
lý**. Chuẩn là **WCAG**, gói trong **POUR** (Perceivable, Operable, Understandable, Robust). Bài
test rẻ và hiệu quả nhất là **điều hướng bằng bàn phím**. Kết hợp **công cụ tự động** (nhanh
nhưng chỉ ~30-40%) với **kiểm tay** và **screen reader** — phần "có ý nghĩa hay không" luôn cần
con người.
