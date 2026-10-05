---
level: "technical"
order: 13
title: "Vẽ diagram & workflow"
est: "4-5 giờ"
checklist:
  - "Chọn đúng loại diagram cho từng mục đích (flowchart, sequence, ERD, use case)"
  - "Vẽ được một workflow nghiệp vụ có swimlane (phân làn theo vai trò)"
  - "Đọc hiểu được sequence diagram mô tả luồng gọi API"
  - "Biết công cụ để vẽ nhanh và xuất ra định dạng chia sẻ được"
related:
  - "glossary:srs"
  - "playbook:ba"
---

## Diagram là ngôn ngữ chung của BA

Một hình rõ ràng tiết kiệm hàng trang mô tả và tránh hiểu nhầm. BA cần vẽ được, không chỉ
đọc được. Bài này bổ sung cho bài *Vẽ luồng nghiệp vụ* ở cấp Trung cấp — đi sâu hơn về
chọn loại diagram và công cụ.

## Chọn loại diagram

| Loại | Trả lời câu hỏi | Khi nào dùng |
|------|-----------------|--------------|
| **Flowchart** | Logic quyết định, nhánh rẽ | Quy trình có nhiều điều kiện |
| **Swimlane / BPMN** | Ai làm bước nào | Quy trình qua nhiều vai trò/phòng ban |
| **Sequence** | Ai gọi ai, theo thứ tự nào | Luồng kỹ thuật, tích hợp API |
| **ERD** | Dữ liệu tổ chức thế nào | Thiết kế / hiểu database |
| **Use case** | Người dùng làm được gì với hệ thống | Xác định phạm vi chức năng |

## Workflow có swimlane

Swimlane chia diagram thành các "làn" theo vai trò — nhìn phát biết **ai chịu trách nhiệm
bước nào**. Ví dụ quy trình duyệt đơn dưới đây (khách → nhân viên → quản lý):

![Workflow duyệt đơn có swimlane](/images/ba-order-approval-flow.png)

Đây chính là kiểu hình BA hay phải vẽ khi mô tả quy trình nghiệp vụ liên phòng ban.

## Sequence diagram — luồng gọi API

Khi cần mô tả tương tác kỹ thuật (đăng nhập, thanh toán), sequence diagram cho thấy thứ
tự các lời gọi giữa các thành phần:

![Sequence diagram đăng nhập](/images/ba-login-sequence.png)

Đọc từ trên xuống theo thời gian: mỗi mũi tên là một lời gọi/phản hồi. BA dùng nó để xác
nhận với dev rằng mình hiểu đúng luồng, và để lộ ra các bước xử lý lỗi bị thiếu.

## Công cụ vẽ

- **draw.io / diagrams.net**: miễn phí, mạnh, xuất PNG/SVG/PDF. Chuẩn công nghiệp cho BA.

> Mẹo: vẽ bản nháp nhanh trước, rồi mở file `.drawio` chỉnh tay cho
> đẹp trước khi gửi khách.

## Nguyên tắc diagram tốt

- Một diagram một mục đích — đừng nhồi flowchart + sequence + ERD vào một hình.
- Đặt tên bước bằng động từ rõ ràng ("Kiểm tra số dư"), không mơ hồ ("Xử lý").
- Luôn có điểm bắt đầu/kết thúc rõ ràng và **nhánh lỗi**, không chỉ happy path.
