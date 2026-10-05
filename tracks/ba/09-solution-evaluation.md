---
level: "advanced"
order: 9
title: "Đánh giá giải pháp sau khi release"
est: "3 giờ"
checklist:
  - "Giải thích được Solution Evaluation là gì và diễn ra ở giai đoạn nào"
  - "Phân biệt được đo 'phần mềm chạy đúng' với đo 'phần mềm tạo ra giá trị nghiệp vụ'"
  - "Đề xuất được ít nhất 3 metric đo giá trị thực tế cho một tính năng"
  - "Biết cách thu thập feedback sau release và biến thành yêu cầu cải tiến"
related:
  - "glossary:kpi"
  - "glossary:mvp"
  - "skill:nta-feedback-collection"
  - "skill:nta-data-insight"
---

## Solution Evaluation là gì

Knowledge area cuối của BABOK: sau khi giải pháp đã chạy thật, **nó có thực sự giải quyết
được vấn đề nghiệp vụ ban đầu không?** Đây là vòng khép kín — quay lại đúng câu hỏi BRD
đặt ra lúc đầu ("doanh nghiệp cần đạt được gì").

Người mới hay dừng ở "release xong là hết việc". BA trưởng thành theo dõi tiếp: tính năng
có được dùng không, có tạo ra giá trị như kỳ vọng không.

## "Chạy đúng" ≠ "tạo giá trị"

- **Chạy đúng** (QA lo): không bug, đúng spec, đúng AC.
- **Tạo giá trị** (BA lo): người dùng có dùng không? Có đạt mục tiêu nghiệp vụ không?

Ví dụ: tính năng "chuyển tiền online" chạy hoàn hảo về mặt kỹ thuật, nhưng nếu chỉ 2%
khách dùng vì luồng quá rườm rà → giải pháp **thất bại về giá trị** dù pass hết test.

## Metric đo giá trị

Chọn metric gắn với **mục tiêu nghiệp vụ**, không chỉ số kỹ thuật:

| Loại | Ví dụ metric |
|------|--------------|
| Adoption | % người dùng dùng tính năng mới trong 30 ngày |
| Hiệu quả | Thời gian hoàn thành tác vụ giảm bao nhiêu |
| Chất lượng | Tỉ lệ lỗi nghiệp vụ (đơn sai, hoàn trả) trước/sau |
| Kinh doanh | Doanh thu / chi phí vận hành thay đổi thế nào |

> Đặt metric **trước khi release**, không phải sau. Nếu không biết đo bằng gì thì cũng
> không biết mình đã thành công hay chưa.

## Thu thập & xử lý feedback

- **Định lượng**: số liệu sử dụng, log, khảo sát (dùng `/nta-data-insight` phân tích).
- **Định tính**: phỏng vấn người dùng, feedback từ UAT/demo (dùng `/nta-feedback-collection`).

Biến feedback thành **yêu cầu cải tiến** có ưu tiên — vòng đời lại quay về Elicitation.
Đây là lúc BA đóng vai trò liên tục, không phải one-shot.

## Liên quan MVP

Với MVP, Solution Evaluation càng quan trọng: cả điểm của MVP là **release nhỏ để học**.
Không đánh giá thì mất luôn ý nghĩa của việc làm MVP.

Công cụ: `/nta-feedback-collection` (cấu trúc feedback UAT/demo), `/nta-data-insight` (phân
tích file dữ liệu thật tìm pattern).
