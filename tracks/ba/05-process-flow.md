---
level: "intermediate"
order: 5
title: "Vẽ luồng nghiệp vụ (Flowchart & Sequence)"
est: "4-5 giờ"
checklist:
  - "Đọc hiểu được một flowchart nghiệp vụ có nhánh rẽ và vòng lặp"
  - "Vẽ được flowchart cho một quy trình có ít nhất 2 nhánh điều kiện"
  - "Phân biệt được khi nào dùng flowchart, khi nào dùng sequence diagram"
  - "Xác định được các luồng: happy path, alternative flow, exception flow"
related:
  - "glossary:srs"
---

## Vì sao BA cần vẽ flow

Chữ dễ mơ hồ, hình thì không. Một flow rõ ràng giúp dev/QA thấy ngay các nhánh rẽ và
trường hợp ngoại lệ — thứ hay bị bỏ sót khi chỉ mô tả bằng lời.

## Flowchart — luồng logic nghiệp vụ

Ký hiệu cơ bản:
- **Hình chữ nhật**: hành động / bước xử lý
- **Hình thoi**: điểm quyết định (rẽ nhánh yes/no)
- **Hình bo tròn**: bắt đầu / kết thúc
- **Mũi tên**: hướng đi

Ví dụ quy trình duyệt đơn:

![Flowchart quy trình duyệt đơn](/images/ba-order-flow-simple.png)

Đọc: hình bo tròn là bắt đầu/kết thúc, hình chữ nhật là bước xử lý, hình thoi là điểm rẽ
nhánh. Đơn > 10 triệu phải qua duyệt 2 cấp.

## Sequence diagram — ai gọi ai, theo thứ tự nào

Dùng khi cần mô tả **tương tác giữa các thành phần** theo thời gian (user → frontend →
API → DB). Trả lời "bước nào xảy ra trước, gọi tới đâu, trả về gì".

![Sequence diagram gửi đơn](/images/ba-order-sequence.png)

Đọc từ trên xuống theo thời gian: mỗi mũi tên là một lời gọi (nét liền) hoặc phản hồi
(nét đứt) giữa các thành phần.

## Flowchart vs Sequence — chọn cái nào

| | Flowchart | Sequence |
|---|-----------|----------|
| Nhấn mạnh | Logic quyết định, nhánh rẽ | Thứ tự tương tác giữa các bên |
| Câu hỏi trả lời | "Nếu điều kiện X thì đi đâu?" | "Ai gọi ai, khi nào?" |
| Hay dùng cho | Quy trình nghiệp vụ | Luồng kỹ thuật, tích hợp API |

## 3 loại luồng phải nghĩ tới

- **Happy path**: mọi thứ suôn sẻ, đúng như mong đợi.
- **Alternative flow**: cách khác vẫn hợp lệ (vd thanh toán bằng thẻ *hoặc* ví).
- **Exception flow**: khi lỗi (hết tiền, timeout, sai OTP). BA hay quên loại này — và
  đây thường là nơi phát sinh bug nghiêm trọng.

> Luôn tự hỏi: "Nếu bước này thất bại thì sao?" cho từng bước trong flow.
