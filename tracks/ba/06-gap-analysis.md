---
level: "intermediate"
order: 6
title: "Gap Analysis & phát hiện yêu cầu thiếu"
est: "3-4 giờ"
checklist:
  - "Giải thích được gap analysis là gì và dùng khi nào"
  - "Lập được bảng As-Is vs To-Be cho một quy trình"
  - "Tự đặt được bộ câu hỏi để phát hiện edge case và yêu cầu ẩn"
  - "Nhận ra được khi một yêu cầu mâu thuẫn với yêu cầu khác"
related:
  - "playbook:ba"
---

## Gap Analysis là gì

So sánh **trạng thái hiện tại (As-Is)** với **trạng thái mong muốn (To-Be)** để tìm ra
"khoảng cách" — chính là những việc cần làm. Dùng khi nâng cấp hệ thống cũ, hoặc khi thay
đổi quy trình nghiệp vụ.

## Bảng As-Is vs To-Be

| Khía cạnh | As-Is (hiện tại) | To-Be (mong muốn) | Gap (việc cần làm) |
|-----------|------------------|-------------------|--------------------|
| Duyệt đơn | Duyệt tay qua email | Duyệt trên hệ thống | Xây màn hình duyệt |
| Thông báo | Không có | Email + push | Tích hợp gửi thông báo |
| Báo cáo | Excel thủ công | Tự động, real-time | Xây dashboard |

Mỗi dòng "Gap" thường trở thành một hoặc nhiều user story.

## Phát hiện yêu cầu ẩn / edge case

Yêu cầu nguy hiểm nhất là cái **không ai nói ra** vì cho là "hiển nhiên". Bộ câu hỏi giúp
lộ ra:

- **Dữ liệu rỗng/cực trị**: "Nếu danh sách trống thì hiển thị gì? Nếu 1 triệu bản ghi?"
- **Quyền hạn**: "Ai được xem/sửa/xóa? User thường thấy gì khác admin?"
- **Đồng thời**: "Hai người sửa cùng lúc thì sao?"
- **Trạng thái**: "Đơn đã duyệt có sửa được không? Xóa rồi khôi phục được không?"
- **Thời gian**: "Dữ liệu cũ giữ bao lâu? Có timezone không?"
- **Lỗi & phục hồi**: "Mất mạng giữa chừng thì sao? Có retry không?"

## Phát hiện mâu thuẫn

Khi hai yêu cầu chọi nhau (vd "cho phép xóa đơn" vs "phải giữ lịch sử mọi đơn để audit"),
BA phải **nêu ra và đề nghị stakeholder quyết**, không tự chọn một bên rồi im lặng.

> Không suy đoán khi spec chưa rõ. Điểm chưa xác nhận được → ghi rõ "chưa xác nhận" và
> tạo câu hỏi để verify với khách/BrSE. Xem playbook BA "speculating-instead-of-confirming".
