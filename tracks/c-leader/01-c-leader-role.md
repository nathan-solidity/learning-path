---
level: "basic"
order: 1
title: "Vai trò C-Leader trong team offshore"
est: "2-3 giờ"
checklist:
  - "Phân biệt được C-Leader với PM, BrSE và Tech Lead về trách nhiệm chính"
  - "Giải thích được vì sao C-Leader là 'người gỡ vướng' chứ không phải 'sếp ra lệnh'"
  - "Kể tên 4 trách nhiệm cốt lõi của C-Leader (cầu nối, chất lượng, gỡ vướng, phát triển team)"
  - "Nhận biết được khi nào một vấn đề cần escalate lên PM/BrSE thay vì tự xử"
  - "Xác định được ranh giới: việc nào C-Leader quyết, việc nào chỉ đề xuất"
---

## C-Leader là ai?

**C-Leader (Communication Leader / Team Lead)** là người dẫn dắt một team dev trong dự án
offshore, đứng giữa **khách hàng/BrSE** và **các member trong team**. Khác với hình dung
"sếp nhỏ", vai trò thật của C-Leader là **người gỡ vướng** (blocker remover) và **người
giữ chất lượng** — để team chạy trơn và đầu ra ổn định.

## C-Leader khác gì PM / BrSE / Tech Lead?

| Vai trò | Quan tâm chính | Câu hỏi thường trực |
|---------|----------------|---------------------|
| **PM** | Tiến độ, nguồn lực, rủi ro dự án | "Khi nào xong? Ai làm? Rủi ro ở đâu?" |
| **BrSE** | Cầu nối ngôn ngữ & nghiệp vụ với khách Nhật | "Khách muốn gì? Diễn đạt sao cho đúng?" |
| **Tech Lead** | Kiến trúc, quyết định kỹ thuật | "Thiết kế thế nào cho đúng và bền?" |
| **C-Leader** | Chất lượng đầu ra & vận hành team | "Team có bị kẹt không? Chất lượng có ổn không?" |

Trong nhiều team offshore VN, **C-Leader kiêm một phần Tech Lead** và làm cầu nối kỹ thuật
với BrSE. Điểm mấu chốt: C-Leader không thay BrSE dịch nghiệp vụ, cũng không thay PM quản
tiến độ tổng — mà đảm bảo **team hiểu đúng việc và làm ra sản phẩm đủ chất lượng**.

> Tình huống: BrSE forward một yêu cầu mơ hồ từ khách. PM hỏi "bao giờ xong?". C-Leader
> không vội trả lời tiến độ — mà hỏi ngược lại team "yêu cầu này đã đủ rõ để estimate
> chưa?", rồi gom câu hỏi làm rõ gửi lại BrSE trước. Đó là gỡ vướng đúng chỗ.

## 4 trách nhiệm cốt lõi

| Trách nhiệm | Làm gì |
|-------------|--------|
| **Cầu nối kỹ thuật** | Giải thích trade-off kỹ thuật cho khách/BrSE; dịch yêu cầu khách thành việc rõ ràng cho team |
| **Giữ chất lượng** | Review spec/code/test ở tầm hệ thống, ưu tiên rủi ro cao |
| **Gỡ vướng** | Phát hiện blocker sớm, tháo gỡ hoặc escalate; không để member kẹt im lặng |
| **Phát triển team** | Onboarding, chuẩn hóa quy trình, nâng năng lực member |

## Không phải "sếp" mà là người gỡ vướng

Sai lầm phổ biến của lead mới: nghĩ mình phải **giỏi nhất và quyết mọi thứ**. Thực tế
C-Leader tạo giá trị bằng **đòn bẩy** — làm cho người khác làm tốt hơn:

- Member kẹt 2 ngày không dám hỏi → C-Leader chủ động hỏi "đang vướng gì?" mỗi ngày.
- Cùng một lỗi lặp lại ở nhiều người → C-Leader chuẩn hóa thành checklist/knowledge.
- Khách đòi tính năng phá kiến trúc → C-Leader giải thích trade-off, không im lặng gật đầu.

> Nếu bạn đang là người **làm nhiều nhất** trong team, khả năng cao bạn đang làm sai vai
> C-Leader. Việc của bạn là làm cho team không cần bạn làm hộ.

## Khi nào escalate?

Escalate lên PM/BrSE khi vấn đề **vượt thẩm quyền hoặc rủi ro lớn**: trễ deadline không
thể cứu bằng nội lực team, yêu cầu khách mâu thuẫn spec đã chốt, xung đột nhân sự, hoặc
quyết định ảnh hưởng chi phí/hợp đồng. Đừng ôm một mình — nhưng escalate phải **kèm phân
tích và đề xuất**, không phải chỉ báo vấn đề.

![Cây quyết định escalate: team tự xử → C-Leader gỡ → escalate BrSE/PM khi vượt thẩm quyền](/images/cl-escalation.png)

## Cạm bẫy hay gặp

- **Ôm hết việc khó vào mình** → team không lớn lên, bạn thành bottleneck.
- **Gật đầu với mọi yêu cầu khách** để "dễ chịu" → nợ kỹ thuật và team kiệt sức.
- **Escalate mọi thứ** hoặc **không escalate gì** → mất uy tín hoặc để rủi ro nổ to.
- **Chỉ giao việc mà không gỡ vướng** → member kẹt im lặng, phát hiện muộn.
- **Nhầm vai với BrSE/PM** → lấn sân hoặc bỏ trống phần chất lượng của mình.

## Ghi nhớ

C-Leader không phải người giỏi nhất hay làm nhiều nhất — mà là người khiến **cả team chạy
trơn và đầu ra ổn định**. Bốn việc phải nắm: **cầu nối, chất lượng, gỡ vướng, phát triển
team**. Đo thành công của bạn không bằng "tôi làm được gì" mà bằng "team làm được gì".
