---
level: "intermediate"
order: 9
title: "Quản lý rủi ro & giao tiếp stakeholder"
est: "3-4 giờ"
checklist:
  - "Lập được risk register với probability × impact và xếp hạng ưu tiên"
  - "Phân biệt được 4 chiến lược xử lý rủi ro (avoid/mitigate/transfer/accept)"
  - "Điều chỉnh được cùng một nội dung cho 3 nhóm đối tượng (exec/dev/khách)"
  - "Viết được báo cáo tiến độ minh bạch kể cả khi có tin xấu"
  - "Nhận ra dấu hiệu sớm của rủi ro trước khi nó thành sự cố"
---

## Risk register

Rủi ro là điều **có thể** xảy ra và gây hại — khác với **issue** (đã xảy ra rồi). PM quản lý
rủi ro trong một bảng, chấm điểm **Probability × Impact** để biết ưu tiên.

| Rủi ro | P (1-5) | I (1-5) | Score | Chiến lược | Owner |
|--------|---------|---------|-------|-----------|-------|
| Spec còn mờ ở module thanh toán | 4 | 5 | **20** | Mitigate: chốt spec với BrSE trước sprint | BA |
| Dev senior nghỉ giữa dự án | 2 | 5 | 10 | Mitigate: pair + tài liệu hóa | Lead |
| API bên thứ 3 đổi version | 3 | 3 | 9 | Accept: theo dõi changelog | Dev |
| Môi trường staging chưa sẵn | 3 | 2 | 6 | Transfer: đẩy DevOps chuẩn bị sớm | PM |

> Score = P × I giúp xếp thứ tự khách quan. Rủi ro **impact cao dù xác suất thấp** (dev
> senior nghỉ) vẫn phải có kế hoạch — đừng bỏ qua chỉ vì "chắc không xảy ra".

## 4 chiến lược xử lý

| Chiến lược | Nghĩa | Ví dụ |
|-----------|-------|-------|
| **Avoid** (tránh) | Loại bỏ nguồn gây rủi ro | Không nhận feature dùng tech chưa ai biết |
| **Mitigate** (giảm) | Hạ P hoặc I | Chốt spec sớm, pair programming, buffer |
| **Transfer** (chuyển) | Đẩy trách nhiệm sang bên khác | Mua dịch vụ, ký SLA với vendor |
| **Accept** (chấp nhận) | Ghi nhận, chuẩn bị plan B | Rủi ro nhỏ, chi phí xử lý > tác hại |

Rà soát risk register **định kỳ** (đầu mỗi sprint): rủi ro nào đã hết, rủi ro mới nào xuất
hiện, cái nào sắp thành issue.

## Giao tiếp theo đối tượng

Cùng một sự thật, ba nhóm cần **mức chi tiết khác nhau**:

| Đối tượng | Quan tâm | Cách trình bày |
|-----------|----------|----------------|
| **Exec / khách** | Tiến độ tổng, rủi ro, tiền/thời gian | Kết luận trước, số liệu, ít thuật ngữ kỹ thuật |
| **BrSE / khách Nhật** | Mốc, cam kết, rõ ràng không mập mờ | Ngôn ngữ đơn giản, xác nhận cách hiểu, không giả định |
| **Dev / team** | Task, block, thứ tự ưu tiên | Chi tiết kỹ thuật, cụ thể ai làm gì |

Ví dụ cùng tin "module A trễ 3 ngày do bug tích hợp":

- **Với exec**: "Release vẫn đúng hạn. Module A trễ 3 ngày nhưng nằm trong buffer, không ảnh
  hưởng ngày bàn giao."
- **Với BrSE**: "Module A phát hiện lỗi tích hợp, cần thêm 3 ngày. Ngày release giữ nguyên
  vì đã có đệm. Sẽ báo lại nếu phát sinh."
- **Với dev**: "Bug ở luồng callback thanh toán — ưu tiên số 1 hôm nay, tạm hoãn task refactor."

> Với khách Nhật, tránh từ mập mờ ("có lẽ ổn", "chắc kịp"). Nói bằng **mốc và con số**. Nếu
> chưa chắc thì nói rõ "chưa xác nhận, sẽ báo lại trước [ngày]" — im lặng bị hiểu là có vấn đề.

## Báo cáo tiến độ minh bạch

Cấu trúc báo cáo định kỳ gọn (áp dụng được ngay):

| Mục | Nội dung |
|-----|----------|
| Tổng quan | On track / At risk / Delayed |
| Đã xong tuần này | Milestone/story hoàn thành |
| Kế hoạch tuần tới | Việc chính |
| Rủi ro & block | Top 2-3, kèm cách xử lý |
| Cần khách quyết | Câu hỏi/quyết định đang chờ |

> Nguyên tắc vàng: **tin xấu báo sớm**. Vấn đề nhỏ báo hôm nay dễ xử lý hơn nhiều so với
> vấn đề lớn giấu tới phút chót. Khách Nhật mất niềm tin không phải vì có vấn đề, mà vì bị
> bất ngờ. "No surprises" là cam kết quan trọng nhất của PM.

## Dấu hiệu rủi ro sớm

- Burndown phẳng ngang vài ngày → có blocker chưa nói ra.
- Cùng một câu hỏi spec lặp lại nhiều lần → spec thật sự mờ, không phải dev chậm hiểu.
- Estimate liên tục vượt → hoặc scope ngầm nở, hoặc team đang gặp khó kỹ thuật.
- Team im lặng bất thường trong daily → thường là đang kẹt mà ngại báo.

## Cạm bẫy hay gặp

- **Chỉ liệt kê rủi ro mà không chấm điểm/gán owner** → risk register thành danh sách chết.
- **Bỏ qua rủi ro impact-cao vì xác suất thấp** → khi xảy ra không có plan B.
- **Gửi cùng một báo cáo kỹ thuật cho exec** → họ không đọc, mất kênh tin cậy.
- **Giấu tin xấu chờ "tự xử lý"** → thành sự cố lớn, mất niềm tin khách.
- **Nói mập mờ với khách Nhật** ("chắc kịp") → hiểu nhầm, vỡ cam kết.

## Ghi nhớ

Rủi ro chấm **P × I** để ưu tiên, mỗi cái có **chiến lược + owner**, rà soát định kỳ. Giao
tiếp phải **resize theo đối tượng** — exec cần kết luận, dev cần chi tiết, khách Nhật cần
rõ ràng không mập mờ. Trên hết: **tin xấu báo sớm, no surprises** — đó là thứ giữ niềm tin.
