---
level: "advanced"
order: 11
title: "Làm việc với BrSE & khách Nhật"
est: "3-4 giờ"
checklist:
  - "Hiểu vai trò BrSE và luồng thông tin BA ↔ BrSE ↔ khách"
  - "Viết được câu hỏi xác nhận song ngữ rõ ràng, không mơ hồ"
  - "Biết cách quản lý Q&A lifecycle (hỏi → chờ → nhận trả lời → chốt)"
  - "Tránh được lỗi 'forward suy đoán như sự thật' khiến khách hiểu sai"
related:
  - "glossary:comtor"
  - "playbook:comtor"
---

## Luồng thông tin

Trong dự án offshore với khách Nhật, BA thường **không nói trực tiếp với khách** mà qua
**BrSE / Comtor**:

```
BA ⇄ BrSE/Comtor ⇄ Khách hàng (Nhật)
```

Mỗi lần "tam sao" là một lần thông tin có thể méo. Vì vậy câu hỏi/xác nhận của BA phải
**đủ rõ để không cần diễn giải thêm**.

## Viết câu hỏi xác nhận tốt

- **Một câu hỏi một ý** — đừng gộp nhiều câu vào một đoạn.
- **Có ngữ cảnh** — nêu rõ đang hỏi về màn hình/chức năng nào, kèm `file:line` hoặc ID.
- **Đưa lựa chọn khi có thể** — "A hay B?" dễ trả lời hơn câu hỏi mở với khách bận.
- **Song ngữ khi cần** — JP cho khách, VN cho nội bộ, để không lệch nghĩa.

Ví dụ tốt:
> [SCR_001 - Màn hình đăng nhập] Khi nhập sai mật khẩu 5 lần, hệ thống nên:
> (A) khóa tài khoản 30 phút, hay (B) yêu cầu CAPTCHA? — Hiện spec chưa nêu.

## Q&A lifecycle

Câu hỏi với khách có vòng đời, phải theo dõi trạng thái:
`Nháp → Đã gửi → Chờ trả lời → Đã trả lời → Đã chốt (đưa vào spec)`.

Đừng để câu hỏi "rơi" — một câu chưa được trả lời mà dev đã code theo suy đoán là mầm
bug.

## Lỗi chí mạng: forward suy đoán như sự thật

Khi BA viết suy đoán ("chắc là khách muốn...") mà BrSE forward như fact → khách tin sai →
spec conflict về sau. Quy tắc:

- Điểm verify được từ source → **check trước khi viết** (kèm `file:line`).
- Điểm chưa verify → ghi rõ **"chưa xác nhận"**, tạo câu hỏi.
- Sau khi correct/xin lỗi rất dễ viết suy đoán tiếp — cẩn trọng nhất ở thời điểm đó.

> Xem playbook BA "speculating-instead-of-confirming". Verify trước khi phát ngôn là rẻ;
> fix sau khi lan ra là đắt.
