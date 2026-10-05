---
level: "intermediate"
order: 9
title: "Non-functional testing tổng quan"
est: "3-4 giờ"
checklist:
  - "Phân biệt functional testing (làm đúng gì) và non-functional testing (làm tốt thế nào)"
  - "Kể các loại non-functional chính: performance, security, usability, compatibility, reliability"
  - "Hiểu vì sao yêu cầu non-functional phải đo được (số cụ thể), không nói chung chung"
  - "Biết non-functional nên test sớm vì sửa muộn thường phải đổi kiến trúc"
  - "Định vị được mỗi loại non-functional sẽ đi sâu ở bài chuyên đề nào"
---

## "Làm đúng" chưa đủ — còn "làm tốt"

Đến giờ bạn test **functional**: phần mềm có làm **đúng chức năng** không. Nhưng một app đăng
nhập đúng mà mất 30 giây, hay để lộ mật khẩu, hay không chạy trên Safari — vẫn là sản phẩm hỏng.
**Non-functional testing** kiểm phần mềm làm chức năng đó **tốt đến đâu**.

> Khách hàng hiếm khi khen "app tính tiền đúng" — họ mong nó đúng là đương nhiên. Nhưng họ sẽ
> phàn nàn ngay nếu nó **chậm**, **rớt khi đông người**, hay **lộ dữ liệu**. Functional là điều
> kiện cần; non-functional thường là thứ quyết định người dùng ở lại hay bỏ đi.

## Các loại non-functional chính

| Loại | Câu hỏi kiểm | Bài chuyên đề |
|------|-------------|---------------|
| **Performance** | Nhanh không? Chịu được bao nhiêu người? | Performance & load testing |
| **Security** | Có bị tấn công/rò dữ liệu không? | Security testing |
| **Usability** | Dễ dùng, dễ hiểu không? | (bài này + Accessibility) |
| **Compatibility** | Chạy đúng trên trình duyệt/thiết bị/OS nào? | Mobile & cross-browser |
| **Accessibility** | Người khuyết tật dùng được không? | Accessibility testing |
| **Reliability** | Chạy ổn định lâu dài, phục hồi sau lỗi? | (liên quan SRE bên DevOps) |

## Yêu cầu non-functional phải đo được

Điểm chết người: non-functional dễ bị viết mơ hồ. "App phải nhanh" thì test kiểu gì, pass ở đâu?

| Mơ hồ (không test được) | Đo được (test được) |
|-------------------------|----------------------|
| "App phải nhanh" | "Trang chủ tải < 2s ở p95, với 500 user đồng thời" |
| "Phải bảo mật" | "Vượt OWASP Top 10 cơ bản; không lộ PII trong response" |
| "Dễ dùng" | "User mới hoàn tất đăng ký < 3 phút, không cần hướng dẫn" |
| "Chạy mọi nơi" | "Chrome/Safari/Edge 2 phiên bản gần nhất; iOS 15+, Android 11+" |

> Nhiệm vụ đầu tiên của QA với non-functional là **ép yêu cầu thành con số**. Nếu spec chỉ ghi
> "app phải nhanh", hỏi lại BrSE/khách: nhanh là bao nhiêu giây, ở bao nhiêu user, đo ở
> percentile nào. Không có ngưỡng cụ thể thì không có khái niệm pass/fail — chỉ là cãi nhau cảm tính.

## Test sớm — vì sửa muộn rất đắt

> Lỗi functional thường sửa được bằng vá code. Lỗi non-functional hay đòi **đổi kiến trúc**:
> app chậm vì thiết kế DB sai, không chịu tải vì không scale được, mất an toàn vì auth gắn sai
> từ đầu. Phát hiện những thứ này một tuần trước go-live thì gần như không kịp sửa. Non-functional
> phải được nghĩ tới **từ khi thiết kế**, và test **liên tục**, không để dồn cuối.

## Usability — phần QA làm ngay được

Nhiều loại non-functional cần bài chuyên đề, nhưng **usability** thì QA quan sát được ngay khi
test functional:

- Thông báo lỗi có **rõ ràng, đúng ngôn ngữ** không, hay chỉ hiện "Error 500"?
- Luồng có **số bước hợp lý** không, hay bắt user nhập lại thứ hệ thống đã biết?
- Trạng thái loading/empty/lỗi có được xử lý, hay màn hình trắng khó hiểu?

Với dự án khách Nhật qua BrSE: chú ý cả **bản dịch** (nhãn, message tiếng Nhật đúng ngữ cảnh
không), định dạng ngày/tiền/họ-tên theo quy ước Nhật — đây là usability rất hay bị bỏ sót.

## Cạm bẫy hay gặp

- **Chấp nhận yêu cầu mơ hồ** ("phải nhanh") → không có ngưỡng pass/fail, cãi nhau cảm tính.
- **Để non-functional tới cuối** → phát hiện lỗi kiến trúc khi không còn kịp sửa.
- **Chỉ test functional, coi non-functional là việc của người khác** → app đúng mà chậm/không an toàn vẫn hỏng.
- **Bỏ qua usability vì "không phải lỗi"** → sản phẩm khó dùng, khách Nhật rất khắt khe điểm này.
- **Quên compatibility** → chạy tốt máy mình, vỡ trên trình duyệt/thiết bị của khách.

## Ghi nhớ

**Non-functional testing** kiểm phần mềm làm chức năng **tốt đến đâu**: nhanh (performance), an
toàn (security), dễ dùng (usability), chạy đúng nơi (compatibility), bền (reliability). Yêu cầu
non-functional **phải đo được** — ép "app phải nhanh" thành con số cụ thể mới có pass/fail. Và
phải test **sớm**, vì lỗi non-functional thường đòi đổi kiến trúc, sửa muộn là quá đắt. Các bài
sau đi sâu từng loại.
